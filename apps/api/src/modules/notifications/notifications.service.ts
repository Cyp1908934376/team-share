import { Injectable, NotFoundException } from '@nestjs/common'
import { PrismaService } from '../../database/prisma/prisma.service'

@Injectable()
export class NotificationsService {
  constructor(private prisma: PrismaService) {}

  async create(params: {
    userId: string
    type: string
    title: string
    message?: string
    data?: Record<string, any>
  }) {
    return this.prisma.notification.create({
      data: {
        userId: params.userId,
        type: params.type,
        title: params.title,
        message: params.message,
        data: params.data || {},
      },
    })
  }

  async findAll(userId: string, params?: { read?: boolean; page?: number; pageSize?: number }) {
    const { read, page = 1, pageSize = 20 } = params || {}

    const where: any = { userId }
    if (read !== undefined) where.read = read

    const [items, total, unreadCount] = await Promise.all([
      this.prisma.notification.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      this.prisma.notification.count({ where }),
      this.prisma.notification.count({ where: { userId, read: false } }),
    ])

    return { items, total, unreadCount, page, pageSize }
  }

  async markAsRead(id: string, userId: string) {
    const notification = await this.prisma.notification.findFirst({
      where: { id, userId },
    })

    if (!notification) {
      throw new NotFoundException('通知不存在')
    }

    return this.prisma.notification.update({
      where: { id },
      data: { read: true },
    })
  }

  async markAllAsRead(userId: string) {
    await this.prisma.notification.updateMany({
      where: { userId, read: false },
      data: { read: true },
    })

    return { success: true }
  }

  async delete(id: string, userId: string) {
    const notification = await this.prisma.notification.findFirst({
      where: { id, userId },
    })

    if (!notification) {
      throw new NotFoundException('通知不存在')
    }

    await this.prisma.notification.delete({ where: { id } })
    return { success: true }
  }

  async deleteAll(userId: string) {
    await this.prisma.notification.deleteMany({ where: { userId } })
    return { success: true }
  }
}
