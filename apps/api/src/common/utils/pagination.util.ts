export interface PaginationParams {
  page?: number
  pageSize?: number
}

export interface PaginationMeta {
  page: number
  pageSize: number
  total: number
  totalPages: number
}

export interface PaginatedResult<T> {
  items: T[]
  meta: PaginationMeta
}

/**
 * Build a standardized pagination result.
 */
export function paginate<T>(
  items: T[],
  total: number,
  params: PaginationParams = {},
): PaginatedResult<T> {
  const page = Math.max(params.page || 1, 1)
  const pageSize = Math.min(Math.max(params.pageSize || 20, 1), 100)
  const totalPages = Math.ceil(total / pageSize)

  return {
    items,
    meta: {
      page,
      pageSize,
      total,
      totalPages,
    },
  }
}

/**
 * Calculate Prisma skip/take from pagination params.
 */
export function getPaginationArgs(params: PaginationParams = {}) {
  const page = Math.max(params.page || 1, 1)
  const pageSize = Math.min(Math.max(params.pageSize || 20, 1), 100)

  return {
    skip: (page - 1) * pageSize,
    take: pageSize,
  }
}
