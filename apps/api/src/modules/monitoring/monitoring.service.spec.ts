import { Test, TestingModule } from '@nestjs/testing'
import { MonitoringService } from './monitoring.service'
import { PrismaService } from '../../database/prisma/prisma.service'

describe('MonitoringService', () => {
  let service: MonitoringService
  let prisma: any

  beforeEach(async () => {
    const mockPrisma = {
      resource: {
        count: jest.fn(),
        groupBy: jest.fn(),
        aggregate: jest.fn(),
      },
      team: { count: jest.fn() },
      environment: { count: jest.fn() },
      workflow: { count: jest.fn() },
      user: { count: jest.fn() },
      version: { count: jest.fn() },
      auditLog: { findMany: jest.fn() },
      workflowExecution: {
        groupBy: jest.fn(),
        findMany: jest.fn(),
        count: jest.fn(),
      },
      teamMember: { count: jest.fn() },
      $queryRaw: jest.fn(),
    }

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MonitoringService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile()

    service = module.get<MonitoringService>(MonitoringService)
    prisma = module.get(PrismaService)
  })

  describe('getStats', () => {
    it('should return entity counts', async () => {
      prisma.resource.count.mockResolvedValue(10)
      prisma.team.count.mockResolvedValue(3)
      prisma.environment.count.mockResolvedValue(5)
      prisma.workflow.count.mockResolvedValue(2)
      prisma.user.count.mockResolvedValue(8)
      prisma.version.count.mockResolvedValue(15)

      const result = await service.getStats()

      expect(result).toEqual({ resources: 10, teams: 3, environments: 5, workflows: 2, users: 8, versions: 15 })
    })
  })

  describe('getResourceStats', () => {
    it('should return resource distribution stats', async () => {
      prisma.resource.groupBy.mockResolvedValueOnce([{ type: 'prompt', _count: { id: 5 } }])
      prisma.resource.groupBy.mockResolvedValueOnce([{ status: 'published', _count: { id: 8 } }])
      prisma.resource.aggregate.mockResolvedValueOnce({ _sum: { downloads: 100 } })
      prisma.resource.aggregate.mockResolvedValueOnce({ _sum: { starCount: 25 } })

      const result = await service.getResourceStats()

      expect(result).toHaveProperty('byType')
      expect(result).toHaveProperty('totalDownloads', 100)
      expect(result).toHaveProperty('totalStars', 25)
    })
  })

  describe('getDashboard', () => {
    it('should return dashboard stats with growth calculations', async () => {
      prisma.resource.count.mockResolvedValue(20).mockResolvedValue(15).mockResolvedValue(2).mockResolvedValue(10)
      prisma.environment.count.mockResolvedValue(5).mockResolvedValue(4).mockResolvedValue(3)
      prisma.workflow.count.mockResolvedValue(3)
      prisma.workflowExecution.count.mockResolvedValue(50).mockResolvedValue(30)
      prisma.team.count.mockResolvedValue(4).mockResolvedValue(3)
      prisma.teamMember.count.mockResolvedValue(20)
      prisma.version.count.mockResolvedValue(40).mockResolvedValue(2)

      const result = await service.getDashboard()

      expect(result).toHaveProperty('resources')
      expect(result.resources).toHaveProperty('growth')
      expect(result).toHaveProperty('environments')
      expect(result).toHaveProperty('workflows')
      expect(result).toHaveProperty('teams')
      expect(result).toHaveProperty('versions')
    })
  })

  describe('getSystemHealth', () => {
    it('should return healthy status when all checks pass', async () => {
      prisma.$queryRaw.mockResolvedValue([{ 1: 1 }])
      prisma.resource.count.mockResolvedValue(10)
      prisma.environment.count.mockResolvedValue(3)
      prisma.workflowExecution.count.mockResolvedValue(1)

      const result = await service.getSystemHealth()

      expect(result).toHaveProperty('status', 'healthy')
      expect(result).toHaveProperty('checks')
      expect(result).toHaveProperty('uptime')
    })

    it('should return unhealthy status when DB check fails', async () => {
      prisma.$queryRaw.mockRejectedValue(new Error('Connection failed'))
      prisma.resource.count.mockResolvedValue(10)
      prisma.environment.count.mockResolvedValue(3)
      prisma.workflowExecution.count.mockResolvedValue(1)

      const result = await service.getSystemHealth()

      expect(result.status).toBe('unhealthy')
    })
  })

  describe('getRecentActivity', () => {
    it('should return recent audit logs', async () => {
      prisma.auditLog.findMany.mockResolvedValue([{ id: 'log-1', action: 'resource.create' }])

      const result = await service.getRecentActivity(10)

      expect(result).toHaveLength(1)
    })
  })
})
