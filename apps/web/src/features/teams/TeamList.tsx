import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, Users, Layers, Search } from 'lucide-react'
import { api } from '@/services/api'
import { Card, Button, Input, Modal } from '@/components/ui'
import { useToast } from '@/components/ui/Toast'
import { EmptyState } from '@/components/common/EmptyState'
import { ErrorState } from '@/components/common/ErrorState'
import { GridSkeleton } from '@/components/common/LoadingSkeleton'
import { API_ENDPOINTS } from '@team-share/shared'

interface Team {
  id: string
  name: string
  slug: string
  description: string | null
  avatarUrl: string | null
  _count: { members: number; resources: number }
  createdAt: string
}

export function TeamList() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { success, error } = useToast()
  const [showCreate, setShowCreate] = useState(false)
  const [newTeam, setNewTeam] = useState({ name: '', description: '' })
  const [search, setSearch] = useState('')

  const { data: teams, isLoading, error: queryError, refetch } = useQuery({
    queryKey: ['teams'],
    queryFn: () => api.get(API_ENDPOINTS.TEAMS.BASE),
  })

  const createMutation = useMutation({
    mutationFn: (data: { name: string; description: string }) =>
      api.post(API_ENDPOINTS.TEAMS.BASE, data),
    onSuccess: () => {
      success('团队已创建')
      queryClient.invalidateQueries({ queryKey: ['teams'] })
      setShowCreate(false)
      setNewTeam({ name: '', description: '' })
    },
    onError: () => error('创建失败', '请稍后重试'),
  })

  const filteredTeams = (Array.isArray(teams) ? teams : []).filter((team: Team) =>
    team.name.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-title-1 text-label-primary">团队管理</h1>
          <p className="mt-1 text-callout text-label-secondary">
            管理你的团队和成员
          </p>
        </div>
        <Button icon={<Plus size={16} />} onClick={() => setShowCreate(true)}>
          创建团队
        </Button>
      </div>

      {/* Search */}
      <Input
        placeholder="搜索团队..."
        icon={<Search size={16} />}
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      {/* Team Grid */}
      {isLoading ? (
        <GridSkeleton count={6} />
      ) : queryError ? (
        <ErrorState onRetry={() => refetch()} />
      ) : filteredTeams.length === 0 ? (
        <EmptyState
          icon={<Users size={32} className="text-label-tertiary" />}
          title="暂无团队"
          description='点击"创建团队"开始'
          action={<Button icon={<Plus size={16} />} onClick={() => setShowCreate(true)}>创建团队</Button>}
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredTeams.map((team: Team) => (
            <Card
              key={team.id}
              hoverable
              className="cursor-pointer"
              onClick={() => navigate(`/teams/${team.id}`)}
            >
              <div className="flex items-start gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-system-blue/10 text-title-3 text-system-blue">
                  {team.name[0]?.toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-headline text-label-primary truncate">
                    {team.name}
                  </h3>
                  {team.description && (
                    <p className="mt-0.5 text-footnote text-label-secondary line-clamp-2">
                      {team.description}
                    </p>
                  )}
                </div>
              </div>

              <div className="mt-4 flex items-center justify-between border-t border-separator pt-3">
                <div className="flex items-center gap-3 text-caption-1 text-label-tertiary">
                  <span className="flex items-center gap-1">
                    <Users size={14} /> {team._count.members} 成员
                  </span>
                  <span className="flex items-center gap-1">
                    <Layers size={14} /> {team._count.resources} 资源
                  </span>
                </div>
                <span className="text-caption-2 text-label-quaternary">
                  {new Date(team.createdAt).toLocaleDateString('zh-CN')}
                </span>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Create Team Modal */}
      <Modal
        open={showCreate}
        onClose={() => setShowCreate(false)}
        title="创建团队"
      >
        <div className="space-y-4">
          <Input
            label="团队名称"
            value={newTeam.name}
            onChange={(e) => setNewTeam((prev) => ({ ...prev, name: e.target.value }))}
            placeholder="输入团队名称"
          />
          <Input
            label="描述"
            value={newTeam.description}
            onChange={(e) => setNewTeam((prev) => ({ ...prev, description: e.target.value }))}
            placeholder="输入团队描述（可选）"
          />
          <div className="flex justify-end gap-3">
            <Button variant="ghost" onClick={() => setShowCreate(false)}>
              取消
            </Button>
            <Button
              onClick={() => createMutation.mutate(newTeam)}
              disabled={!newTeam.name || createMutation.isPending}
            >
              {createMutation.isPending ? '创建中...' : '创建'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
