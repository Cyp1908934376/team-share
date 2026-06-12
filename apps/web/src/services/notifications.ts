import { api } from './api'
import { API_ENDPOINTS } from '@team-share/shared'

export const notificationsService = {
  async findAll(): Promise<any[]> {
    return api.get(API_ENDPOINTS.NOTIFICATIONS.BASE)
  },

  async markAsRead(id: string): Promise<any> {
    return api.post(API_ENDPOINTS.NOTIFICATIONS.READ(id))
  },

  async markAllAsRead(): Promise<any> {
    return api.post(API_ENDPOINTS.NOTIFICATIONS.READ_ALL)
  },

  async delete(id: string): Promise<void> {
    return api.delete(`${API_ENDPOINTS.NOTIFICATIONS.BASE}/${id}`)
  },
}
