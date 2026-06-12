import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { ArrowLeft, Save } from 'lucide-react'
import { resourcesService } from '@/services/resources'
import { RESOURCE_TYPE_LABELS } from '@team-share/shared'
import { Button, Input, Card } from '@/components/ui'
import { useToast } from '@/components/ui/Toast'

const resourceTypes = Object.entries(RESOURCE_TYPE_LABELS).map(([value, label]) => ({
  value,
  label,
}))

export function ResourceForm() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { success, error: showError } = useToast()
  const isEditing = !!id

  const [form, setForm] = useState({
    name: '',
    type: 'prompt',
    description: '',
    content: '',
    tags: '',
    category: '',
    visibility: 'team',
  })

  const { data: resource } = useQuery({
    queryKey: ['resource', id],
    queryFn: () => resourcesService.findById(id!),
    enabled: isEditing,
  })

  useEffect(() => {
    if (resource) {
      setForm({
        name: resource.name,
        type: resource.type,
        description: resource.description || '',
        content: typeof resource.content === 'string' ? resource.content : JSON.stringify(resource.content, null, 2),
        tags: resource.tags?.join(', ') || '',
        category: resource.category || '',
        visibility: resource.visibility,
      })
    }
  }, [resource])

  const createMutation = useMutation({
    mutationFn: (data: any) => resourcesService.create(data),
    onSuccess: (newResource) => {
      success('资源创建成功')
      queryClient.invalidateQueries({ queryKey: ['resources'] })
      navigate(`/resources/${newResource.id}`)
    },
    onError: () => showError('创建失败', '请检查表单内容后重试'),
  })

  const updateMutation = useMutation({
    mutationFn: (data: any) => resourcesService.update(id!, data),
    onSuccess: () => {
      success('资源更新成功')
      queryClient.invalidateQueries({ queryKey: ['resources'] })
      queryClient.invalidateQueries({ queryKey: ['resource', id] })
      navigate(`/resources/${id}`)
    },
    onError: () => showError('更新失败', '请检查表单内容后重试'),
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!form.name.trim()) {
      showError('请填写名称', '资源名称不能为空')
      return
    }

    let content: any = undefined
    if (form.content.trim()) {
      try {
        content = JSON.parse(form.content)
      } catch {
        showError('内容格式错误', 'JSON 格式不正确，请检查后重试')
        return
      }
    }

    const data = {
      ...form,
      tags: form.tags
        .split(',')
        .map((tag) => tag.trim())
        .filter(Boolean),
      content,
    }

    if (isEditing) {
      updateMutation.mutate(data)
    } else {
      createMutation.mutate(data)
    }
  }

  const isLoading = createMutation.isPending || updateMutation.isPending

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft size={20} />
          </Button>
          <h1 className="text-title-1 text-label-primary">
            {isEditing ? '编辑资源' : '创建资源'}
          </h1>
        </div>
        <Button
          icon={<Save size={16} />}
          loading={isLoading}
          onClick={handleSubmit}
        >
          {isEditing ? '保存' : '创建'}
        </Button>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <h3 className="text-headline text-label-primary">基本信息</h3>
          <div className="mt-4 space-y-4">
            <Input
              label="资源名称"
              placeholder="请输入资源名称"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
            />

            <div>
              <label className="text-caption-1 text-label-secondary">资源类型</label>
              <select
                value={form.type}
                onChange={(e) => setForm({ ...form, type: e.target.value })}
                className="mt-1.5 w-full rounded-lg border border-separator bg-bg-primary px-3 py-2 text-subheadline text-label-primary"
              >
                {resourceTypes.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>

            <Input
              label="描述"
              placeholder="请输入资源描述"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />

            <div className="grid grid-cols-2 gap-4">
              <Input
                label="分类"
                placeholder="请输入分类"
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
              />

              <div>
                <label className="text-caption-1 text-label-secondary">可见性</label>
                <select
                  value={form.visibility}
                  onChange={(e) => setForm({ ...form, visibility: e.target.value })}
                  className="mt-1.5 w-full rounded-lg border border-separator bg-bg-primary px-3 py-2 text-subheadline text-label-primary"
                >
                  <option value="public">公开</option>
                  <option value="team">团队</option>
                  <option value="private">私有</option>
                </select>
              </div>
            </div>

            <Input
              label="标签"
              placeholder="多个标签用逗号分隔"
              value={form.tags}
              onChange={(e) => setForm({ ...form, tags: e.target.value })}
              helperText="例如: api, template, generator"
            />
          </div>
        </Card>

        <Card>
          <h3 className="text-headline text-label-primary">内容</h3>
          <div className="mt-4">
            <textarea
              value={form.content}
              onChange={(e) => setForm({ ...form, content: e.target.value })}
              placeholder='请输入资源内容（JSON 格式）&#10;&#10;示例:&#10;{&#10;  "prompt": "你是一个...",&#10;  "model": "gpt-4"&#10;}'
              rows={15}
              className="w-full rounded-lg border border-separator bg-bg-primary p-4 font-mono text-footnote text-label-primary placeholder:text-label-tertiary"
            />
          </div>
        </Card>
      </form>
    </div>
  )
}
