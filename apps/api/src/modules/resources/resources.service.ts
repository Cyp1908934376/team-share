import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common'
import { PrismaService } from '../../database/prisma/prisma.service'
import { CreateResourceDto, UpdateResourceDto, QueryResourceDto } from './dto'

@Injectable()
export class ResourcesService {
  constructor(private prisma: PrismaService) {}

  async findAll(query: QueryResourceDto) {
    const { type, status, search, tags, page = 1, pageSize = 20 } = query

    const where: any = {}

    if (type) where.type = type
    if (status) where.status = status
    if (tags) where.tags = { hasSome: tags.split(',') }
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ]
    }

    const [items, total] = await Promise.all([
      this.prisma.resource.findMany({
        where,
        include: {
          owner: {
            select: {
              id: true,
              username: true,
              displayName: true,
              avatarUrl: true,
            },
          },
          _count: {
            select: { stars: true },
          },
        },
        orderBy: { updatedAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      this.prisma.resource.count({ where }),
    ])

    return {
      items,
      meta: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize),
      },
    }
  }

  async findById(id: string, userId?: string) {
    const resource = await this.prisma.resource.findUnique({
      where: { id },
      include: {
        owner: {
          select: {
            id: true,
            username: true,
            displayName: true,
            avatarUrl: true,
          },
        },
        versions: {
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
        _count: {
          select: { stars: true },
        },
      },
    })

    if (!resource) {
      throw new NotFoundException('资源不存在')
    }

    // Check if current user has starred
    let isStarred = false
    if (userId) {
      const star = await this.prisma.star.findUnique({
        where: {
          userId_resourceId: { userId, resourceId: id },
        },
      })
      isStarred = !!star
    }

    return { ...resource, isStarred }
  }

  async create(userId: string, dto: CreateResourceDto) {
    const slug = dto.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')

    return this.prisma.resource.create({
      data: {
        type: dto.type,
        name: dto.name,
        slug,
        description: dto.description,
        content: dto.content,
        metadata: dto.metadata || {},
        tags: dto.tags || [],
        category: dto.category,
        visibility: dto.visibility || 'team',
        ownerId: userId,
        teamId: dto.teamId,
      },
      include: {
        owner: {
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

  async update(id: string, userId: string, dto: UpdateResourceDto) {
    const resource = await this.findById(id)

    if (resource.ownerId !== userId) {
      throw new ForbiddenException('无权修改此资源')
    }

    return this.prisma.resource.update({
      where: { id },
      data: {
        name: dto.name,
        description: dto.description,
        content: dto.content,
        metadata: dto.metadata,
        tags: dto.tags,
        category: dto.category,
        visibility: dto.visibility,
      },
      include: {
        owner: {
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

  async delete(id: string, userId: string) {
    const resource = await this.findById(id)

    if (resource.ownerId !== userId) {
      throw new ForbiddenException('无权删除此资源')
    }

    await this.prisma.resource.delete({ where: { id } })

    return { success: true }
  }

  async star(id: string, userId: string) {
    const resource = await this.findById(id)

    // Check if already starred
    const existingStar = await this.prisma.star.findUnique({
      where: {
        userId_resourceId: { userId, resourceId: id },
      },
    })

    if (existingStar) {
      // Unstar
      await this.prisma.star.delete({
        where: { id: existingStar.id },
      })
      await this.prisma.resource.update({
        where: { id },
        data: { starCount: { decrement: 1 } },
      })
      return { starred: false }
    } else {
      // Star
      await this.prisma.star.create({
        data: { userId, resourceId: id },
      })
      await this.prisma.resource.update({
        where: { id },
        data: { starCount: { increment: 1 } },
      })
      return { starred: true }
    }
  }

  async getStarredResources(userId: string) {
    const stars = await this.prisma.star.findMany({
      where: { userId },
      include: {
        resource: {
          include: {
            owner: {
              select: {
                id: true,
                username: true,
                displayName: true,
                avatarUrl: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    return stars.map((star) => star.resource)
  }

  async publish(id: string, userId: string) {
    const resource = await this.findById(id)

    if (resource.ownerId !== userId) {
      throw new ForbiddenException('无权发布此资源')
    }

    return this.prisma.resource.update({
      where: { id },
      data: {
        status: 'published',
        publishedAt: new Date(),
      },
    })
  }

  async download(id: string) {
    await this.prisma.resource.update({
      where: { id },
      data: { downloads: { increment: 1 } },
    })

    return this.findById(id)
  }
}
