import { X } from 'lucide-react'

import { MODE_BADGE } from './types'
import { PomodoroSettings } from './PomodoroSettings'
import { PomodoroTimer } from './PomodoroTimer'
import { usePomodoro } from './usePomodoro'

function formatTime(ms: number): string {
  const totalSec = Math.max(0, Math.ceil(ms / 1000))
  const m = Math.floor(totalSec / 60)
  const s = totalSec % 60
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

const IDLE_TAB_CLASS = 'bg-pink-deep text-white'

export function PomodoroDock() {
  const { isOpen, open, close, session, isMounted } = usePomodoro()

  const hasActiveSession =
    isMounted && (session.status === 'running' || session.status === 'paused')
  const showTimerView = hasActiveSession

  const tabLabel = hasActiveSession
    ? formatTime(session.remainingMs)
    : 'Pomodoro'
  const tabColorClass = hasActiveSession
    ? MODE_BADGE[session.mode]
    : IDLE_TAB_CLASS

  return (
    <div
      className="fixed top-1/2 right-0 z-40 flex -translate-y-1/2 items-stretch"
      aria-label="Pomodoro timer"
    >
      {!isOpen && (
        <button
          type="button"
          onClick={open}
          aria-label={
            hasActiveSession ? 'Open pomodoro timer' : 'Open pomodoro settings'
          }
          className={`group flex items-center justify-center border-l-2 border-y-2 border-ink py-6 pl-1 pr-2 shadow-brutal transition-[box-shadow,transform] hover:translate-x-[-2px] active:translate-x-0 active:shadow-none dark:border-dark-ink ${tabColorClass} ${hasActiveSession ? 'dark:shadow-brutal-soft-dark' : 'dark:shadow-brutal-pink'}`}
          style={{
            borderTopLeftRadius: 'var(--radius-brutal-sm)',
            borderBottomLeftRadius: 'var(--radius-brutal-sm)',
          }}
        >
          <span
            className="font-mono text-base font-bold uppercase tracking-[0.15em] tabular-nums"
            style={{
              writingMode: 'vertical-rl',
              transform: 'rotate(180deg)',
            }}
          >
            {tabLabel}
          </span>
        </button>
      )}

      {isOpen && (
        <div
          className="relative w-72 border-l-2 border-y-2 border-ink bg-warm p-4 pt-9 shadow-brutal-soft dark:border-dark-ink dark:bg-dark-warm dark:shadow-brutal-soft-dark"
          style={{
            borderTopLeftRadius: 'var(--radius-brutal-sm)',
            borderBottomLeftRadius: 'var(--radius-brutal-sm)',
          }}
        >
          <button
            type="button"
            onClick={close}
            aria-label="Close pomodoro timer"
            className="absolute top-1.5 right-1.5 inline-flex h-6 w-6 items-center justify-center rounded-full border-2 border-ink/20 bg-warm text-muted transition-all hover:border-ink hover:text-ink dark:border-dark-ink/20 dark:bg-dark-warm dark:text-dark-muted dark:hover:border-dark-ink dark:hover:text-dark-ink"
          >
            <X className="h-3.5 w-3.5" strokeWidth={3} />
          </button>

          {showTimerView ? <PomodoroTimer /> : <PomodoroSettings />}
        </div>
      )}
    </div>
  )
}
