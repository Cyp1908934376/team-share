import { ChevronLeft, ChevronRight, MoreHorizontal } from 'lucide-react'
import { cn } from '../utils/cn'

interface PaginationProps {
  page: number
  totalPages: number
  onPageChange: (page: number) => void
  className?: string
}

export function Pagination({ page, totalPages, onPageChange, className }: PaginationProps) {
  if (totalPages <= 1) return null

  const getVisiblePages = () => {
    const pages: (number | 'ellipsis')[] = []

    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i)
      return pages
    }

    pages.push(1)

    if (page > 3) pages.push('ellipsis')

    const start = Math.max(2, page - 1)
    const end = Math.min(totalPages - 1, page + 1)

    for (let i = start; i <= end; i++) pages.push(i)

    if (page < totalPages - 2) pages.push('ellipsis')

    pages.push(totalPages)

    return pages
  }

  const visiblePages = getVisiblePages()

  return (
    <nav className={cn('flex items-center gap-1', className)} role="navigation" aria-label="Pagination">
      <button
        onClick={() => onPageChange(page - 1)}
        disabled={page <= 1}
        className="flex h-8 w-8 items-center justify-center rounded-lg text-label-secondary transition-colors hover:bg-fill-quaternary hover:text-label-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-system-blue focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-40"
        aria-label="Previous page"
      >
        <ChevronLeft size={16} />
      </button>

      {visiblePages.map((p, index) =>
        p === 'ellipsis' ? (
          <span
            key={`ellipsis-${index}`}
            className="flex h-8 w-8 items-center justify-center text-label-tertiary"
          >
            <MoreHorizontal size={16} />
          </span>
        ) : (
          <button
            key={p}
            onClick={() => onPageChange(p)}
            className={cn(
              'flex h-8 min-w-[32px] items-center justify-center rounded-lg px-2 text-subheadline transition-colors',
              p === page
                ? 'bg-system-blue text-white'
                : 'text-label-secondary hover:bg-fill-quaternary hover:text-label-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-system-blue focus-visible:ring-offset-2'
            )}
            aria-current={p === page ? 'page' : undefined}
          >
            {p}
          </button>
        )
      )}

      <button
        onClick={() => onPageChange(page + 1)}
        disabled={page >= totalPages}
        className="flex h-8 w-8 items-center justify-center rounded-lg text-label-secondary transition-colors hover:bg-fill-quaternary hover:text-label-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-system-blue focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-40"
        aria-label="Next page"
      >
        <ChevronRight size={16} />
      </button>
    </nav>
  )
}
