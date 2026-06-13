import { describe, it, expect, beforeEach, vi } from 'vitest'

vi.mock('@/services/environments', () => ({
  environmentsService: {
    findAll: vi.fn(),
    findById: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    createSnapshot: vi.fn(),
    getSnapshots: vi.fn(),
    restoreSnapshot: vi.fn(),
    deleteSnapshot: vi.fn(),
    getHealth: vi.fn(),
  },
}))

import { useEnvironmentStore } from '../environmentStore'
import { environmentsService } from '@/services/environments'

describe('environmentStore', () => {
  const mockEnv = {
    id: 'env-1',
    name: 'development',
    displayName: '开发环境',
    variables: { NODE_ENV: 'dev' },
    secrets: {},
    dependencies: {},
    status: 'active',
    health: { status: 'healthy' },
    createdAt: new Date(),
    updatedAt: new Date(),
  }

  beforeEach(() => {
    useEnvironmentStore.setState({
      environments: [],
      selectedEnvironment: null,
      snapshots: [],
      isLoading: false,
      isDetailLoading: false,
      error: null,
    })
    vi.clearAllMocks()
  })

  describe('fetchEnvironments', () => {
    it('should load environments into state', async () => {
      ;(environmentsService.findAll as ReturnType<typeof vi.fn>).mockResolvedValue([mockEnv])

      await useEnvironmentStore.getState().fetchEnvironments()

      expect(useEnvironmentStore.getState().environments).toHaveLength(1)
      expect(useEnvironmentStore.getState().isLoading).toBe(false)
    })

    it('should pass teamId to service', async () => {
      ;(environmentsService.findAll as ReturnType<typeof vi.fn>).mockResolvedValue([])

      await useEnvironmentStore.getState().fetchEnvironments('team-1')

      expect(environmentsService.findAll).toHaveBeenCalledWith('team-1')
    })
  })

  describe('createEnvironment', () => {
    it('should prepend new environment', async () => {
      ;(environmentsService.create as ReturnType<typeof vi.fn>).mockResolvedValue(mockEnv)

      const result = await useEnvironmentStore.getState().createEnvironment({ name: 'staging' })

      expect(result).toEqual(mockEnv)
      expect(useEnvironmentStore.getState().environments).toHaveLength(1)
    })
  })

  describe('deleteEnvironment', () => {
    it('should remove environment and clear selection', async () => {
      useEnvironmentStore.setState({ environments: [mockEnv], selectedEnvironment: mockEnv })
      ;(environmentsService.delete as ReturnType<typeof vi.fn>).mockResolvedValue(undefined)

      await useEnvironmentStore.getState().deleteEnvironment('env-1')

      expect(useEnvironmentStore.getState().environments).toHaveLength(0)
      expect(useEnvironmentStore.getState().selectedEnvironment).toBeNull()
    })
  })

  describe('createSnapshot', () => {
    it('should prepend snapshot to list', async () => {
      const mockSnapshot = { id: 'snap-1', name: 'Backup', createdAt: new Date() }
      ;(environmentsService.createSnapshot as ReturnType<typeof vi.fn>).mockResolvedValue(mockSnapshot)

      const result = await useEnvironmentStore.getState().createSnapshot('env-1', 'Backup')

      expect(result).toEqual(mockSnapshot)
      expect(useEnvironmentStore.getState().snapshots).toHaveLength(1)
    })
  })

  describe('fetchSnapshots', () => {
    it('should load snapshots into state', async () => {
      const mockSnapshots = [{ id: 'snap-1', name: 'Backup', createdAt: new Date() }]
      ;(environmentsService.getSnapshots as ReturnType<typeof vi.fn>).mockResolvedValue(mockSnapshots)

      await useEnvironmentStore.getState().fetchSnapshots('env-1')

      expect(useEnvironmentStore.getState().snapshots).toHaveLength(1)
    })
  })

  describe('restoreSnapshot', () => {
    it('should call restore and set loading false', async () => {
      ;(environmentsService.restoreSnapshot as ReturnType<typeof vi.fn>).mockResolvedValue({ success: true })

      const result = await useEnvironmentStore.getState().restoreSnapshot('snap-1')

      expect(result).toEqual({ success: true })
      expect(useEnvironmentStore.getState().isLoading).toBe(false)
    })
  })

  describe('checkHealth', () => {
    it('should return health check result', async () => {
      ;(environmentsService.getHealth as ReturnType<typeof vi.fn>).mockResolvedValue({
        status: 'healthy',
        checks: [],
      })

      const result = await useEnvironmentStore.getState().checkHealth('env-1')

      expect(result.status).toBe('healthy')
    })
  })
})
