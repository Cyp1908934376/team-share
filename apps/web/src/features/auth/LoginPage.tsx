import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Package, Eye, EyeOff } from 'lucide-react'
import { Button, Input, Modal } from '@/components/ui'
import { useAuthStore } from '@/stores/authStore'
import { api } from '@/services/api'

export function LoginPage() {
  const navigate = useNavigate()
  const { login, isLoading, error, clearError } = useAuthStore()
  const [usernameOrEmail, setUsernameOrEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  // Forgot password state
  const [showForgotModal, setShowForgotModal] = useState(false)
  const [forgotEmail, setForgotEmail] = useState('')
  const [forgotLoading, setForgotLoading] = useState(false)
  const [forgotMessage, setForgotMessage] = useState('')
  const [forgotError, setForgotError] = useState('')

  // Reset password state
  const [showResetModal, setShowResetModal] = useState(false)
  const [resetToken, setResetToken] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [resetLoading, setResetLoading] = useState(false)
  const [resetMessage, setResetMessage] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await login(usernameOrEmail, password)
      navigate('/')
    } catch {
      // Error is handled by store
    }
  }

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setForgotLoading(true)
    setForgotError('')
    setForgotMessage('')
    try {
      const result = await api.post('/auth/forgot-password', { email: forgotEmail })
      setForgotMessage(result.message || '重置链接已发送至注册邮箱')
      if (result.devToken) {
        setResetToken(result.devToken)
        setForgotMessage('(开发模式) 重置令牌: ' + result.devToken.substring(0, 20) + '...')
      }
    } catch (err: any) {
      setForgotError(err.message || '发送失败，请重试')
    } finally {
      setForgotLoading(false)
    }
  }

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setResetLoading(true)
    setResetMessage('')
    try {
      const result = await api.post('/auth/reset-password', {
        token: resetToken,
        newPassword,
      })
      setResetMessage(result.message || '密码重置成功')
      setTimeout(() => {
        setShowResetModal(false)
        setShowForgotModal(false)
        setForgotEmail('')
        setNewPassword('')
        setResetToken('')
        setResetMessage('')
      }, 2000)
    } catch (err: any) {
      setResetMessage(err.message || '重置失败，请检查令牌是否正确')
    } finally {
      setResetLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen bg-bg-secondary">
      {/* Left Panel - Branding */}
      <div className="hidden w-1/2 items-center justify-center bg-system-blue lg:flex">
        <div className="max-w-md text-center text-white">
          <Package size={64} className="mx-auto mb-6" />
          <h1 className="text-large-title">Team Share</h1>
          <p className="mt-4 text-title-3 opacity-90">
            团队资源共享平台
          </p>
          <p className="mt-2 text-body opacity-70">
            统一管理提示词、组件、工作流等团队资产
          </p>
        </div>
      </div>

      {/* Right Panel - Login Form */}
      <div className="flex flex-1 items-center justify-center p-8">
        <div className="w-full max-w-sm">
          {/* Mobile Logo */}
          <div className="mb-8 flex items-center gap-3 lg:hidden">
            <Package size={32} className="text-system-blue" />
            <span className="text-title-1 font-bold">Team Share</span>
          </div>

          <h2 className="text-title-2 text-label-primary">登录</h2>
          <p className="mt-2 text-callout text-label-secondary">
            欢迎回来，请输入您的账号信息
          </p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-4">
            {error && (
              <div className="rounded-lg bg-system-red/10 p-3 text-footnote text-system-red">
                {error}
              </div>
            )}

            <Input
              label="用户名或邮箱"
              placeholder="请输入用户名或邮箱"
              value={usernameOrEmail}
              onChange={(e) => {
                setUsernameOrEmail(e.target.value)
                clearError()
              }}
              required
            />

            <Input
              label="密码"
              type={showPassword ? 'text' : 'password'}
              placeholder="请输入密码"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value)
                clearError()
              }}
              suffix={
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-label-tertiary hover:text-label-secondary"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              }
              required
            />

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  className="h-4 w-4 rounded border-separator"
                />
                <span className="text-footnote text-label-secondary">记住我</span>
              </label>
              <button
                type="button"
                onClick={() => setShowForgotModal(true)}
                className="text-footnote text-system-blue hover:underline"
              >
                忘记密码？
              </button>
            </div>

            <Button
              type="submit"
              className="w-full"
              loading={isLoading}
              disabled={!usernameOrEmail || !password}
            >
              登录
            </Button>
          </form>

          <p className="mt-6 text-center text-footnote text-label-secondary">
            还没有账号？{' '}
            <Link to="/register" className="text-system-blue hover:underline">
              注册
            </Link>
          </p>

          {/* Demo Accounts */}
          <div className="mt-8 rounded-lg bg-fill-quaternary p-4">
            <p className="text-caption-1 font-medium text-label-secondary">演示账号</p>
            <div className="mt-2 space-y-1 text-caption-1 text-label-tertiary">
              <p>管理员: admin@teamshare.com / admin123</p>
              <p>用户: demo@teamshare.com / demo123</p>
            </div>
          </div>
        </div>
      </div>

      {/* Forgot Password Modal */}
      <Modal
        open={showForgotModal}
        onClose={() => { setShowForgotModal(false); setForgotMessage(''); setForgotError('') }}
        title="找回密码"
      >
        <form onSubmit={handleForgotPassword} className="space-y-4">
          <p className="text-callout text-label-secondary">
            输入您的注册邮箱，我们将发送密码重置链接。
          </p>
          {forgotError && (
            <div className="rounded-lg bg-system-red/10 p-3 text-footnote text-system-red">
              {forgotError}
            </div>
          )}
          {forgotMessage && (
            <div className="rounded-lg bg-system-green/10 p-3 text-footnote text-system-green">
              {forgotMessage}
            </div>
          )}
          <Input
            label="注册邮箱"
            type="email"
            placeholder="请输入注册邮箱"
            value={forgotEmail}
            onChange={(e) => setForgotEmail(e.target.value)}
            required
          />
          <div className="flex gap-3 pt-2">
            <Button type="submit" loading={forgotLoading} disabled={!forgotEmail}>
              发送重置链接
            </Button>
            {resetToken && (
              <Button
                type="button"
                variant="secondary"
                onClick={() => setShowResetModal(true)}
              >
                已有令牌？直接重置
              </Button>
            )}
          </div>
        </form>
      </Modal>

      {/* Reset Password Modal */}
      <Modal
        open={showResetModal}
        onClose={() => setShowResetModal(false)}
        title="重置密码"
      >
        <form onSubmit={handleResetPassword} className="space-y-4">
          {resetMessage && (
            <div className={cn(
              'rounded-lg p-3 text-footnote',
              resetMessage.includes('成功')
                ? 'bg-system-green/10 text-system-green'
                : 'bg-system-red/10 text-system-red',
            )}>
              {resetMessage}
            </div>
          )}
          <Input
            label="重置令牌"
            placeholder="输入邮件中的重置令牌"
            value={resetToken}
            onChange={(e) => setResetToken(e.target.value)}
            required
          />
          <Input
            label="新密码"
            type="password"
            placeholder="请输入新密码（至少6位）"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
          />
          <Button
            type="submit"
            className="w-full"
            loading={resetLoading}
            disabled={!resetToken || newPassword.length < 6}
          >
            重置密码
          </Button>
        </form>
      </Modal>
    </div>
  )
}

function cn(...classes: (string | boolean | undefined)[]): string {
  return classes.filter(Boolean).join(' ')
}
