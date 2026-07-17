import { Check } from 'lucide-react'
import type { Task } from '@/db/schema'

type HistoryCardProps = {
  task: Task
}

function formatTime(value: Date | string): string {
  return new Date(value).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  })
}

export function HistoryCard({ task }: HistoryCardProps) {
  const completedAt = task.completedAt

  return (
    <div className="flex items-center gap-3 rounded-brutal-sm border-2 border-ink/15 bg-warm/70 px-4 py-3 transition-all hover:border-ink/30">
      <div
        aria-label="Completed"
        className="flex h-5 w-5 shrink-0 items-center justify-center rounded-md border-2 border-ink bg-sage text-white"
      >
        <Check className="h-3 w-3" strokeWidth={4} />
      </div>
      <div className="flex flex-1 flex-col gap-0.5">
        <span className="truncate text-base text-ink line-through decoration-1 decoration-muted/60">
          {task.title}
        </span>
        {completedAt && (
          <span className="text-xs text-muted">
            Completed at {formatTime(completedAt)}
          </span>
        )}
      </div>
    </div>
  )
}
