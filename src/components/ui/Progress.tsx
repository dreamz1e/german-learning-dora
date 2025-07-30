import { HTMLAttributes, forwardRef } from 'react'
import { cn } from '@/lib/utils'

interface ProgressProps extends HTMLAttributes<HTMLDivElement> {
  value?: number
  max?: number
  size?: 'sm' | 'md' | 'lg'
  variant?: 'default' | 'success' | 'warning' | 'error'
  showLabel?: boolean
}

const Progress = forwardRef<HTMLDivElement, ProgressProps>(
  ({ className, value = 0, max = 100, size = 'md', variant = 'default', showLabel, ...props }, ref) => {
    const percentage = Math.min(Math.max((value / max) * 100, 0), 100)

    const sizeClasses = {
      sm: 'h-2',
      md: 'h-3',
      lg: 'h-4'
    }

    const variantClasses = {
      default: 'bg-primary',
      success: 'bg-green-500',
      warning: 'bg-yellow-500',
      error: 'bg-red-500'
    }

    return (
      <div ref={ref} className={cn('relative', className)} {...props}>
        {showLabel && (
          <div className="flex justify-between text-sm text-muted-foreground mb-1">
            <span>{value}</span>
            <span>{max}</span>
          </div>
        )}
        <div className={cn('w-full bg-secondary rounded-full overflow-hidden', sizeClasses[size])}>
          <div
            className={cn('h-full transition-all duration-300 ease-out rounded-full', variantClasses[variant])}
            style={{ width: `${percentage}%` }}
          />
        </div>
        {showLabel && (
          <div className="text-center text-xs text-muted-foreground mt-1">
            {Math.round(percentage)}%
          </div>
        )}
      </div>
    )
  }
)
Progress.displayName = 'Progress'

export { Progress }