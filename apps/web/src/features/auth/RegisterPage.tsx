import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Package, Eye, EyeOff } from 'lucide-react'
import { Button, Input } from '@/components/ui'
import { useAuthStore } from '@/stores/authStore'

export function RegisterPage() {
  const navigate = useNavigate()
  const { register, isLoading, error, clearError } = useAuthStore()
  const [form, setForm] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    displayName: '',
  })
  const [showPassword, setShowPassword] = useState(false)
  const [validationError, setValidationError] = useState('')

  const updateForm = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }))
    clearError()
    setValidationError('')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setValidationError('')

    if (form.password !== form.confirmPassword) {
      setValidationError('两次输入的密码不一致')
      return
    }

    if (form.password.length < 6) {
      setValidationError('密码长度至少为 6 位')
      return
    }

    try {
      await register({
        username: form.username,
        email: form.email,
        password: form.password,
        displayName: form.displayName || form.username,
      })
      navigate('/')
    } catch {
      // Error is handled by store
    }
  }

  const displayError = error || validationError

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

      {/* Right Panel - Register Form */}
      <div className="flex flex-1 items-center justify-center p-8">
        <div className="w-full max-w-sm">
          {/* Mobile Logo */}
          <div className="mb-8 flex items-center gap-3 lg:hidden">
            <Package size={32} className="text-system-blue" />
            <span className="text-title-1 font-bold">Team Share</span>
          </div>

          <h2 className="text-title-2 text-label-primary">注册</h2>
          <p className="mt-2 text-callout text-label-secondary">
            创建账号，开始管理团队资源
          </p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-4">
            {displayError && (
              <div className="rounded-lg bg-system-red/10 p-3 text-footnote text-system-red">
                {displayError}
              </div>
            )}

            <Input
              label="用户名"
              placeholder="请输入用户名"
              value={form.username}
              onChange={(e) => updateForm('username', e.target.value)}
              helperText="3-50 个字符，仅支持字母、数字、下划线"
              required
            />

            <Input
              label="邮箱"
              type="email"
              placeholder="请输入邮箱"
              value={form.email}
              onChange={(e) => updateForm('email', e.target.value)}
              required
            />

            <Input
              label="显示名称"
              placeholder="请输入显示名称（可选）"
              value={form.displayName}
              onChange={(e) => updateForm('displayName', e.target.value)}
            />

            <Input
              label="密码"
              type={showPassword ? 'text' : 'password'}
              placeholder="请输入密码"
              value={form.password}
              onChange={(e) => updateForm('password', e.target.value)}
              helperText="至少 6 个字符"
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

            <Input
              label="确认密码"
              type={showPassword ? 'text' : 'password'}
              placeholder="请再次输入密码"
              value={form.confirmPassword}
              onChange={(e) => updateForm('confirmPassword', e.target.value)}
              required
            />

            <Button
              type="submit"
              className="w-full"
              loading={isLoading}
              disabled={!form.username || !form.email || !form.password}
            >
              注册
            </Button>
          </form>

          <p className="mt-6 text-center text-footnote text-label-secondary">
            已有账号？{' '}
            <Link to="/login" className="text-system-blue hover:underline">
              登录
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
