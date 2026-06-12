import { useState, useCallback, useMemo, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  ReactFlow,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  type Node,
  type Edge,
  type Connection,
  BackgroundVariant,
} from 'reactflow'
import 'reactflow/dist/style.css'
import {
  ArrowLeft,
  Play,
  Save,
  Trash2,
  Zap,
  GitBranch,
  Clock,
  CheckCircle,
  XCircle,
  Loader,
} from 'lucide-react'
import { api } from '@/services/api'
import { Button, Badge, Input, Modal } from '@/components/ui'
import { useToast } from '@/components/ui/Toast'
import { formatRelativeTime } from '@team-share/shared'

// Custom node types
function StartNode({ data }: { data: any }) {
  return (
    <div className="rounded-full bg-system-green px-4 py-2 text-white shadow-lg">
      <div className="text-footnote font-medium">{data.label || '开始'}</div>
    </div>
  )
}

function EndNode({ data }: { data: any }) {
  return (
    <div className="rounded-full bg-system-red px-4 py-2 text-white shadow-lg">
      <div className="text-footnote font-medium">{data.label || '结束'}</div>
    </div>
  )
}

function TaskNode({ data }: { data: any }) {
  return (
    <div className="rounded-lg bg-bg-elevated px-4 py-3 shadow-lg border border-separator">
      <div className="flex items-center gap-2">
        <Zap size={14} className="text-system-blue" />
        <span className="text-footnote font-medium text-label-primary">
          {data.label || '任务'}
        </span>
      </div>
      {data.command && (
        <div className="mt-1 text-caption-2 text-label-tertiary font-mono truncate max-w-[180px]">
          {data.command}
        </div>
      )}
    </div>
  )
}

function ConditionNode({ data }: { data: any }) {
  return (
    <div className="rounded-lg bg-system-orange/10 px-4 py-3 shadow-lg border border-system-orange/20">
      <div className="flex items-center gap-2">
        <GitBranch size={14} className="text-system-orange" />
        <span className="text-footnote font-medium text-label-primary">
          {data.label || '条件'}
        </span>
      </div>
      {data.expression && (
        <div className="mt-1 text-caption-2 text-label-tertiary font-mono truncate max-w-[180px]">
          {data.expression}
        </div>
      )}
    </div>
  )
}

const nodeTypes = {
  start: StartNode,
  end: EndNode,
  task: TaskNode,
  condition: ConditionNode,
}

const NODE_TEMPLATES = [
  { type: 'start', label: '开始', icon: CheckCircle, color: 'text-system-green' },
  { type: 'end', label: '结束', icon: XCircle, color: 'text-system-red' },
  { type: 'task', label: '任务', icon: Zap, color: 'text-system-blue' },
  { type: 'condition', label: '条件', icon: GitBranch, color: 'text-system-orange' },
]

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: typeof CheckCircle }> = {
  success: { label: '成功', color: 'text-system-green', icon: CheckCircle },
  failed: { label: '失败', color: 'text-system-red', icon: XCircle },
  running: { label: '运行中', color: 'text-system-blue', icon: Loader },
  pending: { label: '等待中', color: 'text-label-tertiary', icon: Clock },
  cancelled: { label: '已取消', color: 'text-label-tertiary', icon: XCircle },
}

export function WorkflowEditor() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { success, error: showError } = useToast()
  const [showExecutions, setShowExecutions] = useState(false)
  const [nodeLabel, setNodeLabel] = useState('')
  const [nodeCommand, setNodeCommand] = useState('')
  const [nodeExpression, setNodeExpression] = useState('')

  const { data: workflow, isLoading } = useQuery({
    queryKey: ['workflow', id],
    queryFn: () => api.get<any>(`/workflows/${id}`),
    enabled: !!id,
  })

  const { data: executions = [] } = useQuery({
    queryKey: ['workflow-executions', id],
    queryFn: () => api.get<any[]>(`/workflows/${id}/executions`),
    enabled: !!id,
  })

  const initialNodes: Node[] = useMemo(() => {
    if (!workflow?.nodes) return []
    return workflow.nodes.map((node: any) => ({
      id: node.id,
      type: node.type,
      position: node.position || { x: 0, y: 0 },
      data: { label: node.name, ...node.config },
    }))
  }, [workflow])

  const initialEdges: Edge[] = useMemo(() => {
    if (!workflow?.edges) return []
    return workflow.edges.map((edge: any) => ({
      id: edge.id,
      source: edge.source,
      target: edge.target,
      label: edge.label,
      animated: true,
    }))
  }, [workflow])

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes)
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges)
  const [selectedNode, setSelectedNode] = useState<Node | null>(null)

  // Sync initial data
  useEffect(() => {
    if (initialNodes.length > 0) setNodes(initialNodes)
    if (initialEdges.length > 0) setEdges(initialEdges)
  }, [initialNodes, initialEdges])

  // Sync selected node form
  useEffect(() => {
    if (selectedNode) {
      setNodeLabel(selectedNode.data.label || '')
      setNodeCommand(selectedNode.data.command || '')
      setNodeExpression(selectedNode.data.expression || '')
    }
  }, [selectedNode])

  const onConnect = useCallback(
    (params: Connection) => {
      setEdges((eds) => addEdge({ ...params, animated: true }, eds))
    },
    [setEdges]
  )

  const onNodeClick = useCallback((_: any, node: Node) => {
    setSelectedNode(node)
  }, [])

  const onPaneClick = useCallback(() => {
    setSelectedNode(null)
  }, [])

  const saveMutation = useMutation({
    mutationFn: () => {
      const workflowNodes = nodes.map((n) => ({
        id: n.id,
        type: n.type || 'task',
        name: n.data.label || n.id,
        config: {
          command: n.data.command,
          script: n.data.script,
          expression: n.data.expression,
        },
        position: n.position,
      }))

      const workflowEdges = edges.map((e) => ({
        id: e.id,
        source: e.source,
        target: e.target,
        label: e.label,
        condition: e.label,
      }))

      return api.put(`/workflows/${id}`, {
        nodes: workflowNodes,
        edges: workflowEdges,
      })
    },
    onSuccess: () => {
      success('工作流已保存')
      queryClient.invalidateQueries({ queryKey: ['workflow', id] })
    },
    onError: () => showError('保存失败', '请稍后重试'),
  })

  const executeMutation = useMutation({
    mutationFn: () => api.post(`/workflows/${id}/execute`),
    onSuccess: () => {
      success('工作流已开始执行')
      queryClient.invalidateQueries({ queryKey: ['workflow-executions', id] })
    },
    onError: () => showError('执行失败', '请稍后重试'),
  })

  const addNode = (type: string) => {
    const newNode: Node = {
      id: `node_${Date.now()}`,
      type,
      position: { x: 250, y: (nodes.length + 1) * 120 },
      data: {
        label: type === 'start' ? '开始' : type === 'end' ? '结束' : type === 'task' ? '新任务' : '新条件',
      },
    }
    setNodes((nds) => [...nds, newNode])
  }

  const deleteNode = () => {
    if (!selectedNode) return
    setNodes((nds) => nds.filter((n) => n.id !== selectedNode.id))
    setEdges((eds) => eds.filter((e) => e.source !== selectedNode.id && e.target !== selectedNode.id))
    setSelectedNode(null)
  }

  const updateNodeData = () => {
    if (!selectedNode) return
    setNodes((nds) =>
      nds.map((n) => {
        if (n.id === selectedNode.id) {
          return {
            ...n,
            data: {
              ...n.data,
              label: nodeLabel,
              command: nodeCommand,
              expression: nodeExpression,
            },
          }
        }
        return n
      })
    )
    setSelectedNode(null)
  }

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="text-label-tertiary">加载中...</div>
      </div>
    )
  }

  return (
    <div className="flex h-[calc(100vh-120px)] flex-col">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-separator px-4 py-3">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/workflows')}>
            <ArrowLeft size={20} />
          </Button>
          <div>
            <h1 className="text-headline text-label-primary">
              {workflow?.name || '工作流编辑器'}
            </h1>
            <p className="text-caption-1 text-label-tertiary">
              {nodes.length} 个节点 · {edges.length} 条连线
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            icon={<Clock size={16} />}
            onClick={() => setShowExecutions(true)}
          >
            执行历史
          </Button>
          <Button
            variant="outline"
            icon={<Play size={16} />}
            onClick={() => executeMutation.mutate()}
            loading={executeMutation.isPending}
          >
            执行
          </Button>
          <Button
            icon={<Save size={16} />}
            onClick={() => saveMutation.mutate()}
            loading={saveMutation.isPending}
          >
            保存
          </Button>
        </div>
      </div>

      {/* Editor */}
      <div className="flex flex-1">
        {/* Node Palette */}
        <div className="w-48 border-r border-separator p-3">
          <h3 className="text-caption-1 font-medium text-label-secondary">节点库</h3>
          <div className="mt-3 space-y-2">
            {NODE_TEMPLATES.map((template) => (
              <button
                key={template.type}
                onClick={() => addNode(template.type)}
                className="flex w-full items-center gap-2 rounded-lg p-2 text-footnote text-label-primary hover:bg-fill-quaternary transition-colors"
              >
                <template.icon size={14} className={template.color} />
                {template.label}
              </button>
            ))}
          </div>

          {/* Tips */}
          <div className="mt-6 rounded-lg bg-fill-quaternary p-3">
            <h4 className="text-caption-1 font-medium text-label-secondary">操作提示</h4>
            <ul className="mt-2 space-y-1 text-caption-2 text-label-tertiary">
              <li>点击节点选中</li>
              <li>拖拽端口连线</li>
              <li>从左侧添加节点</li>
              <li>右侧面板编辑属性</li>
            </ul>
          </div>
        </div>

        {/* Flow Canvas */}
        <div className="flex-1">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onNodeClick={onNodeClick}
            onPaneClick={onPaneClick}
            nodeTypes={nodeTypes}
            fitView
          >
            <Controls />
            <Background variant={BackgroundVariant.Dots} gap={12} size={1} />
          </ReactFlow>
        </div>

        {/* Properties Panel */}
        {selectedNode && (
          <div className="w-72 border-l border-separator p-4">
            <div className="flex items-center justify-between">
              <h3 className="text-subheadline font-medium text-label-primary">节点属性</h3>
              <button
                onClick={deleteNode}
                className="rounded p-1 text-label-tertiary hover:bg-fill-quaternary hover:text-system-red"
                title="删除节点"
              >
                <Trash2 size={14} />
              </button>
            </div>
            <div className="mt-4 space-y-3">
              <div>
                <label className="text-caption-2 text-label-tertiary">ID</label>
                <p className="text-footnote text-label-primary font-mono">{selectedNode.id}</p>
              </div>
              <div>
                <label className="text-caption-2 text-label-tertiary">类型</label>
                <p className="text-footnote text-label-primary capitalize">{selectedNode.type}</p>
              </div>
              <Input
                label="名称"
                value={nodeLabel}
                onChange={(e) => setNodeLabel(e.target.value)}
              />
              {(selectedNode.type === 'task') && (
                <Input
                  label="命令"
                  value={nodeCommand}
                  onChange={(e) => setNodeCommand(e.target.value)}
                  placeholder="要执行的命令"
                />
              )}
              {(selectedNode.type === 'condition') && (
                <Input
                  label="表达式"
                  value={nodeExpression}
                  onChange={(e) => setNodeExpression(e.target.value)}
                  placeholder="条件表达式"
                />
              )}
              <Button
                size="sm"
                className="w-full"
                onClick={updateNodeData}
              >
                应用更改
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Executions Modal */}
      <Modal
        open={showExecutions}
        onClose={() => setShowExecutions(false)}
        title="执行历史"
      >
        <div className="max-h-[400px] space-y-2 overflow-y-auto">
          {executions.length === 0 ? (
            <p className="py-8 text-center text-label-tertiary">暂无执行记录</p>
          ) : (
            executions.map((exec: any) => {
              const statusConf = STATUS_CONFIG[exec.status] || STATUS_CONFIG.pending
              const StatusIcon = statusConf.icon

              return (
                <div
                  key={exec.id}
                  className="rounded-lg border border-separator p-3"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <StatusIcon size={16} className={statusConf.color} />
                      <Badge
                        variant={
                          exec.status === 'success' ? 'success' :
                          exec.status === 'failed' ? 'danger' :
                          exec.status === 'running' ? 'primary' : 'default'
                        }
                        size="sm"
                      >
                        {statusConf.label}
                      </Badge>
                      {exec.trigger && (
                        <span className="text-caption-2 text-label-tertiary">
                          触发: {exec.trigger}
                        </span>
                      )}
                    </div>
                    <span className="text-caption-1 text-label-tertiary">
                      {formatRelativeTime(exec.createdAt)}
                    </span>
                  </div>
                  {exec.logs && exec.logs.length > 0 && (
                    <div className="mt-2 max-h-[120px] overflow-y-auto rounded bg-fill-quaternary p-2">
                      {exec.logs.slice(-5).map((log: any, i: number) => (
                        <div key={i} className="text-caption-2 text-label-tertiary font-mono">
                          {log.message}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )
            })
          )}
        </div>
      </Modal>
    </div>
  )
}
