import { Test, TestingModule } from '@nestjs/testing'
import { AuditLogsService } from './audit-logs.service'
import { PrismaService } from '../../database/prisma/prisma.service'

describe('AuditLogsService', () => {
  let service: AuditLogsService
  let prisma: any

  const mockLog = {
    id: 'log-uuid-1',
    userId: 'user-1',
    action: 'resource.create',
    resourceType: 'resource',
    resourceId: 'res-1',
    details: { name: 'Test' },
    ipAddress: '127.0.0.1',
    userAgent: 'test-agent',
    createdAt: new Date(),
  }

  beforeEach(async () => {
    const mockPrisma = {
      auditLog: {
        create: jest.fn(),
        findMany: jest.fn(),
        findUnique: jest.fn(),
        count: jest.fn(),
        groupBy: jest.fn(),
      },
    }

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuditLogsService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile()

    service = module.get<AuditLogsService>(AuditLogsService)
    prisma = module.get(PrismaService)
  })

  describe('log', () => {
    it('should create an audit log entry', async () => {
      prisma.auditLog.create.mockResolvedValue(mockLog)

      const result = await service.log({
        userId: 'user-1',
        action: 'resource.create',
        resourceType: 'resource',
        resourceId: 'res-1',
      })

      expect(result).toHaveProperty('action', 'resource.create')
      expect(prisma.auditLog.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            userId: 'user-1',
            action: 'resource.create',
          }),
        }),
      )
    })
  })

  describe('findAll', () => {
    it('should return paginated audit logs', async () => {
      prisma.auditLog.findMany.mockResolvedValue([mockLog])
      prisma.auditLog.count.mockResolvedValue(1)

      const result = await service.findAll({ page: 1, pageSize: 20 })

      expect(result).toHaveProperty('items')
      expect(result).toHaveProperty('total', 1)
      expect(result.items).toHaveLength(1)
    })

    it('should filter by userId', async () => {
      prisma.auditLog.findMany.mockResolvedValue([])
      prisma.auditLog.count.mockResolvedValue(0)

      await service.findAll({ userId: 'user-1' })

      expect(prisma.auditLog.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ userId: 'user-1' }),
        }),
      )
    })

    it('should filter by action', async () => {
      prisma.auditLog.findMany.mockResolvedValue([])
      prisma.auditLog.count.mockResolvedValue(0)

      await service.findAll({ action: 'resource.create' })

      expect(prisma.auditLog.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ action: 'resource.create' }),
        }),
      )
    })
  })

  describe('findById', () => {
    it('should return a single audit log', async () => {
      prisma.auditLog.findUnique.mockResolvedValue(mockLog)

      const result = await service.findById(mockLog.id)

      expect(result).toHaveProperty('id', mockLog.id)
    })
  })

  describe('getStats', () => {
    it('should return audit log statistics', async () => {
      prisma.auditLog.count.mockResolvedValueOnce(100).mockResolvedValueOnce(10)
      prisma.auditLog.groupBy.mockResolvedValueOnce([
        { action: 'resource.create', _count: { id: 30 } },
      ])
      prisma.auditLog.groupBy.mockResolvedValueOnce([
        { resourceType: 'resource', _count: { id: 50 } },
      ])

      const result = await service.getStats()

      expect(result).toHaveProperty('total', 100)
      expect(result).toHaveProperty('recentCount', 10)
      expect(result).toHaveProperty('byAction')
      expect(result).toHaveProperty('byResourceType')
    })
  })

  describe('getRecentActivity', () => {
    it('should return recent activity with user info', async () => {
      prisma.auditLog.findMany.mockResolvedValue([mockLog])

      const result = await service.getRecentActivity(5)

      expect(result).toHaveLength(1)
    })
  })
})
