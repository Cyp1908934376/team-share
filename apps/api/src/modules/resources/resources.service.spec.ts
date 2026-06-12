import { Test, TestingModule } from '@nestjs/testing'
import { NotFoundException, ForbiddenException } from '@nestjs/common'
import { ResourcesService } from './resources.service'
import { PrismaService } from '../../database/prisma/prisma.service'

describe('ResourcesService', () => {
  let service: ResourcesService
  let prisma: any

  const mockOwner = {
    id: 'owner-uuid',
    username: 'owner',
    displayName: 'Owner',
    avatarUrl: null,
  }

  const mockResource = {
    id: 'resource-uuid-1',
    type: 'prompt',
    name: 'Test Prompt',
    slug: 'test-prompt',
    description: 'A test prompt',
    content: { template: 'Hello {{name}}' },
    metadata: {},
    tags: ['test'],
    category: 'testing',
    visibility: 'team',
    ownerId: mockOwner.id,
    teamId: null,
    version: '1.0.0',
    status: 'draft',
    downloads: 0,
    starCount: 0,
    publishedAt: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    owner: mockOwner,
    _count: { stars: 0 },
  }

  beforeEach(async () => {
    const mockPrisma = {
      resource: {
        findMany: jest.fn(),
        findUnique: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
        count: jest.fn(),
      },
      star: {
        findUnique: jest.fn(),
        findMany: jest.fn(),
        create: jest.fn(),
        delete: jest.fn(),
      },
    }

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ResourcesService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile()

    service = module.get<ResourcesService>(ResourcesService)
    prisma = module.get(PrismaService)
  })

  describe('findAll', () => {
    it('should return paginated resources', async () => {
      prisma.resource.findMany.mockResolvedValue([mockResource])
      prisma.resource.count.mockResolvedValue(1)

      const result = await service.findAll({})

      expect(result.items).toHaveLength(1)
      expect(result.meta).toEqual({ page: 1, pageSize: 20, total: 1, totalPages: 1 })
    })

    it('should filter by type', async () => {
      prisma.resource.findMany.mockResolvedValue([])
      prisma.resource.count.mockResolvedValue(0)

      await service.findAll({ type: 'prompt' })

      expect(prisma.resource.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ type: 'prompt' }),
        }),
      )
    })

    it('should filter by search term', async () => {
      prisma.resource.findMany.mockResolvedValue([])
      prisma.resource.count.mockResolvedValue(0)

      await service.findAll({ search: 'hello' })

      expect(prisma.resource.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            OR: [
              { name: { contains: 'hello', mode: 'insensitive' } },
              { description: { contains: 'hello', mode: 'insensitive' } },
            ],
          }),
        }),
      )
    })

    it('should filter by tags', async () => {
      prisma.resource.findMany.mockResolvedValue([])
      prisma.resource.count.mockResolvedValue(0)

      await service.findAll({ tags: 'test,api' })

      expect(prisma.resource.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ tags: { hasSome: ['test', 'api'] } }),
        }),
      )
    })
  })

  describe('findById', () => {
    it('should return resource with isStarred flag', async () => {
      prisma.resource.findUnique.mockResolvedValue({
        ...mockResource,
        versions: [],
      })
      prisma.star.findUnique.mockResolvedValue(null)

      const result = await service.findById(mockResource.id, 'some-user')

      expect(result).toHaveProperty('isStarred', false)
    })

    it('should return isStarred=true when user starred', async () => {
      prisma.resource.findUnique.mockResolvedValue({
        ...mockResource,
        versions: [],
      })
      prisma.star.findUnique.mockResolvedValue({ id: 'star-uuid' })

      const result = await service.findById(mockResource.id, 'some-user')

      expect(result).toHaveProperty('isStarred', true)
    })

    it('should throw NotFoundException if resource not found', async () => {
      prisma.resource.findUnique.mockResolvedValue(null)

      await expect(service.findById('non-existent')).rejects.toThrow(NotFoundException)
    })
  })

  describe('create', () => {
    it('should create a resource with generated slug', async () => {
      prisma.resource.create.mockResolvedValue(mockResource)

      const dto = {
        type: 'prompt',
        name: 'Test Prompt',
        description: 'A test prompt',
      }

      const result = await service.create(mockOwner.id, dto as any)

      expect(result).toHaveProperty('slug', 'test-prompt')
      expect(prisma.resource.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            type: 'prompt',
            ownerId: mockOwner.id,
          }),
        }),
      )
    })
  })

  describe('update', () => {
    it('should update own resource', async () => {
      prisma.resource.findUnique.mockResolvedValue(mockResource)
      prisma.resource.update.mockResolvedValue({ ...mockResource, name: 'Updated' })

      const result = await service.update(mockResource.id, mockOwner.id, {
        name: 'Updated',
      } as any)

      expect(result.name).toBe('Updated')
    })

    it('should throw ForbiddenException if not owner', async () => {
      prisma.resource.findUnique.mockResolvedValue(mockResource)

      await expect(
        service.update(mockResource.id, 'other-user-id', { name: 'Updated' } as any),
      ).rejects.toThrow(ForbiddenException)
    })
  })

  describe('delete', () => {
    it('should delete own resource', async () => {
      prisma.resource.findUnique.mockResolvedValue(mockResource)
      prisma.resource.delete.mockResolvedValue(mockResource)

      const result = await service.delete(mockResource.id, mockOwner.id)

      expect(result).toEqual({ success: true })
    })

    it('should throw ForbiddenException if not owner', async () => {
      prisma.resource.findUnique.mockResolvedValue(mockResource)

      await expect(
        service.delete(mockResource.id, 'other-user-id'),
      ).rejects.toThrow(ForbiddenException)
    })
  })

  describe('star', () => {
    it('should add star', async () => {
      prisma.resource.findUnique.mockResolvedValue(mockResource)
      prisma.star.findUnique.mockResolvedValue(null)
      prisma.star.create.mockResolvedValue({ id: 'star-uuid' })
      prisma.resource.update.mockResolvedValue(mockResource)

      const result = await service.star(mockResource.id, 'user-id')

      expect(result).toEqual({ starred: true })
      expect(prisma.star.create).toHaveBeenCalledTimes(1)
    })

    it('should remove star', async () => {
      prisma.resource.findUnique.mockResolvedValue(mockResource)
      prisma.star.findUnique.mockResolvedValue({ id: 'star-uuid' })
      prisma.star.delete.mockResolvedValue({ id: 'star-uuid' })
      prisma.resource.update.mockResolvedValue(mockResource)

      const result = await service.star(mockResource.id, 'user-id')

      expect(result).toEqual({ starred: false })
      expect(prisma.star.delete).toHaveBeenCalledTimes(1)
    })
  })

  describe('publish', () => {
    it('should publish own resource', async () => {
      prisma.resource.findUnique.mockResolvedValue(mockResource)
      prisma.resource.update.mockResolvedValue({
        ...mockResource,
        status: 'published',
        publishedAt: new Date(),
      })

      const result = await service.publish(mockResource.id, mockOwner.id)

      expect(result.status).toBe('published')
      expect(result.publishedAt).toBeDefined()
    })

    it('should throw ForbiddenException if not owner', async () => {
      prisma.resource.findUnique.mockResolvedValue(mockResource)

      await expect(
        service.publish(mockResource.id, 'other-user'),
      ).rejects.toThrow(ForbiddenException)
    })
  })

  describe('download', () => {
    it('should increment download count', async () => {
      prisma.resource.update.mockResolvedValue({ ...mockResource, downloads: 1 })
      prisma.resource.findUnique.mockResolvedValue({ ...mockResource, downloads: 1 })

      await service.download(mockResource.id)

      expect(prisma.resource.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: mockResource.id },
          data: { downloads: { increment: 1 } },
        }),
      )
    })
  })
})
