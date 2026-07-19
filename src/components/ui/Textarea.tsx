import { forwardRef, type TextareaHTMLAttributes } from 'react'

type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement>

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className = '', ...props }, ref) => (
    <textarea
      ref={ref}
      className={`rounded-brutal border-2 border-ink/20 bg-warm px-4 py-2 text-base text-ink outline-none transition-all placeholder:text-muted focus:border-pink focus:shadow-brutal-soft resize-none dark:border-dark-ink/20 dark:bg-dark-warm dark:text-dark-ink dark:placeholder:text-dark-muted dark:focus:border-dark-pink dark:focus:shadow-brutal-soft-dark ${className}`}
      {...props}
    />
  ),
)
Textarea.displayName = 'Textarea'
