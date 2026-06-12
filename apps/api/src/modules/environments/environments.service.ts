import { Injectable, NotFoundException } from '@nestjs/common'
import { PrismaService } from '../../database/prisma/prisma.service'
import type { HealthCheck } from '@team-share/shared'
import { CreateEnvironmentDto, UpdateEnvironmentDto } from './dto'

@Injectable()
export class EnvironmentsService {
  constructor(private prisma: PrismaService) {}

  async findAll(teamId?: string) {
    const where = teamId ? { teamId } : {}

    return this.prisma.environment.findMany({
      where,
      include: {
        team: {
          select: {
            id: true,
            name: true,
          },
        },
        _count: {
          select: { snapshots: true },
        },
      },
      orderBy: { updatedAt: 'desc' },
    })
  }

  async findById(id: string) {
    const env = await this.prisma.environment.findUnique({
      where: { id },
      include: {
        team: {
          select: {
            id: true,
            name: true,
          },
        },
        snapshots: {
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
      },
    })

    if (!env) {
      throw new NotFoundException('环境不存在')
    }

    return env
  }

  async create(dto: CreateEnvironmentDto) {
    return this.prisma.environment.create({
      data: {
        name: dto.name,
        displayName: dto.displayName,
        description: dto.description,
        teamId: dto.teamId,
        variables: dto.variables || {},
        secrets: dto.secrets || {},
        dependencies: dto.dependencies || {},
      },
    })
  }

  async update(id: string, dto: UpdateEnvironmentDto) {
    await this.findById(id)

    return this.prisma.environment.update({
      where: { id },
      data: {
        name: dto.name,
        displayName: dto.displayName,
        description: dto.description,
        variables: dto.variables,
        secrets: dto.secrets,
        dependencies: dto.dependencies,
        status: dto.status,
      },
    })
  }

  async delete(id: string) {
    await this.findById(id)

    await this.prisma.environment.delete({ where: { id } })

    return { success: true }
  }

  async snapshot(id: string, name?: string, description?: string) {
    const env = await this.findById(id)

    const snapshot = await this.prisma.environmentSnapshot.create({
      data: {
        environmentId: id,
        name: name || `快照 ${new Date().toLocaleString('zh-CN')}`,
        description,
        snapshot: {
          variables: env.variables,
          secrets: env.secrets,
          dependencies: env.dependencies,
          status: env.status,
        },
      },
    })

    return snapshot
  }

  async getSnapshots(environmentId: string) {
    return this.prisma.environmentSnapshot.findMany({
      where: { environmentId },
      orderBy: { createdAt: 'desc' },
    })
  }

  async restoreSnapshot(snapshotId: string) {
    const snapshot = await this.prisma.environmentSnapshot.findUnique({
      where: { id: snapshotId },
    })

    if (!snapshot) {
      throw new NotFoundException('快照不存在')
    }

    const snapshotData = snapshot.snapshot as any

    await this.prisma.environment.update({
      where: { id: snapshot.environmentId },
      data: {
        variables: snapshotData.variables || {},
        secrets: snapshotData.secrets || {},
        dependencies: snapshotData.dependencies || {},
        status: snapshotData.status || 'active',
      },
    })

    return { success: true, environmentId: snapshot.environmentId }
  }

  async deleteSnapshot(snapshotId: string) {
    await this.prisma.environmentSnapshot.delete({
      where: { id: snapshotId },
    })

    return { success: true }
  }

  async getHealth(id: string) {
    const env = await this.findById(id)

    // Perform health checks
    const checks: HealthCheck[] = []

    // Check if environment is active
    checks.push({
      name: '状态检查',
      status: env.status === 'active' ? 'pass' : 'fail',
      message: env.status === 'active' ? '环境正常运行' : '环境未激活',
    })

    // Check variables
    const variables = env.variables as Record<string, any>
    checks.push({
      name: '变量配置',
      status: Object.keys(variables).length > 0 ? 'pass' : 'warn',
      message: `已配置 ${Object.keys(variables).length} 个变量`,
    })

    // Check dependencies
    const dependencies = env.dependencies as Record<string, any>
    checks.push({
      name: '依赖配置',
      status: Object.keys(dependencies).length > 0 ? 'pass' : 'warn',
      message: `已配置 ${Object.keys(dependencies).length} 个依赖`,
    })

    const overallStatus = checks.every((c) => c.status === 'pass')
      ? 'healthy'
      : checks.some((c) => c.status === 'fail')
      ? 'unhealthy'
      : 'degraded'

    return {
      status: overallStatus,
      checks,
      lastChecked: new Date(),
    }
  }
}
