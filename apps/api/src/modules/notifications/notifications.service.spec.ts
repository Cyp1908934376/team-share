import { Test, TestingModule } from '@nestjs/testing'
import { NotFoundException } from '@nestjs/common'
import { NotificationsService } from './notifications.service'
import { PrismaService } from '../../database/prisma/prisma.service'

describe('NotificationsService', () => {
  let service: NotificationsService
  let prisma: any

  const mockNotification = {
    id: 'notif-uuid-1',
    userId: 'user-1',
    type: 'resource_starred',
    title: '资源被收藏',
    message: 'Your resource was starred',
    data: {},
    read: false,
    createdAt: new Date(),
  }

  beforeEach(async () => {
    const mockPrisma = {
      notification: {
        create: jest.fn(),
        findMany: jest.fn(),
        findFirst: jest.fn(),
        findUnique: jest.fn(),
        update: jest.fn(),
        updateMany: jest.fn(),
        delete: jest.fn(),
        deleteMany: jest.fn(),
        count: jest.fn(),
      },
    }

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotificationsService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile()

    service = module.get<NotificationsService>(NotificationsService)
    prisma = module.get(PrismaService)
  })

  describe('create', () => {
    it('should create a notification', async () => {
      prisma.notification.create.mockResolvedValue(mockNotification)

      const result = await service.create({
        userId: 'user-1',
        type: 'resource_starred',
        title: '资源被收藏',
      })

      expect(result).toHaveProperty('type', 'resource_starred')
      expect(prisma.notification.create).toHaveBeenCalledTimes(1)
    })
  })

  describe('findAll', () => {
    it('should return paginated notifications with unread count', async () => {
      prisma.notification.findMany.mockResolvedValue([mockNotification])
      prisma.notification.count.mockResolvedValueOnce(1).mockResolvedValueOnce(1)

      const result = await service.findAll('user-1')

      expect(result).toHaveProperty('items')
      expect(result).toHaveProperty('unreadCount', 1)
      expect(result).toHaveProperty('total', 1)
    })
  })

  describe('markAsRead', () => {
    it('should mark notification as read', async () => {
      prisma.notification.findFirst.mockResolvedValue(mockNotification)
      prisma.notification.update.mockResolvedValue({ ...mockNotification, read: true })

      const result = await service.markAsRead(mockNotification.id, 'user-1')

      expect(result.read).toBe(true)
    })

    it('should throw NotFoundException if notification not found', async () => {
      prisma.notification.findFirst.mockResolvedValue(null)

      await expect(
        service.markAsRead('non-existent', 'user-1'),
      ).rejects.toThrow(NotFoundException)
    })
  })

  describe('markAllAsRead', () => {
    it('should mark all notifications as read', async () => {
      prisma.notification.updateMany.mockResolvedValue({ count: 5 })

      const result = await service.markAllAsRead('user-1')

      expect(result).toEqual({ success: true })
    })
  })

  describe('delete', () => {
    it('should delete a notification', async () => {
      prisma.notification.findFirst.mockResolvedValue(mockNotification)
      prisma.notification.delete.mockResolvedValue(mockNotification)

      const result = await service.delete(mockNotification.id, 'user-1')

      expect(result).toEqual({ success: true })
    })

    it('should throw NotFoundException if notification not found', async () => {
      prisma.notification.findFirst.mockResolvedValue(null)

      await expect(
        service.delete('non-existent', 'user-1'),
      ).rejects.toThrow(NotFoundException)
    })
  })

  describe('deleteAll', () => {
    it('should delete all notifications for user', async () => {
      prisma.notification.deleteMany.mockResolvedValue({ count: 3 })

      const result = await service.deleteAll('user-1')

      expect(result).toEqual({ success: true })
    })
  })
})
