import { forwardRef, type HTMLAttributes } from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '../utils/cn'

const badgeVariants = cva(
  'inline-flex items-center rounded-full px-2 py-0.5 text-caption-2 font-medium transition-colors',
  {
    variants: {
      variant: {
        default: 'bg-fill-quaternary text-label-secondary',
        primary: 'bg-system-blue/10 text-system-blue',
        success: 'bg-system-green/10 text-system-green',
        warning: 'bg-system-orange/10 text-system-orange',
        danger: 'bg-system-red/10 text-system-red',
        info: 'bg-system-teal/10 text-system-teal',
      },
      size: {
        sm: 'px-1.5 py-0.5 text-[10px]',
        md: 'px-2 py-0.5 text-caption-2',
        lg: 'px-3 py-1 text-caption-1',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
    },
  }
)

export interface BadgeProps
  extends HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {
  dot?: boolean
}

export const Badge = forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant, size, dot, children, ...props }, ref) => {
    const dotColors: Record<string, string> = {
      default: 'bg-label-tertiary',
      primary: 'bg-system-blue',
      success: 'bg-system-green',
      warning: 'bg-system-orange',
      danger: 'bg-system-red',
      info: 'bg-system-teal',
    }

    return (
      <span
        ref={ref}
        className={cn(badgeVariants({ variant, size }), className)}
        {...props}
      >
        {dot && (
          <span
            className={cn('mr-1 h-1.5 w-1.5 rounded-full', dotColors[variant || 'default'])}
          />
        )}
        {children}
      </span>
    )
  }
)

Badge.displayName = 'Badge'
