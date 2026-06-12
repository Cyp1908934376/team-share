import { Injectable } from '@nestjs/common'
import { PrismaService } from '../../database/prisma/prisma.service'
import type { HealthCheck } from '@team-share/shared'

@Injectable()
export class MonitoringService {
  constructor(private prisma: PrismaService) {}

  async getStats() {
    const [resources, teams, environments, workflows, users, versions] =
      await Promise.all([
        this.prisma.resource.count(),
        this.prisma.team.count(),
        this.prisma.environment.count(),
        this.prisma.workflow.count(),
        this.prisma.user.count(),
        this.prisma.version.count(),
      ])

    return { resources, teams, environments, workflows, users, versions }
  }

  async getResourceStats() {
    const byType = await this.prisma.resource.groupBy({
      by: ['type'],
      _count: { id: true },
    })

    const byStatus = await this.prisma.resource.groupBy({
      by: ['status'],
      _count: { id: true },
    })

    const totalDownloads = await this.prisma.resource.aggregate({
      _sum: { downloads: true },
    })

    const totalStars = await this.prisma.resource.aggregate({
      _sum: { starCount: true },
    })

    return {
      byType: byType.map((i) => ({ type: i.type, count: i._count.id })),
      byStatus: byStatus.map((i) => ({ status: i.status, count: i._count.id })),
      totalDownloads: totalDownloads._sum.downloads || 0,
      totalStars: totalStars._sum.starCount || 0,
    }
  }

  async getRecentActivity(limit = 20) {
    return this.prisma.auditLog.findMany({
      include: {
        user: {
          select: { id: true, username: true, displayName: true, avatarUrl: true },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
    })
  }

  async getWorkflowStats() {
    const byStatus = await this.prisma.workflowExecution.groupBy({
      by: ['status'],
      _count: { id: true },
    })

    const recentExecutions = await this.prisma.workflowExecution.findMany({
      include: {
        workflow: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 10,
    })

    return {
      byStatus: byStatus.map((i) => ({ status: i.status, count: i._count.id })),
      recentExecutions,
    }
  }

  async getDashboard() {
    const now = new Date()
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const weekAgo = new Date(todayStart.getTime() - 7 * 24 * 60 * 60 * 1000)
    const prevWeekStart = new Date(weekAgo.getTime() - 7 * 24 * 60 * 60 * 1000)

    const [
      totalResources, publishedResources, archivedResources,
      resourcesBeforeThisWeek,
      totalEnvs, activeEnvs, envsBeforeThisWeek,
      totalWorkflows,
      thisWeekExecs, prevWeekExecs,
      totalTeams, totalMembers, teamsBeforeThisWeek,
      totalVersions, todayNewVersions,
    ] = await Promise.all([
      this.prisma.resource.count(),
      this.prisma.resource.count({ where: { status: 'published' } }),
      this.prisma.resource.count({ where: { status: 'archived' } }),
      this.prisma.resource.count({ where: { createdAt: { lt: weekAgo } } }),
      this.prisma.environment.count(),
      this.prisma.environment.count({ where: { status: 'active' } }),
      this.prisma.environment.count({ where: { createdAt: { lt: weekAgo } } }),
      this.prisma.workflow.count(),
      this.prisma.workflowExecution.count({ where: { createdAt: { gte: weekAgo } } }),
      this.prisma.workflowExecution.count({ where: { createdAt: { gte: prevWeekStart, lt: weekAgo } } }),
      this.prisma.team.count(),
      this.prisma.teamMember.count(),
      this.prisma.team.count({ where: { createdAt: { lt: weekAgo } } }),
      this.prisma.version.count(),
      this.prisma.version.count({ where: { createdAt: { gte: todayStart } } }),
    ])

    const calcGrowth = (current: number, prev: number) => {
      if (prev === 0) return current > 0 ? 100 : 0
      return Math.round(((current - prev) / prev) * 100)
    }

    return {
      resources: {
        total: totalResources,
        published: publishedResources,
        archived: archivedResources,
        growth: calcGrowth(totalResources, resourcesBeforeThisWeek),
      },
      environments: {
        total: totalEnvs,
        active: activeEnvs,
        growth: calcGrowth(totalEnvs, envsBeforeThisWeek),
      },
      workflows: {
        total: totalWorkflows,
        executions: thisWeekExecs,
        growth: calcGrowth(thisWeekExecs, prevWeekExecs),
      },
      teams: {
        total: totalTeams,
        members: totalMembers,
        growth: calcGrowth(totalTeams, teamsBeforeThisWeek),
      },
      versions: {
        total: totalVersions,
        todayNew: todayNewVersions,
      },
    }
  }

  async getSystemHealth() {
    const checks: HealthCheck[] = []

    // Database check
    try {
      await this.prisma.$queryRaw`SELECT 1`
      checks.push({ name: '数据库', status: 'pass', message: '连接正常' })
    } catch {
      checks.push({ name: '数据库', status: 'fail', message: '连接失败' })
    }

    // Resource count check
    const resourceCount = await this.prisma.resource.count()
    checks.push({
      name: '资源存储',
      status: 'pass',
      message: `${resourceCount} 个资源`,
    })

    // Active environments
    const activeEnvs = await this.prisma.environment.count({
      where: { status: 'active' },
    })
    checks.push({
      name: '环境服务',
      status: activeEnvs > 0 ? 'pass' : 'warn',
      message: `${activeEnvs} 个活跃环境`,
    })

    // Running workflows
    const runningWorkflows = await this.prisma.workflowExecution.count({
      where: { status: 'running' },
    })
    checks.push({
      name: '工作流引擎',
      status: 'pass',
      message: `${runningWorkflows} 个正在执行`,
    })

    const overallStatus = checks.every((c) => c.status === 'pass')
      ? 'healthy'
      : checks.some((c) => c.status === 'fail')
        ? 'unhealthy'
        : 'degraded'

    return {
      status: overallStatus,
      checks,
      uptime: process.uptime(),
      timestamp: new Date(),
    }
  }
}
