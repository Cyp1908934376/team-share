import { Injectable } from '@nestjs/common'
import { PrismaService } from '../../database/prisma/prisma.service'

interface LogActionParams {
  userId: string
  action: string
  resourceType?: string
  resourceId?: string
  details?: Record<string, any>
  ipAddress?: string
  userAgent?: string
}

@Injectable()
export class AuditLogsService {
  constructor(private prisma: PrismaService) {}

  async log(params: LogActionParams) {
    return this.prisma.auditLog.create({
      data: {
        userId: params.userId,
        action: params.action,
        resourceType: params.resourceType,
        resourceId: params.resourceId,
        details: params.details || {},
        ipAddress: params.ipAddress,
        userAgent: params.userAgent,
      },
    })
  }

  async findAll(params?: {
    userId?: string
    action?: string
    resourceType?: string
    resourceId?: string
    startDate?: Date
    endDate?: Date
    page?: number
    pageSize?: number
  }) {
    const {
      userId,
      action,
      resourceType,
      resourceId,
      startDate,
      endDate,
      page = 1,
      pageSize = 20,
    } = params || {}

    const where: any = {}

    if (userId) where.userId = userId
    if (action) where.action = action
    if (resourceType) where.resourceType = resourceType
    if (resourceId) where.resourceId = resourceId
    if (startDate || endDate) {
      where.createdAt = {}
      if (startDate) where.createdAt.gte = startDate
      if (endDate) where.createdAt.lte = endDate
    }

    const [items, total] = await Promise.all([
      this.prisma.auditLog.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              username: true,
              displayName: true,
              avatarUrl: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      this.prisma.auditLog.count({ where }),
    ])

    return {
      items,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    }
  }

  async findById(id: string) {
    return this.prisma.auditLog.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            displayName: true,
            avatarUrl: true,
          },
        },
      },
    })
  }

  async getStats() {
    const [total, byAction, byResourceType, recentCount] = await Promise.all([
      this.prisma.auditLog.count(),
      this.prisma.auditLog.groupBy({
        by: ['action'],
        _count: { id: true },
        orderBy: { _count: { id: 'desc' } },
        take: 10,
      }),
      this.prisma.auditLog.groupBy({
        by: ['resourceType'],
        _count: { id: true },
        orderBy: { _count: { id: 'desc' } },
      }),
      this.prisma.auditLog.count({
        where: {
          createdAt: {
            gte: new Date(Date.now() - 24 * 60 * 60 * 1000),
          },
        },
      }),
    ])

    return {
      total,
      recentCount,
      byAction: byAction.map((item) => ({
        action: item.action,
        count: item._count.id,
      })),
      byResourceType: byResourceType.map((item) => ({
        resourceType: item.resourceType,
        count: item._count.id,
      })),
    }
  }

  async getRecentActivity(limit = 10) {
    return this.prisma.auditLog.findMany({
      include: {
        user: {
          select: {
            id: true,
            username: true,
            displayName: true,
            avatarUrl: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
    })
  }
}
