import { cn } from '@/utils/cn'

interface EmptyStateProps {
  icon?: React.ReactNode
  title: string
  description?: string
  action?: React.ReactNode
  className?: string
}

export function EmptyState({ icon, title, description, action, className }: EmptyStateProps) {
  return (
    <div className={cn('flex flex-col items-center justify-center py-16', className)}>
      {icon && (
        <div className="mb-4 rounded-full bg-fill-quaternary p-4">
          {icon}
        </div>
      )}
      <h3 className="text-headline text-label-secondary">{title}</h3>
      {description && (
        <p className="mt-1 max-w-sm text-center text-footnote text-label-tertiary">
          {description}
        </p>
      )}
      {action && <div className="mt-4">{action}</div>}
    </div>
  )
}
