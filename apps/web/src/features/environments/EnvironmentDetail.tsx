import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  ArrowLeft,
  Camera,
  RefreshCw,
  Trash2,
  Eye,
  EyeOff,
  CheckCircle,
  XCircle,
  AlertCircle,
  RotateCcw,
} from 'lucide-react'
import { api } from '@/services/api'
import { Button, Card, Input, Badge, Modal } from '@/components/ui'
import { useToast } from '@/components/ui/Toast'
import { formatRelativeTime } from '@team-share/shared'

export function EnvironmentDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { success, error: showError } = useToast()
  const [showSecrets, setShowSecrets] = useState<Record<string, boolean>>({})
  const [showSnapshotModal, setShowSnapshotModal] = useState(false)
  const [snapshotName, setSnapshotName] = useState('')
  const [showHealthModal, setShowHealthModal] = useState(false)
  const [healthResult, setHealthResult] = useState<any>(null)

  const { data: env, isLoading } = useQuery({
    queryKey: ['environment', id],
    queryFn: () => api.get<any>(`/environments/${id}`),
    enabled: !!id,
  })

  const { data: snapshots = [] } = useQuery({
    queryKey: ['env-snapshots', id],
    queryFn: () => api.get<any[]>(`/environments/${id}/snapshots`),
    enabled: !!id,
  })

  const snapshotMutation = useMutation({
    mutationFn: (name?: string) => api.post(`/environments/${id}/snapshot`, { name }),
    onSuccess: () => {
      success('快照创建成功')
      queryClient.invalidateQueries({ queryKey: ['env-snapshots', id] })
      setShowSnapshotModal(false)
      setSnapshotName('')
    },
    onError: () => showError('创建失败', '请稍后重试'),
  })

  const restoreMutation = useMutation({
    mutationFn: (snapshotId: string) => api.post(`/environments/snapshots/${snapshotId}/restore`),
    onSuccess: () => {
      success('环境已恢复')
      queryClient.invalidateQueries({ queryKey: ['environment', id] })
    },
    onError: () => showError('恢复失败', '请稍后重试'),
  })

  const deleteSnapshotMutation = useMutation({
    mutationFn: (snapshotId: string) => api.delete(`/environments/snapshots/${snapshotId}`),
    onSuccess: () => {
      success('快照已删除')
      queryClient.invalidateQueries({ queryKey: ['env-snapshots', id] })
    },
  })

  const healthMutation = useMutation({
    mutationFn: () => api.get<any>(`/environments/${id}/health`),
    onSuccess: (data) => {
      setHealthResult(data)
      setShowHealthModal(true)
    },
    onError: () => showError('健康检查失败', '请稍后重试'),
  })

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="text-label-tertiary">加载中...</div>
      </div>
    )
  }

  if (!env) {
    return (
      <div className="flex h-64 flex-col items-center justify-center">
        <p className="text-headline text-label-secondary">环境不存在</p>
        <Button variant="tertiary" onClick={() => navigate('/environments')} className="mt-4">
          返回环境列表
        </Button>
      </div>
    )
  }

  const variables = (env.variables || {}) as Record<string, string>
  const secrets = (env.secrets || {}) as Record<string, string>
  const dependencies = (env.dependencies || {}) as Record<string, string>

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/environments')}>
            <ArrowLeft size={20} />
          </Button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-title-1 text-label-primary">
                {env.displayName || env.name}
              </h1>
              <Badge
                variant={env.status === 'active' ? 'success' : env.status === 'error' ? 'danger' : 'default'}
                dot
              >
                {env.status === 'active' ? '运行中' : env.status === 'error' ? '异常' : '未激活'}
              </Badge>
            </div>
            {env.description && (
              <p className="mt-1 text-callout text-label-secondary">{env.description}</p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            icon={<Camera size={16} />}
            onClick={() => setShowSnapshotModal(true)}
          >
            创建快照
          </Button>
          <Button
            variant="ghost"
            icon={<RefreshCw size={16} />}
            onClick={() => healthMutation.mutate()}
            loading={healthMutation.isPending}
          >
            健康检查
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Variables */}
        <Card className="col-span-2">
          <h3 className="text-headline text-label-primary">环境变量</h3>
          <div className="mt-4 space-y-2">
            {Object.entries(variables).length === 0 ? (
              <p className="text-footnote text-label-tertiary py-4 text-center">暂无环境变量</p>
            ) : (
              Object.entries(variables).map(([key, value]) => (
                <div
                  key={key}
                  className="flex items-center gap-4 rounded-lg border border-separator p-3"
                >
                  <span className="w-1/3 font-mono text-footnote text-system-blue">
                    {key}
                  </span>
                  <span className="flex-1 font-mono text-footnote text-label-primary">
                    {String(value)}
                  </span>
                </div>
              ))
            )}
          </div>
        </Card>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Secrets */}
          <Card>
            <div className="flex items-center justify-between">
              <h3 className="text-headline text-label-primary">密钥</h3>
              <span className="text-caption-1 text-label-tertiary">
                {Object.keys(secrets).length} 个
              </span>
            </div>
            <div className="mt-4 space-y-2">
              {Object.entries(secrets).length === 0 ? (
                <p className="text-footnote text-label-tertiary text-center py-2">暂无密钥</p>
              ) : (
                Object.entries(secrets).map(([key, value]) => (
                  <div key={key} className="flex items-center justify-between">
                    <span className="font-mono text-footnote text-label-primary">{key}</span>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-footnote text-label-tertiary">
                        {showSecrets[key] ? String(value) : '••••••••'}
                      </span>
                      <button
                        onClick={() => setShowSecrets((prev) => ({ ...prev, [key]: !prev[key] }))}
                        className="text-label-tertiary hover:text-label-secondary"
                      >
                        {showSecrets[key] ? <EyeOff size={14} /> : <Eye size={14} />}
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </Card>

          {/* Dependencies */}
          <Card>
            <h3 className="text-headline text-label-primary">依赖</h3>
            <div className="mt-4 space-y-2">
              {Object.entries(dependencies).length === 0 ? (
                <p className="text-footnote text-label-tertiary text-center py-2">暂无依赖</p>
              ) : (
                Object.entries(dependencies).map(([key, value]) => (
                  <div key={key} className="flex items-center justify-between">
                    <span className="text-footnote text-label-primary">{key}</span>
                    <Badge size="sm">{String(value)}</Badge>
                  </div>
                ))
              )}
            </div>
          </Card>

          {/* Snapshots */}
          <Card>
            <div className="flex items-center justify-between">
              <h3 className="text-headline text-label-primary">快照</h3>
              <span className="text-caption-1 text-label-tertiary">{snapshots.length} 个</span>
            </div>
            <div className="mt-4 space-y-2">
              {snapshots.length === 0 ? (
                <p className="text-footnote text-label-tertiary text-center py-2">暂无快照</p>
              ) : (
                snapshots.map((snapshot: any) => (
                  <div
                    key={snapshot.id}
                    className="flex items-center justify-between rounded-lg border border-separator p-2"
                  >
                    <div className="min-w-0">
                      <p className="text-footnote text-label-primary truncate">{snapshot.name}</p>
                      <p className="text-caption-2 text-label-tertiary">
                        {formatRelativeTime(snapshot.createdAt)}
                      </p>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => {
                          if (window.confirm('确定要恢复到此快照吗？')) {
                            restoreMutation.mutate(snapshot.id)
                          }
                        }}
                        className="rounded p-1 text-label-tertiary hover:bg-fill-quaternary hover:text-system-blue"
                        title="恢复"
                      >
                        <RotateCcw size={14} />
                      </button>
                      <button
                        onClick={() => {
                          if (window.confirm('确定要删除此快照吗？')) {
                            deleteSnapshotMutation.mutate(snapshot.id)
                          }
                        }}
                        className="rounded p-1 text-label-tertiary hover:bg-fill-quaternary hover:text-system-red"
                        title="删除"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </Card>
        </div>
      </div>

      {/* Create Snapshot Modal */}
      <Modal
        open={showSnapshotModal}
        onClose={() => setShowSnapshotModal(false)}
        title="创建环境快照"
      >
        <div className="space-y-4">
          <Input
            label="快照名称"
            value={snapshotName}
            onChange={(e) => setSnapshotName(e.target.value)}
            placeholder="输入快照名称（可选）"
          />
          <div className="flex justify-end gap-3">
            <Button variant="ghost" onClick={() => setShowSnapshotModal(false)}>
              取消
            </Button>
            <Button
              onClick={() => snapshotMutation.mutate(snapshotName || undefined)}
              disabled={snapshotMutation.isPending}
            >
              {snapshotMutation.isPending ? '创建中...' : '创建快照'}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Health Check Result Modal */}
      <Modal
        open={showHealthModal}
        onClose={() => setShowHealthModal(false)}
        title="健康检查结果"
      >
        {healthResult && (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <span className="text-subheadline text-label-primary">整体状态:</span>
              <Badge
                variant={
                  healthResult.status === 'healthy' ? 'success' :
                  healthResult.status === 'degraded' ? 'warning' : 'danger'
                }
              >
                {healthResult.status === 'healthy' ? '健康' :
                 healthResult.status === 'degraded' ? '性能下降' : '异常'}
              </Badge>
            </div>

            <div className="space-y-2">
              {healthResult.checks?.map((check: any) => (
                <div
                  key={check.name}
                  className="flex items-center gap-3 rounded-lg border border-separator p-3"
                >
                  {check.status === 'pass' ? (
                    <CheckCircle size={18} className="text-system-green flex-shrink-0" />
                  ) : check.status === 'warn' ? (
                    <AlertCircle size={18} className="text-system-orange flex-shrink-0" />
                  ) : (
                    <XCircle size={18} className="text-system-red flex-shrink-0" />
                  )}
                  <div>
                    <p className="text-subheadline text-label-primary">{check.name}</p>
                    <p className="text-caption-1 text-label-tertiary">{check.message}</p>
                  </div>
                </div>
              ))}
            </div>

            <p className="text-caption-1 text-label-tertiary">
              检查时间: {new Date(healthResult.lastChecked).toLocaleString('zh-CN')}
            </p>
          </div>
        )}
      </Modal>
    </div>
  )
}
