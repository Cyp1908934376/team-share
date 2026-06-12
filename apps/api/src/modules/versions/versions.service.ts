import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common'
import { PrismaService } from '../../database/prisma/prisma.service'
import { CreateVersionDto } from './dto'

@Injectable()
export class VersionsService {
  constructor(private prisma: PrismaService) {}

  async findByResource(resourceId: string) {
    return this.prisma.version.findMany({
      where: { resourceId },
      include: {
        author: {
          select: {
            id: true,
            username: true,
            displayName: true,
            avatarUrl: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })
  }

  async findById(id: string) {
    const version = await this.prisma.version.findUnique({
      where: { id },
      include: {
        author: {
          select: {
            id: true,
            username: true,
            displayName: true,
            avatarUrl: true,
          },
        },
        resource: {
          select: {
            id: true,
            name: true,
            type: true,
          },
        },
      },
    })

    if (!version) {
      throw new NotFoundException('版本不存在')
    }

    return version
  }

  async create(resourceId: string, userId: string, dto: CreateVersionDto) {
    // Check resource exists and user has permission
    const resource = await this.prisma.resource.findUnique({
      where: { id: resourceId },
    })

    if (!resource) {
      throw new NotFoundException('资源不存在')
    }

    if (resource.ownerId !== userId) {
      throw new ForbiddenException('无权为此资源创建版本')
    }

    // Auto-increment version
    const latestVersion = await this.prisma.version.findFirst({
      where: { resourceId },
      orderBy: { createdAt: 'desc' },
    })

    let version = '1.0.0'
    if (latestVersion) {
      const parts = latestVersion.version.split('.').map(Number)
      parts[2] += 1
      version = parts.join('.')
    }

    return this.prisma.version.create({
      data: {
        resourceId,
        version: dto.version || version,
        tag: dto.tag,
        changelog: dto.changelog,
        content: dto.content || resource.content,
        dependencies: dto.dependencies || [],
        authorId: userId,
      },
      include: {
        author: {
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

  async diff(versionId1: string, versionId2: string) {
    const [v1, v2] = await Promise.all([
      this.findById(versionId1),
      this.findById(versionId2),
    ])

    const changes: Array<{
      path: string
      type: 'added' | 'removed' | 'modified'
      oldValue?: any
      newValue?: any
    }> = []

    const content1 = (v1.content as Record<string, any>) || {}
    const content2 = (v2.content as Record<string, any>) || {}

    const allKeys = new Set([...Object.keys(content1), ...Object.keys(content2)])

    for (const key of allKeys) {
      const inV1 = key in content1
      const inV2 = key in content2

      if (!inV1 && inV2) {
        changes.push({ path: key, type: 'added', newValue: content2[key] })
      } else if (inV1 && !inV2) {
        changes.push({ path: key, type: 'removed', oldValue: content1[key] })
      } else if (JSON.stringify(content1[key]) !== JSON.stringify(content2[key])) {
        changes.push({
          path: key,
          type: 'modified',
          oldValue: content1[key],
          newValue: content2[key],
        })
      }
    }

    return {
      from: { id: v1.id, version: v1.version, createdAt: v1.createdAt },
      to: { id: v2.id, version: v2.version, createdAt: v2.createdAt },
      changes,
      summary: {
        added: changes.filter((c) => c.type === 'added').length,
        removed: changes.filter((c) => c.type === 'removed').length,
        modified: changes.filter((c) => c.type === 'modified').length,
        total: changes.length,
      },
    }
  }

  async publish(id: string, userId: string) {
    const version = await this.findById(id)

    if (version.authorId !== userId) {
      throw new ForbiddenException('无权发布此版本')
    }

    return this.prisma.version.update({
      where: { id },
      data: {
        status: 'published',
        publishedAt: new Date(),
      },
    })
  }
}
