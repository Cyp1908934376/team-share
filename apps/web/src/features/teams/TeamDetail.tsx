import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import type { Team } from '@team-share/shared'
import {
  ArrowLeft,
  Users,
  Layers,
  Workflow,
  UserPlus,
  Crown,
  Shield,
  User as UserIcon,
  Eye,
  Trash2,
} from 'lucide-react'
import { api } from '@/services/api'
import { Card, Badge, Button, Input, Modal } from '@/components/ui'
import { useToast } from '@/components/ui/Toast'
import { useAuthStore } from '@/stores/authStore'
import { cn } from '@/utils/cn'

const ROLE_CONFIG: Record<string, { label: string; icon: typeof Crown; color: string }> = {
  owner: { label: '所有者', icon: Crown, color: 'text-system-yellow' },
  admin: { label: '管理员', icon: Shield, color: 'text-system-blue' },
  member: { label: '成员', icon: UserIcon, color: 'text-system-green' },
  viewer: { label: '观察者', icon: Eye, color: 'text-label-tertiary' },
}

export function TeamDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { success, error } = useToast()
  const { user: currentUser } = useAuthStore()
  const [showAddMember, setShowAddMember] = useState(false)
  const [newMemberId, setNewMemberId] = useState('')
  const [newMemberRole, setNewMemberRole] = useState('member')

  const { data: team, isLoading } = useQuery<Team>({
    queryKey: ['team', id],
    queryFn: () => api.get(`/teams/${id}`),
    enabled: !!id,
  })

  const removeMemberMutation = useMutation({
    mutationFn: (userId: string) => api.delete(`/teams/${id}/members/${userId}`),
    onSuccess: () => {
      success('成员已移除')
      queryClient.invalidateQueries({ queryKey: ['team', id] })
    },
    onError: () => error('移除失败', '请稍后重试'),
  })

  const addMemberMutation = useMutation({
    mutationFn: (data: { userId: string; role: string }) =>
      api.post(`/teams/${id}/members`, data),
    onSuccess: () => {
      success('成员已添加')
      queryClient.invalidateQueries({ queryKey: ['team', id] })
      setShowAddMember(false)
      setNewMemberId('')
    },
    onError: () => error('添加失败', '请检查用户 ID 是否正确'),
  })

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-label-tertiary">加载中...</div>
      </div>
    )
  }

  if (!team) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <p className="text-headline text-label-secondary">团队不存在</p>
        <Button variant="ghost" className="mt-4" onClick={() => navigate('/teams')}>
          返回团队列表
        </Button>
      </div>
    )
  }

  const isOwnerOrAdmin = team.members?.some(
    (m: any) => m.userId === currentUser?.id && ['owner', 'admin'].includes(m.role)
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate('/teams')}
          className="rounded-lg p-2 text-label-secondary transition-colors hover:bg-fill-quaternary"
        >
          <ArrowLeft size={20} />
        </button>
        <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-system-blue/10 text-title-2 text-system-blue">
          {team.name[0]?.toUpperCase()}
        </div>
        <div className="flex-1">
          <h1 className="text-title-1 text-label-primary">{team.name}</h1>
          {team.description && (
            <p className="mt-1 text-callout text-label-secondary">{team.description}</p>
          )}
        </div>
        {isOwnerOrAdmin && (
          <Button
            variant="outline"
            icon={<UserPlus size={16} />}
            onClick={() => setShowAddMember(true)}
          >
            添加成员
          </Button>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: '成员', value: team._count?.members || 0, icon: Users, color: 'bg-system-blue/10 text-system-blue' },
          { label: '资源', value: team._count?.resources || 0, icon: Layers, color: 'bg-system-green/10 text-system-green' },
          { label: '工作流', value: team._count?.workflows || 0, icon: Workflow, color: 'bg-system-purple/10 text-system-purple' },
        ].map((stat) => (
          <Card key={stat.label}>
            <div className="flex items-center gap-3">
              <div className={cn('rounded-lg p-2', stat.color)}>
                <stat.icon size={20} />
              </div>
              <div>
                <p className="text-title-2 text-label-primary">{stat.value}</p>
                <p className="text-caption-1 text-label-tertiary">{stat.label}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Members */}
      <Card>
        <div className="flex items-center justify-between">
          <h3 className="text-headline text-label-primary">团队成员</h3>
          <span className="text-footnote text-label-tertiary">
            {team.members?.length || 0} 人
          </span>
        </div>

        <div className="mt-4 space-y-2">
          {team.members?.map((member: any) => {
            const roleConfig = ROLE_CONFIG[member.role] || ROLE_CONFIG.member
            const RoleIcon = roleConfig.icon
            const isCurrentUser = member.userId === currentUser?.id

            return (
              <div
                key={member.id}
                className="flex items-center justify-between rounded-lg border border-separator p-3"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-fill-tertiary text-subheadline text-label-secondary">
                    {member.user?.displayName?.[0] || member.user?.username?.[0]?.toUpperCase() || '?'}
                  </div>
                  <div>
                    <p className="text-subheadline text-label-primary">
                      {member.user?.displayName || member.user?.username}
                      {isCurrentUser && (
                        <span className="ml-2 text-caption-1 text-label-tertiary">(你)</span>
                      )}
                    </p>
                    <p className="text-caption-1 text-label-tertiary">
                      @{member.user?.username}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Badge variant={member.role === 'owner' ? 'warning' : member.role === 'admin' ? 'primary' : 'default'}>
                    <RoleIcon size={12} className={cn('mr-1', roleConfig.color)} />
                    {roleConfig.label}
                  </Badge>

                  {isOwnerOrAdmin && !isCurrentUser && member.role !== 'owner' && (
                    <button
                      onClick={() => removeMemberMutation.mutate(member.userId)}
                      className="rounded-lg p-1.5 text-label-tertiary transition-colors hover:bg-system-red/10 hover:text-system-red"
                      title="移除成员"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </Card>

      {/* Add Member Modal */}
      <Modal
        open={showAddMember}
        onClose={() => setShowAddMember(false)}
        title="添加成员"
      >
        <div className="space-y-4">
          <Input
            label="用户 ID"
            value={newMemberId}
            onChange={(e) => setNewMemberId(e.target.value)}
            placeholder="输入用户 ID"
          />
          <div>
            <label className="text-caption-1 text-label-secondary">角色</label>
            <div className="mt-2 flex gap-2">
              {Object.entries(ROLE_CONFIG)
                .filter(([key]) => key !== 'owner')
                .map(([key, config]) => (
                  <button
                    key={key}
                    onClick={() => setNewMemberRole(key)}
                    className={cn(
                      'flex items-center gap-1.5 rounded-lg border-2 px-3 py-1.5 text-subheadline transition-colors',
                      newMemberRole === key
                        ? 'border-system-blue bg-system-blue/5'
                        : 'border-separator hover:border-label-tertiary'
                    )}
                  >
                    <config.icon size={14} className={config.color} />
                    {config.label}
                  </button>
                ))}
            </div>
          </div>
          <div className="flex justify-end gap-3">
            <Button variant="ghost" onClick={() => setShowAddMember(false)}>
              取消
            </Button>
            <Button
              onClick={() => addMemberMutation.mutate({ userId: newMemberId, role: newMemberRole })}
              disabled={!newMemberId || addMemberMutation.isPending}
            >
              {addMemberMutation.isPending ? '添加中...' : '添加'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
