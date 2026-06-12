import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '../utils/cn'

const buttonVariants = cva(
  'btn-apple inline-flex items-center justify-center gap-2 font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-system-blue focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-40',
  {
    variants: {
      variant: {
        primary:
          'bg-system-blue text-white hover:bg-system-blue/90 active:bg-system-blue/80',
        secondary:
          'bg-fill-primary text-label-primary hover:bg-fill-secondary active:bg-fill-tertiary',
        tertiary:
          'bg-transparent text-system-blue hover:bg-system-blue/10 active:bg-system-blue/20',
        danger:
          'bg-system-red text-white hover:bg-system-red/90 active:bg-system-red/80',
        ghost:
          'bg-transparent text-label-secondary hover:bg-fill-quaternary hover:text-label-primary active:bg-fill-tertiary',
        outline:
          'border border-separator bg-transparent text-label-primary hover:bg-fill-quaternary active:bg-fill-tertiary',
      },
      size: {
        sm: 'h-7 rounded-md px-3 text-caption-1',
        md: 'h-9 rounded-[10px] px-4 text-subheadline',
        lg: 'h-11 rounded-[10px] px-5 text-body',
        icon: 'h-9 w-9 rounded-[10px]',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  }
)

export interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  loading?: boolean
  icon?: ReactNode
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, loading, icon, children, disabled, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        disabled={disabled || loading}
        {...props}
      >
        {loading ? (
          <svg
            className="animate-spin"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            width="16"
            height="16"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        ) : icon ? (
          icon
        ) : null}
        {children}
      </button>
    )
  }
)

Button.displayName = 'Button'
