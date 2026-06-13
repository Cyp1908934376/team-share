import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { resourcesService } from '@/services/resources'
import type { ResourceQuery } from '@team-share/shared'

const RESOURCES_KEY = ['resources'] as const

export function useResources(params?: ResourceQuery) {
  return useQuery({
    queryKey: [...RESOURCES_KEY, params],
    queryFn: () => resourcesService.findAll(params),
  })
}

export function useResource(id: string) {
  return useQuery({
    queryKey: ['resource', id],
    queryFn: () => resourcesService.findById(id),
    enabled: !!id,
  })
}

export function useCreateResource() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: resourcesService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: RESOURCES_KEY })
    },
  })
}

export function useUpdateResource() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => resourcesService.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: RESOURCES_KEY })
      queryClient.invalidateQueries({ queryKey: ['resource', variables.id] })
    },
  })
}

export function useDeleteResource() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => resourcesService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: RESOURCES_KEY })
    },
  })
}

export function useStarResource() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => resourcesService.star(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: RESOURCES_KEY })
    },
  })
}

export function usePublishResource() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => resourcesService.publish(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: RESOURCES_KEY })
    },
  })
}

export function useResourceVersions(resourceId: string) {
  return useQuery({
    queryKey: ['resource-versions', resourceId],
    queryFn: () => resourcesService.getVersions(resourceId),
    enabled: !!resourceId,
  })
}

export function useCreateResourceVersion() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ resourceId, data }: { resourceId: string; data: any }) =>
      resourcesService.createVersion(resourceId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['resource-versions', variables.resourceId] })
    },
  })
}
