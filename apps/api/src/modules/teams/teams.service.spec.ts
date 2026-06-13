import { Test, TestingModule } from '@nestjs/testing'
import { NotFoundException, ForbiddenException } from '@nestjs/common'
import { TeamsService } from './teams.service'
import { PrismaService } from '../../database/prisma/prisma.service'

describe('TeamsService', () => {
  let service: TeamsService
  let prisma: any

  const mockTeam = {
    id: 'team-uuid-1',
    name: 'Test Team',
    slug: 'test-team',
    description: 'A test team',
    settings: {},
    members: [
      { userId: 'user-1', role: 'owner', user: { id: 'user-1', username: 'admin', displayName: 'Admin' } },
    ],
    _count: { members: 1, resources: 0, environments: 0, workflows: 0 },
    createdAt: new Date(),
    updatedAt: new Date(),
  }

  beforeEach(async () => {
    const mockPrisma = {
      team: {
        findMany: jest.fn(),
        findUnique: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
      },
      teamMember: {
        create: jest.fn(),
        delete: jest.fn(),
      },
    }

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TeamsService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile()

    service = module.get<TeamsService>(TeamsService)
    prisma = module.get(PrismaService)
  })

  describe('findAll', () => {
    it('should return all teams with member/resource counts', async () => {
      prisma.team.findMany.mockResolvedValue([mockTeam])

      const result = await service.findAll()

      expect(result).toHaveLength(1)
      expect(result[0]).toHaveProperty('_count')
    })
  })

  describe('findById', () => {
    it('should return team with members and counts', async () => {
      prisma.team.findUnique.mockResolvedValue(mockTeam)

      const result = await service.findById(mockTeam.id)

      expect(result).toHaveProperty('members')
      expect(result).toHaveProperty('_count')
    })

    it('should throw NotFoundException if team not found', async () => {
      prisma.team.findUnique.mockResolvedValue(null)

      await expect(service.findById('non-existent')).rejects.toThrow(NotFoundException)
    })
  })

  describe('create', () => {
    it('should create team with creator as owner', async () => {
      prisma.team.create.mockResolvedValue(mockTeam)

      const result = await service.create('user-1', {
        name: 'New Team',
        description: 'Description',
      } as any)

      expect(result).toHaveProperty('name', 'Test Team')
      expect(prisma.team.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            members: { create: { userId: 'user-1', role: 'owner' } },
          }),
        }),
      )
    })
  })

  describe('update', () => {
    it('should update team when user is owner', async () => {
      prisma.team.findUnique.mockResolvedValue(mockTeam)
      prisma.team.update.mockResolvedValue({ ...mockTeam, name: 'Updated' })

      const result = await service.update(mockTeam.id, 'user-1', { name: 'Updated' } as any)

      expect(result.name).toBe('Updated')
    })

    it('should throw ForbiddenException if user is not owner or admin', async () => {
      prisma.team.findUnique.mockResolvedValue({
        ...mockTeam,
        members: [{ userId: 'other-user', role: 'member' }],
      })

      await expect(
        service.update(mockTeam.id, 'other-user', { name: 'Updated' } as any),
      ).rejects.toThrow(ForbiddenException)
    })
  })

  describe('addMember', () => {
    it('should add a new team member', async () => {
      const mockMember = { userId: 'new-user', teamId: mockTeam.id, role: 'member', user: {} }
      prisma.teamMember.create.mockResolvedValue(mockMember)

      const result = await service.addMember(mockTeam.id, 'new-user', 'member')

      expect(result).toHaveProperty('userId', 'new-user')
    })
  })

  describe('removeMember', () => {
    it('should remove a team member', async () => {
      prisma.teamMember.delete.mockResolvedValue({})

      const result = await service.removeMember(mockTeam.id, 'user-2')

      expect(result).toEqual({ success: true })
    })
  })
})
