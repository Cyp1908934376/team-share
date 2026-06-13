import { describe, it, expect, beforeEach, vi } from 'vitest'

vi.mock('@/services/workflows', () => ({
  workflowsService: {
    findAll: vi.fn(),
    findById: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    execute: vi.fn(),
    getExecutions: vi.fn(),
    getExecution: vi.fn(),
    cancelExecution: vi.fn(),
  },
}))

import { useWorkflowStore } from '../workflowStore'
import { workflowsService } from '@/services/workflows'

describe('workflowStore', () => {
  const mockWorkflow = {
    id: 'wf-1',
    name: 'Test Workflow',
    description: 'A test workflow',
    version: '1.0.0',
    triggerConfig: {},
    nodes: [],
    edges: [],
    variables: {},
    timeout: 3600,
    retryPolicy: {},
    status: 'draft',
    createdAt: new Date(),
    updatedAt: new Date(),
  }

  const mockExecution = {
    id: 'exec-1',
    workflowId: 'wf-1',
    status: 'running',
    trigger: 'manual',
    inputs: {},
    outputs: {},
    nodeExecutions: [],
    logs: [],
    createdAt: new Date(),
  }

  beforeEach(() => {
    useWorkflowStore.setState({
      workflows: [],
      selectedWorkflow: null,
      executions: [],
      selectedExecution: null,
      isLoading: false,
      isDetailLoading: false,
      error: null,
    })
    vi.clearAllMocks()
  })

  describe('fetchWorkflows', () => {
    it('should load workflows', async () => {
      ;(workflowsService.findAll as ReturnType<typeof vi.fn>).mockResolvedValue([mockWorkflow])

      await useWorkflowStore.getState().fetchWorkflows()

      expect(useWorkflowStore.getState().workflows).toHaveLength(1)
    })
  })

  describe('createWorkflow', () => {
    it('should prepend new workflow', async () => {
      ;(workflowsService.create as ReturnType<typeof vi.fn>).mockResolvedValue(mockWorkflow)

      await useWorkflowStore.getState().createWorkflow({ name: 'New WF' })

      expect(useWorkflowStore.getState().workflows).toHaveLength(1)
    })
  })

  describe('updateWorkflow', () => {
    it('should update workflow in list', async () => {
      useWorkflowStore.setState({ workflows: [mockWorkflow], selectedWorkflow: mockWorkflow })
      const updated = { ...mockWorkflow, name: 'Updated' }
      ;(workflowsService.update as ReturnType<typeof vi.fn>).mockResolvedValue(updated)

      await useWorkflowStore.getState().updateWorkflow('wf-1', { name: 'Updated' })

      expect(useWorkflowStore.getState().workflows[0].name).toBe('Updated')
      expect(useWorkflowStore.getState().selectedWorkflow?.name).toBe('Updated')
    })
  })

  describe('executeWorkflow', () => {
    it('should execute and return result', async () => {
      ;(workflowsService.execute as ReturnType<typeof vi.fn>).mockResolvedValue(mockExecution)

      const result = await useWorkflowStore.getState().executeWorkflow('wf-1')

      expect(result).toHaveProperty('id', 'exec-1')
      expect(useWorkflowStore.getState().isLoading).toBe(false)
    })

    it('should handle execution error', async () => {
      ;(workflowsService.execute as ReturnType<typeof vi.fn>).mockRejectedValue(new Error('Execute failed'))

      await expect(
        useWorkflowStore.getState().executeWorkflow('wf-1'),
      ).rejects.toThrow()

      expect(useWorkflowStore.getState().error).toBe('Execute failed')
    })
  })

  describe('fetchExecutions', () => {
    it('should load execution history', async () => {
      ;(workflowsService.getExecutions as ReturnType<typeof vi.fn>).mockResolvedValue([mockExecution])

      await useWorkflowStore.getState().fetchExecutions('wf-1')

      expect(useWorkflowStore.getState().executions).toHaveLength(1)
    })
  })

  describe('cancelExecution', () => {
    it('should cancel and update execution status locally', async () => {
      useWorkflowStore.setState({ executions: [mockExecution] })
      ;(workflowsService.cancelExecution as ReturnType<typeof vi.fn>).mockResolvedValue(undefined)

      await useWorkflowStore.getState().cancelExecution('exec-1')

      expect(useWorkflowStore.getState().executions[0].status).toBe('cancelled')
    })
  })

  describe('fetchExecution', () => {
    it('should load execution detail', async () => {
      ;(workflowsService.getExecution as ReturnType<typeof vi.fn>).mockResolvedValue(mockExecution)

      await useWorkflowStore.getState().fetchExecution('wf-1', 'exec-1')

      expect(useWorkflowStore.getState().selectedExecution).toEqual(mockExecution)
    })
  })
})
