import { Test, TestingModule } from '@nestjs/testing'
import { NotFoundException } from '@nestjs/common'
import { EnvironmentsService } from './environments.service'
import { PrismaService } from '../../database/prisma/prisma.service'

describe('EnvironmentsService', () => {
  let service: EnvironmentsService
  let prisma: any

  const mockEnv = {
    id: 'env-uuid-1',
    name: 'development',
    displayName: '开发环境',
    description: 'Development environment',
    teamId: 'team-1',
    variables: { NODE_ENV: 'development' },
    secrets: {},
    dependencies: { node: '20' },
    status: 'active',
    health: {},
    team: { id: 'team-1', name: 'Test Team' },
    snapshots: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  }

  beforeEach(async () => {
    const mockPrisma = {
      environment: {
        findMany: jest.fn(),
        findUnique: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      },
      environmentSnapshot: {
        create: jest.fn(),
        findMany: jest.fn(),
        findUnique: jest.fn(),
        delete: jest.fn(),
      },
    }

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EnvironmentsService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile()

    service = module.get<EnvironmentsService>(EnvironmentsService)
    prisma = module.get(PrismaService)
  })

  describe('findAll', () => {
    it('should return environments with team info', async () => {
      prisma.environment.findMany.mockResolvedValue([mockEnv])

      const result = await service.findAll()

      expect(result).toHaveLength(1)
    })

    it('should filter by teamId', async () => {
      prisma.environment.findMany.mockResolvedValue([])

      await service.findAll('team-1')

      expect(prisma.environment.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: { teamId: 'team-1' } }),
      )
    })
  })

  describe('findById', () => {
    it('should return environment with snapshots', async () => {
      prisma.environment.findUnique.mockResolvedValue(mockEnv)

      const result = await service.findById(mockEnv.id)

      expect(result).toHaveProperty('variables')
      expect(result).toHaveProperty('snapshots')
    })

    it('should throw NotFoundException if not found', async () => {
      prisma.environment.findUnique.mockResolvedValue(null)

      await expect(service.findById('non-existent')).rejects.toThrow(NotFoundException)
    })
  })

  describe('create', () => {
    it('should create an environment', async () => {
      prisma.environment.create.mockResolvedValue(mockEnv)

      const result = await service.create({
        name: 'staging',
        variables: {},
        secrets: {},
        dependencies: {},
      } as any)

      expect(result).toHaveProperty('name', 'development')
    })
  })

  describe('snapshot', () => {
    it('should create a snapshot of current environment state', async () => {
      prisma.environment.findUnique.mockResolvedValue(mockEnv)
      prisma.environmentSnapshot.create.mockResolvedValue({
        id: 'snap-1',
        environmentId: mockEnv.id,
        name: 'Test Snapshot',
        snapshot: { variables: mockEnv.variables },
        createdAt: new Date(),
      })

      const result = await service.snapshot(mockEnv.id, 'Test Snapshot')

      expect(result).toHaveProperty('id', 'snap-1')
    })
  })

  describe('restoreSnapshot', () => {
    it('should restore environment from snapshot', async () => {
      prisma.environmentSnapshot.findUnique.mockResolvedValue({
        id: 'snap-1',
        environmentId: mockEnv.id,
        snapshot: { variables: { NODE_ENV: 'production' }, secrets: {}, dependencies: {}, status: 'active' },
        createdAt: new Date(),
      })
      prisma.environment.update.mockResolvedValue(mockEnv)

      const result = await service.restoreSnapshot('snap-1')

      expect(result).toEqual({ success: true, environmentId: mockEnv.id })
    })

    it('should throw NotFoundException if snapshot not found', async () => {
      prisma.environmentSnapshot.findUnique.mockResolvedValue(null)

      await expect(service.restoreSnapshot('non-existent')).rejects.toThrow(NotFoundException)
    })
  })

  describe('getHealth', () => {
    it('should return health checks for active environment', async () => {
      prisma.environment.findUnique.mockResolvedValue(mockEnv)

      const result = await service.getHealth(mockEnv.id)

      expect(result).toHaveProperty('status', 'healthy')
      expect(result).toHaveProperty('checks')
      expect(result.checks).toHaveLength(3)
    })
  })
})
