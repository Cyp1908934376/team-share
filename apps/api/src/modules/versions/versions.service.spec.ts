import { Test, TestingModule } from '@nestjs/testing'
import { NotFoundException, ForbiddenException } from '@nestjs/common'
import { VersionsService } from './versions.service'
import { PrismaService } from '../../database/prisma/prisma.service'

describe('VersionsService', () => {
  let service: VersionsService
  let prisma: any

  const mockResource = {
    id: 'resource-uuid-1',
    type: 'prompt',
    name: 'Test Resource',
    ownerId: 'owner-uuid',
    content: { template: 'v1 content' },
  }

  const mockVersion = {
    id: 'version-uuid-1',
    resourceId: 'resource-uuid-1',
    version: '1.0.0',
    changelog: 'Initial version',
    content: { template: 'v1 content' },
    dependencies: [],
    authorId: 'owner-uuid',
    status: 'draft',
    publishedAt: null,
    createdAt: new Date(),
    author: { id: 'owner-uuid', username: 'owner', displayName: 'Owner' },
    resource: { id: 'resource-uuid-1', name: 'Test Resource', type: 'prompt' },
  }

  beforeEach(async () => {
    const mockPrisma = {
      resource: {
        findUnique: jest.fn(),
      },
      version: {
        findMany: jest.fn(),
        findUnique: jest.fn(),
        findFirst: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
      },
    }

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        VersionsService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile()

    service = module.get<VersionsService>(VersionsService)
    prisma = module.get(PrismaService)
  })

  describe('findByResource', () => {
    it('should return versions for a resource', async () => {
      prisma.version.findMany.mockResolvedValue([mockVersion])

      const result = await service.findByResource('resource-uuid-1')

      expect(result).toHaveLength(1)
      expect(result[0]).toHaveProperty('author')
    })
  })

  describe('findById', () => {
    it('should return version with author and resource', async () => {
      prisma.version.findUnique.mockResolvedValue(mockVersion)

      const result = await service.findById(mockVersion.id)

      expect(result).toHaveProperty('version', '1.0.0')
      expect(result).toHaveProperty('resource')
    })

    it('should throw NotFoundException if not found', async () => {
      prisma.version.findUnique.mockResolvedValue(null)

      await expect(service.findById('non-existent')).rejects.toThrow(NotFoundException)
    })
  })

  describe('create', () => {
    it('should create version with auto-incremented version number', async () => {
      prisma.resource.findUnique.mockResolvedValue(mockResource)
      prisma.version.findFirst.mockResolvedValue(mockVersion)
      prisma.version.create.mockResolvedValue({ ...mockVersion, version: '1.0.1' })

      const result = await service.create('resource-uuid-1', 'owner-uuid', {
        changelog: 'Updated template',
      } as any)

      expect(result.version).toBe('1.0.1')
    })

    it('should start at 1.0.0 for first version', async () => {
      prisma.resource.findUnique.mockResolvedValue(mockResource)
      prisma.version.findFirst.mockResolvedValue(null)
      prisma.version.create.mockResolvedValue({ ...mockVersion, version: '1.0.0' })

      const result = await service.create('resource-uuid-1', 'owner-uuid', {} as any)

      expect(result.version).toBe('1.0.0')
    })

    it('should throw ForbiddenException if not owner', async () => {
      prisma.resource.findUnique.mockResolvedValue(mockResource)

      await expect(
        service.create('resource-uuid-1', 'other-user', {} as any),
      ).rejects.toThrow(ForbiddenException)
    })

    it('should throw NotFoundException if resource not found', async () => {
      prisma.resource.findUnique.mockResolvedValue(null)

      await expect(
        service.create('non-existent', 'owner-uuid', {} as any),
      ).rejects.toThrow(NotFoundException)
    })
  })

  describe('diff', () => {
    it('should return diff between two versions', async () => {
      const v1 = { ...mockVersion, content: { template: 'v1', prompt: 'old' } }
      const v2 = { ...mockVersion, id: 'v2-id', version: '1.0.1', content: { template: 'v2', prompt: 'old', newField: 'added' } }
      prisma.version.findUnique.mockResolvedValueOnce(v1).mockResolvedValueOnce(v2)

      const result = await service.diff(v1.id, v2.id)

      expect(result).toHaveProperty('changes')
      expect(result).toHaveProperty('summary')
      expect(result.summary.modified).toBe(1)
      expect(result.summary.added).toBe(1)
    })
  })

  describe('publish', () => {
    it('should publish a version', async () => {
      prisma.version.findUnique.mockResolvedValue(mockVersion)
      prisma.version.update.mockResolvedValue({ ...mockVersion, status: 'published' })

      const result = await service.publish(mockVersion.id, 'owner-uuid')

      expect(result.status).toBe('published')
    })

    it('should throw ForbiddenException if not author', async () => {
      prisma.version.findUnique.mockResolvedValue(mockVersion)

      await expect(service.publish(mockVersion.id, 'other-user')).rejects.toThrow(ForbiddenException)
    })
  })
})
