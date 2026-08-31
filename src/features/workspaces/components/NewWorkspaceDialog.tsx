import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'

import { Button } from '@/components/ui/Button'
import { Dialog } from '@/components/ui/Dialog'
import { Input } from '@/components/ui/Input'
import { useCreateWorkspace } from '../hooks'

type NewWorkspaceDialogProps = {
  open: boolean
  onClose: () => void
}

export function NewWorkspaceDialog({ open, onClose }: NewWorkspaceDialogProps) {
  const create = useCreateWorkspace()
  const [name, setName] = useState('')

  useEffect(() => {
    if (open) setName('')
  }, [open])

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    const trimmed = name.trim()
    if (!trimmed) return
    create.mutate(
      { name: trimmed },
      {
        onSuccess: () => onClose(),
      },
    )
  }

  return (
    <Dialog open={open} onClose={onClose} title="New Workspace">
      <form onSubmit={handleSubmit} className="flex w-md flex-col gap-4">
        <label className="flex flex-col gap-1">
          <span className="text-xs font-bold uppercase tracking-wider text-muted dark:text-dark-muted">
            Name
          </span>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Personal, Work, Side Project"
            autoFocus
            required
            maxLength={80}
          />
        </label>

        <div className="mt-2 flex justify-end gap-2">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={!name.trim() || create.isPending}>
            Create
          </Button>
        </div>
      </form>
    </Dialog>
  )
}
