import { useState, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
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
  Eye,
  EyeOff,
  Lock,
  Check,
  X,
  Upload,
  Trash2,
  LogOut,
} from 'lucide-react'
import { API_ENDPOINTS } from '@team-share/shared'
import { cn } from '@/utils/cn'

export function SettingsPage() {
  const { theme, setTheme } = useTheme()
  const { user, fetchProfile, logout } = useAuthStore()
  const navigate = useNavigate()
  const { success, error } = useToast()
  const queryClient = useQueryClient()
  const [activeSection, setActiveSection] = useState('profile')

  // Profile state
  const [displayName, setDisplayName] = useState(user?.displayName || '')
  const [avatarPreview, setAvatarPreview] = useState<string | null>(user?.avatar || null)
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Generate initials avatar
  const getInitials = (): string => {
    const name = displayName || user?.displayName || user?.username || '?'
    // Take first character of first two "words" (Chinese: first two characters)
    if (/[一-鿿]/.test(name)) {
      return name.slice(0, Math.min(name.length, 2))
    }
    return name.split(/\s+/).map(w => w[0]).join('').toUpperCase().slice(0, 2)
  }

  // Generate a deterministic background color from name
  const getAvatarColor = (): string => {
    const name = displayName || user?.displayName || user?.username || '?'
    const colors = [
      'bg-system-blue',
      'bg-system-green',
      'bg-system-indigo',
      'bg-system-orange',
      'bg-system-pink',
      'bg-system-purple',
      'bg-system-red',
      'bg-system-teal',
    ]
    let hash = 0
    for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash)
    return colors[Math.abs(hash) % colors.length]
  }

  const handleAvatarSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      error('无效文件', '请选择图片文件')
      return
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      error('文件过大', '图片大小不能超过 5MB')
      return
    }

    setAvatarFile(file)

    // Generate preview
    const reader = new FileReader()
    reader.onload = (e) => setAvatarPreview(e.target?.result as string)
    reader.readAsDataURL(file)

    // Reset file input so same file can be re-selected
    e.target.value = ''
  }, [error])

  const handleRemoveAvatar = useCallback(() => {
    setAvatarFile(null)
    setAvatarPreview(null)
  }, [])

  // Password state
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  // Password strength checker
  const getPasswordStrength = (pw: string) => {
    let score = 0
    if (pw.length >= 8) score++
    if (/[a-z]/.test(pw) && /[A-Z]/.test(pw)) score++
    if (/\d/.test(pw)) score++
    if (/[^a-zA-Z\d]/.test(pw)) score++
    return score
  }
  const strength = getPasswordStrength(newPassword)
  const strengthLabel = ['弱', '较弱', '中', '强', '很强']
  const strengthColor = ['text-system-red', 'text-system-orange', 'text-system-yellow', 'text-system-green', 'text-system-green']
  const strengthBg = ['bg-system-red', 'bg-system-orange', 'bg-system-yellow', 'bg-system-green', 'bg-system-green']

  // Notification preferences state
  const [notifications, setNotifications] = useState({
    resourceUpdate: true,
    workflowExecution: true,
    teamInvite: true,
  })

  // Notification channels state
  const [notificationChannels, setNotificationChannels] = useState({
    wechat: '',
    dingtalk: '',
    slack: '',
    email: '',
  })
  const [saveNotificationsLoading, setSaveNotificationsLoading] = useState(false)

  const handleSaveNotifications = async () => {
    setSaveNotificationsLoading(true)
    try {
      // Save notification preferences + channels
      await api.put(API_ENDPOINTS.USERS.ME, {
        notificationPreferences: notifications,
        notificationChannels,
      })
      success('通知设置已保存')
    } catch {
      error('保存失败', '请稍后重试')
    } finally {
      setSaveNotificationsLoading(false)
    }
  }

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

  const handleSaveProfile = async () => {
    let avatarUrl = avatarPreview || undefined

    // If a new file was selected, upload it first
    if (avatarFile) {
      try {
        // Convert to base64 for upload via user profile API
        // For production, this should use a dedicated avatar upload endpoint
        const base64 = await new Promise<string>((resolve) => {
          const reader = new FileReader()
          reader.onload = () => resolve(reader.result as string)
          reader.readAsDataURL(avatarFile)
        })
        avatarUrl = base64
      } catch {
        error('上传失败', '头像上传出错，请重试')
        return
      }
    }

    // If avatar was removed, send null to clear it
    if (avatarPreview === null && user?.avatar) {
      avatarUrl = '' as any
    }

    updateProfileMutation.mutate({ displayName, avatar: avatarUrl as string })
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
              <div className="mt-6 space-y-5">
                {/* Avatar Section */}
                <div className="flex items-start gap-5">
                  {/* Avatar Preview */}
                  <div className="relative group flex-shrink-0">
                    {avatarPreview ? (
                      <img
                        src={avatarPreview}
                        alt="头像预览"
                        className="h-20 w-20 rounded-full object-cover shadow-apple-1 ring-2 ring-separator"
                      />
                    ) : (
                      <div className={cn(
                        'h-20 w-20 rounded-full flex items-center justify-center text-title-1 font-semibold text-white shadow-apple-1',
                        getAvatarColor()
                      )}>
                        {getInitials()}
                      </div>
                    )}

                    {/* Hover overlay with actions */}
                    <div className="absolute inset-0 rounded-full bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1">
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="p-1.5 rounded-full text-white/90 hover:text-white hover:bg-white/20 transition-colors"
                        title={avatarPreview ? '更换头像' : '上传头像'}
                      >
                        <Upload size={16} />
                      </button>
                      {avatarPreview && (
                        <button
                          type="button"
                          onClick={handleRemoveAvatar}
                          className="p-1.5 rounded-full text-white/90 hover:text-white hover:bg-white/20 transition-colors"
                          title="移除头像"
                        >
                          <Trash2 size={16} />
                        </button>
                      )}
                    </div>

                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/png,image/jpeg,image/webp,image/gif"
                      onChange={handleAvatarSelect}
                      className="hidden"
                    />
                  </div>

                  {/* Avatar Instructions */}
                  <div className="flex-1 min-w-0 pt-1">
                    <p className="text-subheadline font-medium text-label-primary">
                      {avatarPreview ? '更换头像' : '设置头像'}
                    </p>
                    <p className="mt-1 text-caption-1 text-label-tertiary">
                      支持 PNG、JPEG、WebP、GIF 格式，最大 5MB
                    </p>
                    <div className="mt-3 flex gap-2">
                      <Button
                        type="button"
                        variant="secondary"
                        size="sm"
                        onClick={() => fileInputRef.current?.click()}
                      >
                        <Upload size={14} className="mr-1" />
                        {avatarPreview ? '更换图片' : '选择图片'}
                      </Button>
                      {avatarPreview && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={handleRemoveAvatar}
                        >
                          <Trash2 size={14} className="mr-1" />
                          移除
                        </Button>
                      )}
                    </div>
                  </div>
                </div>

                <div className="border-t border-separator" />

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
                  placeholder="输入显示名称，修改后上方头像会自动更新"
                  helperText="中文名取前两个字，英文名取首字母"
                />
                <div className="flex gap-3 pt-2">
                  <Button
                    onClick={handleSaveProfile}
                    disabled={updateProfileMutation.isPending}
                    loading={updateProfileMutation.isPending}
                  >
                    {updateProfileMutation.isPending ? '保存中...' : '保存修改'}
                  </Button>
                </div>
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

              {/* 通知渠道配置 */}
              <h3 className="text-headline text-label-primary mt-8">通知渠道</h3>
              <p className="text-caption-1 text-label-tertiary mt-1">
                配置第三方通知渠道，未填写则不启用该渠道
              </p>
              <div className="mt-4 space-y-4">
                {/* 企业微信 */}
                <div className="rounded-lg border border-separator p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-xl">💬</span>
                    <div>
                      <p className="text-subheadline text-label-primary">企业微信</p>
                      <p className="text-caption-2 text-label-tertiary">群机器人 Webhook</p>
                    </div>
                  </div>
                  <Input
                    placeholder="https://qyapi.weixin.qq.com/cgi-bin/webhook/send?key=..."
                    value={notificationChannels.wechat}
                    onChange={(e) => setNotificationChannels(prev => ({ ...prev, wechat: e.target.value }))}
                  />
                </div>

                {/* 钉钉 */}
                <div className="rounded-lg border border-separator p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-xl">📢</span>
                    <div>
                      <p className="text-subheadline text-label-primary">钉钉</p>
                      <p className="text-caption-2 text-label-tertiary">自定义机器人 Webhook</p>
                    </div>
                  </div>
                  <Input
                    placeholder="https://oapi.dingtalk.com/robot/send?access_token=..."
                    value={notificationChannels.dingtalk}
                    onChange={(e) => setNotificationChannels(prev => ({ ...prev, dingtalk: e.target.value }))}
                  />
                </div>

                {/* Slack */}
                <div className="rounded-lg border border-separator p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-xl">💜</span>
                    <div>
                      <p className="text-subheadline text-label-primary">Slack</p>
                      <p className="text-caption-2 text-label-tertiary">Incoming Webhook URL</p>
                    </div>
                  </div>
                  <Input
                    placeholder="https://hooks.slack.com/services/..."
                    value={notificationChannels.slack}
                    onChange={(e) => setNotificationChannels(prev => ({ ...prev, slack: e.target.value }))}
                  />
                </div>

                {/* Email */}
                <div className="rounded-lg border border-separator p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-xl">📧</span>
                    <div>
                      <p className="text-subheadline text-label-primary">邮件通知</p>
                      <p className="text-caption-2 text-label-tertiary">接收通知的邮箱地址</p>
                    </div>
                  </div>
                  <Input
                    type="email"
                    placeholder="admin@example.com"
                    value={notificationChannels.email}
                    onChange={(e) => setNotificationChannels(prev => ({ ...prev, email: e.target.value }))}
                  />
                </div>

                <Button onClick={handleSaveNotifications} loading={saveNotificationsLoading}>
                  保存通知设置
                </Button>
              </div>
            </Card>
          )}

          {activeSection === 'security' && (
            <>
              {/* 修改密码 */}
              <Card>
                <div className="flex items-start gap-4">
                  <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-system-blue/10">
                    <Lock size={20} className="text-system-blue" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-headline text-label-primary">修改密码</h3>
                    <p className="mt-1 text-caption-1 text-label-tertiary">
                      请使用至少 8 位字符，包含大小写字母、数字和特殊字符中的至少三种
                    </p>
                  </div>
                </div>

                <div className="mt-6 space-y-4">
                  {/* 当前密码 */}
                  <div className="relative">
                    <Input
                      label="当前密码"
                      type={showCurrentPassword ? 'text' : 'password'}
                      placeholder="输入当前密码"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      suffix={
                        <button
                          type="button"
                          onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                          className="text-label-tertiary hover:text-label-secondary transition-colors"
                          tabIndex={-1}
                        >
                          {showCurrentPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                      }
                    />
                  </div>

                  {/* 分割线 */}
                  <div className="border-b border-separator pt-2" />

                  {/* 新密码 */}
                  <div>
                    <Input
                      label="新密码"
                      type={showNewPassword ? 'text' : 'password'}
                      placeholder="输入新密码"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      suffix={
                        <button
                          type="button"
                          onClick={() => setShowNewPassword(!showNewPassword)}
                          className="text-label-tertiary hover:text-label-secondary transition-colors"
                          tabIndex={-1}
                        >
                          {showNewPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                      }
                    />

                    {/* 密码强度指示器 */}
                    {newPassword && (
                      <div className="mt-3">
                        <div className="flex gap-1.5">
                          {[1, 2, 3, 4].map((level) => (
                            <div
                              key={level}
                              className={cn(
                                'h-1 flex-1 rounded-full transition-all duration-300',
                                level <= strength
                                  ? strengthBg[strength]
                                  : 'bg-fill-tertiary'
                              )}
                            />
                          ))}
                        </div>
                        <div className="mt-2 flex items-center justify-between">
                          <p className={cn('text-caption-2 font-medium', strengthColor[strength])}>
                            密码强度：{strengthLabel[strength]}
                          </p>
                          {strength === 4 && (
                            <Check size={14} className="text-system-green" />
                          )}
                        </div>
                      </div>
                    )}

                    {/* 密码要求 */}
                    {newPassword && (
                      <div className="mt-4 rounded-lg bg-fill-quaternary p-3">
                        <p className="text-caption-2 font-medium text-label-secondary mb-2">密码要求：</p>
                        <ul className="space-y-1.5">
                          {[
                            { met: newPassword.length >= 8, text: '至少 8 个字符' },
                            { met: /[a-z]/.test(newPassword) && /[A-Z]/.test(newPassword), text: '包含大小写字母' },
                            { met: /\d/.test(newPassword), text: '至少一个数字' },
                            { met: /[^a-zA-Z\d]/.test(newPassword), text: '至少一个特殊字符' },
                          ].map((req, i) => (
                            <li key={i} className="flex items-center gap-2 text-caption-2">
                              {req.met ? (
                                <Check size={12} className="text-system-green flex-shrink-0" />
                              ) : (
                                <div className="w-3 h-3 rounded-full border border-label-tertiary flex-shrink-0" />
                              )}
                              <span className={req.met ? 'text-system-green' : 'text-label-tertiary'}>
                                {req.text}
                              </span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>

                  {/* 确认新密码 */}
                  <div className="relative">
                    <Input
                      label="确认新密码"
                      type={showConfirmPassword ? 'text' : 'password'}
                      placeholder="再次输入新密码"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      error={confirmPassword && newPassword !== confirmPassword ? '两次输入的密码不一致' : undefined}
                      suffix={
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="text-label-tertiary hover:text-label-secondary transition-colors"
                          tabIndex={-1}
                        >
                          {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                      }
                    />
                    {confirmPassword && newPassword === confirmPassword && (
                      <p className="mt-1 flex items-center gap-1 text-caption-2 text-system-green">
                        <Check size={12} />
                        密码匹配
                      </p>
                    )}
                  </div>

                  {/* 操作按钮 */}
                  <div className="flex items-center gap-3 pt-4 border-t border-separator">
                    <Button
                      onClick={handleChangePassword}
                      disabled={changePasswordMutation.isPending || !currentPassword || !newPassword || newPassword !== confirmPassword}
                      loading={changePasswordMutation.isPending}
                    >
                      {changePasswordMutation.isPending ? '修改中...' : '更新密码'}
                    </Button>
                    <Button
                      variant="secondary"
                      onClick={() => {
                        setCurrentPassword('')
                        setNewPassword('')
                        setConfirmPassword('')
                      }}
                      disabled={!currentPassword && !newPassword && !confirmPassword}
                    >
                      取消
                    </Button>
                  </div>
                </div>
              </Card>

              {/* 安全提示 */}
              <Card className="mt-4">
                <div className="flex items-start gap-3">
                  <Shield size={18} className="text-system-blue mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-subheadline font-medium text-label-primary">安全建议</p>
                    <ul className="mt-2 space-y-1.5 text-caption-2 text-label-secondary">
                      <li>• 不要使用与其他网站相同的密码</li>
                      <li>• 密码应至少包含 8 个字符</li>
                      <li>• 使用大小写字母、数字和符号的组合</li>
                      <li>• 定期更换密码以保证账户安全</li>
                    </ul>
                  </div>
                </div>
              </Card>

              {/* 退出登录 — Apple style: red text, minimal */}
              <div className="mt-8 pt-6 border-t border-separator">
                <button
                  onClick={() => {
                    logout()
                    navigate('/login')
                  }}
                  className="flex items-center gap-2 text-subheadline text-system-red transition-colors hover:opacity-70"
                >
                  <LogOut size={16} />
                  退出登录
                </button>
                <p className="mt-1 text-caption-2 text-label-tertiary">
                  退出后需要重新输入账号密码
                </p>
              </div>
            </>
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
