import { create } from 'zustand'
import { teamsService } from '@/services/teams'

interface TeamState {
  teams: any[]
  selectedTeam: any | null
  members: any[]
  isLoading: boolean
  isDetailLoading: boolean
  error: string | null

  // Actions
  fetchTeams: () => Promise<void>
  fetchTeamById: (id: string) => Promise<void>
  createTeam: (data: any) => Promise<any>
  updateTeam: (id: string, data: any) => Promise<any>
  deleteTeam: (id: string) => Promise<void>
  fetchMembers: (id: string) => Promise<void>
  addMember: (id: string, data: { userId: string; role?: string }) => Promise<any>
  removeMember: (teamId: string, userId: string) => Promise<void>
  clearSelected: () => void
  clearError: () => void
}

export const useTeamStore = create<TeamState>()((set) => ({
  teams: [],
  selectedTeam: null,
  members: [],
  isLoading: false,
  isDetailLoading: false,
  error: null,

  fetchTeams: async () => {
    set({ isLoading: true, error: null })
    try {
      const teams = await teamsService.findAll()
      set({ teams, isLoading: false })
    } catch (error: any) {
      set({
        error: error.message || '获取团队列表失败',
        isLoading: false,
      })
    }
  },

  fetchTeamById: async (id: string) => {
    set({ isDetailLoading: true, error: null })
    try {
      const team = await teamsService.findById(id)
      set({ selectedTeam: team, isDetailLoading: false })
    } catch (error: any) {
      set({
        error: error.message || '获取团队详情失败',
        isDetailLoading: false,
      })
    }
  },

  createTeam: async (data: any) => {
    set({ isLoading: true, error: null })
    try {
      const team = await teamsService.create(data)
      set((state) => ({
        teams: [team, ...state.teams],
        isLoading: false,
      }))
      return team
    } catch (error: any) {
      set({
        error: error.message || '创建团队失败',
        isLoading: false,
      })
      throw error
    }
  },

  updateTeam: async (id: string, data: any) => {
    set({ isLoading: true, error: null })
    try {
      const team = await teamsService.update(id, data)
      set((state) => ({
        teams: state.teams.map((t) => (t.id === id ? team : t)),
        selectedTeam: state.selectedTeam?.id === id ? team : state.selectedTeam,
        isLoading: false,
      }))
      return team
    } catch (error: any) {
      set({
        error: error.message || '更新团队失败',
        isLoading: false,
      })
      throw error
    }
  },

  deleteTeam: async (id: string) => {
    set({ isLoading: true, error: null })
    try {
      await teamsService.delete(id)
      set((state) => ({
        teams: state.teams.filter((t) => t.id !== id),
        selectedTeam: state.selectedTeam?.id === id ? null : state.selectedTeam,
        isLoading: false,
      }))
    } catch (error: any) {
      set({
        error: error.message || '删除团队失败',
        isLoading: false,
      })
      throw error
    }
  },

  fetchMembers: async (id: string) => {
    try {
      const members = await teamsService.getMembers(id)
      set({ members })
    } catch (error: any) {
      set({ error: error.message || '获取成员列表失败' })
    }
  },

  addMember: async (id: string, data: { userId: string; role?: string }) => {
    try {
      const member = await teamsService.addMember(id, data)
      set((state) => ({
        members: [...state.members, member],
      }))
      return member
    } catch (error: any) {
      set({ error: error.message || '添加成员失败' })
      throw error
    }
  },

  removeMember: async (teamId: string, userId: string) => {
    try {
      await teamsService.removeMember(teamId, userId)
      set((state) => ({
        members: state.members.filter((m: any) => m.userId !== userId),
      }))
    } catch (error: any) {
      set({ error: error.message || '移除成员失败' })
      throw error
    }
  },

  clearSelected: () => set({ selectedTeam: null, members: [] }),

  clearError: () => set({ error: null }),
}))
