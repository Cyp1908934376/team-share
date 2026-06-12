import { api } from './api'
import { API_ENDPOINTS } from '@team-share/shared'

export const monitoringService = {
  async getStats(): Promise<any> {
    return api.get(API_ENDPOINTS.MONITORING.STATS)
  },

  async getResourceStats(): Promise<any> {
    return api.get(API_ENDPOINTS.MONITORING.RESOURCES)
  },

  async getWorkflowStats(): Promise<any> {
    return api.get(API_ENDPOINTS.MONITORING.WORKFLOWS)
  },

  async getActivity(limit?: number): Promise<any[]> {
    return api.get(API_ENDPOINTS.MONITORING.ACTIVITY, {
      params: limit ? { limit } : undefined,
    })
  },

  async getHealth(): Promise<any> {
    return api.get(API_ENDPOINTS.MONITORING.HEALTH)
  },
}
