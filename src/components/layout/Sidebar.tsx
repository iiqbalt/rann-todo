import { Link, useRouterState } from '@tanstack/react-router'
import { CheckCircle2, History, LayoutList, LogOut } from 'lucide-react'

const navItems = [
  { to: '/', icon: LayoutList, label: 'Dashboard' },
  { to: '/history', icon: History, label: 'History' },
] as const

type SidebarProps = {
  collapsed: boolean
}

export function Sidebar({ collapsed }: SidebarProps) {
  const pathname = useRouterState({
    select: (state) => state.location.pathname,
  })

  return (
    <aside
      className={`flex h-screen shrink-0 flex-col justify-between border-r-2 border-ink/10 bg-warm py-6 transition-[width,padding] duration-300 ease-out dark:border-dark-ink/10 dark:bg-dark-warm ${
        collapsed
          ? 'w-20 items-center px-3'
          : 'w-64 px-5'
      }`}
    >
      <div className={`flex w-full flex-col gap-6`}>
        <div
          className={`flex items-center ${
            collapsed ? 'justify-center' : 'gap-3'
          }`}
        >
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-brutal-sm bg-pink text-white shadow-brutal-soft dark:bg-dark-pink dark:shadow-brutal-pink-dark">
            <CheckCircle2 className="h-5 w-5" strokeWidth={3} />
          </div>
          {!collapsed && (
            <span className="text-xl font-bold text-ink dark:text-dark-ink">Rann Todo</span>
          )}
        </div>

        <nav className="flex flex-col gap-2">
          {navItems.map((item) => {
            const isActive = pathname === item.to
            const Icon = item.icon
            return (
              <Link
                key={item.to}
                to={item.to}
                aria-label={item.label}
                title={collapsed ? item.label : undefined}
                className={`flex items-center rounded-brutal-sm border-2 transition-all ${
                  collapsed
                    ? 'h-10 w-full justify-center'
                    : 'gap-3 px-4 py-2.5 text-sm font-bold uppercase tracking-wider'
                } ${
                  isActive
                    ? 'border-ink bg-pink-light text-ink shadow-brutal-soft dark:border-dark-ink dark:bg-dark-pink-light dark:text-dark-ink dark:shadow-brutal-soft-dark'
                    : 'border-transparent text-muted hover:border-ink/15 hover:text-ink dark:text-dark-muted dark:hover:border-dark-ink/15 dark:hover:text-dark-ink'
                }`}
              >
                <Icon className="h-4 w-4 shrink-0" />
                {!collapsed && item.label}
              </Link>
            )
          })}
        </nav>
      </div>

      {/* <div
        className={`flex items-center border-t-2 border-ink/10 pt-4 ${
          collapsed
            ? 'w-full justify-center'
            : 'w-full gap-3'
        }`}
      >
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-pink font-bold text-white">
          F
        </div>
        {!collapsed && (
          <>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-ink">
                fatik.backup2@gmail...
              </p>
              <p className="text-xs text-muted">Creator</p>
            </div>
            <button
              type="button"
              aria-label="Logout"
              className="text-muted transition-colors hover:text-ink"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </>
        )}
      </div> */}
    </aside>
  )
}
