import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { resourcesService } from '@/services/resources'
import type { Resource, ResourceQuery, ResourceType, ResourceStatus, PaginationMeta } from '@team-share/shared'

interface ResourceFilters {
  type?: ResourceType
  status?: ResourceStatus
  search?: string
  tags?: string
  category?: string
}

interface ResourceState {
  resources: Resource[]
  selectedResource: Resource | null
  filters: ResourceFilters
  pagination: PaginationMeta
  isLoading: boolean
  isDetailLoading: boolean
  error: string | null

  // Actions
  fetchResources: (query?: ResourceQuery) => Promise<void>
  fetchResourceById: (id: string) => Promise<void>
  createResource: (data: Partial<Resource>) => Promise<Resource>
  updateResource: (id: string, data: Partial<Resource>) => Promise<Resource>
  deleteResource: (id: string) => Promise<void>
  starResource: (id: string) => Promise<void>
  publishResource: (id: string) => Promise<Resource>
  setFilters: (filters: Partial<ResourceFilters>) => void
  clearFilters: () => void
  clearSelected: () => void
  clearError: () => void
}

export const useResourceStore = create<ResourceState>()(
  persist(
    (set, get) => ({
      resources: [],
      selectedResource: null,
      filters: {},
      pagination: { page: 1, pageSize: 20, total: 0, totalPages: 0 },
      isLoading: false,
      isDetailLoading: false,
      error: null,

      fetchResources: async (query?: ResourceQuery) => {
        set({ isLoading: true, error: null })
        try {
          const { filters } = get()
          const params = { ...filters, ...query }
          const response = await resourcesService.findAll(params)
          set({
            resources: response.items,
            pagination: response.meta,
            isLoading: false,
          })
        } catch (error: any) {
          set({
            error: error.message || '获取资源列表失败',
            isLoading: false,
          })
        }
      },

      fetchResourceById: async (id: string) => {
        set({ isDetailLoading: true, error: null })
        try {
          const resource = await resourcesService.findById(id)
          set({ selectedResource: resource, isDetailLoading: false })
        } catch (error: any) {
          set({
            error: error.message || '获取资源详情失败',
            isDetailLoading: false,
          })
        }
      },

      createResource: async (data: Partial<Resource>) => {
        set({ isLoading: true, error: null })
        try {
          const resource = await resourcesService.create(data)
          set((state) => ({
            resources: [resource, ...state.resources],
            isLoading: false,
          }))
          return resource
        } catch (error: any) {
          set({
            error: error.message || '创建资源失败',
            isLoading: false,
          })
          throw error
        }
      },

      updateResource: async (id: string, data: Partial<Resource>) => {
        set({ isLoading: true, error: null })
        try {
          const resource = await resourcesService.update(id, data)
          set((state) => ({
            resources: state.resources.map((r) => (r.id === id ? resource : r)),
            selectedResource: state.selectedResource?.id === id ? resource : state.selectedResource,
            isLoading: false,
          }))
          return resource
        } catch (error: any) {
          set({
            error: error.message || '更新资源失败',
            isLoading: false,
          })
          throw error
        }
      },

      deleteResource: async (id: string) => {
        set({ isLoading: true, error: null })
        try {
          await resourcesService.delete(id)
          set((state) => ({
            resources: state.resources.filter((r) => r.id !== id),
            selectedResource: state.selectedResource?.id === id ? null : state.selectedResource,
            isLoading: false,
          }))
        } catch (error: any) {
          set({
            error: error.message || '删除资源失败',
            isLoading: false,
          })
          throw error
        }
      },

      starResource: async (id: string) => {
        try {
          await resourcesService.star(id)
          set((state) => ({
            resources: state.resources.map((r) =>
              r.id === id
                ? { ...r, isStarred: !r.isStarred, stars: r.stars + (r.isStarred ? -1 : 1) }
                : r
            ),
            selectedResource:
              state.selectedResource?.id === id
                ? {
                    ...state.selectedResource,
                    isStarred: !state.selectedResource.isStarred,
                    stars: state.selectedResource.stars + (state.selectedResource.isStarred ? -1 : 1),
                  }
                : state.selectedResource,
          }))
        } catch {
          // silently fail for star toggle
        }
      },

      publishResource: async (id: string) => {
        set({ isLoading: true, error: null })
        try {
          const resource = await resourcesService.publish(id)
          set((state) => ({
            resources: state.resources.map((r) => (r.id === id ? resource : r)),
            selectedResource: state.selectedResource?.id === id ? resource : state.selectedResource,
            isLoading: false,
          }))
          return resource
        } catch (error: any) {
          set({
            error: error.message || '发布资源失败',
            isLoading: false,
          })
          throw error
        }
      },

      setFilters: (filters: Partial<ResourceFilters>) => {
        set((state) => ({ filters: { ...state.filters, ...filters } }))
      },

      clearFilters: () => set({ filters: {} }),

      clearSelected: () => set({ selectedResource: null }),

      clearError: () => set({ error: null }),
    }),
    {
      name: 'resource-storage',
      partialize: (state) => ({
        filters: state.filters,
        pagination: state.pagination,
      }),
    }
  )
)
