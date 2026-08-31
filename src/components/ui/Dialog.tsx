import { useEffect, useRef } from 'react'
import type { MouseEvent, ReactNode } from 'react'

type DialogProps = {
  open: boolean
  onClose: () => void
  title?: string
  children: ReactNode
}

export function Dialog({ open, onClose, title, children }: DialogProps) {
  const ref = useRef<HTMLDialogElement>(null)

  useEffect(() => {
    const dialog = ref.current
    if (!dialog) return
    if (open && !dialog.open) {
      dialog.showModal()
    } else if (!open && dialog.open) {
      dialog.close()
    }
  }, [open])

  useEffect(() => {
    const dialog = ref.current
    if (!dialog) return
    const handleClose = () => onClose()
    dialog.addEventListener('close', handleClose)
    dialog.addEventListener('cancel', handleClose)
    return () => {
      dialog.removeEventListener('close', handleClose)
      dialog.removeEventListener('cancel', handleClose)
    }
  }, [onClose])

  const handleBackdropClick = (e: MouseEvent<HTMLDialogElement>) => {
    if (e.target === ref.current) onClose()
  }

  return (
    <dialog
      ref={ref}
      onClick={handleBackdropClick}
      className="m-auto rounded-brutal border-2 border-ink bg-warm p-6 text-ink shadow-brutal outline-none dark:border-dark-ink dark:bg-dark-warm dark:text-dark-ink dark:shadow-brutal-dark"
    >
      {title && (
        <h2 className="mb-4 text-lg font-bold uppercase tracking-widest text-ink dark:text-dark-ink">
          {title}
        </h2>
      )}
      {children}
    </dialog>
  )
}
