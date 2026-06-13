import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '../utils/cn'

const buttonVariants = cva(
  'btn-apple inline-flex items-center justify-center gap-2 font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-system-blue focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-40 active:scale-[0.98]',
  {
    variants: {
      variant: {
        // 主按钮 — 主题自适应深色/亮色，非蓝色
        primary:
          'bg-label-primary text-bg-primary shadow-apple-1 hover:opacity-90 active:opacity-80',
        // 次按钮 — 浅色填充
        secondary:
          'bg-fill-secondary text-label-primary hover:bg-fill-tertiary active:bg-fill-primary',
        // 强调按钮 — 蓝色，仅用于关键操作
        accent:
          'bg-system-blue text-white shadow-apple-1 hover:bg-system-blue/90 active:bg-system-blue/80',
        // 三级按钮 — 纯文字
        tertiary:
          'bg-transparent text-label-primary hover:bg-fill-quaternary active:bg-fill-tertiary',
        // 危险按钮
        danger:
          'bg-system-red text-white shadow-apple-1 hover:bg-system-red/90 active:bg-system-red/80',
        // 幽灵按钮 — 工具栏风格
        ghost:
          'bg-transparent text-label-secondary hover:bg-fill-quaternary hover:text-label-primary active:bg-fill-tertiary',
        // 轮廓按钮
        outline:
          'border border-separator bg-transparent text-label-primary hover:bg-fill-quaternary active:bg-fill-tertiary',
      },
      size: {
        sm: 'h-7 rounded-md px-3 text-caption-1',
        md: 'h-9 rounded-md px-4 text-subheadline',
        lg: 'h-11 rounded-md px-5 text-body',
        icon: 'h-9 w-9 rounded-md',
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
