import { Coffee, Pause, Play, RotateCcw, Target } from 'lucide-react'

import { Button } from '@/components/ui/Button'
import { MODE_BADGE, MODE_LABEL } from './types'
import type { PomodoroMode } from './types'
import { usePomodoro } from './usePomodoro'

const MODE_ICON: Record<PomodoroMode, typeof Target> = {
  focus: Target,
  shortBreak: Coffee,
  longBreak: Coffee,
}

function formatTime(ms: number): string {
  const totalSec = Math.max(0, Math.ceil(ms / 1000))
  const m = Math.floor(totalSec / 60)
  const s = totalSec % 60
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

export function PomodoroTimer() {
  const { session, start, pause, reset } = usePomodoro()

  const isRunning = session.status === 'running'
  const ModeIcon = MODE_ICON[session.mode]

  return (
    <div className="flex flex-col gap-4">
      <div
        className={`flex items-center justify-center gap-2 rounded-brutal-sm border-2 border-ink px-3 py-1.5 shadow-brutal-soft dark:border-dark-ink ${MODE_BADGE[session.mode]}`}
      >
        <ModeIcon className="h-3.5 w-3.5" />
        <span className="text-xs font-bold uppercase tracking-widest">
          {MODE_LABEL[session.mode]}
        </span>
      </div>

      <div className="flex flex-col items-center gap-1">
        <div className="font-mono text-5xl font-bold tabular-nums text-ink dark:text-dark-ink">
          {formatTime(session.remainingMs)}
        </div>
        <div className="flex items-center gap-1.5 text-xs font-medium text-muted dark:text-dark-muted">
          <span className="inline-flex h-1.5 w-1.5 rounded-full bg-rose/60 dark:bg-dark-rose/60" />
          Cycle {session.completedFocusCount + 1}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <Button
          onClick={isRunning ? pause : start}
          size="sm"
          variant={isRunning ? 'secondary' : 'primary'}
        >
          {isRunning ? (
            <>
              <Pause className="h-4 w-4" fill="currentColor" />
              Pause
            </>
          ) : (
            <>
              <Play className="h-4 w-4" fill="currentColor" />
              Resume
            </>
          )}
        </Button>
        <Button onClick={reset} size="sm" variant="ghost">
          <RotateCcw className="h-4 w-4" />
          Reset
        </Button>
      </div>
    </div>
  )
}
