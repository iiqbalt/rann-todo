import type { ReactNode } from 'react'
import { useDroppable } from '@dnd-kit/core'
import {
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'

export type BoardStatus = 'TODO' | 'IN_PROGRESS'

type BoardProps = {
  status: BoardStatus
  title: string
  count?: number
  itemIds: string[]
  children?: ReactNode
  actions?: ReactNode
}

export function Board({
  status,
  title,
  count,
  itemIds,
  children,
  actions,
}: BoardProps) {
  const { setNodeRef, isOver } = useDroppable({ id: status })

  return (
    <section className="rounded-brutal border-2 border-ink/15 bg-warm p-5 shadow-brutal-soft dark:border-dark-ink/15 dark:bg-dark-warm dark:shadow-brutal-soft-dark">
      <header className="mb-4 flex items-center justify-between">
        <h2 className="text-sm font-bold uppercase tracking-widest text-ink dark:text-dark-ink">
          {title}
          {count !== undefined && (
            <span className="ml-2 text-muted dark:text-dark-muted">({count})</span>
          )}
        </h2>
        {actions && <div>{actions}</div>}
      </header>
      <SortableContext items={itemIds} strategy={verticalListSortingStrategy}>
        <div
          ref={setNodeRef}
          data-status={status}
          className={`flex min-h-[60px] flex-col gap-2 rounded-brutal-sm border-2 border-dashed border-transparent p-1 transition-colors ${
            isOver ? 'border-pink bg-pink-light/30 dark:border-dark-pink dark:bg-dark-pink-light/30' : ''
          }`}
        >
          {children}
        </div>
      </SortableContext>
    </section>
  )
}
