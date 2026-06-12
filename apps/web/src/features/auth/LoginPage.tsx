import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Package, Eye, EyeOff } from 'lucide-react'
import { Button, Input } from '@/components/ui'
import { useAuthStore } from '@/stores/authStore'

export function LoginPage() {
  const navigate = useNavigate()
  const { login, isLoading, error, clearError } = useAuthStore()
  const [usernameOrEmail, setUsernameOrEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await login(usernameOrEmail, password)
      navigate('/')
    } catch {
      // Error is handled by store
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
              <a href="#" className="text-footnote text-system-blue hover:underline">
                忘记密码？
              </a>
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
    </div>
  )
}
