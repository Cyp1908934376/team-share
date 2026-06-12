import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, Server, Settings, Search } from 'lucide-react'
import { api } from '@/services/api'
import { Card, Badge, Button, Input, Modal } from '@/components/ui'
import { useToast } from '@/components/ui/Toast'
import { EmptyState } from '@/components/common/EmptyState'
import { ErrorState } from '@/components/common/ErrorState'
import { GridSkeleton } from '@/components/common/LoadingSkeleton'
import { API_ENDPOINTS } from '@team-share/shared'
import { cn } from '@/utils/cn'

export function EnvironmentList() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { success, error: showError } = useToast()
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [search, setSearch] = useState('')
  const [newEnv, setNewEnv] = useState({
    name: '',
    displayName: '',
    description: '',
  })

  const { data: environments = [], isLoading, error, refetch } = useQuery({
    queryKey: ['environments'],
    queryFn: () => api.get<any[]>(API_ENDPOINTS.ENVIRONMENTS.BASE),
  })

  const createMutation = useMutation({
    mutationFn: (data: typeof newEnv) => api.post(API_ENDPOINTS.ENVIRONMENTS.BASE, data),
    onSuccess: () => {
      success('环境创建成功')
      queryClient.invalidateQueries({ queryKey: ['environments'] })
      setShowCreateModal(false)
      setNewEnv({ name: '', displayName: '', description: '' })
    },
    onError: () => showError('创建失败', '请稍后重试'),
  })

  const filteredEnvs = environments.filter((env: any) => {
    if (!search) return true
    const q = search.toLowerCase()
    return (
      env.name?.toLowerCase().includes(q) ||
      env.displayName?.toLowerCase().includes(q) ||
      env.description?.toLowerCase().includes(q)
    )
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-title-1 text-label-primary">环境管理</h1>
          <p className="mt-1 text-callout text-label-secondary">
            管理开发、测试、生产环境配置
          </p>
        </div>
        <Button icon={<Plus size={16} />} onClick={() => setShowCreateModal(true)}>
          创建环境
        </Button>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-label-tertiary" />
        <input
          type="text"
          placeholder="搜索环境..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-lg border border-separator bg-bg-primary py-2 pl-9 pr-3 text-subheadline text-label-primary placeholder:text-label-tertiary focus:border-system-blue focus:outline-none focus:ring-2 focus:ring-system-blue/20"
        />
      </div>

      {/* Environment Grid */}
      {isLoading ? (
        <GridSkeleton count={6} />
      ) : error ? (
        <ErrorState onRetry={() => refetch()} />
      ) : filteredEnvs.length === 0 ? (
        <EmptyState
          icon={<Server size={32} className="text-label-tertiary" />}
          title={search ? '未找到匹配的环境' : '暂无环境'}
          description={search ? '请尝试其他搜索关键词' : '点击"创建环境"添加第一个环境配置'}
          action={
            !search && (
              <Button icon={<Plus size={16} />} onClick={() => setShowCreateModal(true)}>
                创建环境
              </Button>
            )
          }
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredEnvs.map((env: any) => (
            <Card
              key={env.id}
              hoverable
              onClick={() => navigate(`/environments/${env.id}`)}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className={cn(
                      'rounded-lg p-2',
                      env.status === 'active'
                        ? 'bg-system-green/10'
                        : env.status === 'error'
                        ? 'bg-system-red/10'
                        : 'bg-fill-quaternary'
                    )}
                  >
                    <Server
                      size={20}
                      className={cn(
                        env.status === 'active'
                          ? 'text-system-green'
                          : env.status === 'error'
                          ? 'text-system-red'
                          : 'text-label-tertiary'
                      )}
                    />
                  </div>
                  <div>
                    <h3 className="text-headline text-label-primary">
                      {env.displayName || env.name}
                    </h3>
                    <p className="text-caption-1 text-label-tertiary">{env.name}</p>
                  </div>
                </div>
                <Badge
                  variant={env.status === 'active' ? 'success' : env.status === 'error' ? 'danger' : 'default'}
                  dot
                >
                  {env.status === 'active' ? '运行中' : env.status === 'error' ? '异常' : '未激活'}
                </Badge>
              </div>

              {env.description && (
                <p className="mt-3 text-footnote text-label-secondary line-clamp-2">
                  {env.description}
                </p>
              )}

              <div className="mt-4 flex items-center justify-between border-t border-separator pt-3">
                <div className="flex items-center gap-2 text-caption-1 text-label-tertiary">
                  <Settings size={14} />
                  <span>
                    {Object.keys(env.variables || {}).length} 个变量
                  </span>
                </div>
                {env.team && (
                  <Badge size="sm">{env.team.name}</Badge>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Create Modal */}
      <Modal
        open={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="创建环境"
      >
        <div className="space-y-4">
          <Input
            label="环境标识"
            value={newEnv.name}
            onChange={(e) => setNewEnv({ ...newEnv, name: e.target.value })}
            placeholder="例如: dev, staging, prod"
            required
          />
          <Input
            label="显示名称"
            value={newEnv.displayName}
            onChange={(e) => setNewEnv({ ...newEnv, displayName: e.target.value })}
            placeholder="例如: 开发环境"
          />
          <Input
            label="描述"
            value={newEnv.description}
            onChange={(e) => setNewEnv({ ...newEnv, description: e.target.value })}
            placeholder="环境用途描述"
          />
          <div className="flex justify-end gap-3">
            <Button variant="ghost" onClick={() => setShowCreateModal(false)}>
              取消
            </Button>
            <Button
              onClick={() => {
                if (!newEnv.name.trim()) {
                  showError('请填写环境标识', '环境标识不能为空')
                  return
                }
                createMutation.mutate(newEnv)
              }}
              loading={createMutation.isPending}
            >
              创建
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
