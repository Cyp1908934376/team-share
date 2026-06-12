import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useTheme } from '@/app/providers/ThemeProvider'
import { useAuthStore } from '@/stores/authStore'
import { Card, Button, Input } from '@/components/ui'
import { useToast } from '@/components/ui/Toast'
import { api } from '@/services/api'
import {
  User,
  Palette,
  Bell,
  Shield,
  Database,
  Moon,
  Sun,
  Monitor,
} from 'lucide-react'
import { API_ENDPOINTS } from '@team-share/shared'
import { cn } from '@/utils/cn'

export function SettingsPage() {
  const { theme, setTheme } = useTheme()
  const { user, fetchProfile } = useAuthStore()
  const { success, error } = useToast()
  const queryClient = useQueryClient()
  const [activeSection, setActiveSection] = useState('profile')

  // Profile state
  const [displayName, setDisplayName] = useState(user?.displayName || '')
  const [avatarUrl, setAvatarUrl] = useState(user?.avatar || '')

  // Password state
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  // Notification preferences state
  const [notifications, setNotifications] = useState({
    resourceUpdate: true,
    workflowExecution: true,
    teamInvite: true,
  })

  const updateProfileMutation = useMutation({
    mutationFn: (data: { displayName: string; avatar?: string }) =>
      api.put(API_ENDPOINTS.USERS.ME, data),
    onSuccess: () => {
      success('个人资料已更新')
      fetchProfile()
      queryClient.invalidateQueries({ queryKey: ['profile'] })
    },
    onError: () => error('更新失败', '请稍后重试'),
  })

  const changePasswordMutation = useMutation({
    mutationFn: (data: { currentPassword: string; newPassword: string }) =>
      api.post(API_ENDPOINTS.AUTH.CHANGE_PASSWORD, data),
    onSuccess: () => {
      success('密码已修改')
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
    },
    onError: (err: any) => error('修改失败', err?.response?.data?.message || '请检查当前密码'),
  })

  const handleSaveProfile = () => {
    updateProfileMutation.mutate({ displayName, avatar: avatarUrl })
  }

  const handleChangePassword = () => {
    if (newPassword !== confirmPassword) {
      error('密码不一致', '两次输入的新密码不一致')
      return
    }
    if (newPassword.length < 6) {
      error('密码太短', '新密码至少需要 6 个字符')
      return
    }
    changePasswordMutation.mutate({ currentPassword, newPassword })
  }

  const sections = [
    { id: 'profile', label: '个人资料', icon: User },
    { id: 'appearance', label: '外观', icon: Palette },
    { id: 'notifications', label: '通知', icon: Bell },
    { id: 'security', label: '安全', icon: Shield },
    { id: 'system', label: '系统', icon: Database },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-title-1 text-label-primary">设置</h1>
        <p className="mt-1 text-callout text-label-secondary">
          管理你的账户和应用设置
        </p>
      </div>

      <div className="flex gap-6">
        {/* Sidebar */}
        <div className="w-48 space-y-1">
          {sections.map((section) => (
            <button
              key={section.id}
              onClick={() => setActiveSection(section.id)}
              className={cn(
                'flex w-full items-center gap-3 rounded-lg px-3 py-2 text-subheadline transition-colors',
                activeSection === section.id
                  ? 'bg-system-blue/10 text-system-blue'
                  : 'text-label-secondary hover:bg-fill-quaternary hover:text-label-primary'
              )}
            >
              <section.icon size={18} />
              {section.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1">
          {activeSection === 'profile' && (
            <Card>
              <h3 className="text-headline text-label-primary">个人资料</h3>
              <div className="mt-6 space-y-4">
                <div className="flex items-center gap-4">
                  <div className="h-20 w-20 rounded-full bg-fill-tertiary flex items-center justify-center text-title-1 text-label-tertiary">
                    {user?.displayName?.[0] || user?.username?.[0]?.toUpperCase() || '?'}
                  </div>
                  <div>
                    <Input
                      label="头像 URL"
                      value={avatarUrl}
                      onChange={(e) => setAvatarUrl(e.target.value)}
                      placeholder="输入头像链接"
                    />
                  </div>
                </div>
                <Input
                  label="用户名"
                  value={user?.username || ''}
                  disabled
                />
                <Input
                  label="邮箱"
                  value={user?.email || ''}
                  disabled
                />
                <Input
                  label="显示名称"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="请输入显示名称"
                />
                <Button
                  onClick={handleSaveProfile}
                  disabled={updateProfileMutation.isPending}
                >
                  {updateProfileMutation.isPending ? '保存中...' : '保存修改'}
                </Button>
              </div>
            </Card>
          )}

          {activeSection === 'appearance' && (
            <Card>
              <h3 className="text-headline text-label-primary">外观设置</h3>
              <div className="mt-6 space-y-4">
                <div>
                  <label className="text-caption-1 text-label-secondary">主题</label>
                  <div className="mt-3 flex gap-3">
                    {[
                      { value: 'light', label: '浅色', icon: Sun },
                      { value: 'dark', label: '深色', icon: Moon },
                      { value: 'system', label: '跟随系统', icon: Monitor },
                    ].map((option) => (
                      <button
                        key={option.value}
                        onClick={() => setTheme(option.value as any)}
                        className={cn(
                          'flex flex-1 flex-col items-center gap-2 rounded-lg border-2 p-4 transition-colors',
                          theme === option.value
                            ? 'border-system-blue bg-system-blue/5'
                            : 'border-separator hover:border-label-tertiary'
                        )}
                      >
                        <option.icon size={24} />
                        <span className="text-subheadline">{option.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </Card>
          )}

          {activeSection === 'notifications' && (
            <Card>
              <h3 className="text-headline text-label-primary">通知设置</h3>
              <div className="mt-6 space-y-4">
                {[
                  { key: 'resourceUpdate', label: '资源更新通知', description: '当关注的资源有更新时通知' },
                  { key: 'workflowExecution', label: '工作流执行通知', description: '工作流执行完成或失败时通知' },
                  { key: 'teamInvite', label: '团队邀请通知', description: '收到团队邀请时通知' },
                ].map((item) => (
                  <div
                    key={item.key}
                    className="flex items-center justify-between rounded-lg border border-separator p-4"
                  >
                    <div>
                      <p className="text-subheadline text-label-primary">{item.label}</p>
                      <p className="text-caption-1 text-label-tertiary">{item.description}</p>
                    </div>
                    <label className="relative inline-flex cursor-pointer items-center">
                      <input
                        type="checkbox"
                        className="peer sr-only"
                        checked={notifications[item.key as keyof typeof notifications]}
                        onChange={(e) =>
                          setNotifications((prev) => ({
                            ...prev,
                            [item.key]: e.target.checked,
                          }))
                        }
                      />
                      <div className="peer h-6 w-11 rounded-full bg-fill-tertiary after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:bg-white after:transition-all peer-checked:bg-system-blue peer-checked:after:translate-x-full" />
                    </label>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {activeSection === 'security' && (
            <Card>
              <h3 className="text-headline text-label-primary">安全设置</h3>
              <div className="mt-6 space-y-4">
                <div>
                  <h4 className="text-subheadline text-label-primary">修改密码</h4>
                  <div className="mt-3 space-y-3">
                    <Input
                      label="当前密码"
                      type="password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                    />
                    <Input
                      label="新密码"
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                    />
                    <Input
                      label="确认新密码"
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      error={confirmPassword && newPassword !== confirmPassword ? '密码不一致' : undefined}
                    />
                    <Button
                      onClick={handleChangePassword}
                      disabled={changePasswordMutation.isPending || !currentPassword || !newPassword || newPassword !== confirmPassword}
                    >
                      {changePasswordMutation.isPending ? '修改中...' : '修改密码'}
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          )}

          {activeSection === 'system' && (
            <Card>
              <h3 className="text-headline text-label-primary">系统信息</h3>
              <div className="mt-6 space-y-3">
                {[
                  { label: '版本', value: '1.0.0' },
                  { label: '数据库', value: 'PostgreSQL 16' },
                  { label: '缓存', value: 'Redis 7' },
                  { label: '存储', value: 'MinIO' },
                  { label: '运行时', value: 'Node.js 20 + NestJS' },
                  { label: '前端', value: 'React 18 + Vite 5' },
                ].map((item, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between rounded-lg border border-separator p-3"
                  >
                    <span className="text-footnote text-label-secondary">{item.label}</span>
                    <span className="font-mono text-footnote text-label-primary">
                      {item.value}
                    </span>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
