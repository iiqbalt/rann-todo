import { PanelLeftClose, PanelLeftOpen } from 'lucide-react'

type HeaderProps = {
  collapsed: boolean
  onToggle: () => void
}

export function Header({ collapsed, onToggle }: HeaderProps) {
  return (
    <header className="flex h-14 shrink-0 items-center justify-between border-b-2 border-ink/10 bg-cream/80 px-6 backdrop-blur-sm">
      <button
        type="button"
        onClick={onToggle}
        aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        className="flex h-9 w-9 items-center justify-center rounded-brutal-sm border-2 border-ink/20 bg-warm text-ink transition-all hover:border-ink hover:shadow-brutal-soft active:translate-x-0.5 active:translate-y-0.5 active:shadow-none hover:cursor-pointer"
      >
        {collapsed ? (
          <PanelLeftOpen className="h-4 w-4" />
        ) : (
          <PanelLeftClose className="h-4 w-4" />
        )}
      </button>

      <div className="text-xs font-bold uppercase tracking-widest text-muted">
        Daily Todo Workspace
      </div>
    </header>
  )
}
