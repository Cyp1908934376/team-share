import { api } from './api'
import { API_ENDPOINTS } from '@team-share/shared'

export const environmentsService = {
  async findAll(teamId?: string): Promise<any[]> {
    return api.get(API_ENDPOINTS.ENVIRONMENTS.BASE, {
      params: teamId ? { teamId } : undefined,
    })
  },

  async findById(id: string): Promise<any> {
    return api.get(API_ENDPOINTS.ENVIRONMENTS.BY_ID(id))
  },

  async create(data: any): Promise<any> {
    return api.post(API_ENDPOINTS.ENVIRONMENTS.BASE, data)
  },

  async update(id: string, data: any): Promise<any> {
    return api.put(API_ENDPOINTS.ENVIRONMENTS.BY_ID(id), data)
  },

  async delete(id: string): Promise<void> {
    return api.delete(API_ENDPOINTS.ENVIRONMENTS.BY_ID(id))
  },

  async createSnapshot(id: string, name?: string): Promise<any> {
    return api.post(API_ENDPOINTS.ENVIRONMENTS.SNAPSHOT(id), { name })
  },

  async getSnapshots(id: string): Promise<any[]> {
    return api.get(`${API_ENDPOINTS.ENVIRONMENTS.BY_ID(id)}/snapshots`)
  },

  async restoreSnapshot(snapshotId: string): Promise<any> {
    return api.post(`/environments/snapshots/${snapshotId}/restore`)
  },

  async deleteSnapshot(snapshotId: string): Promise<void> {
    return api.delete(`/environments/snapshots/${snapshotId}`)
  },

  async getHealth(id: string): Promise<any> {
    return api.get(API_ENDPOINTS.ENVIRONMENTS.HEALTH(id))
  },
}
