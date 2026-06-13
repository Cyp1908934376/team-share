import { useState, useCallback, useMemo } from 'react'

interface PaginationOptions {
  defaultPage?: number
  defaultPageSize?: number
  total?: number
}

interface PaginationResult {
  page: number
  pageSize: number
  total: number
  totalPages: number
  setPage: (page: number) => void
  setPageSize: (pageSize: number) => void
  setTotal: (total: number) => void
  resetPage: () => void
  nextPage: () => void
  prevPage: () => void
  hasNext: boolean
  hasPrev: boolean
}

export function usePagination(options: PaginationOptions = {}): PaginationResult {
  const { defaultPage = 1, defaultPageSize = 20, total: initialTotal = 0 } = options

  const [page, setPageState] = useState(defaultPage)
  const [pageSize, setPageSizeState] = useState(defaultPageSize)
  const [total, setTotal] = useState(initialTotal)

  const totalPages = useMemo(
    () => (total > 0 ? Math.ceil(total / pageSize) : 0),
    [total, pageSize]
  )

  const setPage = useCallback(
    (newPage: number) => {
      setPageState(Math.max(1, Math.min(newPage, totalPages || newPage)))
    },
    [totalPages]
  )

  const setPageSize = useCallback(
    (newPageSize: number) => {
      setPageSizeState(newPageSize)
      setPageState(1) // reset to first page when page size changes
    },
    []
  )

  const resetPage = useCallback(() => {
    setPageState(1)
  }, [])

  const nextPage = useCallback(() => {
    setPageState((prev) => Math.min(prev + 1, totalPages || prev + 1))
  }, [totalPages])

  const prevPage = useCallback(() => {
    setPageState((prev) => Math.max(prev - 1, 1))
  }, [])

  const hasNext = totalPages > 0 ? page < totalPages : false
  const hasPrev = page > 1

  return {
    page,
    pageSize,
    total,
    totalPages,
    setPage,
    setPageSize,
    setTotal,
    resetPage,
    nextPage,
    prevPage,
    hasNext,
    hasPrev,
  }
}
