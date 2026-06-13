import { describe, it, expect, beforeEach, vi } from 'vitest'

vi.mock('@/services/notifications', () => ({
  notificationsService: {
    findAll: vi.fn(),
    markAsRead: vi.fn(),
    markAllAsRead: vi.fn(),
    delete: vi.fn(),
  },
}))

import { useNotificationStore } from '../notificationStore'
import { notificationsService } from '@/services/notifications'

describe('notificationStore', () => {
  const mockNotification = {
    id: 'notif-1',
    userId: 'user-1',
    type: 'resource_starred',
    title: '资源被收藏',
    message: 'Someone starred your resource',
    data: {},
    read: false,
    createdAt: new Date(),
  }

  beforeEach(() => {
    useNotificationStore.setState({
      notifications: [],
      unreadCount: 0,
      isLoading: false,
      error: null,
    })
    vi.clearAllMocks()
  })

  describe('fetchNotifications', () => {
    it('should load notifications and calculate unread count', async () => {
      ;(notificationsService.findAll as ReturnType<typeof vi.fn>).mockResolvedValue({
        items: [mockNotification, { ...mockNotification, id: 'notif-2', read: true }],
        unreadCount: 1,
      })

      await useNotificationStore.getState().fetchNotifications()

      expect(useNotificationStore.getState().notifications).toHaveLength(2)
      expect(useNotificationStore.getState().unreadCount).toBe(1)
    })

    it('should handle plain array response', async () => {
      ;(notificationsService.findAll as ReturnType<typeof vi.fn>).mockResolvedValue([mockNotification])

      await useNotificationStore.getState().fetchNotifications()

      expect(useNotificationStore.getState().notifications).toHaveLength(1)
      expect(useNotificationStore.getState().unreadCount).toBe(1)
    })
  })

  describe('markAsRead', () => {
    it('should mark notification as read and update count', async () => {
      useNotificationStore.setState({ notifications: [mockNotification], unreadCount: 1 })
      ;(notificationsService.markAsRead as ReturnType<typeof vi.fn>).mockResolvedValue(undefined)

      await useNotificationStore.getState().markAsRead('notif-1')

      expect(useNotificationStore.getState().notifications[0].read).toBe(true)
      expect(useNotificationStore.getState().unreadCount).toBe(0)
    })
  })

  describe('markAllAsRead', () => {
    it('should mark all as read and reset count', async () => {
      useNotificationStore.setState({
        notifications: [mockNotification, { ...mockNotification, id: 'notif-2' }],
        unreadCount: 2,
      })
      ;(notificationsService.markAllAsRead as ReturnType<typeof vi.fn>).mockResolvedValue(undefined)

      await useNotificationStore.getState().markAllAsRead()

      expect(useNotificationStore.getState().unreadCount).toBe(0)
      expect(useNotificationStore.getState().notifications.every((n: any) => n.read)).toBe(true)
    })
  })

  describe('deleteNotification', () => {
    it('should remove notification and update count', async () => {
      useNotificationStore.setState({
        notifications: [mockNotification, { ...mockNotification, id: 'notif-2', read: true }],
        unreadCount: 1,
      })
      ;(notificationsService.delete as ReturnType<typeof vi.fn>).mockResolvedValue(undefined)

      await useNotificationStore.getState().deleteNotification('notif-2')

      expect(useNotificationStore.getState().notifications).toHaveLength(1)
      expect(useNotificationStore.getState().unreadCount).toBe(1)
    })
  })

  describe('addNotification', () => {
    it('should add notification and increment unread count', () => {
      const newNotif = { ...mockNotification, id: 'notif-3' }

      useNotificationStore.getState().addNotification(newNotif)

      expect(useNotificationStore.getState().notifications).toHaveLength(1)
      expect(useNotificationStore.getState().unreadCount).toBe(1)
    })
  })
})
