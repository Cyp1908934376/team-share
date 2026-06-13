import { describe, it, expect, beforeEach, vi } from 'vitest'

vi.mock('@/services/teams', () => ({
  teamsService: {
    findAll: vi.fn(),
    findById: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    getMembers: vi.fn(),
    addMember: vi.fn(),
    removeMember: vi.fn(),
  },
}))

import { useTeamStore } from '../teamStore'
import { teamsService } from '@/services/teams'

describe('teamStore', () => {
  const mockTeam = {
    id: 'team-1',
    name: 'Test Team',
    slug: 'test-team',
    description: 'A test team',
    settings: {},
    _count: { members: 3, resources: 5, workflows: 2, environments: 1 },
    createdAt: new Date(),
    updatedAt: new Date(),
  }

  const mockMember = {
    userId: 'user-2',
    teamId: 'team-1',
    role: 'member',
    user: { id: 'user-2', username: 'member1', displayName: 'Member 1' },
    joinedAt: new Date(),
  }

  beforeEach(() => {
    useTeamStore.setState({
      teams: [],
      selectedTeam: null,
      members: [],
      isLoading: false,
      isDetailLoading: false,
      error: null,
    })
    vi.clearAllMocks()
  })

  describe('fetchTeams', () => {
    it('should load teams', async () => {
      ;(teamsService.findAll as ReturnType<typeof vi.fn>).mockResolvedValue([mockTeam])

      await useTeamStore.getState().fetchTeams()

      expect(useTeamStore.getState().teams).toHaveLength(1)
    })
  })

  describe('createTeam', () => {
    it('should prepend new team', async () => {
      ;(teamsService.create as ReturnType<typeof vi.fn>).mockResolvedValue(mockTeam)

      const result = await useTeamStore.getState().createTeam({ name: 'New Team' })

      expect(result).toEqual(mockTeam)
      expect(useTeamStore.getState().teams).toHaveLength(1)
    })
  })

  describe('updateTeam', () => {
    it('should update team in list and selected', async () => {
      useTeamStore.setState({ teams: [mockTeam], selectedTeam: mockTeam })
      const updated = { ...mockTeam, name: 'Updated Team' }
      ;(teamsService.update as ReturnType<typeof vi.fn>).mockResolvedValue(updated)

      await useTeamStore.getState().updateTeam('team-1', { name: 'Updated Team' })

      expect(useTeamStore.getState().teams[0].name).toBe('Updated Team')
      expect(useTeamStore.getState().selectedTeam?.name).toBe('Updated Team')
    })
  })

  describe('deleteTeam', () => {
    it('should remove team and clear selection', async () => {
      useTeamStore.setState({ teams: [mockTeam], selectedTeam: mockTeam })
      ;(teamsService.delete as ReturnType<typeof vi.fn>).mockResolvedValue(undefined)

      await useTeamStore.getState().deleteTeam('team-1')

      expect(useTeamStore.getState().teams).toHaveLength(0)
      expect(useTeamStore.getState().selectedTeam).toBeNull()
    })
  })

  describe('fetchMembers', () => {
    it('should load team members', async () => {
      ;(teamsService.getMembers as ReturnType<typeof vi.fn>).mockResolvedValue([mockMember])

      await useTeamStore.getState().fetchMembers('team-1')

      expect(useTeamStore.getState().members).toHaveLength(1)
    })
  })

  describe('addMember', () => {
    it('should append new member to list', async () => {
      ;(teamsService.addMember as ReturnType<typeof vi.fn>).mockResolvedValue(mockMember)

      const result = await useTeamStore.getState().addMember('team-1', { userId: 'user-2' })

      expect(result).toEqual(mockMember)
      expect(useTeamStore.getState().members).toHaveLength(1)
    })
  })

  describe('removeMember', () => {
    it('should remove member from list', async () => {
      useTeamStore.setState({ members: [mockMember] })
      ;(teamsService.removeMember as ReturnType<typeof vi.fn>).mockResolvedValue(undefined)

      await useTeamStore.getState().removeMember('team-1', 'user-2')

      expect(useTeamStore.getState().members).toHaveLength(0)
    })
  })
})
