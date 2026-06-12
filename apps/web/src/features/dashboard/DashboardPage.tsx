import { useQuery } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import {
  Layers,
  Server,
  Workflow,
  GitBranch,
  Users,
  TrendingUp,
  TrendingDown,
  Clock,
  Star,
  Download,
  Activity,
  Plus,
  ArrowRight,
} from 'lucide-react'
import { api } from '@/services/api'
import { Card } from '@/components/ui'
import { ListSkeleton, GridSkeleton } from '@/components/common/LoadingSkeleton'
import { ErrorState } from '@/components/common/ErrorState'
import { formatRelativeTime, RESOURCE_TYPE_LABELS, API_ENDPOINTS, type DashboardStats, type RecentActivity } from '@team-share/shared'
import { cn } from '@/utils/cn'

export function DashboardPage() {
  const navigate = useNavigate()

  const { data: stats, isLoading: statsLoading, error: statsError } = useQuery<DashboardStats>({
    queryKey: ['dashboard-stats'],
    queryFn: () => api.get<DashboardStats>(API_ENDPOINTS.MONITORING.DASHBOARD),
  })

  const { data: recentResources = [], isLoading: resourcesLoading } = useQuery({
    queryKey: ['recent-resources'],
    queryFn: () =>
      api.get<any>(API_ENDPOINTS.RESOURCES.BASE, { params: { pageSize: 6, sort: 'updatedAt', order: 'desc' } }).then((r: any) => r.items || []),
  })

  const { data: recentActivities = [], isLoading: activitiesLoading } = useQuery<RecentActivity[]>({
    queryKey: ['recent-activities'],
    queryFn: () => api.get<RecentActivity[]>(API_ENDPOINTS.MONITORING.ACTIVITIES),
  })

  const statCards = stats
    ? [
        {
          label: '资源总数',
          value: stats.resources.total,
          growth: stats.resources.growth,
          icon: Layers,
          color: 'text-system-blue',
          bg: 'bg-system-blue/10',
          path: '/resources',
        },
        {
          label: '环境数',
          value: stats.environments.total,
          growth: stats.environments.growth,
          icon: Server,
          color: 'text-system-green',
          bg: 'bg-system-green/10',
          path: '/environments',
        },
        {
          label: '工作流',
          value: stats.workflows.total,
          growth: stats.workflows.growth,
          icon: Workflow,
          color: 'text-system-purple',
          bg: 'bg-system-purple/10',
          path: '/workflows',
        },
        {
          label: '团队数',
          value: stats.teams.total,
          growth: stats.teams.growth,
          icon: Users,
          color: 'text-system-orange',
          bg: 'bg-system-orange/10',
          path: '/teams',
        },
      ]
    : []

  const actionCards = [
    {
      title: '新建资源',
      description: '创建 Prompt、Skill、Component 等资源',
      icon: Plus,
      color: 'text-system-blue',
      bg: 'bg-system-blue/10',
      onClick: () => navigate('/resources/new'),
    },
    {
      title: '执行工作流',
      description: '运行已配置的自动化工作流',
      icon: Workflow,
      color: 'text-system-purple',
      bg: 'bg-system-purple/10',
      onClick: () => navigate('/workflows'),
    },
    {
      title: '管理环境',
      description: '配置和监控运行环境',
      icon: Server,
      color: 'text-system-green',
      bg: 'bg-system-green/10',
      onClick: () => navigate('/environments'),
    },
    {
      title: '查看版本',
      description: '浏览和管理资源版本历史',
      icon: GitBranch,
      color: 'text-system-orange',
      bg: 'bg-system-orange/10',
      onClick: () => navigate('/versions'),
    },
  ]

  if (statsError) {
    return <ErrorState onRetry={() => window.location.reload()} />
  }

  return (
    <div className="space-y-8">
      {/* Welcome & Time */}
      <div>
        <h1 className="text-large-title text-label-primary">
          {getGreeting()}，欢迎回来
        </h1>
        <p className="mt-1 text-callout text-label-secondary">
          以下是团队资源共享平台的概览
        </p>
      </div>

      {/* Stat Cards */}
      {statsLoading ? (
        <GridSkeleton count={4} />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {statCards.map((stat) => (
            <Card
              key={stat.label}
              hoverable
              className="cursor-pointer"
              onClick={() => navigate(stat.path)}
            >
              <div className="flex items-start justify-between">
                <div className={cn('rounded-xl p-2.5', stat.bg)}>
                  <stat.icon size={20} className={stat.color} />
                </div>
                <div
                  className={cn(
                    'flex items-center gap-0.5 text-caption-2',
                    (stat.growth ?? 0) >= 0 ? 'text-system-green' : 'text-system-red'
                  )}
                >
                  {(stat.growth ?? 0) >= 0 ? (
                    <TrendingUp size={14} />
                  ) : (
                    <TrendingDown size={14} />
                  )}
                  <span>{Math.abs(stat.growth ?? 0)}%</span>
                </div>
              </div>
              <div className="mt-4">
                <p className="text-large-title text-label-primary">{stat.value.toLocaleString()}</p>
                <p className="mt-0.5 text-footnote text-label-secondary">{stat.label}</p>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Quick Actions + Recent Activity */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Quick Actions */}
        <div className="lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-title-3 text-label-primary">快捷操作</h2>
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {actionCards.map((action) => (
              <Card key={action.title} hoverable onClick={action.onClick}>
                <div className="flex items-start gap-4">
                  <div className={cn('rounded-xl p-2.5', action.bg)}>
                    <action.icon size={20} className={action.color} />
                  </div>
                  <div>
                    <h3 className="text-headline text-label-primary">{action.title}</h3>
                    <p className="mt-0.5 text-footnote text-label-secondary">
                      {action.description}
                    </p>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {/* Recent Resources */}
          <div className="mt-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-title-3 text-label-primary">最近资源</h2>
              <button
                onClick={() => navigate('/resources')}
                className="flex items-center gap-1 text-subheadline text-system-blue transition-colors hover:text-system-blue/80"
              >
                查看全部
                <ArrowRight size={16} />
              </button>
            </div>
            {resourcesLoading ? (
              <ListSkeleton count={5} />
            ) : (
              <div className="space-y-2">
                {recentResources.map((resource: any) => (
                  <div
                    key={resource.id}
                    onClick={() => navigate(`/resources/${resource.id}`)}
                    className="flex cursor-pointer items-center gap-4 rounded-xl px-4 py-3 transition-colors hover:bg-fill-quaternary"
                  >
                    <div className="rounded-lg bg-fill-tertiary p-2 text-subheadline">
                      {getTypeEmoji(resource.type)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-subheadline font-medium text-label-primary truncate">
                        {resource.name}
                      </p>
                      <p className="text-footnote text-label-secondary">
                        {RESOURCE_TYPE_LABELS[resource.type as keyof typeof RESOURCE_TYPE_LABELS] || resource.type}
                        {' · '}
                        {resource.owner?.displayName || resource.owner?.username || '未知'}
                      </p>
                    </div>
                    <div className="flex items-center gap-4 text-footnote text-label-tertiary">
                      <span className="flex items-center gap-1">
                        <Star size={14} />
                        {resource.stars || 0}
                      </span>
                      <span className="flex items-center gap-1">
                        <Download size={14} />
                        {resource.downloads || 0}
                      </span>
                    </div>
                  </div>
                ))}
                {recentResources.length === 0 && (
                  <div className="flex flex-col items-center py-8">
                    <Layers size={32} className="text-label-tertiary" />
                    <p className="mt-2 text-footnote text-label-secondary">暂无资源</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Sidebar: Recent Activity */}
        <div>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-title-3 text-label-primary">最近动态</h2>
          </div>
          <Card padding="sm">
            {activitiesLoading ? (
              <ListSkeleton count={5} />
            ) : recentActivities.length === 0 ? (
              <div className="flex flex-col items-center py-8">
                <Activity size={32} className="text-label-tertiary" />
                <p className="mt-2 text-footnote text-label-secondary">暂无动态</p>
              </div>
            ) : (
              <div className="space-y-0">
                {recentActivities.map((activity, index) => (
                  <div
                    key={activity.id}
                    className={cn(
                      'flex gap-3 px-2 py-3',
                      index < recentActivities.length - 1 && 'border-b border-separator'
                    )}
                  >
                    <div className="flex-shrink-0 pt-0.5">
                      <Clock size={14} className="text-label-tertiary" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-subheadline text-label-primary">
                        <span className="font-medium">{activity.userName}</span>
                        {' '}
                        {activity.action}
                        {' '}
                        <span className="font-medium">{activity.resourceName}</span>
                      </p>
                      <p className="mt-0.5 text-caption-2 text-label-tertiary">
                        {formatRelativeTime(activity.createdAt)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  )
}

function getGreeting(): string {
  const hour = new Date().getHours()
  if (hour < 6) return '夜深了'
  if (hour < 12) return '早上好'
  if (hour < 14) return '中午好'
  if (hour < 18) return '下午好'
  return '晚上好'
}

function getTypeEmoji(type: string): string {
  const map: Record<string, string> = {
    prompt: '📝',
    skill: '🧩',
    component: '📦',
    mcp: '🔌',
    protocol: '📄',
    workflow: '🔄',
    template: '📋',
    snippet: '💻',
  }
  return map[type] || '📄'
}
