import { History as HistoryIcon } from 'lucide-react'
import { useHistory } from '@/features/history'
import { EmptyState } from '@/components/shared/EmptyState'
import { HistoryCard } from '@/components/history/HistoryCard'

function formatDateHeading(dateStr: string): string {
  const [y, m, d] = dateStr.split('-').map(Number)
  const date = new Date(y, (m ?? 1) - 1, d ?? 1)
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

export function HistoryPage() {
  const { data: groups = [], isLoading, isError } = useHistory()

  const totalTasks = groups.reduce((sum, g) => sum + g.tasks.length, 0)

  return (
    <div className="mx-auto max-w-3xl px-8 py-10">
      <header className="mb-8 flex items-baseline justify-between">
        <h1 className="text-2xl font-bold uppercase tracking-widest text-pink-deep dark:text-dark-pink-deep">
          History
        </h1>
        <div className="text-sm font-medium text-muted dark:text-dark-muted">
          <span className="text-ink dark:text-dark-ink">{totalTasks}</span>{' '}
          {totalTasks === 1 ? 'task' : 'tasks'} across{' '}
          <span className="text-ink dark:text-dark-ink">{groups.length}</span>{' '}
          {groups.length === 1 ? 'day' : 'days'}
        </div>
      </header>

      {isLoading ? (
        <div className="py-12 text-center text-muted dark:text-dark-muted">Loading history...</div>
      ) : isError ? (
        <EmptyState
          icon={<HistoryIcon className="h-12 w-12" />}
          title="Couldn't load history"
          description="Please try again later"
        />
      ) : groups.length === 0 ? (
        <EmptyState
          icon={<HistoryIcon className="h-12 w-12" />}
          title="No history yet"
          description="Completed tasks will appear here"
        />
      ) : (
        <div className="flex flex-col gap-8">
          {groups.map((group) => (
            <section key={group.date}>
              <h2 className="mb-3 flex items-center gap-3 text-xs font-bold uppercase tracking-widest text-muted dark:text-dark-muted">
                <span className="h-px flex-1 bg-ink/15 dark:bg-dark-ink/15" />
                <span className="whitespace-nowrap">
                  {formatDateHeading(group.date)}
                </span>
                <span className="h-px flex-1 bg-ink/15 dark:bg-dark-ink/15" />
              </h2>
              <div className="flex flex-col gap-2">
                {group.tasks
                  .filter((task) => task.completedAt)
                  .map((task) => (
                    <HistoryCard key={task.id} task={task} />
                  ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  )
}
