import { describe, it, expect, beforeEach, vi } from 'vitest'

vi.mock('@/services/resources', () => ({
  resourcesService: {
    findAll: vi.fn(),
    findById: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    star: vi.fn(),
    publish: vi.fn(),
    download: vi.fn(),
    getVersions: vi.fn(),
    createVersion: vi.fn(),
  },
}))

import { useResourceStore } from '../resourceStore'
import { resourcesService } from '@/services/resources'

describe('resourceStore', () => {
  const mockResource = {
    id: 'res-1',
    type: 'prompt' as const,
    name: 'Test Resource',
    slug: 'test-resource',
    description: 'Test description',
    content: { template: 'Hello {{name}}' },
    metadata: {},
    tags: ['test'],
    category: 'testing',
    visibility: 'team' as const,
    ownerId: 'user-1',
    version: '1.0.0',
    status: 'draft' as const,
    downloads: 0,
    stars: 0,
    isStarred: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  }

  beforeEach(() => {
    useResourceStore.setState({
      resources: [],
      selectedResource: null,
      filters: {},
      pagination: { page: 1, pageSize: 20, total: 0, totalPages: 0 },
      isLoading: false,
      isDetailLoading: false,
      error: null,
    })
    vi.clearAllMocks()
  })

  describe('fetchResources', () => {
    it('should load resources into state', async () => {
      ;(resourcesService.findAll as ReturnType<typeof vi.fn>).mockResolvedValue({
        items: [mockResource],
        meta: { page: 1, pageSize: 20, total: 1, totalPages: 1 },
      })

      await useResourceStore.getState().fetchResources()

      const state = useResourceStore.getState()
      expect(state.resources).toHaveLength(1)
      expect(state.pagination.total).toBe(1)
      expect(state.isLoading).toBe(false)
    })

    it('should set error on failure', async () => {
      ;(resourcesService.findAll as ReturnType<typeof vi.fn>).mockRejectedValue(new Error('Network error'))

      await useResourceStore.getState().fetchResources()

      expect(useResourceStore.getState().error).toBe('Network error')
      expect(useResourceStore.getState().isLoading).toBe(false)
    })

    it('should merge filters with query params', async () => {
      useResourceStore.setState({ filters: { type: 'prompt' } })
      ;(resourcesService.findAll as ReturnType<typeof vi.fn>).mockResolvedValue({
        items: [],
        meta: { page: 1, pageSize: 20, total: 0, totalPages: 0 },
      })

      await useResourceStore.getState().fetchResources({ search: 'test' })

      expect(resourcesService.findAll).toHaveBeenCalledWith({
        type: 'prompt',
        search: 'test',
      })
    })
  })

  describe('createResource', () => {
    it('should prepend new resource to list', async () => {
      ;(resourcesService.create as ReturnType<typeof vi.fn>).mockResolvedValue(mockResource)

      const result = await useResourceStore.getState().createResource({
        name: 'New',
        type: 'prompt',
      })

      const state = useResourceStore.getState()
      expect(result).toHaveProperty('id', 'res-1')
      expect(state.resources).toHaveLength(1)
      expect(state.resources[0]).toEqual(mockResource)
    })

    it('should set error on failure', async () => {
      ;(resourcesService.create as ReturnType<typeof vi.fn>).mockRejectedValue(new Error('Create failed'))

      await expect(
        useResourceStore.getState().createResource({ name: 'New', type: 'prompt' }),
      ).rejects.toThrow()

      expect(useResourceStore.getState().error).toBe('Create failed')
    })
  })

  describe('updateResource', () => {
    it('should update resource in list and selected', async () => {
      useResourceStore.setState({
        resources: [mockResource],
        selectedResource: mockResource,
      })
      const updated = { ...mockResource, name: 'Updated' }
      ;(resourcesService.update as ReturnType<typeof vi.fn>).mockResolvedValue(updated)

      const result = await useResourceStore.getState().updateResource('res-1', { name: 'Updated' })

      expect(result.name).toBe('Updated')
      expect(useResourceStore.getState().resources[0].name).toBe('Updated')
      expect(useResourceStore.getState().selectedResource?.name).toBe('Updated')
    })

    it('should throw ForbiddenException if not owner', async () => {
      ;(resourcesService.update as ReturnType<typeof vi.fn>).mockRejectedValue(new Error('无权修改'))

      await expect(
        useResourceStore.getState().updateResource('res-1', { name: 'Updated' }),
      ).rejects.toThrow()
    })
  })

  describe('deleteResource', () => {
    it('should remove resource from list and clear selection', async () => {
      useResourceStore.setState({
        resources: [mockResource],
        selectedResource: mockResource,
      })
      ;(resourcesService.delete as ReturnType<typeof vi.fn>).mockResolvedValue(undefined)

      await useResourceStore.getState().deleteResource('res-1')

      expect(useResourceStore.getState().resources).toHaveLength(0)
      expect(useResourceStore.getState().selectedResource).toBeNull()
    })
  })

  describe('starResource', () => {
    it('should toggle star locally', async () => {
      useResourceStore.setState({ resources: [mockResource], selectedResource: mockResource })
      ;(resourcesService.star as ReturnType<typeof vi.fn>).mockResolvedValue(undefined)

      await useResourceStore.getState().starResource('res-1')

      const resource = useResourceStore.getState().resources[0]
      expect(resource.isStarred).toBe(true)
    })
  })

  describe('setFilters', () => {
    it('should merge new filters with existing', () => {
      useResourceStore.setState({ filters: { type: 'prompt' } })

      useResourceStore.getState().setFilters({ status: 'published' })

      expect(useResourceStore.getState().filters).toEqual({
        type: 'prompt',
        status: 'published',
      })
    })
  })

  describe('clearFilters', () => {
    it('should reset all filters', () => {
      useResourceStore.setState({ filters: { type: 'prompt', search: 'test' } })

      useResourceStore.getState().clearFilters()

      expect(useResourceStore.getState().filters).toEqual({})
    })
  })
})
