// User Types
export interface User {
  id: string
  username: string
  email: string
  displayName?: string
  avatar?: string
  role: UserRole
  preferences: UserPreferences
  lastLoginAt?: Date
  createdAt: Date
}

export type UserRole = 'user' | 'admin' | 'super_admin'

export interface UserPreferences {
  theme?: 'light' | 'dark' | 'system'
  language?: string
  notifications?: NotificationPreferences
}

export interface NotificationPreferences {
  email?: boolean
  push?: boolean
  slack?: boolean
}

// Team Types
export interface Team {
  id: string
  name: string
  slug: string
  description?: string
  avatar?: string
  settings: TeamSettings
  members?: TeamMember[]
  _count?: {
    members?: number
    resources?: number
    workflows?: number
    environments?: number
  }
  createdAt: Date
  updatedAt: Date
}

export interface TeamMember {
  userId: string
  teamId: string
  role: TeamRole
  user?: User
  joinedAt: Date
}

export type TeamRole = 'owner' | 'admin' | 'member' | 'viewer'

export interface TeamSettings {
  visibility?: 'public' | 'private'
  defaultResourceVisibility?: 'public' | 'team' | 'private'
}

// Resource Types
export type ResourceType =
  | 'prompt'
  | 'skill'
  | 'component'
  | 'mcp'
  | 'protocol'
  | 'workflow'
  | 'template'
  | 'snippet'

export type ResourceStatus = 'draft' | 'published' | 'archived'

export type ResourceVisibility = 'public' | 'team' | 'private'

export interface Resource {
  id: string
  type: ResourceType
  name: string
  slug: string
  description?: string
  content: any
  metadata: Record<string, any>
  tags: string[]
  category?: string
  visibility: ResourceVisibility
  ownerId: string
  teamId?: string
  version: string
  status: ResourceStatus
  downloads: number
  stars: number
  isStarred?: boolean
  owner?: User
  team?: Team
  versions?: Version[]
  publishedAt?: Date
  createdAt: Date
  updatedAt: Date
}

// Version Types
export type VersionStatus = 'draft' | 'review' | 'approved' | 'published' | 'rejected'

export interface Version {
  id: string
  resourceId: string
  version: string
  tag?: string
  changelog?: string
  content: any
  contentHash?: string
  dependencies: DependencySnapshot[]
  authorId: string
  status: VersionStatus
  author?: User
  resource?: Pick<Resource, 'id' | 'name' | 'type'>
  publishedAt?: Date
  createdAt: Date
}

export interface DependencySnapshot {
  name: string
  version: string
  type: string
}

// Environment Types
export type EnvironmentStatus = 'active' | 'inactive' | 'error'

export interface Environment {
  id: string
  name: string
  displayName?: string
  description?: string
  teamId?: string
  variables: Record<string, any>
  secrets: Record<string, any>
  dependencies: Record<string, any>
  status: EnvironmentStatus
  health: HealthStatus
  team?: Pick<Team, 'id' | 'name'>
  createdAt: Date
  updatedAt: Date
}

export interface HealthStatus {
  status: 'healthy' | 'unhealthy' | 'unknown'
  checks?: HealthCheck[]
  lastChecked?: Date
}

export interface HealthCheck {
  name: string
  status: 'pass' | 'fail' | 'warn'
  message?: string
  duration?: number
}

// Workflow Types
export type WorkflowStatus = 'draft' | 'active' | 'disabled'

export type WorkflowNodeTypes =
  | 'start'
  | 'end'
  | 'task'
  | 'condition'
  | 'parallel'
  | 'loop'
  | 'subprocess'

export interface Workflow {
  id: string
  name: string
  description?: string
  version: string
  triggerConfig: Record<string, any>
  nodes: WorkflowNode[]
  edges: WorkflowEdge[]
  variables: Record<string, any>
  timeout: number
  retryPolicy: Record<string, any>
  teamId?: string
  status: WorkflowStatus
  team?: Pick<Team, 'id' | 'name'>
  executions?: WorkflowExecution[]
  createdAt: Date
  updatedAt: Date
}

export interface WorkflowNode {
  id: string
  type: WorkflowNodeTypes
  name: string
  config: Record<string, any>
  position: { x: number; y: number }
  inputs: NodePort[]
  outputs: NodePort[]
}

export interface WorkflowEdge {
  id: string
  source: string
  target: string
  condition?: string
  label?: string
}

export interface NodePort {
  id: string
  name: string
  type: string
  required?: boolean
}

export type ExecutionStatus = 'pending' | 'running' | 'success' | 'failed' | 'cancelled'

export interface WorkflowExecution {
  id: string
  workflowId: string
  status: ExecutionStatus
  trigger?: string
  inputs: Record<string, any>
  outputs: Record<string, any>
  nodeExecutions: NodeExecution[]
  logs: ExecutionLog[]
  startedAt?: Date
  finishedAt?: Date
  duration?: number
  createdAt: Date
}

export interface NodeExecution {
  nodeId: string
  status: ExecutionStatus
  startedAt?: Date
  finishedAt?: Date
  inputs: Record<string, any>
  outputs: Record<string, any>
  error?: string
  retryCount: number
}

export interface ExecutionLog {
  timestamp: Date
  level: 'info' | 'warn' | 'error' | 'debug'
  message: string
  nodeId?: string
  data?: any
}

// API Types
export interface ApiResponse<T> {
  code: 0
  message: 'success'
  data: T
  meta?: PaginationMeta
}

export interface ApiError {
  code: number
  message: string
  details?: any
}

export interface PaginationMeta {
  page: number
  pageSize: number
  total: number
  totalPages: number
}

// Query Types
// Dashboard Types
export interface DashboardStats {
  resources: { total: number; published: number; archived: number; growth: number }
  environments: { total: number; active: number; growth: number }
  workflows: { total: number; executions: number; growth: number }
  teams: { total: number; members: number; growth: number }
  versions: { total: number; todayNew: number }
}

export interface RecentActivity {
  id: string
  action: string
  resourceType: string
  resourceName: string
  userName: string
  createdAt: string
}

// Query Types
export interface PaginationQuery {
  page?: number
  pageSize?: number
}

export interface ResourceQuery extends PaginationQuery {
  type?: ResourceType
  status?: ResourceStatus
  search?: string
  tags?: string
  category?: string
}
