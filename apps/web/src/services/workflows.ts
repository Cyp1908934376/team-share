import { api } from './api'
import { API_ENDPOINTS } from '@team-share/shared'

export const workflowsService = {
  async findAll(teamId?: string): Promise<any[]> {
    return api.get(API_ENDPOINTS.WORKFLOWS.BASE, {
      params: teamId ? { teamId } : undefined,
    })
  },

  async findById(id: string): Promise<any> {
    return api.get(API_ENDPOINTS.WORKFLOWS.BY_ID(id))
  },

  async create(data: any): Promise<any> {
    return api.post(API_ENDPOINTS.WORKFLOWS.BASE, data)
  },

  async update(id: string, data: any): Promise<any> {
    return api.put(API_ENDPOINTS.WORKFLOWS.BY_ID(id), data)
  },

  async delete(id: string): Promise<void> {
    return api.delete(API_ENDPOINTS.WORKFLOWS.BY_ID(id))
  },

  async execute(id: string, inputs?: Record<string, any>): Promise<any> {
    return api.post(API_ENDPOINTS.WORKFLOWS.EXECUTE(id), { inputs })
  },

  async getExecutions(id: string): Promise<any[]> {
    return api.get(API_ENDPOINTS.WORKFLOWS.EXECUTIONS(id))
  },

  async getExecution(workflowId: string, executionId: string): Promise<any> {
    return api.get(API_ENDPOINTS.WORKFLOWS.EXECUTION(workflowId, executionId))
  },

  async cancelExecution(executionId: string): Promise<any> {
    return api.post(`/workflows/executions/${executionId}/cancel`)
  },
}
