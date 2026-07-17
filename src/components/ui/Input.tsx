import { forwardRef, type InputHTMLAttributes } from 'react'

type InputProps = InputHTMLAttributes<HTMLInputElement>

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className = '', ...props }, ref) => (
    <input
      ref={ref}
      className={`rounded-brutal border-2 border-ink/20 bg-warm px-4 py-2 text-base text-ink outline-none transition-all placeholder:text-muted focus:border-pink focus:shadow-brutal-soft ${className}`}
      {...props}
    />
  ),
)
Input.displayName = 'Input'
