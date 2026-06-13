import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { environmentsService } from '@/services/environments'

const ENVIRONMENTS_KEY = ['environments'] as const

export function useEnvironments(teamId?: string) {
  return useQuery({
    queryKey: [...ENVIRONMENTS_KEY, teamId],
    queryFn: () => environmentsService.findAll(teamId),
  })
}

export function useEnvironment(id: string) {
  return useQuery({
    queryKey: ['environment', id],
    queryFn: () => environmentsService.findById(id),
    enabled: !!id,
  })
}

export function useCreateEnvironment() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: environmentsService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ENVIRONMENTS_KEY })
    },
  })
}

export function useUpdateEnvironment() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => environmentsService.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ENVIRONMENTS_KEY })
      queryClient.invalidateQueries({ queryKey: ['environment', variables.id] })
    },
  })
}

export function useDeleteEnvironment() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => environmentsService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ENVIRONMENTS_KEY })
    },
  })
}

export function useCreateSnapshot() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, name }: { id: string; name?: string }) =>
      environmentsService.createSnapshot(id, name),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['environment', variables.id] })
      queryClient.invalidateQueries({ queryKey: ['environment-snapshots', variables.id] })
    },
  })
}

export function useEnvironmentSnapshots(environmentId: string) {
  return useQuery({
    queryKey: ['environment-snapshots', environmentId],
    queryFn: () => environmentsService.getSnapshots(environmentId),
    enabled: !!environmentId,
  })
}

export function useRestoreSnapshot() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (snapshotId: string) => environmentsService.restoreSnapshot(snapshotId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ENVIRONMENTS_KEY })
    },
  })
}

export function useDeleteSnapshot() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (snapshotId: string) => environmentsService.deleteSnapshot(snapshotId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ENVIRONMENTS_KEY })
    },
  })
}

export function useEnvironmentHealth(id: string) {
  return useQuery({
    queryKey: ['environment-health', id],
    queryFn: () => environmentsService.getHealth(id),
    enabled: !!id,
  })
}
