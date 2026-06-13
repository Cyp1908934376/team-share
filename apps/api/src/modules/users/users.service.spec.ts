import { Test, TestingModule } from '@nestjs/testing'
import { NotFoundException } from '@nestjs/common'
import { UsersService } from './users.service'
import { PrismaService } from '../../database/prisma/prisma.service'

describe('UsersService', () => {
  let service: UsersService
  let prisma: any

  const mockUser = {
    id: 'user-uuid-1',
    username: 'testuser',
    email: 'test@example.com',
    displayName: 'Test User',
    avatarUrl: 'https://example.com/avatar.png',
    role: 'user',
    preferences: { theme: 'dark' },
    lastLoginAt: new Date(),
    createdAt: new Date(),
  }

  beforeEach(async () => {
    const mockPrisma = {
      user: {
        findUnique: jest.fn(),
        update: jest.fn(),
        findMany: jest.fn(),
      },
      resource: {
        findMany: jest.fn(),
      },
    }

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile()

    service = module.get<UsersService>(UsersService)
    prisma = module.get(PrismaService)
  })

  describe('findById', () => {
    it('should return user without sensitive fields', async () => {
      prisma.user.findUnique.mockResolvedValue(mockUser)

      const result = await service.findById(mockUser.id)

      expect(result).toHaveProperty('id', mockUser.id)
      expect(result).toHaveProperty('username', 'testuser')
      expect(result).not.toHaveProperty('passwordHash')
    })

    it('should throw NotFoundException if user not found', async () => {
      prisma.user.findUnique.mockResolvedValue(null)

      await expect(service.findById('non-existent')).rejects.toThrow(NotFoundException)
    })
  })

  describe('update', () => {
    it('should update user profile fields', async () => {
      prisma.user.findUnique.mockResolvedValue(mockUser)
      prisma.user.update.mockResolvedValue({ ...mockUser, displayName: 'Updated Name' })

      const result = await service.update(mockUser.id, {
        displayName: 'Updated Name',
      } as any)

      expect(result.displayName).toBe('Updated Name')
    })

    it('should throw NotFoundException if user to update not found', async () => {
      prisma.user.findUnique.mockResolvedValue(null)

      await expect(
        service.update('non-existent', { displayName: 'Test' } as any),
      ).rejects.toThrow(NotFoundException)
    })
  })

  describe('getResources', () => {
    it('should return resources owned by user', async () => {
      const mockResources = [{ id: 'r1', name: 'Resource 1' }]
      prisma.resource.findMany.mockResolvedValue(mockResources)

      const result = await service.getResources(mockUser.id)

      expect(result).toEqual(mockResources)
      expect(prisma.resource.findMany).toHaveBeenCalledWith({
        where: { ownerId: mockUser.id },
        orderBy: { updatedAt: 'desc' },
      })
    })
  })
})
