import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'

import { Button } from '@/components/ui/Button'
import { Dialog } from '@/components/ui/Dialog'
import { Input } from '@/components/ui/Input'
import { useRenameWorkspace } from '../hooks'

type RenameWorkspaceDialogProps = {
  open: boolean
  workspaceId: string
  initialName: string
  onClose: () => void
}

export function RenameWorkspaceDialog({
  open,
  workspaceId,
  initialName,
  onClose,
}: RenameWorkspaceDialogProps) {
  const rename = useRenameWorkspace()
  const [name, setName] = useState(initialName)

  useEffect(() => {
    if (open) setName(initialName)
  }, [open, initialName])

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    const trimmed = name.trim()
    if (!trimmed) return
    rename.mutate(
      { id: workspaceId, name: trimmed },
      {
        onSuccess: () => onClose(),
      },
    )
  }

  return (
    <Dialog open={open} onClose={onClose} title="Rename Workspace">
      <form onSubmit={handleSubmit} className="flex w-md flex-col gap-4">
        <label className="flex flex-col gap-1">
          <span className="text-xs font-bold uppercase tracking-wider text-muted dark:text-dark-muted">
            Name
          </span>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoFocus
            required
            maxLength={80}
          />
        </label>

        <div className="mt-2 flex justify-end gap-2">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={!name.trim() || rename.isPending}>
            Save
          </Button>
        </div>
      </form>
    </Dialog>
  )
}
