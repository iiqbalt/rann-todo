import type { ReactNode } from 'react'

type TooltipProps = {
  label: string
  children: ReactNode
  side?: 'top' | 'bottom'
}

export function Tooltip({ label, children, side = 'bottom' }: TooltipProps) {
  const positionClass =
    side === 'top' ? 'bottom-full mb-1.5' : 'top-full mt-1.5'

  return (
    <span className="group/tooltip relative inline-flex">
      {children}
      <span
        role="tooltip"
        className={`pointer-events-none absolute left-1/2 z-10 -translate-x-1/2 whitespace-nowrap rounded-brutal-sm border-2 border-ink bg-ivory px-2 py-1 text-xs font-semibold text-ink opacity-0 shadow-brutal-soft transition-opacity group-hover/tooltip:opacity-100 dark:border-dark-ink dark:bg-dark-ivory dark:text-dark-ink dark:shadow-brutal-soft-dark ${positionClass}`}
      >
        {label}
      </span>
    </span>
  )
}
