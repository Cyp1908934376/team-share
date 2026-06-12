import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, Workflow, Play, Clock, Search } from 'lucide-react'
import { api } from '@/services/api'
import { Card, Badge, Button, Input, Modal } from '@/components/ui'
import { useToast } from '@/components/ui/Toast'
import { EmptyState } from '@/components/common/EmptyState'
import { ErrorState } from '@/components/common/ErrorState'
import { GridSkeleton } from '@/components/common/LoadingSkeleton'
import { formatRelativeTime, API_ENDPOINTS } from '@team-share/shared'

export function WorkflowList() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { success, error: showError } = useToast()
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [search, setSearch] = useState('')
  const [newWorkflow, setNewWorkflow] = useState({
    name: '',
    description: '',
  })

  const { data: workflows = [], isLoading, error, refetch } = useQuery({
    queryKey: ['workflows'],
    queryFn: () => api.get<any[]>(API_ENDPOINTS.WORKFLOWS.BASE),
  })

  const createMutation = useMutation({
    mutationFn: (data: typeof newWorkflow) => api.post(API_ENDPOINTS.WORKFLOWS.BASE, data),
    onSuccess: (created: any) => {
      success('工作流创建成功')
      queryClient.invalidateQueries({ queryKey: ['workflows'] })
      setShowCreateModal(false)
      setNewWorkflow({ name: '', description: '' })
      navigate(`/workflows/${created.id}`)
    },
    onError: () => showError('创建失败', '请稍后重试'),
  })

  const filteredWorkflows = workflows.filter((wf: any) => {
    if (!search) return true
    const q = search.toLowerCase()
    return (
      wf.name?.toLowerCase().includes(q) ||
      wf.description?.toLowerCase().includes(q)
    )
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-title-1 text-label-primary">工作流</h1>
          <p className="mt-1 text-callout text-label-secondary">
            可视化编排和自动化执行工作流
          </p>
        </div>
        <Button icon={<Plus size={16} />} onClick={() => setShowCreateModal(true)}>
          创建工作流
        </Button>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-label-tertiary" />
        <input
          type="text"
          placeholder="搜索工作流..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-lg border border-separator bg-bg-primary py-2 pl-9 pr-3 text-subheadline text-label-primary placeholder:text-label-tertiary focus:border-system-blue focus:outline-none focus:ring-2 focus:ring-system-blue/20"
        />
      </div>

      {/* Workflow Grid */}
      {isLoading ? (
        <GridSkeleton count={6} />
      ) : error ? (
        <ErrorState onRetry={() => refetch()} />
      ) : filteredWorkflows.length === 0 ? (
        <EmptyState
          icon={<Workflow size={32} className="text-label-tertiary" />}
          title={search ? '未找到匹配的工作流' : '暂无工作流'}
          description={search ? '请尝试其他搜索关键词' : '点击"创建工作流"开始编排你的第一个工作流'}
          action={
            !search && (
              <Button icon={<Plus size={16} />} onClick={() => setShowCreateModal(true)}>
                创建工作流
              </Button>
            )
          }
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredWorkflows.map((workflow: any) => (
            <Card
              key={workflow.id}
              hoverable
              onClick={() => navigate(`/workflows/${workflow.id}`)}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-system-purple/10 p-2">
                    <Workflow size={20} className="text-system-purple" />
                  </div>
                  <div>
                    <h3 className="text-headline text-label-primary">
                      {workflow.name}
                    </h3>
                    <p className="text-caption-1 text-label-tertiary">
                      v{workflow.version}
                    </p>
                  </div>
                </div>
                <Badge
                  variant={workflow.status === 'active' ? 'success' : 'default'}
                  dot
                >
                  {workflow.status === 'active' ? '活跃' : '草稿'}
                </Badge>
              </div>

              {workflow.description && (
                <p className="mt-3 text-footnote text-label-secondary line-clamp-2">
                  {workflow.description}
                </p>
              )}

              <div className="mt-4 flex items-center gap-4 text-caption-1 text-label-tertiary">
                <span className="flex items-center gap-1">
                  <Workflow size={14} />
                  {(workflow.nodes || []).length} 个节点
                </span>
                <span className="flex items-center gap-1">
                  <Play size={14} />
                  {workflow._count?.executions || 0} 次执行
                </span>
                <span className="flex items-center gap-1">
                  <Clock size={14} />
                  {formatRelativeTime(workflow.updatedAt)}
                </span>
              </div>

              {workflow.team && (
                <div className="mt-3 border-t border-separator pt-3">
                  <Badge size="sm">{workflow.team.name}</Badge>
                </div>
              )}
            </Card>
          ))}
        </div>
      )}

      {/* Create Modal */}
      <Modal
        open={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="创建工作流"
      >
        <div className="space-y-4">
          <Input
            label="工作流名称"
            value={newWorkflow.name}
            onChange={(e) => setNewWorkflow({ ...newWorkflow, name: e.target.value })}
            placeholder="例如: 一键部署、资源发布"
            required
          />
          <Input
            label="描述"
            value={newWorkflow.description}
            onChange={(e) => setNewWorkflow({ ...newWorkflow, description: e.target.value })}
            placeholder="工作流用途描述"
          />
          <div className="flex justify-end gap-3">
            <Button variant="ghost" onClick={() => setShowCreateModal(false)}>
              取消
            </Button>
            <Button
              onClick={() => {
                if (!newWorkflow.name.trim()) {
                  showError('请填写名称', '工作流名称不能为空')
                  return
                }
                createMutation.mutate(newWorkflow)
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
