import { api } from './api'
import { API_ENDPOINTS, type Resource, type ResourceQuery, type PaginationMeta } from '@team-share/shared'

interface ResourceListResponse {
  items: Resource[]
  meta: PaginationMeta
}

export const resourcesService = {
  async findAll(query?: ResourceQuery): Promise<ResourceListResponse> {
    return api.get(API_ENDPOINTS.RESOURCES.BASE, { params: query })
  },

  async findById(id: string): Promise<Resource> {
    return api.get(API_ENDPOINTS.RESOURCES.BY_ID(id))
  },

  async create(data: Partial<Resource>): Promise<Resource> {
    return api.post(API_ENDPOINTS.RESOURCES.BASE, data)
  },

  async update(id: string, data: Partial<Resource>): Promise<Resource> {
    return api.put(API_ENDPOINTS.RESOURCES.BY_ID(id), data)
  },

  async delete(id: string): Promise<void> {
    return api.delete(API_ENDPOINTS.RESOURCES.BY_ID(id))
  },

  async star(id: string): Promise<void> {
    return api.post(API_ENDPOINTS.RESOURCES.STAR(id))
  },

  async publish(id: string): Promise<Resource> {
    return api.post(API_ENDPOINTS.RESOURCES.PUBLISH(id))
  },

  async download(id: string): Promise<void> {
    return api.post(`/resources/${id}/download`)
  },

  async getVersions(resourceId: string): Promise<any[]> {
    return api.get(API_ENDPOINTS.RESOURCES.VERSIONS(resourceId))
  },

  async createVersion(resourceId: string, data: any): Promise<any> {
    return api.post(API_ENDPOINTS.RESOURCES.VERSIONS(resourceId), data)
  },
}
