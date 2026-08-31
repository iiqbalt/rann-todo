import {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
} from 'react'
import type { ReactNode } from 'react'

import {
  CONFIG_STORAGE_KEY,
  DEFAULT_CONFIG,
  IDLE_SESSION,
  MODE_DURATION_MS,
  SESSION_STORAGE_KEY,
} from './types'
import type { PomodoroConfig, PomodoroMode, PomodoroSession } from './types'
import { playBreakEndBeep, playFocusEndBeep, unlockAudio } from './audio'

export type PomodoroContextValue = {
  config: PomodoroConfig
  session: PomodoroSession
  isOpen: boolean
  isMounted: boolean
  open: () => void
  close: () => void
  toggle: () => void
  start: () => void
  pause: () => void
  reset: () => void
  updateConfig: (partial: Partial<PomodoroConfig>) => void
}

const PomodoroContext = createContext<PomodoroContextValue | undefined>(
  undefined,
)

function isPomodoroMode(value: unknown): value is PomodoroMode {
  return value === 'focus' || value === 'shortBreak' || value === 'longBreak'
}

function isPomodoroStatus(value: unknown): value is PomodoroSession['status'] {
  return value === 'idle' || value === 'running' || value === 'paused'
}

function readConfig(): PomodoroConfig {
  if (typeof window === 'undefined') return DEFAULT_CONFIG
  try {
    const raw = window.localStorage.getItem(CONFIG_STORAGE_KEY)
    if (!raw) return DEFAULT_CONFIG
    const parsed = JSON.parse(raw) as Partial<PomodoroConfig>
    return {
      focusMinutes: Number(parsed.focusMinutes) || DEFAULT_CONFIG.focusMinutes,
      shortBreakMinutes:
        Number(parsed.shortBreakMinutes) || DEFAULT_CONFIG.shortBreakMinutes,
      longBreakMinutes:
        Number(parsed.longBreakMinutes) || DEFAULT_CONFIG.longBreakMinutes,
      cyclesBeforeLongBreak:
        Number(parsed.cyclesBeforeLongBreak) ||
        DEFAULT_CONFIG.cyclesBeforeLongBreak,
    }
  } catch {
    return DEFAULT_CONFIG
  }
}

function readSession(): PomodoroSession {
  if (typeof window === 'undefined') return IDLE_SESSION
  try {
    const raw = window.localStorage.getItem(SESSION_STORAGE_KEY)
    if (!raw) return IDLE_SESSION
    const parsed = JSON.parse(raw) as Partial<PomodoroSession>
    if (!isPomodoroMode(parsed.mode)) return IDLE_SESSION
    if (!isPomodoroStatus(parsed.status)) return IDLE_SESSION
    return {
      mode: parsed.mode,
      status: parsed.status,
      runStartAt:
        typeof parsed.runStartAt === 'number' ? parsed.runStartAt : null,
      pausedAt: typeof parsed.pausedAt === 'number' ? parsed.pausedAt : null,
      pausedAccumMs:
        typeof parsed.pausedAccumMs === 'number' ? parsed.pausedAccumMs : 0,
      remainingMs:
        typeof parsed.remainingMs === 'number'
          ? parsed.remainingMs
          : IDLE_SESSION.remainingMs,
      completedFocusCount:
        typeof parsed.completedFocusCount === 'number'
          ? parsed.completedFocusCount
          : 0,
    }
  } catch {
    return IDLE_SESSION
  }
}

function computeElapsed(session: PomodoroSession): number {
  if (session.status === 'running' && session.runStartAt !== null) {
    return Date.now() - session.runStartAt + session.pausedAccumMs
  }
  if (session.status === 'paused' && session.pausedAt !== null) {
    return (
      session.pausedAt -
      (session.runStartAt ?? session.pausedAt) +
      session.pausedAccumMs
    )
  }
  return 0
}

function computeRemaining(
  session: PomodoroSession,
  config: PomodoroConfig,
): number {
  const total = MODE_DURATION_MS(config, session.mode)
  if (session.status === 'idle') return total
  const elapsed = computeElapsed(session)
  return Math.max(0, total - elapsed)
}

type Action =
  | { type: 'HYDRATE'; config: PomodoroConfig; session: PomodoroSession }
  | { type: 'TICK' }
  | { type: 'START' }
  | { type: 'PAUSE' }
  | { type: 'RESET' }
  | {
      type: 'MODE_TRANSITION'
      nextMode: PomodoroMode
      nextRemainingMs: number
      newCount: number
    }
  | { type: 'UPDATE_CONFIG'; partial: Partial<PomodoroConfig> }

type State = { config: PomodoroConfig; session: PomodoroSession }

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'HYDRATE':
      return { config: action.config, session: action.session }

    case 'TICK': {
      if (state.session.status !== 'running') return state
      const remaining = computeRemaining(state.session, state.config)
      if (remaining > 0) {
        return {
          config: state.config,
          session: { ...state.session, remainingMs: remaining },
        }
      }
      return state
    }

    case 'START': {
      if (state.session.status === 'running') return state
      const total = MODE_DURATION_MS(state.config, state.session.mode)
      if (state.session.status === 'paused') {
        const remaining = computeRemaining(state.session, state.config)
        return {
          config: state.config,
          session: {
            ...state.session,
            status: 'running',
            runStartAt:
              Date.now() - (total - remaining) + state.session.pausedAccumMs,
            pausedAt: null,
            remainingMs: remaining,
          },
        }
      }
      return {
        config: state.config,
        session: {
          ...state.session,
          status: 'running',
          runStartAt: Date.now(),
          pausedAt: null,
          pausedAccumMs: 0,
          remainingMs: total,
        },
      }
    }

    case 'PAUSE': {
      if (state.session.status !== 'running') return state
      const now = Date.now()
      const elapsedAtPause =
        state.session.runStartAt !== null
          ? now - state.session.runStartAt + state.session.pausedAccumMs
          : state.session.pausedAccumMs
      return {
        config: state.config,
        session: {
          ...state.session,
          status: 'paused',
          runStartAt: null,
          pausedAt: now,
          pausedAccumMs: elapsedAtPause,
          remainingMs: computeRemaining(
            {
              ...state.session,
              status: 'running',
            },
            state.config,
          ),
        },
      }
    }

    case 'RESET': {
      const total = MODE_DURATION_MS(state.config, 'focus')
      return {
        config: state.config,
        session: {
          ...IDLE_SESSION,
          remainingMs: total,
        },
      }
    }

    case 'MODE_TRANSITION': {
      return {
        config: state.config,
        session: {
          ...state.session,
          mode: action.nextMode,
          status: 'running',
          runStartAt: Date.now(),
          pausedAt: null,
          pausedAccumMs: 0,
          remainingMs: action.nextRemainingMs,
          completedFocusCount: action.newCount,
        },
      }
    }

    case 'UPDATE_CONFIG': {
      const next = { ...state.config, ...action.partial }
      return {
        config: next,
        session:
          state.session.status === 'idle'
            ? {
                ...state.session,
                remainingMs: MODE_DURATION_MS(next, state.session.mode),
              }
            : state.session,
      }
    }
  }
}

function nextModeAfter(
  currentMode: PomodoroMode,
  completedFocusCount: number,
  cyclesBeforeLongBreak: number,
): { mode: PomodoroMode; newCount: number } {
  if (currentMode === 'focus') {
    const nextCount = completedFocusCount + 1
    const isLong = nextCount % cyclesBeforeLongBreak === 0
    return {
      mode: isLong ? 'longBreak' : 'shortBreak',
      newCount: nextCount,
    }
  }
  return { mode: 'focus', newCount: completedFocusCount }
}

export function PomodoroProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false)
  const [isMounted, setIsMounted] = useState(false)
  const [state, dispatch] = useReducer(reducer, undefined, () => ({
    config: DEFAULT_CONFIG,
    session: IDLE_SESSION,
  }))

  const lastWrittenRef = useRef<string>('')

  useEffect(() => {
    setIsMounted(true)
    const config = readConfig()
    const rawSession = readSession()

    if (rawSession.status === 'running' && rawSession.runStartAt !== null) {
      const total = MODE_DURATION_MS(config, rawSession.mode)
      const elapsed =
        Date.now() - rawSession.runStartAt + rawSession.pausedAccumMs
      const remaining = Math.max(0, total - elapsed)
      if (remaining <= 0) {
        const { mode: next, newCount } = nextModeAfter(
          rawSession.mode,
          rawSession.completedFocusCount,
          config.cyclesBeforeLongBreak,
        )
        const nextRemaining = MODE_DURATION_MS(config, next)
        dispatch({
          type: 'HYDRATE',
          config,
          session: {
            ...rawSession,
            mode: next,
            status: 'running',
            runStartAt: Date.now(),
            pausedAt: null,
            pausedAccumMs: 0,
            remainingMs: nextRemaining,
            completedFocusCount: newCount,
          },
        })
        playFocusEndBeep()
        return
      }
      dispatch({
        type: 'HYDRATE',
        config,
        session: { ...rawSession, remainingMs: remaining },
      })
      return
    }

    if (rawSession.status === 'paused') {
      const remaining = computeRemaining(rawSession, config)
      dispatch({
        type: 'HYDRATE',
        config,
        session: { ...rawSession, remainingMs: remaining },
      })
      return
    }

    const total = MODE_DURATION_MS(config, rawSession.mode)
    dispatch({
      type: 'HYDRATE',
      config,
      session: { ...rawSession, remainingMs: total },
    })
  }, [])

  useEffect(() => {
    if (!isMounted) return
    const serialized = JSON.stringify(state.session)
    if (lastWrittenRef.current === serialized) return
    lastWrittenRef.current = serialized
    window.localStorage.setItem(SESSION_STORAGE_KEY, serialized)
  }, [state.session, isMounted])

  useEffect(() => {
    if (!isMounted) return
    window.localStorage.setItem(
      CONFIG_STORAGE_KEY,
      JSON.stringify(state.config),
    )
  }, [state.config, isMounted])

  useEffect(() => {
    if (!isMounted) return
    if (state.session.status !== 'running') return
    const id = window.setInterval(() => {
      const remaining = computeRemaining(state.session, state.config)
      if (remaining <= 0) {
        const { mode: next, newCount } = nextModeAfter(
          state.session.mode,
          state.session.completedFocusCount,
          state.config.cyclesBeforeLongBreak,
        )
        const nextRemaining = MODE_DURATION_MS(state.config, next)
        if (state.session.mode === 'focus') {
          playFocusEndBeep()
        } else {
          playBreakEndBeep()
        }
        dispatch({
          type: 'MODE_TRANSITION',
          nextMode: next,
          nextRemainingMs: nextRemaining,
          newCount,
        })
      } else {
        dispatch({ type: 'TICK' })
      }
    }, 1000)
    return () => window.clearInterval(id)
  }, [state.session, state.config, isMounted])

  useEffect(() => {
    function onStorage(e: StorageEvent) {
      if (e.key !== SESSION_STORAGE_KEY || !e.newValue) return
      try {
        const parsed = JSON.parse(e.newValue) as Partial<PomodoroSession>
        if (!isPomodoroMode(parsed.mode)) return
        if (!isPomodoroStatus(parsed.status)) return
        const config = readConfig()
        const total = MODE_DURATION_MS(config, parsed.mode)
        const session: PomodoroSession = {
          mode: parsed.mode,
          status: parsed.status,
          runStartAt:
            typeof parsed.runStartAt === 'number' ? parsed.runStartAt : null,
          pausedAt:
            typeof parsed.pausedAt === 'number' ? parsed.pausedAt : null,
          pausedAccumMs:
            typeof parsed.pausedAccumMs === 'number' ? parsed.pausedAccumMs : 0,
          remainingMs:
            typeof parsed.remainingMs === 'number' ? parsed.remainingMs : total,
          completedFocusCount:
            typeof parsed.completedFocusCount === 'number'
              ? parsed.completedFocusCount
              : 0,
        }
        dispatch({ type: 'HYDRATE', config, session })
      } catch {
        // ignore
      }
    }
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [])

  const open = useCallback(() => setIsOpen(true), [])
  const close = useCallback(() => setIsOpen(false), [])
  const toggle = useCallback(() => setIsOpen((o) => !o), [])

  const start = useCallback(() => {
    unlockAudio()
    dispatch({ type: 'START' })
    setIsOpen(true)
  }, [])

  const pause = useCallback(() => {
    dispatch({ type: 'PAUSE' })
  }, [])

  const reset = useCallback(() => {
    dispatch({ type: 'RESET' })
  }, [])

  const updateConfig = useCallback((partial: Partial<PomodoroConfig>) => {
    dispatch({ type: 'UPDATE_CONFIG', partial })
  }, [])

  const value = useMemo<PomodoroContextValue>(
    () => ({
      config: state.config,
      session: state.session,
      isOpen,
      isMounted,
      open,
      close,
      toggle,
      start,
      pause,
      reset,
      updateConfig,
    }),
    [
      state.config,
      state.session,
      isOpen,
      isMounted,
      open,
      close,
      toggle,
      start,
      pause,
      reset,
      updateConfig,
    ],
  )

  return (
    <PomodoroContext.Provider value={value}>
      {children}
    </PomodoroContext.Provider>
  )
}

export { PomodoroContext }
