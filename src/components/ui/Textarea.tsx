import { forwardRef, type TextareaHTMLAttributes } from 'react'

type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement>

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className = '', ...props }, ref) => (
    <textarea
      ref={ref}
      className={`rounded-brutal border-2 border-ink/20 bg-warm px-4 py-2 text-base text-ink outline-none transition-all placeholder:text-muted focus:border-pink focus:shadow-brutal-soft resize-none ${className}`}
      {...props}
    />
  ),
)
Textarea.displayName = 'Textarea'
