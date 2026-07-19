import { forwardRef, type ButtonHTMLAttributes } from 'react'

type Variant = 'primary' | 'secondary' | 'ghost' | 'destructive'
type Size = 'sm' | 'md' | 'lg'

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant
  size?: Size
}

const variantClasses: Record<Variant, string> = {
  primary: 'bg-pink text-ink dark:bg-dark-pink dark:text-dark-ink',
  secondary: 'bg-ivory text-ink dark:bg-dark-ivory dark:text-dark-ink',
  ghost: 'bg-transparent text-ink border-transparent shadow-none dark:text-dark-ink',
  destructive: 'bg-rose text-ink dark:bg-dark-rose dark:text-dark-ink',
}

const sizeClasses: Record<Size, string> = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2 text-base',
  lg: 'px-6 py-3 text-lg',
}

const baseClasses =
  'rounded-brutal border-2 border-ink font-semibold shadow-brutal-soft transition-[box-shadow,transform] active:translate-x-1 active:translate-y-1 active:shadow-none disabled:opacity-50 disabled:pointer-events-none inline-flex items-center justify-center gap-2 whitespace-nowrap dark:border-dark-ink dark:shadow-brutal-soft-dark'

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className = '', variant = 'primary', size = 'md', ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
        {...props}
      />
    )
  },
)
Button.displayName = 'Button'
