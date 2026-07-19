import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import type { Task } from '@/db/schema'
import { useCreateTask, useUpdateTask } from '@/features/tasks'

import { Button } from '@/components/ui/Button'
import { Dialog } from '@/components/ui/Dialog'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'

type TaskEditorModalProps = {
  open: boolean
  task?: Task | null
  onClose: () => void
}

export function TaskEditorModal({ open, task, onClose }: TaskEditorModalProps) {
  const isEdit = !!task
  const create = useCreateTask()
  const update = useUpdateTask()

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')

  useEffect(() => {
    if (!open) return
    setTitle(task?.title ?? '')
    setDescription(task?.description ?? '')
  }, [open, task])

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    const trimmedTitle = title.trim()
    if (!trimmedTitle) return

    if (isEdit && task) {
      update.mutate(
        {
          id: task.id,
          title: trimmedTitle,
          description: description.trim() || null,
        },
        { onSuccess: onClose },
      )
    } else {
      create.mutate(
        {
          title: trimmedTitle,
          description: description.trim() || undefined,
        },
        { onSuccess: onClose },
      )
    }
  }

  const isPending = create.isPending || update.isPending

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={isEdit ? 'Edit Task' : 'New Task'}
    >
      <form onSubmit={handleSubmit} className="flex w-md flex-col gap-4">
        <label className="flex flex-col gap-1">
          <span className="text-xs font-bold uppercase tracking-wider text-muted dark:text-dark-muted">
            Title
          </span>
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="What needs to be done?"
            autoFocus
            required
          />
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-xs font-bold uppercase tracking-wider text-muted dark:text-dark-muted">
            Note (optional)
          </span>
          <Textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Add some details..."
            rows={6}
            className="resize-y"
          />
        </label>

        <div className="mt-2 flex justify-end gap-2">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={!title.trim() || isPending}>
            {isEdit ? 'Save' : 'Create'}
          </Button>
        </div>
      </form>
    </Dialog>
  )
}
