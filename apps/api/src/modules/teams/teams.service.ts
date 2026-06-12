import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common'
import { PrismaService } from '../../database/prisma/prisma.service'
import { CreateTeamDto, UpdateTeamDto } from './dto'

@Injectable()
export class TeamsService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.team.findMany({
      include: {
        _count: {
          select: {
            members: true,
            resources: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })
  }

  async findById(id: string) {
    const team = await this.prisma.team.findUnique({
      where: { id },
      include: {
        members: {
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
        },
        _count: {
          select: {
            resources: true,
            environments: true,
            workflows: true,
          },
        },
      },
    })

    if (!team) {
      throw new NotFoundException('团队不存在')
    }

    return team
  }

  async create(userId: string, dto: CreateTeamDto) {
    const slug = dto.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')

    const team = await this.prisma.team.create({
      data: {
        name: dto.name,
        slug,
        description: dto.description,
        members: {
          create: {
            userId,
            role: 'owner',
          },
        },
      },
      include: {
        members: {
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
        },
      },
    })

    return team
  }

  async update(id: string, userId: string, dto: UpdateTeamDto) {
    const team = await this.findById(id)

    const member = team.members.find((m) => m.userId === userId)
    if (!member || !['owner', 'admin'].includes(member.role)) {
      throw new ForbiddenException('无权修改此团队')
    }

    return this.prisma.team.update({
      where: { id },
      data: {
        name: dto.name,
        description: dto.description,
        settings: dto.settings,
      },
    })
  }

  async addMember(teamId: string, userId: string, role: string = 'member') {
    return this.prisma.teamMember.create({
      data: {
        teamId,
        userId,
        role,
      },
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

  async removeMember(teamId: string, userId: string) {
    await this.prisma.teamMember.delete({
      where: {
        userId_teamId: {
          userId,
          teamId,
        },
      },
    })

    return { success: true }
  }
}
