import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { GitBranch, Tag, Clock, User, Plus, Minus, RefreshCw, FileText } from 'lucide-react'
import { api } from '@/services/api'
import { Card, Badge, Button, Modal } from '@/components/ui'
import { formatRelativeTime, VERSION_STATUS_LABELS } from '@team-share/shared'
import { cn } from '@/utils/cn'

interface DiffChange {
  path: string
  type: 'added' | 'removed' | 'modified'
  oldValue?: any
  newValue?: any
}

interface DiffResult {
  from: { id: string; version: string; createdAt: string }
  to: { id: string; version: string; createdAt: string }
  changes: DiffChange[]
  summary: { added: number; removed: number; modified: number; total: number }
}

export function VersionList() {
  const [selectedResource, setSelectedResource] = useState<string>('')
  const [diffResult, setDiffResult] = useState<DiffResult | null>(null)
  const [showDiff, setShowDiff] = useState(false)
  const [showVersionDetail, setShowVersionDetail] = useState(false)
  const [selectedVersion, setSelectedVersion] = useState<any | null>(null)

  const { data: resources = [] } = useQuery({
    queryKey: ['resources-for-versions'],
    queryFn: () => api.get<any>('/resources').then((res: any) => res.items || []),
  })

  const { data: versions = [], isLoading } = useQuery({
    queryKey: ['versions', selectedResource],
    queryFn: () => api.get<any[]>(`/resources/${selectedResource}/versions`),
    enabled: !!selectedResource,
  })

  const handleCompare = async (fromId: string, toId: string) => {
    try {
      const result = await api.get<any>(`/resources/${selectedResource}/versions/diff`, {
        params: { from: fromId, to: toId },
      })
      setDiffResult(result)
      setShowDiff(true)
    } catch (err) {
      console.error('Failed to compare versions:', err)
    }
  }

  const handleViewVersion = (version: any) => {
    setSelectedVersion(version)
    setShowVersionDetail(true)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-title-1 text-label-primary">版本管理</h1>
        <p className="mt-1 text-callout text-label-secondary">
          查看和管理资源的版本历史
        </p>
      </div>

      {/* Resource Selector */}
      <Card>
        <h3 className="text-headline text-label-primary">选择资源</h3>
        <div className="mt-3 flex flex-wrap gap-2">
          {resources.map((resource: any) => (
            <Button
              key={resource.id}
              variant={selectedResource === resource.id ? 'primary' : 'outline'}
              size="sm"
              onClick={() => setSelectedResource(resource.id)}
            >
              {resource.name}
            </Button>
          ))}
        </div>
      </Card>

      {/* Version List */}
      {!selectedResource ? (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="rounded-full bg-fill-quaternary p-4">
            <GitBranch size={32} className="text-label-tertiary" />
          </div>
          <p className="mt-4 text-headline text-label-secondary">请选择资源</p>
          <p className="mt-1 text-footnote text-label-tertiary">
            选择一个资源查看其版本历史
          </p>
        </div>
      ) : isLoading ? (
        <div className="flex h-64 items-center justify-center">
          <div className="text-label-tertiary">加载中...</div>
        </div>
      ) : versions.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20">
          <p className="text-headline text-label-secondary">暂无版本记录</p>
        </div>
      ) : (
        <div className="space-y-4">
          {versions.map((version: any, index: number) => (
            <Card key={version.id}>
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4">
                  <div className="flex flex-col items-center">
                    <div className="rounded-full bg-system-blue/10 p-2">
                      <GitBranch size={16} className="text-system-blue" />
                    </div>
                    {index < versions.length - 1 && (
                      <div className="mt-2 h-8 w-px bg-separator" />
                    )}
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-headline text-label-primary">
                        v{version.version}
                      </span>
                      {version.tag && (
                        <Badge variant="primary" size="sm">
                          <Tag size={10} className="mr-1" />
                          {version.tag}
                        </Badge>
                      )}
                      <Badge
                        variant={
                          version.status === 'published'
                            ? 'success'
                            : version.status === 'approved'
                            ? 'primary'
                            : version.status === 'rejected'
                            ? 'danger'
                            : 'default'
                        }
                        size="sm"
                      >
                        {version.status === 'published'
                          ? '已发布'
                          : version.status === 'approved'
                          ? '已批准'
                          : version.status === 'rejected'
                          ? '已拒绝'
                          : version.status === 'review'
                          ? '审核中'
                          : '草稿'}
                      </Badge>
                    </div>

                    {version.changelog && (
                      <p className="mt-1 text-body text-label-secondary">
                        {version.changelog}
                      </p>
                    )}

                    <div className="mt-2 flex items-center gap-4 text-caption-1 text-label-tertiary">
                      <span className="flex items-center gap-1">
                        <User size={12} />
                        {version.author?.displayName || version.author?.username}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock size={12} />
                        {formatRelativeTime(version.createdAt)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {index < versions.length - 1 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleCompare(versions[index + 1].id, version.id)}
                    >
                      对比
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleViewVersion(version)}
                  >
                    查看
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Diff Modal */}
      <Modal
        open={showDiff}
        onClose={() => setShowDiff(false)}
        title="版本对比"
      >
        {diffResult && (
          <div className="space-y-4">
            {/* Summary */}
            <div className="flex items-center gap-4 rounded-lg bg-fill-quaternary p-3">
              <span className="text-subheadline text-label-primary">
                v{diffResult.from.version} → v{diffResult.to.version}
              </span>
              <div className="flex items-center gap-3 text-caption-1">
                <span className="flex items-center gap-1 text-system-green">
                  <Plus size={12} /> {diffResult.summary.added}
                </span>
                <span className="flex items-center gap-1 text-system-red">
                  <Minus size={12} /> {diffResult.summary.removed}
                </span>
                <span className="flex items-center gap-1 text-system-orange">
                  <RefreshCw size={12} /> {diffResult.summary.modified}
                </span>
              </div>
            </div>

            {/* Changes */}
            {diffResult.changes.length === 0 ? (
              <div className="py-8 text-center text-label-tertiary">
                两个版本内容相同
              </div>
            ) : (
              <div className="max-h-[400px] space-y-2 overflow-y-auto">
                {diffResult.changes.map((change, index) => (
                  <div
                    key={index}
                    className={cn(
                      'rounded-lg border p-3',
                      change.type === 'added' && 'border-system-green/30 bg-system-green/5',
                      change.type === 'removed' && 'border-system-red/30 bg-system-red/5',
                      change.type === 'modified' && 'border-system-orange/30 bg-system-orange/5'
                    )}
                  >
                    <div className="flex items-center gap-2">
                      {change.type === 'added' && (
                        <Plus size={14} className="text-system-green" />
                      )}
                      {change.type === 'removed' && (
                        <Minus size={14} className="text-system-red" />
                      )}
                      {change.type === 'modified' && (
                        <RefreshCw size={14} className="text-system-orange" />
                      )}
                      <span className="font-mono text-subheadline text-label-primary">
                        {change.path}
                      </span>
                      <Badge
                        variant={
                          change.type === 'added'
                            ? 'success'
                            : change.type === 'removed'
                            ? 'danger'
                            : 'warning'
                        }
                        size="sm"
                      >
                        {change.type === 'added' ? '新增' : change.type === 'removed' ? '删除' : '修改'}
                      </Badge>
                    </div>

                    {change.type === 'removed' && (
                      <pre className="mt-2 overflow-x-auto rounded bg-system-red/10 p-2 text-caption-1 text-system-red">
                        {JSON.stringify(change.oldValue, null, 2)}
                      </pre>
                    )}

                    {change.type === 'added' && (
                      <pre className="mt-2 overflow-x-auto rounded bg-system-green/10 p-2 text-caption-1 text-system-green">
                        {JSON.stringify(change.newValue, null, 2)}
                      </pre>
                    )}

                    {change.type === 'modified' && (
                      <div className="mt-2 grid grid-cols-2 gap-2">
                        <pre className="overflow-x-auto rounded bg-system-red/10 p-2 text-caption-1 text-system-red">
                          {JSON.stringify(change.oldValue, null, 2)}
                        </pre>
                        <pre className="overflow-x-auto rounded bg-system-green/10 p-2 text-caption-1 text-system-green">
                          {JSON.stringify(change.newValue, null, 2)}
                        </pre>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* Version Detail Modal */}
      <Modal
        open={showVersionDetail}
        onClose={() => {
          setShowVersionDetail(false)
          setSelectedVersion(null)
        }}
        title="版本详情"
        size="lg"
      >
        {selectedVersion && (
          <div className="space-y-5">
            {/* Header Info */}
            <div className="flex items-center gap-3">
              <div className="rounded-full bg-system-blue/10 p-2">
                <GitBranch size={20} className="text-system-blue" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-title-3 text-label-primary">
                    v{selectedVersion.version}
                  </span>
                  {selectedVersion.tag && (
                    <Badge variant="primary" size="sm">
                      <Tag size={10} className="mr-1" />
                      {selectedVersion.tag}
                    </Badge>
                  )}
                  <Badge
                    variant={
                      selectedVersion.status === 'published'
                        ? 'success'
                        : selectedVersion.status === 'approved'
                        ? 'primary'
                        : selectedVersion.status === 'rejected'
                        ? 'danger'
                        : 'default'
                    }
                    size="sm"
                  >
                    {VERSION_STATUS_LABELS[selectedVersion.status] || selectedVersion.status}
                  </Badge>
                </div>
                <div className="mt-1 flex items-center gap-4 text-caption-1 text-label-tertiary">
                  <span className="flex items-center gap-1">
                    <User size={12} />
                    {selectedVersion.author?.displayName || selectedVersion.author?.username || '未知'}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock size={12} />
                    {formatRelativeTime(selectedVersion.createdAt)}
                  </span>
                </div>
              </div>
            </div>

            {/* Changelog */}
            {selectedVersion.changelog && (
              <div>
                <h4 className="text-subheadline text-label-primary mb-2">变更说明</h4>
                <div className="rounded-lg bg-fill-quaternary p-4 text-body text-label-secondary">
                  {selectedVersion.changelog}
                </div>
              </div>
            )}

            {/* Version Content */}
            <div>
              <h4 className="text-subheadline text-label-primary mb-2 flex items-center gap-2">
                <FileText size={16} className="text-label-tertiary" />
                版本内容
              </h4>
              <pre className="max-h-[400px] overflow-auto rounded-lg bg-fill-quaternary p-4 text-footnote text-label-secondary font-mono whitespace-pre-wrap">
                {selectedVersion.content
                  ? typeof selectedVersion.content === 'string'
                    ? selectedVersion.content
                    : JSON.stringify(selectedVersion.content, null, 2)
                  : '(空)'}
              </pre>
            </div>

            {/* Metadata */}
            <div className="grid grid-cols-2 gap-4 text-footnote">
              <div className="rounded-lg bg-fill-quaternary p-3">
                <p className="text-label-tertiary">内容哈希</p>
                <p className="mt-0.5 text-label-primary font-mono text-caption-1 truncate">
                  {selectedVersion.contentHash || '-'}
                </p>
              </div>
              <div className="rounded-lg bg-fill-quaternary p-3">
                <p className="text-label-tertiary">发布时间</p>
                <p className="mt-0.5 text-label-primary">
                  {selectedVersion.publishedAt
                    ? formatRelativeTime(selectedVersion.publishedAt)
                    : '未发布'}
                </p>
              </div>
            </div>

            {/* Dependencies */}
            {selectedVersion.dependencies && (
              <div>
                <h4 className="text-subheadline text-label-primary mb-2">依赖项</h4>
                <pre className="max-h-[200px] overflow-auto rounded-lg bg-fill-quaternary p-4 text-footnote text-label-secondary font-mono">
                  {typeof selectedVersion.dependencies === 'string'
                    ? selectedVersion.dependencies
                    : JSON.stringify(selectedVersion.dependencies, null, 2)}
                </pre>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  )
}
