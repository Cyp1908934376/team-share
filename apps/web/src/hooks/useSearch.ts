import { useState, useCallback } from 'react'
import { useDebounce } from '@team-share/ui'

interface UseSearchOptions {
  debounceMs?: number
  initialValue?: string
}

interface UseSearchResult {
  search: string
  debouncedSearch: string
  setSearch: (value: string) => void
  clearSearch: () => void
}

export function useSearch(options: UseSearchOptions = {}): UseSearchResult {
  const { debounceMs = 300, initialValue = '' } = options
  const [search, setSearchState] = useState(initialValue)
  const debouncedSearch = useDebounce(search, debounceMs)

  const setSearch = useCallback((value: string) => {
    setSearchState(value)
  }, [])

  const clearSearch = useCallback(() => {
    setSearchState('')
  }, [])

  return {
    search,
    debouncedSearch,
    setSearch,
    clearSearch,
  }
}
