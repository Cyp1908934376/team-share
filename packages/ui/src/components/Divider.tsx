import { cn } from '../utils/cn'

interface DividerProps {
  className?: string
  label?: string
  orientation?: 'horizontal' | 'vertical'
}

export function Divider({ className, label, orientation = 'horizontal' }: DividerProps) {
  if (orientation === 'vertical') {
    return (
      <div
        className={cn('h-full w-px bg-separator', className)}
        role="separator"
        aria-orientation="vertical"
      />
    )
  }

  if (label) {
    return (
      <div className={cn('flex items-center gap-4', className)} role="separator">
        <div className="h-px flex-1 bg-separator" />
        <span className="text-caption-2 text-label-tertiary">{label}</span>
        <div className="h-px flex-1 bg-separator" />
      </div>
    )
  }

  return (
    <div
      className={cn('h-px w-full bg-separator', className)}
      role="separator"
      aria-orientation="horizontal"
    />
  )
}
