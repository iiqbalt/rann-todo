import { Button } from '@/components/ui/Button'
import { Dialog } from '@/components/ui/Dialog'
import { useDeleteWorkspace } from '../hooks'

type DeleteWorkspaceDialogProps = {
  open: boolean
  workspaceId: string
  workspaceName: string
  onClose: () => void
  onDeleted?: () => void
}

export function DeleteWorkspaceDialog({
  open,
  workspaceId,
  workspaceName,
  onClose,
  onDeleted,
}: DeleteWorkspaceDialogProps) {
  const remove = useDeleteWorkspace()

  const handleConfirm = () => {
    remove.mutate(
      { id: workspaceId },
      {
        onSuccess: () => {
          onDeleted?.()
          onClose()
        },
      },
    )
  }

  return (
    <Dialog open={open} onClose={onClose} title="Delete Workspace">
      <div className="flex w-md flex-col gap-4">
        <p className="text-sm text-ink dark:text-dark-ink">
          Are you sure you want to delete{' '}
          <span className="font-bold">{workspaceName}</span>?
        </p>
        <p className="rounded-brutal-sm border-2 border-ink/15 bg-cream px-4 py-3 text-sm text-muted dark:border-dark-ink/15 dark:bg-dark-cream dark:text-dark-muted">
          All its tasks will be moved to the{' '}
          <span className="font-bold text-ink dark:text-dark-ink">Default</span>{' '}
          workspace. This action cannot be undone.
        </p>

        <div className="mt-2 flex justify-end gap-2">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={handleConfirm}
            disabled={remove.isPending}
          >
            Delete
          </Button>
        </div>
      </div>
    </Dialog>
  )
}
