import { api } from './api'
import { API_ENDPOINTS } from '@team-share/shared'

export const teamsService = {
  async findAll(): Promise<any[]> {
    return api.get(API_ENDPOINTS.TEAMS.BASE)
  },

  async findById(id: string): Promise<any> {
    return api.get(API_ENDPOINTS.TEAMS.BY_ID(id))
  },

  async create(data: any): Promise<any> {
    return api.post(API_ENDPOINTS.TEAMS.BASE, data)
  },

  async update(id: string, data: any): Promise<any> {
    return api.put(API_ENDPOINTS.TEAMS.BY_ID(id), data)
  },

  async delete(id: string): Promise<void> {
    return api.delete(API_ENDPOINTS.TEAMS.BY_ID(id))
  },

  async getMembers(id: string): Promise<any[]> {
    return api.get(API_ENDPOINTS.TEAMS.MEMBERS(id))
  },

  async addMember(id: string, data: { userId: string; role?: string }): Promise<any> {
    return api.post(API_ENDPOINTS.TEAMS.MEMBERS(id), data)
  },

  async removeMember(teamId: string, userId: string): Promise<void> {
    return api.delete(API_ENDPOINTS.TEAMS.MEMBER(teamId, userId))
  },
}
