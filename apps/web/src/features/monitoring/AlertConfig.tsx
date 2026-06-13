import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  Bell,
  Plus,
  Trash2,
  ToggleLeft,
  ToggleRight,
  AlertTriangle,
  AlertCircle,
  Info,
} from 'lucide-react'
import { api } from '@/services/api'
import { Button, Card, Input, Select, Badge, Modal } from '@/components/ui'
import { useToast } from '@/components/ui/Toast'
import { cn } from '@/utils/cn'

const SEVERITY_CONFIG = {
  critical: { label: '严重', icon: AlertTriangle, color: 'text-system-red', bg: 'bg-system-red/10' },
  warning: { label: '警告', icon: AlertCircle, color: 'text-system-orange', bg: 'bg-system-orange/10' },
  info: { label: '信息', icon: Info, color: 'text-system-blue', bg: 'bg-system-blue/10' },
}

const METRIC_OPTIONS = [
  { value: 'cpu', label: 'CPU 使用率' },
  { value: 'memory', label: '内存使用率' },
  { value: 'disk', label: '磁盘使用率' },
  { value: 'api_latency', label: 'API 响应时间' },
  { value: 'error_rate', label: '错误率' },
  { value: 'workflow_failures', label: '工作流失败数' },
]

const CONDITION_OPTIONS = [
  { value: 'gt', label: '大于' },
  { value: 'lt', label: '小于' },
  { value: 'gte', label: '大于等于' },
  { value: 'lte', label: '小于等于' },
]

const CHANNEL_OPTIONS = [
  { value: 'websocket', label: '站内通知', icon: '🔔' },
  { value: 'wechat', label: '企业微信', icon: '💬' },
  { value: 'dingtalk', label: '钉钉', icon: '📢' },
  { value: 'email', label: '邮件', icon: '📧' },
]

interface AlertRule {
  id: string
  name: string
  description: string
  metric: string
  condition: string
  threshold: number
  severity: string
  enabled: boolean
  channels?: string[]
}

export function AlertConfig() {
  const queryClient = useQueryClient()
  const { success, error: showError } = useToast()
  const [showCreate, setShowCreate] = useState(false)
  const [form, setForm] = useState({
    name: '',
    description: '',
    metric: 'cpu',
    condition: 'gt',
    threshold: 80,
    severity: 'warning',
    channels: ['websocket'] as string[],
  })

  const { data: rules = [], isLoading } = useQuery<AlertRule[]>({
    queryKey: ['alert-rules'],
    queryFn: () => api.get('/monitoring/alerts'),
  })

  const createMutation = useMutation({
    mutationFn: (data: any) => api.post('/monitoring/alerts', data),
    onSuccess: () => {
      success('告警规则创建成功')
      queryClient.invalidateQueries({ queryKey: ['alert-rules'] })
      setShowCreate(false)
    },
    onError: () => showError('创建失败'),
  })

  const toggleMutation = useMutation({
    mutationFn: ({ id, enabled }: { id: string; enabled: boolean }) =>
      api.put(`/monitoring/alerts/${id}`, { enabled }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['alert-rules'] })
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/monitoring/alerts/${id}`),
    onSuccess: () => {
      success('告警规则已删除')
      queryClient.invalidateQueries({ queryKey: ['alert-rules'] })
    },
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-title-2 text-label-primary">告警规则</h2>
          <p className="text-callout text-label-secondary mt-1">
            配置系统和资源的告警规则与通知渠道
          </p>
        </div>
        <Button variant="primary" size="sm" onClick={() => setShowCreate(true)}>
          <Plus className="w-4 h-4 mr-2" />
          新建规则
        </Button>
      </div>

      {/* Rules list */}
      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse h-20 bg-fill-quaternary rounded-xl" />
          ))}
        </div>
      ) : rules.length === 0 ? (
        <div className="py-12 text-center">
          <Bell className="w-12 h-12 text-label-tertiary mx-auto mb-4" />
          <p className="text-headline text-label-primary">暂无告警规则</p>
          <p className="text-callout text-label-secondary mt-1">
            创建规则以监控关键指标并及时收到通知
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {rules.map((rule) => {
            const sev = SEVERITY_CONFIG[rule.severity as keyof typeof SEVERITY_CONFIG] || SEVERITY_CONFIG.info
            const metricLabel = METRIC_OPTIONS.find((m) => m.value === rule.metric)?.label || rule.metric
            const condLabel = CONDITION_OPTIONS.find((c) => c.value === rule.condition)?.label || rule.condition
            return (
              <Card key={rule.id} className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="text-headline text-label-primary">{rule.name}</h4>
                      <Badge className={cn('text-caption-2', sev.bg, sev.color)}>
                        {sev.label}
                      </Badge>
                      {!rule.enabled && (
                        <Badge className="text-caption-2 bg-fill-quaternary text-label-tertiary">
                          已禁用
                        </Badge>
                      )}
                    </div>
                    <p className="text-callout text-label-secondary mb-2">
                      {metricLabel} {condLabel} {rule.threshold}
                      {rule.metric === 'cpu' || rule.metric === 'memory' || rule.metric === 'disk' ? '%' : ''}
                    </p>
                    {rule.description && (
                      <p className="text-footnote text-label-tertiary">{rule.description}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-2 ml-4">
                    <button
                      onClick={() => toggleMutation.mutate({ id: rule.id, enabled: !rule.enabled })}
                      className="p-1 rounded-md hover:bg-fill-quaternary transition-colors"
                    >
                      {rule.enabled ? (
                        <ToggleRight className="w-6 h-6 text-system-green" />
                      ) : (
                        <ToggleLeft className="w-6 h-6 text-label-tertiary" />
                      )}
                    </button>
                    <button
                      onClick={() => {
                        if (confirm('确定删除此告警规则？')) {
                          deleteMutation.mutate(rule.id)
                        }
                      }}
                      className="p-1 rounded-md hover:bg-fill-quaternary transition-colors"
                    >
                      <Trash2 className="w-4 h-4 text-label-tertiary hover:text-system-red" />
                    </button>
                  </div>
                </div>
              </Card>
            )
          })}
        </div>
      )}

      {/* Create modal */}
      <Modal
        open={showCreate}
        onClose={() => setShowCreate(false)}
        title="新建告警规则"
      >
        <div className="space-y-4">
          <Input
            label="名称"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="CPU 过载告警"
          />
          <div>
            <label className="text-footnote text-label-secondary block mb-1">监控指标</label>
            <Select
              value={form.metric}
              onChange={(e) => setForm({ ...form, metric: e.target.value })}
              options={METRIC_OPTIONS}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-footnote text-label-secondary block mb-1">条件</label>
              <Select
                value={form.condition}
                onChange={(e) => setForm({ ...form, condition: e.target.value })}
                options={CONDITION_OPTIONS}
              />
            </div>
            <Input
              label="阈值"
              type="number"
              value={String(form.threshold)}
              onChange={(e) => setForm({ ...form, threshold: Number(e.target.value) })}
            />
          </div>
          <div>
            <label className="text-footnote text-label-secondary block mb-1">严重程度</label>
            <Select
              value={form.severity}
              onChange={(e) => setForm({ ...form, severity: e.target.value })}
              options={[
                { value: 'critical', label: '严重' },
                { value: 'warning', label: '警告' },
                { value: 'info', label: '信息' },
              ]}
            />
          </div>
          <div>
            <label className="text-footnote text-label-secondary block mb-1">通知渠道</label>
            <div className="flex flex-wrap gap-2">
              {CHANNEL_OPTIONS.map((ch) => (
                <button
                  key={ch.value}
                  type="button"
                  onClick={() => {
                    const channels = form.channels.includes(ch.value)
                      ? form.channels.filter((c) => c !== ch.value)
                      : [...form.channels, ch.value]
                    setForm({ ...form, channels })
                  }}
                  className={cn(
                    'px-3 py-1.5 rounded-lg text-footnote border transition-colors',
                    form.channels.includes(ch.value)
                      ? 'bg-system-blue/10 border-system-blue text-system-blue'
                      : 'border-separator text-label-secondary hover:bg-fill-quaternary',
                  )}
                >
                  {ch.icon} {ch.label}
                </button>
              ))}
            </div>
          </div>
          <Input
            label="描述（可选）"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            placeholder="当 CPU 使用率超过阈值时触发告警"
          />
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="secondary" onClick={() => setShowCreate(false)}>
              取消
            </Button>
            <Button
              variant="primary"
              onClick={() => createMutation.mutate(form)}
              loading={createMutation.isPending}
              disabled={!form.name}
            >
              创建规则
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
