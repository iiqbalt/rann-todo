import { Moon, PanelLeftClose, PanelLeftOpen, Sun } from 'lucide-react'
import { useDarkMode } from '@/contexts/DarkModeContext'

type HeaderProps = {
  collapsed: boolean
  onToggle: () => void
}

export function Header({ collapsed, onToggle }: HeaderProps) {
  const { isDarkMode, toggleDarkMode } = useDarkMode()

  return (
    <header className="flex h-14 shrink-0 items-center justify-between border-b-2 border-ink/10 bg-cream/80 px-6 backdrop-blur-sm dark:border-dark-ink/10 dark:bg-dark-cream/80">
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={onToggle}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          className="flex h-9 w-9 items-center justify-center rounded-brutal-sm border-2 border-ink/20 bg-warm text-ink transition-all hover:border-ink hover:shadow-brutal-soft active:translate-x-0.5 active:translate-y-0.5 active:shadow-none hover:cursor-pointer dark:border-dark-ink/20 dark:bg-dark-warm dark:text-dark-ink dark:hover:border-dark-ink dark:hover:shadow-brutal-soft-dark"
        >
          {collapsed ? (
            <PanelLeftOpen className="h-4 w-4" />
          ) : (
            <PanelLeftClose className="h-4 w-4" />
          )}
        </button>
      </div>
      <button
        type="button"
        onClick={toggleDarkMode}
        aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
        title={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
        className="flex h-9 w-9 items-center justify-center rounded-brutal-sm border-2 border-ink/20 bg-warm text-ink transition-all hover:border-ink hover:shadow-brutal-soft active:translate-x-0.5 active:translate-y-0.5 active:shadow-none hover:cursor-pointer dark:border-dark-ink/20 dark:bg-dark-warm dark:text-dark-ink dark:hover:border-dark-ink dark:hover:shadow-brutal-soft-dark"
      >
        {isDarkMode ? (
          <Sun className="h-4 w-4" />
        ) : (
          <Moon className="h-4 w-4" />
        )}
      </button>
    </header>
  )
}
