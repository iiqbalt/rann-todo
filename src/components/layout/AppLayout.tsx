import { useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import { Header } from './Header'
import { Sidebar } from './Sidebar'

const STORAGE_KEY = 'rann:sidebar-collapsed'

function readCollapsed(): boolean {
  if (typeof window === 'undefined') return false
  return window.localStorage.getItem(STORAGE_KEY) === 'true'
}

export function AppLayout({ children }: { children: ReactNode }) {
  const [collapsed, setCollapsed] = useState<boolean>(readCollapsed)

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, String(collapsed))
  }, [collapsed])

  const toggle = () => setCollapsed((c) => !c)

  return (
    <div className="flex min-h-screen bg-cream dark:bg-dark-cream">
      <Sidebar collapsed={collapsed} />
      <div className="flex min-w-0 flex-1 flex-col">
        <Header collapsed={collapsed} onToggle={toggle} />
        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  )
}
