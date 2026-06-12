// API Endpoints
export const API_ENDPOINTS = {
  AUTH: {
    REGISTER: '/auth/register',
    LOGIN: '/auth/login',
    ME: '/auth/me',
    CHANGE_PASSWORD: '/auth/change-password',
  },
  USERS: {
    BASE: '/users',
    ME: '/users/me',
    BY_ID: (id: string) => `/users/${id}`,
    RESOURCES: (id: string) => `/users/${id}/resources`,
  },
  TEAMS: {
    BASE: '/teams',
    BY_ID: (id: string) => `/teams/${id}`,
    MEMBERS: (id: string) => `/teams/${id}/members`,
    MEMBER: (teamId: string, userId: string) => `/teams/${teamId}/members/${userId}`,
  },
  RESOURCES: {
    BASE: '/resources',
    BY_ID: (id: string) => `/resources/${id}`,
    STAR: (id: string) => `/resources/${id}/star`,
    PUBLISH: (id: string) => `/resources/${id}/publish`,
    VERSIONS: (id: string) => `/resources/${id}/versions`,
  },
  ENVIRONMENTS: {
    BASE: '/environments',
    BY_ID: (id: string) => `/environments/${id}`,
    SNAPSHOT: (id: string) => `/environments/${id}/snapshot`,
    HEALTH: (id: string) => `/environments/${id}/health`,
  },
  WORKFLOWS: {
    BASE: '/workflows',
    BY_ID: (id: string) => `/workflows/${id}`,
    EXECUTE: (id: string) => `/workflows/${id}/execute`,
    EXECUTIONS: (id: string) => `/workflows/${id}/executions`,
    EXECUTION: (workflowId: string, executionId: string) =>
      `/workflows/${workflowId}/executions/${executionId}`,
  },
  MONITORING: {
    DASHBOARD: '/monitoring/dashboard',
    STATS: '/monitoring/stats',
    RESOURCES: '/monitoring/resources',
    WORKFLOWS: '/monitoring/workflows',
    ACTIVITY: '/monitoring/activity',
    ACTIVITIES: '/monitoring/activities',
    HEALTH: '/monitoring/health',
  },
  NOTIFICATIONS: {
    BASE: '/notifications',
    READ_ALL: '/notifications/read-all',
    READ: (id: string) => `/notifications/${id}/read`,
  },
} as const

// Resource Type Labels
export const RESOURCE_TYPE_LABELS: Record<string, string> = {
  prompt: '提示词',
  skill: '技能',
  component: '组件',
  mcp: 'MCP',
  protocol: '协议',
  workflow: '工作流',
  template: '模板',
  snippet: '代码片段',
}

// Resource Type Icons (Lucide icon names)
export const RESOURCE_TYPE_ICONS: Record<string, string> = {
  prompt: 'message-square',
  skill: 'puzzle',
  component: 'box',
  mcp: 'plug',
  protocol: 'file-code',
  workflow: 'git-branch',
  template: 'layout-template',
  snippet: 'code',
}

// Status Labels
export const RESOURCE_STATUS_LABELS: Record<string, string> = {
  draft: '草稿',
  published: '已发布',
  archived: '已归档',
}

export const VERSION_STATUS_LABELS: Record<string, string> = {
  draft: '草稿',
  review: '审核中',
  approved: '已批准',
  published: '已发布',
  rejected: '已拒绝',
}

export const EXECUTION_STATUS_LABELS: Record<string, string> = {
  pending: '等待中',
  running: '运行中',
  success: '成功',
  failed: '失败',
  cancelled: '已取消',
}

// Role Labels
export const TEAM_ROLE_LABELS: Record<string, string> = {
  owner: '所有者',
  admin: '管理员',
  member: '成员',
  viewer: '查看者',
}

// Pagination Defaults
export const DEFAULT_PAGE = 1
export const DEFAULT_PAGE_SIZE = 20
export const MAX_PAGE_SIZE = 100
