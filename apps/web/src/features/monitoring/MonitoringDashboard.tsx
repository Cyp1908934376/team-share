import { useQuery } from '@tanstack/react-query'
import {
  Users,
  Layers,
  Server,
  Workflow,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
} from 'lucide-react'
import { api } from '@/services/api'
import { Card, Badge } from '@/components/ui'
import { formatRelativeTime } from '@team-share/shared'
import { cn } from '@/utils/cn'

interface StatCardProps {
  title: string
  value: string | number
  icon: React.ReactNode
  color: string
}

function StatCard({ title, value, icon, color }: StatCardProps) {
  return (
    <Card>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-caption-1 text-label-tertiary">{title}</p>
          <p className="mt-1 text-title-2 text-label-primary">{value}</p>
        </div>
        <div className={cn('rounded-lg p-2', color)}>{icon}</div>
      </div>
    </Card>
  )
}

const ACTION_LABELS: Record<string, string> = {
  'resource.create': '创建了资源',
  'resource.update': '更新了资源',
  'resource.delete': '删除了资源',
  'resource.publish': '发布了资源',
  'workflow.create': '创建了工作流',
  'workflow.execute': '执行了工作流',
  'environment.create': '创建了环境',
  'environment.snapshot': '创建了环境快照',
  'environment.restore': '恢复了环境快照',
}

export function MonitoringDashboard() {
  const { data: stats } = useQuery({
    queryKey: ['monitoring-stats'],
    queryFn: () => api.get<any>('/monitoring/stats'),
  })

  const { data: resourceStats } = useQuery({
    queryKey: ['monitoring-resources'],
    queryFn: () => api.get<any>('/monitoring/resources'),
  })

  const { data: workflowStats } = useQuery({
    queryKey: ['monitoring-workflows'],
    queryFn: () => api.get<any>('/monitoring/workflows'),
  })

  const { data: activities = [] } = useQuery({
    queryKey: ['monitoring-activity'],
    queryFn: () => api.get<any[]>('/monitoring/activity'),
  })

  const { data: health } = useQuery({
    queryKey: ['monitoring-health'],
    queryFn: () => api.get<any>('/monitoring/health'),
    refetchInterval: 30000, // Refresh every 30s
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-title-1 text-label-primary">监控面板</h1>
        <p className="mt-1 text-callout text-label-secondary">
          系统运行状态和资源使用统计
        </p>
      </div>

      {/* System Health */}
      {health && (
        <Card>
          <div className="flex items-center justify-between">
            <h3 className="text-headline text-label-primary">系统状态</h3>
            <Badge
              variant={
                health.status === 'healthy'
                  ? 'success'
                  : health.status === 'degraded'
                  ? 'warning'
                  : 'danger'
              }
            >
              {health.status === 'healthy'
                ? '正常运行'
                : health.status === 'degraded'
                ? '性能下降'
                : '异常'}
            </Badge>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {health.checks?.map((check: any) => (
              <div
                key={check.name}
                className="flex items-center gap-2 rounded-lg border border-separator p-2"
              >
                {check.status === 'pass' ? (
                  <CheckCircle size={16} className="text-system-green" />
                ) : check.status === 'warn' ? (
                  <AlertCircle size={16} className="text-system-orange" />
                ) : (
                  <XCircle size={16} className="text-system-red" />
                )}
                <div className="min-w-0">
                  <p className="text-caption-1 text-label-primary truncate">{check.name}</p>
                  <p className="text-caption-2 text-label-tertiary truncate">{check.message}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-3 flex items-center gap-4 text-caption-1 text-label-tertiary">
            <span>运行时间: {Math.floor((health.uptime || 0) / 3600)}h {Math.floor(((health.uptime || 0) % 3600) / 60)}m</span>
            <span>检查时间: {formatRelativeTime(health.timestamp)}</span>
          </div>
        </Card>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="资源总数"
          value={stats?.resources || 0}
          icon={<Layers size={20} className="text-system-blue" />}
          color="bg-system-blue/10"
        />
        <StatCard
          title="团队数量"
          value={stats?.teams || 0}
          icon={<Users size={20} className="text-system-purple" />}
          color="bg-system-purple/10"
        />
        <StatCard
          title="环境配置"
          value={stats?.environments || 0}
          icon={<Server size={20} className="text-system-green" />}
          color="bg-system-green/10"
        />
        <StatCard
          title="工作流"
          value={stats?.workflows || 0}
          icon={<Workflow size={20} className="text-system-orange" />}
          color="bg-system-orange/10"
        />
      </div>

      {/* Resource Stats and Workflow Stats */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Resource by Type */}
        <Card>
          <h3 className="text-headline text-label-primary">资源类型分布</h3>
          <div className="mt-4 space-y-3">
            {resourceStats?.byType?.map((item: any) => (
              <div key={item.type} className="flex items-center justify-between">
                <span className="text-subheadline text-label-secondary capitalize">{item.type}</span>
                <div className="flex items-center gap-2">
                  <div className="h-2 w-32 rounded-full bg-fill-quaternary overflow-hidden">
                    <div
                      className="h-full rounded-full bg-system-blue"
                      style={{
                        width: `${Math.min(100, (item.count / (stats?.resources || 1)) * 100)}%`,
                      }}
                    />
                  </div>
                  <span className="text-caption-1 text-label-tertiary w-8 text-right">
                    {item.count}
                  </span>
                </div>
              </div>
            ))}
            {(!resourceStats?.byType || resourceStats.byType.length === 0) && (
              <p className="text-center text-label-tertiary py-4">暂无数据</p>
            )}
          </div>
          {resourceStats && (
            <div className="mt-4 flex items-center justify-between border-t border-separator pt-3 text-caption-1 text-label-tertiary">
              <span>总下载: {resourceStats.totalDownloads}</span>
              <span>总收藏: {resourceStats.totalStars}</span>
            </div>
          )}
        </Card>

        {/* Workflow Executions */}
        <Card>
          <h3 className="text-headline text-label-primary">工作流执行统计</h3>
          <div className="mt-4 space-y-3">
            {workflowStats?.byStatus?.map((item: any) => (
              <div key={item.status} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {item.status === 'success' && <CheckCircle size={14} className="text-system-green" />}
                  {item.status === 'failed' && <XCircle size={14} className="text-system-red" />}
                  {item.status === 'running' && <Clock size={14} className="text-system-blue" />}
                  {item.status === 'pending' && <Clock size={14} className="text-label-tertiary" />}
                  {item.status === 'cancelled' && <XCircle size={14} className="text-label-tertiary" />}
                  <span className="text-subheadline text-label-secondary">
                    {item.status === 'success' ? '成功' :
                     item.status === 'failed' ? '失败' :
                     item.status === 'running' ? '运行中' :
                     item.status === 'pending' ? '等待中' :
                     item.status === 'cancelled' ? '已取消' : item.status}
                  </span>
                </div>
                <Badge
                  variant={
                    item.status === 'success' ? 'success' :
                    item.status === 'failed' ? 'danger' :
                    item.status === 'running' ? 'primary' : 'default'
                  }
                >
                  {item.count}
                </Badge>
              </div>
            ))}
            {(!workflowStats?.byStatus || workflowStats.byStatus.length === 0) && (
              <p className="text-center text-label-tertiary py-4">暂无执行记录</p>
            )}
          </div>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <h3 className="text-headline text-label-primary">最近活动</h3>
        <div className="mt-4 space-y-2">
          {activities.length === 0 ? (
            <p className="text-center text-label-tertiary py-8">暂无活动记录</p>
          ) : (
            activities.map((activity: any) => (
              <div
                key={activity.id}
                className="flex items-center justify-between rounded-lg p-3 hover:bg-fill-quaternary transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-fill-tertiary text-caption-1 text-label-secondary">
                    {activity.user?.displayName?.[0] || activity.user?.username?.[0]?.toUpperCase() || '?'}
                  </div>
                  <div>
                    <p className="text-subheadline text-label-primary">
                      <span className="text-label-secondary">
                        {activity.user?.displayName || activity.user?.username}
                      </span>
                      {' '}
                      {ACTION_LABELS[activity.action] || activity.action}
                    </p>
                    {activity.resourceType && (
                      <p className="text-caption-1 text-label-tertiary">
                        {activity.resourceType} {activity.resourceId?.slice(0, 8)}
                      </p>
                    )}
                  </div>
                </div>
                <span className="text-caption-1 text-label-tertiary">
                  {formatRelativeTime(activity.createdAt)}
                </span>
              </div>
            ))
          )}
        </div>
      </Card>
    </div>
  )
}
