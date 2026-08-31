export type PomodoroMode = 'focus' | 'shortBreak' | 'longBreak'

export type PomodoroStatus = 'idle' | 'running' | 'paused'

export type PomodoroConfig = {
  focusMinutes: number
  shortBreakMinutes: number
  longBreakMinutes: number
  cyclesBeforeLongBreak: number
}

export type PomodoroSession = {
  mode: PomodoroMode
  status: PomodoroStatus
  runStartAt: number | null
  pausedAt: number | null
  pausedAccumMs: number
  remainingMs: number
  completedFocusCount: number
}

export const DEFAULT_CONFIG: PomodoroConfig = {
  focusMinutes: 25,
  shortBreakMinutes: 5,
  longBreakMinutes: 15,
  cyclesBeforeLongBreak: 4,
}

export const IDLE_SESSION: PomodoroSession = {
  mode: 'focus',
  status: 'idle',
  runStartAt: null,
  pausedAt: null,
  pausedAccumMs: 0,
  remainingMs: DEFAULT_CONFIG.focusMinutes * 60 * 1000,
  completedFocusCount: 0,
}

export const CONFIG_STORAGE_KEY = 'rann:pomodoro:config'
export const SESSION_STORAGE_KEY = 'rann:pomodoro:session'

export const MODE_DURATION_MS = (
  config: PomodoroConfig,
  mode: PomodoroMode,
): number => {
  switch (mode) {
    case 'focus':
      return config.focusMinutes * 60 * 1000
    case 'shortBreak':
      return config.shortBreakMinutes * 60 * 1000
    case 'longBreak':
      return config.longBreakMinutes * 60 * 1000
  }
}

export const MODE_LABEL: Record<PomodoroMode, string> = {
  focus: 'FOCUS',
  shortBreak: 'SHORT BREAK',
  longBreak: 'LONG BREAK',
}

export const MODE_BADGE: Record<PomodoroMode, string> = {
  focus: 'bg-pink-deep text-white',
  shortBreak: 'bg-sage text-ink',
  longBreak: 'bg-rose text-ink',
}
