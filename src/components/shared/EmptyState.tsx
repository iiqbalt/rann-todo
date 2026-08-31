import type { ReactNode } from 'react'

type EmptyStateProps = {
  icon?: ReactNode
  title: string
  description?: string
}

export function EmptyState({ icon, title, description }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-brutal-sm border-2 border-dashed border-ink/15 bg-warm/40 px-6 py-8 text-center dark:border-dark-ink/15 dark:bg-dark-warm/40">
      {icon && (
        <div className="mb-3 text-muted dark:text-dark-muted">{icon}</div>
      )}
      <p className="font-medium text-ink dark:text-dark-ink">{title}</p>
      {description && (
        <p className="mt-1 text-sm text-muted dark:text-dark-muted">
          {description}
        </p>
      )}
    </div>
  )
}
