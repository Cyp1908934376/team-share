import { AlertCircle, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui'
import { cn } from '@/utils/cn'

interface ErrorStateProps {
  title?: string
  message?: string
  onRetry?: () => void
  className?: string
}

export function ErrorState({
  title = '加载失败',
  message = '获取数据时发生错误，请稍后重试',
  onRetry,
  className,
}: ErrorStateProps) {
  return (
    <div className={cn('flex flex-col items-center justify-center py-16', className)}>
      <div className="mb-4 rounded-full bg-system-red/10 p-4">
        <AlertCircle size={32} className="text-system-red" />
      </div>
      <h3 className="text-headline text-label-primary">{title}</h3>
      <p className="mt-1 max-w-sm text-center text-footnote text-label-tertiary">
        {message}
      </p>
      {onRetry && (
        <Button
          variant="outline"
          size="sm"
          className="mt-4"
          icon={<RefreshCw size={14} />}
          onClick={onRetry}
        >
          重试
        </Button>
      )}
    </div>
  )
}
