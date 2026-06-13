import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { teamsService } from '@/services/teams'

const TEAMS_KEY = ['teams'] as const

export function useTeams() {
  return useQuery({
    queryKey: TEAMS_KEY,
    queryFn: () => teamsService.findAll(),
  })
}

export function useTeam(id: string) {
  return useQuery({
    queryKey: ['team', id],
    queryFn: () => teamsService.findById(id),
    enabled: !!id,
  })
}

export function useCreateTeam() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: teamsService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TEAMS_KEY })
    },
  })
}

export function useUpdateTeam() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => teamsService.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: TEAMS_KEY })
      queryClient.invalidateQueries({ queryKey: ['team', variables.id] })
    },
  })
}

export function useDeleteTeam() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => teamsService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TEAMS_KEY })
    },
  })
}

export function useTeamMembers(teamId: string) {
  return useQuery({
    queryKey: ['team-members', teamId],
    queryFn: () => teamsService.getMembers(teamId),
    enabled: !!teamId,
  })
}

export function useAddTeamMember() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ teamId, data }: { teamId: string; data: { userId: string; role?: string } }) =>
      teamsService.addMember(teamId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['team-members', variables.teamId] })
      queryClient.invalidateQueries({ queryKey: ['team', variables.teamId] })
    },
  })
}

export function useRemoveTeamMember() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ teamId, userId }: { teamId: string; userId: string }) =>
      teamsService.removeMember(teamId, userId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['team-members', variables.teamId] })
      queryClient.invalidateQueries({ queryKey: ['team', variables.teamId] })
    },
  })
}
