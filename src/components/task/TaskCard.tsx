import type { CSSProperties, MouseEvent } from 'react'
import { CSS } from '@dnd-kit/utilities'
import { useSortable } from '@dnd-kit/sortable'
import { Trash2 } from 'lucide-react'
import type { Task } from '@/db/schema'
import {
  useCompleteTask,
  useDeleteTask,
  useMoveTask,
} from '@/features/tasks'

type TaskCardProps = {
  task: Task
  onEdit?: (task: Task) => void
}

export function TaskCard({ task, onEdit }: TaskCardProps) {
  const remove = useDeleteTask()
  const complete = useCompleteTask()
  const move = useMoveTask()

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id })

  const handleToggle = () => {
    if (task.status === 'IN_PROGRESS') {
      complete.mutate({ id: task.id })
    } else {
      move.mutate({ id: task.id, targetStatus: 'IN_PROGRESS' })
    }
  }

  const handleDelete = (e: MouseEvent) => {
    e.stopPropagation()
    remove.mutate({ id: task.id })
  }

  const style: CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`group flex items-center gap-3 rounded-brutal-sm border-2 bg-warm px-4 py-3 transition-all hover:border-ink/30 hover:shadow-brutal-soft dark:bg-dark-warm dark:hover:border-dark-ink/30 dark:hover:shadow-brutal-soft-dark ${
        isDragging
          ? 'border-pink shadow-brutal dark:border-dark-pink dark:shadow-brutal-dark'
          : 'border-ink/15 dark:border-dark-ink/15'
      }`}
    >
      <button
        type="button"
        onClick={handleToggle}
        aria-label={
          task.status === 'IN_PROGRESS' ? 'Complete task' : 'Move to in progress'
        }
        className="flex h-5 w-5 shrink-0 items-center justify-center rounded-md border-2 border-ink/40 transition-colors hover:border-pink hover:bg-pink-light dark:border-dark-ink/40 dark:hover:border-dark-pink dark:hover:bg-dark-pink-light"
      />
      <button
        type="button"
        onClick={() => onEdit?.(task)}
        {...attributes}
        {...listeners}
        className="flex flex-1 cursor-grab flex-col items-start gap-0.5 text-left active:cursor-grabbing"
      >
        <span className="w-full truncate text-base text-ink dark:text-dark-ink">{task.title}</span>
      </button>
      <button
        type="button"
        onClick={handleDelete}
        aria-label="Delete task"
        className="text-muted opacity-0 transition-all hover:text-rose group-hover:opacity-100 dark:text-dark-muted dark:hover:text-dark-rose"
      >
        <Trash2 className="h-4 w-4" />
      </button>
    </div>
  )
}
