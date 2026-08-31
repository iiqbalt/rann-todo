import { useState } from 'react'
import { Link, useNavigate } from '@tanstack/react-router'
import { MoreHorizontal, Pencil, Plus, Trash2 } from 'lucide-react'

import { Button } from '@/components/ui/Button'
import { Tooltip } from '@/components/shared/Tooltip'
import {
  DEFAULT_WORKSPACE_SLUG,
  useCurrentWorkspace,
  useWorkspaces,
} from '@/features/workspaces'
import type { CurrentWorkspace } from '@/features/workspaces'

import { NewWorkspaceDialog } from './NewWorkspaceDialog'
import { RenameWorkspaceDialog } from './RenameWorkspaceDialog'
import { DeleteWorkspaceDialog } from './DeleteWorkspaceDialog'

type WorkspaceTarget = {
  slug: string
  label: string
  isDefault: boolean
  id?: string
}

function toTargets(
  list: { id: string; name: string }[],
  current: CurrentWorkspace,
): { default: WorkspaceTarget; others: WorkspaceTarget[] } {
  return {
    default: {
      slug: DEFAULT_WORKSPACE_SLUG,
      label: 'Default',
      isDefault: true,
    },
    others: list.map((w) => ({
      slug: w.id,
      label: w.name,
      isDefault: false,
      id: w.id,
    })),
  }
}

type WorkspaceItemProps = {
  target: WorkspaceTarget
  current: CurrentWorkspace
  collapsed: boolean
  onRequestRename: (target: WorkspaceTarget) => void
  onRequestDelete: (target: WorkspaceTarget) => void
}

function WorkspaceItem({
  target,
  current,
  collapsed,
  onRequestRename,
  onRequestDelete,
}: WorkspaceItemProps) {
  const isActive = current.rawId === target.slug

  const itemClass = collapsed
    ? 'h-10 w-full justify-center'
    : 'gap-3 px-4 py-2 text-sm'

  const stateClass = isActive
    ? 'border-ink/30 bg-pink-light text-ink shadow-brutal-soft dark:border-dark-ink/30 dark:bg-dark-pink-light dark:text-dark-ink dark:shadow-brutal-soft-dark'
    : 'border-transparent text-muted hover:border-ink/15 hover:text-ink dark:text-dark-muted dark:hover:border-dark-ink/15 dark:hover:text-dark-ink'

  const content = (
    <div className="group relative w-full">
      <Link
        to="/w/$workspaceId"
        params={{ workspaceId: target.slug }}
        aria-label={target.label}
        title={collapsed ? target.label : undefined}
        className={`flex items-center rounded-brutal-sm border-2 transition-all ${itemClass} ${stateClass}`}
      >
        <span className="h-2 w-2 shrink-0 rounded-full bg-current opacity-60" />
        {!collapsed && (
          <span className="flex-1 truncate font-bold uppercase tracking-wider">
            {target.label}
          </span>
        )}
      </Link>
      {!collapsed && !target.isDefault && target.id && (
        <div className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 transition-opacity group-hover:opacity-100">
          <WorkspaceItemMenu
            target={target}
            onRename={onRequestRename}
            onDelete={onRequestDelete}
          />
        </div>
      )}
    </div>
  )

  if (collapsed) {
    return content
  }
  return content
}

function WorkspaceItemMenu({
  target,
  onRename,
  onDelete,
}: {
  target: WorkspaceTarget
  onRename: (target: WorkspaceTarget) => void
  onDelete: (target: WorkspaceTarget) => void
}) {
  const [open, setOpen] = useState(false)

  if (!target.id) return null

  return (
    <div className="relative">
      <button
        type="button"
        aria-label={`Actions for ${target.label}`}
        onClick={(e) => {
          e.preventDefault()
          e.stopPropagation()
          setOpen((v) => !v)
        }}
        className="flex h-7 w-7 items-center justify-center rounded-brutal-sm border-2 border-transparent text-muted hover:border-ink/20 hover:text-ink dark:text-dark-muted dark:hover:border-dark-ink/20 dark:hover:text-dark-ink"
      >
        <MoreHorizontal className="h-4 w-4" />
      </button>
      {open && (
        <>
          <button
            type="button"
            aria-label="Close menu"
            onClick={() => setOpen(false)}
            className="fixed inset-0 z-10 cursor-default"
          />
          <div className="absolute right-0 top-9 z-20 flex w-40 flex-col gap-1 rounded-brutal-sm border-2 border-ink/20 bg-warm p-1 shadow-brutal-soft dark:border-dark-ink/20 dark:bg-dark-warm dark:shadow-brutal-soft-dark">
            <button
              type="button"
              onClick={() => {
                setOpen(false)
                onRename(target)
              }}
              className="flex items-center gap-2 rounded-brutal-sm px-3 py-1.5 text-left text-sm text-ink hover:bg-ivory dark:text-dark-ink dark:hover:bg-dark-ivory"
            >
              <Pencil className="h-3.5 w-3.5" />
              Rename
            </button>
            <button
              type="button"
              onClick={() => {
                setOpen(false)
                onDelete(target)
              }}
              className="flex items-center gap-2 rounded-brutal-sm px-3 py-1.5 text-left text-sm text-rose hover:bg-ivory dark:hover:bg-dark-ivory"
            >
              <Trash2 className="h-3.5 w-3.5" />
              Delete
            </button>
          </div>
        </>
      )}
    </div>
  )
}

type WorkspaceSwitcherProps = {
  collapsed: boolean
}

export function WorkspaceSwitcher({ collapsed }: WorkspaceSwitcherProps) {
  const current = useCurrentWorkspace()
  const navigate = useNavigate()
  const { data: list = [] } = useWorkspaces()

  const [createOpen, setCreateOpen] = useState(false)
  const [renameTarget, setRenameTarget] = useState<WorkspaceTarget | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<WorkspaceTarget | null>(null)

  const { default: defaultTarget, others } = toTargets(list, current)

  const handleDeleted = () => {
    if (
      deleteTarget &&
      current.rawId === deleteTarget.slug &&
      !deleteTarget.isDefault
    ) {
      navigate({
        to: '/w/$workspaceId',
        params: { workspaceId: DEFAULT_WORKSPACE_SLUG },
      })
    }
  }

  return (
    <div className="flex flex-col gap-2">
      {!collapsed && (
        <div className="flex items-center justify-between px-2">
          <span className="text-xs font-bold uppercase tracking-widest text-muted dark:text-dark-muted">
            Workspaces
          </span>
          <Tooltip label="New workspace">
            <Button
              type="button"
              size="xs"
              variant="ghost"
              onClick={() => setCreateOpen(true)}
              aria-label="New workspace"
              className="h-6 w-6 p-0"
            >
              <Plus className="h-3.5 w-3.5" />
            </Button>
          </Tooltip>
        </div>
      )}
      {collapsed && (
        <div className="flex justify-center">
          <Tooltip label="New workspace">
            <Button
              type="button"
              size="xs"
              variant="ghost"
              onClick={() => setCreateOpen(true)}
              aria-label="New workspace"
              className="h-9 w-9 p-0"
            >
              <Plus className="h-4 w-4" />
            </Button>
          </Tooltip>
        </div>
      )}

      <nav className="flex flex-col gap-2">
        <WorkspaceItem
          target={defaultTarget}
          current={current}
          collapsed={collapsed}
          onRequestRename={() => {
            /* default not editable */
          }}
          onRequestDelete={() => {
            /* default not deletable */
          }}
        />
        {others.map((target) => (
          <WorkspaceItem
            key={target.slug}
            target={target}
            current={current}
            collapsed={collapsed}
            onRequestRename={(t) => setRenameTarget(t)}
            onRequestDelete={(t) => setDeleteTarget(t)}
          />
        ))}
      </nav>

      <NewWorkspaceDialog
        open={createOpen}
        onClose={() => setCreateOpen(false)}
      />
      <RenameWorkspaceDialog
        open={renameTarget !== null}
        workspaceId={renameTarget?.id ?? ''}
        initialName={renameTarget?.label ?? ''}
        onClose={() => setRenameTarget(null)}
      />
      <DeleteWorkspaceDialog
        open={deleteTarget !== null}
        workspaceId={deleteTarget?.id ?? ''}
        workspaceName={deleteTarget?.label ?? ''}
        onClose={() => setDeleteTarget(null)}
        onDeleted={handleDeleted}
      />
    </div>
  )
}
