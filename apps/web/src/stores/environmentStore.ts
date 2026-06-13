import { create } from 'zustand'
import { environmentsService } from '@/services/environments'

interface EnvironmentState {
  environments: any[]
  selectedEnvironment: any | null
  snapshots: any[]
  isLoading: boolean
  isDetailLoading: boolean
  error: string | null

  // Actions
  fetchEnvironments: (teamId?: string) => Promise<void>
  fetchEnvironmentById: (id: string) => Promise<void>
  createEnvironment: (data: any) => Promise<any>
  updateEnvironment: (id: string, data: any) => Promise<any>
  deleteEnvironment: (id: string) => Promise<void>
  createSnapshot: (id: string, name?: string) => Promise<any>
  fetchSnapshots: (id: string) => Promise<void>
  restoreSnapshot: (snapshotId: string) => Promise<any>
  deleteSnapshot: (snapshotId: string) => Promise<void>
  checkHealth: (id: string) => Promise<any>
  clearSelected: () => void
  clearError: () => void
}

export const useEnvironmentStore = create<EnvironmentState>()((set) => ({
  environments: [],
  selectedEnvironment: null,
  snapshots: [],
  isLoading: false,
  isDetailLoading: false,
  error: null,

  fetchEnvironments: async (teamId?: string) => {
    set({ isLoading: true, error: null })
    try {
      const environments = await environmentsService.findAll(teamId)
      set({ environments, isLoading: false })
    } catch (error: any) {
      set({
        error: error.message || '获取环境列表失败',
        isLoading: false,
      })
    }
  },

  fetchEnvironmentById: async (id: string) => {
    set({ isDetailLoading: true, error: null })
    try {
      const environment = await environmentsService.findById(id)
      set({ selectedEnvironment: environment, isDetailLoading: false })
    } catch (error: any) {
      set({
        error: error.message || '获取环境详情失败',
        isDetailLoading: false,
      })
    }
  },

  createEnvironment: async (data: any) => {
    set({ isLoading: true, error: null })
    try {
      const environment = await environmentsService.create(data)
      set((state) => ({
        environments: [environment, ...state.environments],
        isLoading: false,
      }))
      return environment
    } catch (error: any) {
      set({
        error: error.message || '创建环境失败',
        isLoading: false,
      })
      throw error
    }
  },

  updateEnvironment: async (id: string, data: any) => {
    set({ isLoading: true, error: null })
    try {
      const environment = await environmentsService.update(id, data)
      set((state) => ({
        environments: state.environments.map((e) => (e.id === id ? environment : e)),
        selectedEnvironment: state.selectedEnvironment?.id === id ? environment : state.selectedEnvironment,
        isLoading: false,
      }))
      return environment
    } catch (error: any) {
      set({
        error: error.message || '更新环境失败',
        isLoading: false,
      })
      throw error
    }
  },

  deleteEnvironment: async (id: string) => {
    set({ isLoading: true, error: null })
    try {
      await environmentsService.delete(id)
      set((state) => ({
        environments: state.environments.filter((e) => e.id !== id),
        selectedEnvironment: state.selectedEnvironment?.id === id ? null : state.selectedEnvironment,
        isLoading: false,
      }))
    } catch (error: any) {
      set({
        error: error.message || '删除环境失败',
        isLoading: false,
      })
      throw error
    }
  },

  createSnapshot: async (id: string, name?: string) => {
    try {
      const snapshot = await environmentsService.createSnapshot(id, name)
      set((state) => ({
        snapshots: [snapshot, ...state.snapshots],
      }))
      return snapshot
    } catch (error: any) {
      set({ error: error.message || '创建快照失败' })
      throw error
    }
  },

  fetchSnapshots: async (id: string) => {
    try {
      const snapshots = await environmentsService.getSnapshots(id)
      set({ snapshots })
    } catch (error: any) {
      set({ error: error.message || '获取快照列表失败' })
    }
  },

  restoreSnapshot: async (snapshotId: string) => {
    set({ isLoading: true, error: null })
    try {
      const result = await environmentsService.restoreSnapshot(snapshotId)
      set({ isLoading: false })
      return result
    } catch (error: any) {
      set({
        error: error.message || '恢复快照失败',
        isLoading: false,
      })
      throw error
    }
  },

  deleteSnapshot: async (snapshotId: string) => {
    try {
      await environmentsService.deleteSnapshot(snapshotId)
      set((state) => ({
        snapshots: state.snapshots.filter((s) => s.id !== snapshotId),
      }))
    } catch (error: any) {
      set({ error: error.message || '删除快照失败' })
      throw error
    }
  },

  checkHealth: async (id: string) => {
    try {
      return await environmentsService.getHealth(id)
    } catch (error: any) {
      set({ error: error.message || '健康检查失败' })
      throw error
    }
  },

  clearSelected: () => set({ selectedEnvironment: null, snapshots: [] }),

  clearError: () => set({ error: null }),
}))
