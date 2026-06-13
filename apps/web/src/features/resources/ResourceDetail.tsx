import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  ArrowLeft,
  Edit,
  Trash2,
  Star,
  Download,
  Clock,
  User,
  Tag,
  GitBranch,
  Send,
  Copy,
  CheckCircle,
} from 'lucide-react'
import { resourcesService } from '@/services/resources'
import { api } from '@/services/api'
import { RESOURCE_TYPE_LABELS, RESOURCE_STATUS_LABELS, formatRelativeTime } from '@team-share/shared'
import { Button, Badge, Card, Tabs, TabsList, TabsTrigger, TabsContent, Modal, Input } from '@/components/ui'
import { useToast } from '@/components/ui/Toast'
import { EmptyState } from '@/components/common/EmptyState'

export function ResourceDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { success, error: showError } = useToast()
  const [activeTab, setActiveTab] = useState('overview')
  const [showNewVersion, setShowNewVersion] = useState(false)
  const [newVersion, setNewVersion] = useState({ changelog: '', tag: '' })
  const [copied, setCopied] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  const { data: resource, isLoading } = useQuery({
    queryKey: ['resource', id],
    queryFn: () => resourcesService.findById(id!),
    enabled: !!id,
  })

  const { data: versions = [] } = useQuery({
    queryKey: ['resource-versions', id],
    queryFn: () => resourcesService.getVersions(id!),
    enabled: !!id,
  })

  const starMutation = useMutation({
    mutationFn: () => resourcesService.star(id!),
    onSuccess: () => {
      success('操作成功')
      queryClient.invalidateQueries({ queryKey: ['resource', id] })
    },
  })

  const deleteMutation = useMutation({
    mutationFn: () => resourcesService.delete(id!),
    onSuccess: () => {
      success('资源已删除')
      queryClient.invalidateQueries({ queryKey: ['resources'] })
      navigate('/resources')
    },
    onError: () => showError('删除失败', '请稍后重试'),
  })

  const publishMutation = useMutation({
    mutationFn: () => resourcesService.publish(id!),
    onSuccess: () => {
      success('资源已发布')
      queryClient.invalidateQueries({ queryKey: ['resource', id] })
    },
    onError: () => showError('发布失败', '请稍后重试'),
  })

  const createVersionMutation = useMutation({
    mutationFn: (data: any) => resourcesService.createVersion(id!, data),
    onSuccess: () => {
      success('版本创建成功')
      queryClient.invalidateQueries({ queryKey: ['resource-versions', id] })
      setShowNewVersion(false)
      setNewVersion({ changelog: '', tag: '' })
    },
    onError: () => showError('创建失败', '请稍后重试'),
  })

  const handleCopy = () => {
    const content = typeof resource?.content === 'string'
      ? resource.content
      : JSON.stringify(resource?.content, null, 2)
    navigator.clipboard.writeText(content || '')
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="text-label-tertiary">加载中...</div>
      </div>
    )
  }

  if (!resource) {
    return (
      <div className="flex h-64 flex-col items-center justify-center">
        <p className="text-headline text-label-secondary">资源不存在</p>
        <Button variant="tertiary" onClick={() => navigate('/resources')} className="mt-4">
          返回资源列表
        </Button>
      </div>
    )
  }

  const handleDelete = () => {
    deleteMutation.mutate()
  }

  const handleOpenDeleteConfirm = () => {
    setShowDeleteConfirm(true)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/resources')}
          >
            <ArrowLeft size={20} />
          </Button>

          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-title-1 text-label-primary">{resource.name}</h1>
              <Badge
                variant={resource.status === 'published' ? 'success' : 'default'}
              >
                {RESOURCE_STATUS_LABELS[resource.status]}
              </Badge>
              <Badge variant="primary">
                {RESOURCE_TYPE_LABELS[resource.type]}
              </Badge>
            </div>

            {resource.description && (
              <p className="mt-2 text-callout text-label-secondary">
                {resource.description}
              </p>
            )}

            <div className="mt-3 flex items-center gap-4 text-footnote text-label-tertiary">
              <span className="flex items-center gap-1">
                <User size={14} />
                {resource.owner?.displayName || resource.owner?.username}
              </span>
              <span className="flex items-center gap-1">
                <Clock size={14} />
                {formatRelativeTime(resource.updatedAt)}
              </span>
              <span className="flex items-center gap-1">
                <GitBranch size={14} />
                v{resource.version}
              </span>
              <span className="flex items-center gap-1">
                <Star size={14} />
                {resource.stars}
              </span>
              <span className="flex items-center gap-1">
                <Download size={14} />
                {resource.downloads}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            icon={<Star size={16} className={resource.isStarred ? 'fill-system-yellow text-system-yellow' : ''} />}
            onClick={() => starMutation.mutate()}
          >
            {resource.isStarred ? '已收藏' : '收藏'}
          </Button>
          <Button
            variant="ghost"
            icon={copied ? <CheckCircle size={16} className="text-system-green" /> : <Copy size={16} />}
            onClick={handleCopy}
          >
            {copied ? '已复制' : '复制内容'}
          </Button>
          <Button
            variant="ghost"
            icon={<Edit size={16} />}
            onClick={() => navigate(`/resources/${id}/edit`)}
          >
            编辑
          </Button>
          {resource.status !== 'published' && (
            <Button
              variant="outline"
              icon={<Send size={16} />}
              onClick={() => publishMutation.mutate()}
              disabled={publishMutation.isPending}
            >
              发布
            </Button>
          )}
          <div className="mx-1 h-6 w-px bg-separator" />
          <Button
            variant="ghost"
            className="text-system-red hover:bg-system-red/10 active:bg-system-red/20"
            icon={<Trash2 size={16} />}
            onClick={handleOpenDeleteConfirm}
            disabled={deleteMutation.isPending}
          >
            删除
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="overview">概览</TabsTrigger>
          <TabsTrigger value="content">内容</TabsTrigger>
          <TabsTrigger value="versions">版本历史</TabsTrigger>
          <TabsTrigger value="analytics">统计</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-6">
          <div className="grid grid-cols-3 gap-6">
            {/* Main Content */}
            <div className="col-span-2 space-y-6">
              <Card>
                <h3 className="text-headline text-label-primary">简介</h3>
                <p className="mt-2 text-body text-label-secondary">
                  {resource.description || '暂无简介'}
                </p>
              </Card>

              <Card>
                <div className="flex items-center justify-between">
                  <h3 className="text-headline text-label-primary">内容预览</h3>
                  <Button variant="ghost" size="sm" onClick={handleCopy}>
                    {copied ? '已复制' : '复制'}
                  </Button>
                </div>
                <div className="mt-2 rounded-lg bg-fill-quaternary p-4">
                  <pre className="whitespace-pre-wrap font-mono text-footnote text-label-secondary max-h-[400px] overflow-y-auto">
                    {typeof resource.content === 'string'
                      ? resource.content
                      : JSON.stringify(resource.content, null, 2) || '暂无内容'}
                  </pre>
                </div>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              <Card>
                <h3 className="text-headline text-label-primary">信息</h3>
                <div className="mt-4 space-y-3">
                  <div className="flex justify-between">
                    <span className="text-footnote text-label-tertiary">类型</span>
                    <span className="text-footnote text-label-primary">
                      {RESOURCE_TYPE_LABELS[resource.type]}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-footnote text-label-tertiary">版本</span>
                    <span className="text-footnote text-label-primary">
                      v{resource.version}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-footnote text-label-tertiary">可见性</span>
                    <span className="text-footnote text-label-primary">
                      {resource.visibility === 'public' ? '公开' : resource.visibility === 'team' ? '团队' : '私有'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-footnote text-label-tertiary">状态</span>
                    <Badge
                      variant={resource.status === 'published' ? 'success' : 'default'}
                      size="sm"
                    >
                      {RESOURCE_STATUS_LABELS[resource.status]}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-footnote text-label-tertiary">创建时间</span>
                    <span className="text-footnote text-label-primary">
                      {new Date(resource.createdAt).toLocaleDateString('zh-CN')}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-footnote text-label-tertiary">更新时间</span>
                    <span className="text-footnote text-label-primary">
                      {formatRelativeTime(resource.updatedAt)}
                    </span>
                  </div>
                </div>
              </Card>

              {resource.tags && resource.tags.length > 0 && (
                <Card>
                  <h3 className="text-headline text-label-primary">标签</h3>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {resource.tags.map((tag) => (
                      <Badge key={tag} variant="default">
                        <Tag size={12} className="mr-1" />
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </Card>
              )}

              <Card>
                <h3 className="text-headline text-label-primary">作者</h3>
                <div className="mt-3 flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-fill-tertiary text-subheadline text-label-secondary">
                    {resource.owner?.displayName?.[0] || resource.owner?.username?.[0]?.toUpperCase() || '?'}
                  </div>
                  <div>
                    <p className="text-subheadline text-label-primary">
                      {resource.owner?.displayName || resource.owner?.username}
                    </p>
                    <p className="text-caption-1 text-label-tertiary">
                      {resource.owner?.email}
                    </p>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="content" className="mt-6">
          <Card>
            <div className="flex items-center justify-between">
              <h3 className="text-headline text-label-primary">资源内容</h3>
              <Button
                variant="outline"
                size="sm"
                icon={copied ? <CheckCircle size={14} className="text-system-green" /> : <Copy size={14} />}
                onClick={handleCopy}
              >
                {copied ? '已复制到剪贴板' : '复制'}
              </Button>
            </div>
            <div className="mt-4 rounded-lg bg-fill-quaternary p-6">
              <pre className="whitespace-pre-wrap font-mono text-footnote text-label-primary max-h-[600px] overflow-y-auto">
                {typeof resource.content === 'string'
                  ? resource.content
                  : JSON.stringify(resource.content, null, 2) || '暂无内容'}
              </pre>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="versions" className="mt-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-headline text-label-primary">版本历史</h3>
            <Button
              icon={<GitBranch size={16} />}
              onClick={() => setShowNewVersion(true)}
            >
              创建版本
            </Button>
          </div>

          {versions.length === 0 ? (
            <EmptyState
              icon={<GitBranch size={32} className="text-label-tertiary" />}
              title="暂无版本记录"
              description='点击"创建版本"创建第一个版本'
            />
          ) : (
            <div className="space-y-3">
              {versions.map((version: any) => (
                <Card key={version.id}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="rounded-full bg-system-blue/10 p-2">
                        <GitBranch size={16} className="text-system-blue" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-subheadline font-medium text-label-primary">
                            v{version.version}
                          </span>
                          {version.tag && (
                            <Badge variant="primary" size="sm">{version.tag}</Badge>
                          )}
                          <Badge
                            variant={
                              version.status === 'published' ? 'success' :
                              version.status === 'approved' ? 'primary' :
                              version.status === 'rejected' ? 'danger' : 'default'
                            }
                            size="sm"
                          >
                            {version.status === 'published' ? '已发布' :
                             version.status === 'approved' ? '已批准' :
                             version.status === 'rejected' ? '已拒绝' :
                             version.status === 'review' ? '审核中' : '草稿'}
                          </Badge>
                        </div>
                        {version.changelog && (
                          <p className="mt-1 text-footnote text-label-secondary">
                            {version.changelog}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right text-caption-1 text-label-tertiary">
                        <p>{version.author?.displayName || version.author?.username}</p>
                        <p>{formatRelativeTime(version.createdAt)}</p>
                      </div>
                      {version.status === 'draft' && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={async () => {
                            try {
                              await api.post(`/resources/${id}/versions/${version.id}/publish`)
                              success('版本已发布')
                              queryClient.invalidateQueries({ queryKey: ['resource-versions', id] })
                            } catch {
                              showError('发布失败', '请稍后重试')
                            }
                          }}
                        >
                          发布
                        </Button>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="analytics" className="mt-6">
          <div className="grid grid-cols-3 gap-4">
            <Card>
              <p className="text-caption-1 text-label-tertiary">总下载量</p>
              <p className="mt-1 text-title-2 text-label-primary">{resource.downloads}</p>
            </Card>
            <Card>
              <p className="text-caption-1 text-label-tertiary">收藏数</p>
              <p className="mt-1 text-title-2 text-label-primary">{resource.stars}</p>
            </Card>
            <Card>
              <p className="text-caption-1 text-label-tertiary">版本数</p>
              <p className="mt-1 text-title-2 text-label-primary">{versions.length}</p>
            </Card>
          </div>
          <Card className="mt-4">
            <h3 className="text-headline text-label-primary">资源信息</h3>
            <div className="mt-4 space-y-2">
              <div className="flex items-center justify-between rounded-lg p-2">
                <span className="text-footnote text-label-secondary">分类</span>
                <span className="text-footnote text-label-primary">{resource.category || '未分类'}</span>
              </div>
              <div className="flex items-center justify-between rounded-lg p-2">
                <span className="text-footnote text-label-secondary">可见性</span>
                <span className="text-footnote text-label-primary">
                  {resource.visibility === 'public' ? '公开' : resource.visibility === 'team' ? '团队' : '私有'}
                </span>
              </div>
              <div className="flex items-center justify-between rounded-lg p-2">
                <span className="text-footnote text-label-secondary">创建时间</span>
                <span className="text-footnote text-label-primary">
                  {new Date(resource.createdAt).toLocaleString('zh-CN')}
                </span>
              </div>
              <div className="flex items-center justify-between rounded-lg p-2">
                <span className="text-footnote text-label-secondary">最后更新</span>
                <span className="text-footnote text-label-primary">
                  {new Date(resource.updatedAt).toLocaleString('zh-CN')}
                </span>
              </div>
            </div>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Create Version Modal */}
      <Modal
        open={showNewVersion}
        onClose={() => setShowNewVersion(false)}
        title="创建新版本"
      >
        <div className="space-y-4">
          <Input
            label="版本标签"
            value={newVersion.tag}
            onChange={(e) => setNewVersion((prev) => ({ ...prev, tag: e.target.value }))}
            placeholder="例如: latest, beta, rc（可选）"
          />
          <div>
            <label className="text-caption-1 text-label-secondary">变更说明</label>
            <textarea
              value={newVersion.changelog}
              onChange={(e) => setNewVersion((prev) => ({ ...prev, changelog: e.target.value }))}
              placeholder="描述此版本的变更内容..."
              rows={4}
              className="mt-1.5 w-full rounded-lg border border-separator bg-bg-primary px-3 py-2 text-subheadline text-label-primary"
            />
          </div>
          <p className="text-caption-1 text-label-tertiary">
            版本号将自动递增（当前: v{resource.version}）
          </p>
          <div className="flex justify-end gap-3">
            <Button variant="ghost" onClick={() => setShowNewVersion(false)}>
              取消
            </Button>
            <Button
              onClick={() => createVersionMutation.mutate(newVersion)}
              disabled={createVersionMutation.isPending}
            >
              {createVersionMutation.isPending ? '创建中...' : '创建版本'}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        open={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        title="删除资源"
        description="此操作不可撤销，请谨慎操作。"
        size="sm"
      >
        <div className="space-y-4">
          <div className="rounded-lg bg-system-red/5 border border-system-red/20 p-4">
            <p className="text-subheadline text-label-primary">
              确定要删除「{resource.name}」吗？
            </p>
            <p className="mt-1 text-footnote text-label-secondary">
              删除后，该资源的所有版本、收藏记录和相关数据将被永久移除。
            </p>
          </div>
          <div className="flex justify-end gap-3">
            <Button variant="secondary" onClick={() => setShowDeleteConfirm(false)}>
              取消
            </Button>
            <Button
              variant="danger"
              icon={<Trash2 size={16} />}
              onClick={() => {
                handleDelete()
                setShowDeleteConfirm(false)
              }}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? '删除中...' : '确认删除'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
