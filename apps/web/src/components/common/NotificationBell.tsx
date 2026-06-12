import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Bell, Check, CheckCheck, Trash2 } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { api } from '@/services/api'
import { cn } from '@/utils/cn'
import { formatRelativeTime, API_ENDPOINTS } from '@team-share/shared'

export function NotificationBell() {
  const [open, setOpen] = useState(false)
  const queryClient = useQueryClient()

  const { data } = useQuery({
    queryKey: ['notifications'],
    queryFn: () => api.get<any>(API_ENDPOINTS.NOTIFICATIONS.BASE, { params: { pageSize: 20 } }),
    refetchInterval: 60000, // Refresh every minute
  })

  const markReadMutation = useMutation({
    mutationFn: (id: string) => api.post(API_ENDPOINTS.NOTIFICATIONS.READ(id)),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications'] }),
  })

  const markAllReadMutation = useMutation({
    mutationFn: () => api.post(API_ENDPOINTS.NOTIFICATIONS.READ_ALL),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications'] }),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(API_ENDPOINTS.NOTIFICATIONS.READ(id)),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications'] }),
  })

  const notifications = data?.items || []
  const unreadCount = data?.unreadCount || 0

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="relative rounded-lg p-2 text-label-secondary transition-colors hover:bg-fill-quaternary hover:text-label-primary"
      >
        <Bell size={18} />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-system-red text-[10px] font-medium text-white">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      <AnimatePresence>
        {open && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
            <motion.div
              initial={{ opacity: 0, y: -8, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.95 }}
              transition={{ duration: 0.15 }}
              className="absolute right-0 top-full z-50 mt-2 w-80 overflow-hidden rounded-xl bg-bg-elevated shadow-apple-4 border border-separator"
            >
              {/* Header */}
              <div className="flex items-center justify-between border-b border-separator px-4 py-3">
                <h4 className="text-subheadline font-medium text-label-primary">通知</h4>
                {unreadCount > 0 && (
                  <button
                    onClick={() => markAllReadMutation.mutate()}
                    className="flex items-center gap-1 text-caption-1 text-system-blue hover:text-system-blue/80"
                  >
                    <CheckCheck size={14} />
                    全部已读
                  </button>
                )}
              </div>

              {/* List */}
              <div className="max-h-[300px] overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-8">
                    <Bell size={24} className="text-label-tertiary" />
                    <p className="mt-2 text-footnote text-label-tertiary">暂无通知</p>
                  </div>
                ) : (
                  notifications.map((notification: any) => (
                    <div
                      key={notification.id}
                      className={cn(
                        'flex items-start gap-3 px-4 py-3 transition-colors hover:bg-fill-quaternary',
                        !notification.read && 'bg-system-blue/5'
                      )}
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-subheadline text-label-primary truncate">
                            {notification.title}
                          </p>
                          {!notification.read && (
                            <div className="h-1.5 w-1.5 flex-shrink-0 rounded-full bg-system-blue" />
                          )}
                        </div>
                        {notification.message && (
                          <p className="mt-0.5 text-caption-1 text-label-tertiary line-clamp-2">
                            {notification.message}
                          </p>
                        )}
                        <p className="mt-1 text-caption-2 text-label-quaternary">
                          {formatRelativeTime(notification.createdAt)}
                        </p>
                      </div>

                      <div className="flex items-center gap-1">
                        {!notification.read && (
                          <button
                            onClick={() => markReadMutation.mutate(notification.id)}
                            className="rounded p-1 text-label-tertiary hover:bg-fill-tertiary hover:text-label-secondary"
                            title="标记已读"
                          >
                            <Check size={14} />
                          </button>
                        )}
                        <button
                          onClick={() => deleteMutation.mutate(notification.id)}
                          className="rounded p-1 text-label-tertiary hover:bg-fill-tertiary hover:text-system-red"
                          title="删除"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}
