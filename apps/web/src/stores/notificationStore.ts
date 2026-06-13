import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { notificationsService } from '@/services/notifications'

interface NotificationState {
  notifications: any[]
  unreadCount: number
  isLoading: boolean
  error: string | null

  // Actions
  fetchNotifications: () => Promise<void>
  markAsRead: (id: string) => Promise<void>
  markAllAsRead: () => Promise<void>
  deleteNotification: (id: string) => Promise<void>
  addNotification: (notification: any) => void
  clearError: () => void
}

export const useNotificationStore = create<NotificationState>()(
  persist(
    (set) => ({
      notifications: [],
      unreadCount: 0,
      isLoading: false,
      error: null,

      fetchNotifications: async () => {
        set({ isLoading: true, error: null })
        try {
          const response: any = await notificationsService.findAll()
          // The API interceptor unwraps responses. Paginated endpoints return
          // { items, ...extra } where extra may include unreadCount.
          const notifications: any[] = Array.isArray(response) ? response : response?.items || []
          const unreadCount: number =
            response?.unreadCount ?? notifications.filter((n: any) => !n.read).length
          set({ notifications, unreadCount, isLoading: false })
        } catch (error: any) {
          set({
            error: error.message || '获取通知列表失败',
            isLoading: false,
          })
        }
      },

      markAsRead: async (id: string) => {
        try {
          await notificationsService.markAsRead(id)
          set((state) => {
            const notifications = state.notifications.map((n: any) =>
              n.id === id ? { ...n, read: true } : n
            )
            const unreadCount = notifications.filter((n: any) => !n.read).length
            return { notifications, unreadCount }
          })
        } catch (error: any) {
          set({ error: error.message || '标记已读失败' })
        }
      },

      markAllAsRead: async () => {
        try {
          await notificationsService.markAllAsRead()
          set((state) => ({
            notifications: state.notifications.map((n: any) => ({ ...n, read: true })),
            unreadCount: 0,
          }))
        } catch (error: any) {
          set({ error: error.message || '全部标记已读失败' })
        }
      },

      deleteNotification: async (id: string) => {
        try {
          await notificationsService.delete(id)
          set((state) => {
            const notifications = state.notifications.filter((n: any) => n.id !== id)
            const unreadCount = notifications.filter((n: any) => !n.read).length
            return { notifications, unreadCount }
          })
        } catch (error: any) {
          set({ error: error.message || '删除通知失败' })
        }
      },

      addNotification: (notification: any) => {
        set((state) => ({
          notifications: [notification, ...state.notifications],
          unreadCount: state.unreadCount + 1,
        }))
      },

      clearError: () => set({ error: null }),
    }),
    {
      name: 'notification-storage',
      partialize: (state) => ({
        unreadCount: state.unreadCount,
      }),
    }
  )
)
