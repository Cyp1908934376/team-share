import { Injectable, NotFoundException } from '@nestjs/common'
import { PrismaService } from '../../database/prisma/prisma.service'
import { UpdateUserDto } from './dto'

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findById(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        username: true,
        email: true,
        displayName: true,
        avatarUrl: true,
        role: true,
        preferences: true,
        lastLoginAt: true,
        createdAt: true,
      },
    })

    if (!user) {
      throw new NotFoundException('用户不存在')
    }

    return user
  }

  async update(id: string, dto: UpdateUserDto) {
    await this.findById(id)

    return this.prisma.user.update({
      where: { id },
      data: {
        displayName: dto.displayName,
        avatarUrl: dto.avatar,
        preferences: dto.preferences,
      },
      select: {
        id: true,
        username: true,
        email: true,
        displayName: true,
        avatarUrl: true,
        role: true,
        preferences: true,
      },
    })
  }

  async getResources(userId: string) {
    return this.prisma.resource.findMany({
      where: { ownerId: userId },
      orderBy: { updatedAt: 'desc' },
    })
  }
}
