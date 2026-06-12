import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { Search, Layers, Grid, List, Plus } from 'lucide-react'
import { resourcesService } from '@/services/resources'
import { RESOURCE_TYPE_LABELS, RESOURCE_STATUS_LABELS, type ResourceType } from '@team-share/shared'
import { Card, Badge, Button, Input } from '@/components/ui'
import { Pagination } from '@/components/ui/Pagination'
import { EmptyState } from '@/components/common/EmptyState'
import { ErrorState } from '@/components/common/ErrorState'
import { GridSkeleton } from '@/components/common/LoadingSkeleton'
import { cn } from '@/utils/cn'

export function ResourceList() {
  const navigate = useNavigate()
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState<ResourceType | ''>('')
  const [page, setPage] = useState(1)

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['resources', search, typeFilter, page],
    queryFn: () =>
      resourcesService.findAll({
        search: search || undefined,
        type: typeFilter || undefined,
        page,
        pageSize: 12,
      }),
  })

  const resources = data?.items || []
  const meta = data?.meta

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-title-1 text-label-primary">资源管理</h1>
          <p className="mt-1 text-callout text-label-secondary">
            管理团队的公共资源资产
          </p>
        </div>
        <Button icon={<Plus size={16} />} onClick={() => navigate('/resources/new')}>
          新建资源
        </Button>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4">
        <div className="flex-1">
          <Input
            placeholder="搜索资源..."
            icon={<Search size={16} />}
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1) }}
          />
        </div>

        {/* Type Filter */}
        <div className="flex items-center gap-2">
          <Button
            variant={typeFilter === '' ? 'primary' : 'ghost'}
            size="sm"
            onClick={() => { setTypeFilter(''); setPage(1) }}
          >
            全部
          </Button>
          {(Object.entries(RESOURCE_TYPE_LABELS) as [ResourceType, string][]).map(([type, label]) => (
            <Button
              key={type}
              variant={typeFilter === type ? 'primary' : 'ghost'}
              size="sm"
              onClick={() => { setTypeFilter(type); setPage(1) }}
            >
              {label}
            </Button>
          ))}
        </div>

        {/* View Mode */}
        <div className="flex items-center gap-1 rounded-lg bg-fill-quaternary p-1">
          <button
            onClick={() => setViewMode('grid')}
            className={cn(
              'rounded-md p-1.5 transition-colors',
              viewMode === 'grid'
                ? 'bg-bg-elevated text-label-primary shadow-sm'
                : 'text-label-tertiary hover:text-label-secondary'
            )}
          >
            <Grid size={16} />
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={cn(
              'rounded-md p-1.5 transition-colors',
              viewMode === 'list'
                ? 'bg-bg-elevated text-label-primary shadow-sm'
                : 'text-label-tertiary hover:text-label-secondary'
            )}
          >
            <List size={16} />
          </button>
        </div>
      </div>

      {/* Resource Grid/List */}
      {isLoading ? (
        <GridSkeleton count={8} />
      ) : error ? (
        <ErrorState onRetry={() => refetch()} />
      ) : resources.length === 0 ? (
        <EmptyState
          icon={<Layers size={32} className="text-label-tertiary" />}
          title="暂无资源"
          description='点击"新建资源"创建第一个资源'
          action={
            <Button icon={<Plus size={16} />} onClick={() => navigate('/resources/new')}>
              新建资源
            </Button>
          }
        />
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {resources.map((resource) => (
            <ResourceCard key={resource.id} resource={resource} />
          ))}
        </div>
      ) : (
        <div className="space-y-2">
          {resources.map((resource) => (
            <ResourceListItem key={resource.id} resource={resource} />
          ))}
        </div>
      )}

      {/* Pagination */}
      {meta && meta.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-footnote text-label-tertiary">
            共 {meta.total} 项，第 {meta.page}/{meta.totalPages} 页
          </p>
          <Pagination
            page={meta.page}
            totalPages={meta.totalPages}
            onPageChange={setPage}
          />
        </div>
      )}
    </div>
  )
}

function ResourceCard({ resource }: { resource: any }) {
  const navigate = useNavigate()
  return (
    <Card hoverable className="group" onClick={() => navigate(`/resources/${resource.id}`)}>
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-system-blue/10 p-2">
            <span className="text-lg">
              {resource.type === 'prompt' && '💬'}
              {resource.type === 'skill' && '🧩'}
              {resource.type === 'component' && '📦'}
              {resource.type === 'mcp' && '🔌'}
              {resource.type === 'template' && '📄'}
              {resource.type === 'snippet' && '💻'}
            </span>
          </div>
          <div>
            <h3 className="text-headline text-label-primary group-hover:text-system-blue transition-colors">
              {resource.name}
            </h3>
            <p className="text-caption-1 text-label-tertiary">
              {RESOURCE_TYPE_LABELS[resource.type]}
            </p>
          </div>
        </div>
        <Badge
          variant={resource.status === 'published' ? 'success' : 'default'}
          dot
        >
          {RESOURCE_STATUS_LABELS[resource.status]}
        </Badge>
      </div>

      {resource.description && (
        <p className="mt-3 text-footnote text-label-secondary line-clamp-2">
          {resource.description}
        </p>
      )}

      {resource.tags && resource.tags.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1">
          {resource.tags.slice(0, 3).map((tag: string) => (
            <Badge key={tag} size="sm">
              {tag}
            </Badge>
          ))}
          {resource.tags.length > 3 && (
            <Badge size="sm">+{resource.tags.length - 3}</Badge>
          )}
        </div>
      )}

      <div className="mt-4 flex items-center justify-between border-t border-separator pt-3">
        <div className="flex items-center gap-2">
          <div className="h-6 w-6 rounded-full bg-fill-tertiary" />
          <span className="text-caption-1 text-label-secondary">
            {resource.owner?.displayName || resource.owner?.username}
          </span>
        </div>
        <div className="flex items-center gap-3 text-caption-1 text-label-tertiary">
          <span>⭐ {resource.stars}</span>
          <span>📥 {resource.downloads}</span>
        </div>
      </div>
    </Card>
  )
}

function ResourceListItem({ resource }: { resource: any }) {
  const navigate = useNavigate()
  return (
    <Card hoverable padding="sm" onClick={() => navigate(`/resources/${resource.id}`)}>
      <div className="flex items-center gap-4">
        <div className="rounded-lg bg-system-blue/10 p-2">
          <span className="text-lg">
            {resource.type === 'prompt' && '💬'}
            {resource.type === 'skill' && '🧩'}
            {resource.type === 'component' && '📦'}
            {resource.type === 'mcp' && '🔌'}
            {resource.type === 'template' && '📄'}
            {resource.type === 'snippet' && '💻'}
          </span>
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3">
            <h3 className="text-headline text-label-primary truncate">
              {resource.name}
            </h3>
            <Badge
              variant={resource.status === 'published' ? 'success' : 'default'}
              size="sm"
            >
              {RESOURCE_STATUS_LABELS[resource.status]}
            </Badge>
          </div>
          {resource.description && (
            <p className="mt-0.5 text-footnote text-label-secondary truncate">
              {resource.description}
            </p>
          )}
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            {resource.tags?.slice(0, 2).map((tag: string) => (
              <Badge key={tag} size="sm">
                {tag}
              </Badge>
            ))}
          </div>

          <div className="flex items-center gap-2 text-caption-1 text-label-tertiary">
            <span>⭐ {resource.stars}</span>
            <span>📥 {resource.downloads}</span>
          </div>

          <div className="flex items-center gap-2">
            <div className="h-6 w-6 rounded-full bg-fill-tertiary" />
            <span className="text-caption-1 text-label-secondary">
              {resource.owner?.displayName || resource.owner?.username}
            </span>
          </div>
        </div>
      </div>
    </Card>
  )
}
