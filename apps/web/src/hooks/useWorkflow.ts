import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { workflowsService } from '@/services/workflows'

const WORKFLOWS_KEY = ['workflows'] as const

export function useWorkflows(teamId?: string) {
  return useQuery({
    queryKey: [...WORKFLOWS_KEY, teamId],
    queryFn: () => workflowsService.findAll(teamId),
  })
}

export function useWorkflow(id: string) {
  return useQuery({
    queryKey: ['workflow', id],
    queryFn: () => workflowsService.findById(id),
    enabled: !!id,
  })
}

export function useCreateWorkflow() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: workflowsService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: WORKFLOWS_KEY })
    },
  })
}

export function useUpdateWorkflow() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => workflowsService.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: WORKFLOWS_KEY })
      queryClient.invalidateQueries({ queryKey: ['workflow', variables.id] })
    },
  })
}

export function useDeleteWorkflow() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => workflowsService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: WORKFLOWS_KEY })
    },
  })
}

export function useExecuteWorkflow() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, inputs }: { id: string; inputs?: Record<string, any> }) =>
      workflowsService.execute(id, inputs),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['workflow', variables.id] })
      queryClient.invalidateQueries({ queryKey: ['workflow-executions', variables.id] })
    },
  })
}

export function useWorkflowExecutions(workflowId: string) {
  return useQuery({
    queryKey: ['workflow-executions', workflowId],
    queryFn: () => workflowsService.getExecutions(workflowId),
    enabled: !!workflowId,
  })
}

export function useWorkflowExecution(workflowId: string, executionId: string) {
  return useQuery({
    queryKey: ['workflow-execution', workflowId, executionId],
    queryFn: () => workflowsService.getExecution(workflowId, executionId),
    enabled: !!workflowId && !!executionId,
  })
}

export function useCancelExecution() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (executionId: string) => workflowsService.cancelExecution(executionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: WORKFLOWS_KEY })
    },
  })
}
