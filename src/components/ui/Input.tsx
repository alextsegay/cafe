import { InputHTMLAttributes, forwardRef } from 'react'
import { cn } from '@/lib/utils'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  icon?: React.ReactNode
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, icon, ...props }, ref) => {
    return (
      <div className="space-y-1.5">
        {label && (
          <label className="block text-sm font-medium text-foreground/80">
            {label}
          </label>
        )}
        <div className="relative">
          {icon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
              {icon}
            </div>
          )}
          <input
            ref={ref}
            className={cn(
              'w-full px-4 py-3 rounded-xl border bg-white/50 dark:bg-black/20 backdrop-blur-sm',
              'focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500',
              'transition-all duration-200',
              'placeholder:text-muted-foreground/50',
              icon && 'pl-10',
              error 
                ? 'border-red-500 focus:ring-red-500/50 focus:border-red-500' 
                : 'border-gray-200 dark:border-gray-700',
              className
            )}
            {...props}
          />
        </div>
        {error && (
          <p className="text-sm text-red-500">{error}</p>
        )}
      </div>
    )
  }
)

Input.displayName = 'Input'

export { Input }
