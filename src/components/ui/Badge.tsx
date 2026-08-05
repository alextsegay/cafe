import { HTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'popular' | 'new' | 'warning' | 'danger' | 'success'
  size?: 'sm' | 'md'
}

export function Badge({ 
  className, 
  variant = 'default', 
  size = 'sm',
  children, 
  ...props 
}: BadgeProps) {
  const variants = {
    default: 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300',
    popular: 'bg-gradient-to-r from-amber-500 to-yellow-500 text-white',
    new: 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white',
    warning: 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400',
    danger: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400',
    success: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400',
  }

  const sizes = {
    sm: 'px-2.5 py-0.5 text-xs',
    md: 'px-3 py-1 text-sm',
  }

  return (
    <span
      className={cn(
        'inline-flex items-center font-medium rounded-full',
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    >
      {children}
    </span>
  )
}
