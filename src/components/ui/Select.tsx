import { SelectHTMLAttributes, forwardRef } from 'react'
import { cn } from '@/lib/utils'
import { ChevronDown } from 'lucide-react'

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string
  error?: string
  options: { value: string; label: string }[]
}

const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, label, error, options, ...props }, ref) => {
    return (
      <div className="space-y-1.5">
        {label && (
          <label className="block text-sm font-medium text-foreground/80">
            {label}
          </label>
        )}
        <div className="relative">
          <select
            ref={ref}
            className={cn(
              'w-full px-4 py-3 rounded-xl border bg-white/50 dark:bg-black/20 backdrop-blur-sm',
              'focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500',
              'transition-all duration-200 appearance-none cursor-pointer',
              'pr-10 text-gray-900 dark:text-gray-100',
              error 
                ? 'border-red-500 focus:ring-red-500/50 focus:border-red-500' 
                : 'border-gray-200 dark:border-gray-700',
              className
            )}
            {...props}
          >
            {options.map(option => (
              <option
                key={option.value}
                value={option.value}
                className="bg-white text-gray-900 dark:bg-gray-800 dark:text-gray-100"
              >
                {option.label}
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground pointer-events-none" />
        </div>
        {error && (
          <p className="text-sm text-red-500">{error}</p>
        )}
      </div>
    )
  }
)

Select.displayName = 'Select'

export { Select }
