import type { HTMLAttributes } from 'react'
import { cn } from '../utils/cn'
import { ChevronUp, ChevronDown, ChevronsUpDown } from 'lucide-react'

export interface TableColumn<T> {
  key: string
  header: string
  accessor: (row: T) => React.ReactNode
  sortable?: boolean
  align?: 'left' | 'center' | 'right'
  width?: string | number
}

interface TableProps<T> extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
  columns: TableColumn<T>[]
  data: T[]
  keyExtractor: (row: T) => string
  sortColumn?: string
  sortDirection?: 'asc' | 'desc'
  onSort?: (column: string) => void
  onRowClick?: (row: T) => void
  selectedRowId?: string
  emptyState?: React.ReactNode
  loading?: boolean
  className?: string
}

export function Table<T>({
  columns,
  data,
  keyExtractor,
  sortColumn,
  sortDirection,
  onSort,
  onRowClick,
  selectedRowId,
  emptyState,
  loading = false,
  className,
  ...props
}: TableProps<T>) {
  const SortIcon = ({ column }: { column: string }) => {
    if (sortColumn !== column) return <ChevronsUpDown size={14} className="text-label-tertiary opacity-50" />
    if (sortDirection === 'asc') return <ChevronUp size={14} className="text-system-blue" />
    return <ChevronDown size={14} className="text-system-blue" />
  }

  if (loading) {
    return (
      <div className={cn('overflow-hidden rounded-xl border border-separator', className)} {...props}>
        <table className="w-full">
          <thead>
            <tr className="border-b border-separator bg-fill-secondary">
              {columns.map((col) => (
                <th
                  key={col.key}
                  className="px-3 py-3 text-left text-caption-1 font-medium text-label-secondary"
                  style={{ width: col.width }}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
        </table>
        <div className="space-y-2 p-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-10 animate-pulse rounded-md bg-fill-tertiary" />
          ))}
        </div>
      </div>
    )
  }

  if (data.length === 0 && emptyState) {
    return <>{emptyState}</>
  }

  const alignClasses = {
    left: 'text-left',
    center: 'text-center',
    right: 'text-right',
  }

  return (
    <div className={cn('overflow-hidden rounded-xl border border-separator', className)} {...props}>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-separator bg-fill-secondary">
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={cn(
                    'px-3 py-3 text-caption-1 font-medium text-label-secondary',
                    col.sortable && 'cursor-pointer select-none hover:text-label-primary',
                    alignClasses[col.align || 'left']
                  )}
                  style={{ width: col.width }}
                  onClick={col.sortable && onSort ? () => onSort(col.key) : undefined}
                >
                  <div className={cn('flex items-center gap-1', col.align === 'right' && 'justify-end')}>
                    {col.header}
                    {col.sortable && <SortIcon column={col.key} />}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row) => {
              const id = keyExtractor(row)
              const isSelected = selectedRowId === id
              return (
                <tr
                  key={id}
                  className={cn(
                    'border-b border-separator transition-colors last:border-b-0',
                    onRowClick && 'cursor-pointer',
                    isSelected
                      ? 'bg-system-blue/5'
                      : 'hover:bg-fill-quaternary'
                  )}
                  onClick={onRowClick ? () => onRowClick(row) : undefined}
                >
                  {columns.map((col) => (
                    <td
                      key={col.key}
                      className={cn(
                        'h-11 px-3 text-subheadline text-label-primary',
                        alignClasses[col.align || 'left']
                      )}
                    >
                      {col.accessor(row)}
                    </td>
                  ))}
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
      {data.length === 0 && !emptyState && (
        <div className="flex items-center justify-center py-12 text-footnote text-label-tertiary">
          暂无数据
        </div>
      )}
    </div>
  )
}
