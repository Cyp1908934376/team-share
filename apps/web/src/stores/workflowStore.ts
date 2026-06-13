import { create } from 'zustand'
import { workflowsService } from '@/services/workflows'

interface WorkflowState {
  workflows: any[]
  selectedWorkflow: any | null
  executions: any[]
  selectedExecution: any | null
  isLoading: boolean
  isDetailLoading: boolean
  error: string | null

  // Actions
  fetchWorkflows: (teamId?: string) => Promise<void>
  fetchWorkflowById: (id: string) => Promise<void>
  createWorkflow: (data: any) => Promise<any>
  updateWorkflow: (id: string, data: any) => Promise<any>
  deleteWorkflow: (id: string) => Promise<void>
  executeWorkflow: (id: string, inputs?: Record<string, any>) => Promise<any>
  fetchExecutions: (id: string) => Promise<void>
  fetchExecution: (workflowId: string, executionId: string) => Promise<void>
  cancelExecution: (executionId: string) => Promise<void>
  clearSelected: () => void
  clearError: () => void
}

export const useWorkflowStore = create<WorkflowState>()((set) => ({
  workflows: [],
  selectedWorkflow: null,
  executions: [],
  selectedExecution: null,
  isLoading: false,
  isDetailLoading: false,
  error: null,

  fetchWorkflows: async (teamId?: string) => {
    set({ isLoading: true, error: null })
    try {
      const workflows = await workflowsService.findAll(teamId)
      set({ workflows, isLoading: false })
    } catch (error: any) {
      set({
        error: error.message || '获取工作流列表失败',
        isLoading: false,
      })
    }
  },

  fetchWorkflowById: async (id: string) => {
    set({ isDetailLoading: true, error: null })
    try {
      const workflow = await workflowsService.findById(id)
      set({ selectedWorkflow: workflow, isDetailLoading: false })
    } catch (error: any) {
      set({
        error: error.message || '获取工作流详情失败',
        isDetailLoading: false,
      })
    }
  },

  createWorkflow: async (data: any) => {
    set({ isLoading: true, error: null })
    try {
      const workflow = await workflowsService.create(data)
      set((state) => ({
        workflows: [workflow, ...state.workflows],
        isLoading: false,
      }))
      return workflow
    } catch (error: any) {
      set({
        error: error.message || '创建工作流失败',
        isLoading: false,
      })
      throw error
    }
  },

  updateWorkflow: async (id: string, data: any) => {
    set({ isLoading: true, error: null })
    try {
      const workflow = await workflowsService.update(id, data)
      set((state) => ({
        workflows: state.workflows.map((w) => (w.id === id ? workflow : w)),
        selectedWorkflow: state.selectedWorkflow?.id === id ? workflow : state.selectedWorkflow,
        isLoading: false,
      }))
      return workflow
    } catch (error: any) {
      set({
        error: error.message || '更新工作流失败',
        isLoading: false,
      })
      throw error
    }
  },

  deleteWorkflow: async (id: string) => {
    set({ isLoading: true, error: null })
    try {
      await workflowsService.delete(id)
      set((state) => ({
        workflows: state.workflows.filter((w) => w.id !== id),
        selectedWorkflow: state.selectedWorkflow?.id === id ? null : state.selectedWorkflow,
        isLoading: false,
      }))
    } catch (error: any) {
      set({
        error: error.message || '删除工作流失败',
        isLoading: false,
      })
      throw error
    }
  },

  executeWorkflow: async (id: string, inputs?: Record<string, any>) => {
    set({ isLoading: true, error: null })
    try {
      const execution = await workflowsService.execute(id, inputs)
      set({ isLoading: false })
      return execution
    } catch (error: any) {
      set({
        error: error.message || '执行工作流失败',
        isLoading: false,
      })
      throw error
    }
  },

  fetchExecutions: async (id: string) => {
    try {
      const executions = await workflowsService.getExecutions(id)
      set({ executions })
    } catch (error: any) {
      set({ error: error.message || '获取执行记录失败' })
    }
  },

  fetchExecution: async (workflowId: string, executionId: string) => {
    try {
      const execution = await workflowsService.getExecution(workflowId, executionId)
      set({ selectedExecution: execution })
    } catch (error: any) {
      set({ error: error.message || '获取执行详情失败' })
    }
  },

  cancelExecution: async (executionId: string) => {
    try {
      await workflowsService.cancelExecution(executionId)
      set((state) => ({
        executions: state.executions.map((e) =>
          e.id === executionId ? { ...e, status: 'cancelled' } : e
        ),
      }))
    } catch (error: any) {
      set({ error: error.message || '取消执行失败' })
      throw error
    }
  },

  clearSelected: () => set({ selectedWorkflow: null, executions: [], selectedExecution: null }),

  clearError: () => set({ error: null }),
}))
