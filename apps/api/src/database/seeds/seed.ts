import { PrismaClient } from '@prisma/client'
import * as bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...\n')

  // ==========================================
  // USERS
  // ==========================================
  const passwords = {
    admin: await bcrypt.hash('admin123', 10),
    zhangsan: await bcrypt.hash('zhangsan123', 10),
    lisi: await bcrypt.hash('lisi123', 10),
    wangwu: await bcrypt.hash('wangwu123', 10),
    zhaoliu: await bcrypt.hash('zhaoliu123', 10),
  }

  const admin = await prisma.user.upsert({
    where: { email: 'admin@teamshare.com' },
    update: {},
    create: {
      username: 'admin', email: 'admin@teamshare.com',
      displayName: '系统管理员', passwordHash: passwords.admin, role: 'admin',
    },
  })
  console.log('👤', admin.displayName, '- admin@teamshare.com / admin123')

  const zhangsan = await prisma.user.upsert({
    where: { email: 'zhangsan@teamshare.com' },
    update: {},
    create: {
      username: 'zhangsan', email: 'zhangsan@teamshare.com',
      displayName: '张三', passwordHash: passwords.zhangsan, role: 'user',
      preferences: { theme: 'light', language: 'zh-CN', notifications: { email: true, browser: true } },
    },
  })
  console.log('👤', zhangsan.displayName, '- zhangsan@teamshare.com / zhangsan123')

  const lisi = await prisma.user.upsert({
    where: { email: 'lisi@teamshare.com' },
    update: {},
    create: {
      username: 'lisi', email: 'lisi@teamshare.com',
      displayName: '李四', passwordHash: passwords.lisi, role: 'user',
      preferences: { theme: 'dark', language: 'zh-CN' },
    },
  })
  console.log('👤', lisi.displayName, '- lisi@teamshare.com / lisi123')

  const wangwu = await prisma.user.upsert({
    where: { email: 'wangwu@teamshare.com' },
    update: {},
    create: {
      username: 'wangwu', email: 'wangwu@teamshare.com',
      displayName: '王五', passwordHash: passwords.wangwu, role: 'user',
    },
  })
  console.log('👤', wangwu.displayName, '- wangwu@teamshare.com / wangwu123')

  const zhaoliu = await prisma.user.upsert({
    where: { email: 'zhaoliu@teamshare.com' },
    update: {},
    create: {
      username: 'zhaoliu', email: 'zhaoliu@teamshare.com',
      displayName: '赵六', passwordHash: passwords.zhaoliu, role: 'user',
    },
  })
  console.log('👤', zhaoliu.displayName, '- zhaoliu@teamshare.com / zhaoliu123')

  // ==========================================
  // TEAMS
  // ==========================================
  const frontendTeam = await prisma.team.upsert({
    where: { slug: 'frontend-team' },
    update: {},
    create: {
      name: '前端团队', slug: 'frontend-team', description: '负责前端架构、组件库开发与用户体验优化',
      members: {
        create: [
          { userId: admin.id, role: 'owner' },
          { userId: zhangsan.id, role: 'admin' },
          { userId: lisi.id, role: 'member' },
        ],
      },
    },
  })
  console.log('👥', frontendTeam.name)

  const backendTeam = await prisma.team.upsert({
    where: { slug: 'backend-team' },
    update: {},
    create: {
      name: '后端团队', slug: 'backend-team', description: '负责 API 服务、数据库设计与系统架构',
      members: {
        create: [
          { userId: admin.id, role: 'owner' },
          { userId: wangwu.id, role: 'admin' },
          { userId: zhaoliu.id, role: 'member' },
        ],
      },
    },
  })
  console.log('👥', backendTeam.name)

  const aiTeam = await prisma.team.upsert({
    where: { slug: 'ai-team' },
    update: {},
    create: {
      name: 'AI 创新团队', slug: 'ai-team', description: '探索 AI 技术应用，管理提示词和 AI 工作流',
      members: {
        create: [
          { userId: zhangsan.id, role: 'owner' },
          { userId: admin.id, role: 'admin' },
          { userId: lisi.id, role: 'member' },
          { userId: wangwu.id, role: 'member' },
        ],
      },
    },
  })
  console.log('👥', aiTeam.name)

  // ==========================================
  // RESOURCES - 8 types, multiple each
  // ==========================================
  const resourceData = [
    // --- PROMPTS (提示词) ---
    {
      type: 'prompt', name: 'API 文档生成提示词', slug: 'api-doc-generator',
      description: '根据接口定义自动生成标准化 API 文档的提示词模板，支持 RESTful 和 GraphQL 两种风格',
      content: { template: '请为以下 {apiType} API 生成详细的文档...', variables: ['apiName', 'endpoints', 'parameters'], model: 'claude-opus-4-8', temperature: 0.3 },
      tags: ['api', 'documentation', 'generator'], category: '开发工具',
      visibility: 'team', ownerId: admin.id, teamId: frontendTeam.id,
      status: 'published', publishedAt: new Date('2026-06-01'), starCount: 42, downloads: 156,
    },
    {
      type: 'prompt', name: '代码审查助手', slug: 'code-review-assistant',
      description: '帮助团队进行代码审查的提示词，覆盖安全性、性能、可维护性等多个维度',
      content: { template: '请审查以下 {language} 代码，重点关注...', variables: ['language', 'code', 'reviewFocus'], model: 'claude-sonnet-4-6', temperature: 0.2 },
      tags: ['code-review', 'quality', 'security'], category: '开发工具',
      visibility: 'team', ownerId: zhangsan.id, teamId: frontendTeam.id,
      status: 'published', publishedAt: new Date('2026-05-28'), starCount: 38, downloads: 203,
    },
    {
      type: 'prompt', name: '需求分析助手', slug: 'requirement-analyst',
      description: '将用户故事和需求描述转化为结构化的技术规格说明',
      content: { template: '分析以下需求：{requirement}，输出结构化的技术规格...', variables: ['requirement', 'context'], model: 'claude-opus-4-8', temperature: 0.4 },
      tags: ['requirement', 'analysis', 'planning'], category: '产品设计',
      visibility: 'team', ownerId: lisi.id, teamId: aiTeam.id,
      status: 'published', publishedAt: new Date('2026-06-05'), starCount: 25, downloads: 89,
    },
    {
      type: 'prompt', name: 'SQL 优化顾问', slug: 'sql-optimization-advisor',
      description: '分析和优化 SQL 查询语句，提供索引建议和性能改进方案',
      content: { template: '分析以下 SQL 查询性能：\n{sql}\n数据库类型：{dbType}', variables: ['sql', 'dbType'], model: 'claude-sonnet-4-6', temperature: 0.1 },
      tags: ['sql', 'database', 'performance'], category: '后端开发',
      visibility: 'public', ownerId: wangwu.id, teamId: backendTeam.id,
      status: 'published', publishedAt: new Date('2026-05-20'), starCount: 67, downloads: 412,
    },
    {
      type: 'prompt', name: 'UI 文案润色', slug: 'ui-copy-polisher',
      description: '优化界面文案，使其更符合品牌调性和用户体验最佳实践',
      content: { template: '请优化以下 UI 文案...', variables: ['text', 'tone', 'maxLength'], model: 'claude-haiku-4-5', temperature: 0.6 },
      tags: ['ui', 'copywriting', 'ux'], category: '设计',
      visibility: 'team', ownerId: zhangsan.id, teamId: frontendTeam.id,
      status: 'published', publishedAt: new Date('2026-06-08'), starCount: 19, downloads: 67,
    },

    // --- 更多提示词模板 ---
    {
      type: 'prompt', name: 'Git 提交信息生成器', slug: 'git-commit-generator',
      description: '根据代码变更自动生成符合 Conventional Commits 规范的提交信息，支持中英文双语输出',
      content: {
        template: '# Git Commit 信息生成\n\n请根据以下代码变更，生成符合 Conventional Commits 规范的提交信息。\n\n## 变更内容\n```diff\n{diff}\n```\n\n## 要求\n- 类型：{type}（feat/fix/docs/style/refactor/test/chore/perf）\n- 范围：{scope}\n- 语言：{language}\n- 格式：<type>(<scope>): <subject>\n\n请生成中英文双语版本。',
        variables: ['diff', 'type', 'scope', 'language'],
        model: 'claude-haiku-4-5',
        temperature: 0.2,
        metadata: { usageCount: 0, category: 'git' }
      },
      tags: ['git', 'commit', 'conventional-commits', 'automation'], category: '开发工具',
      visibility: 'public', ownerId: admin.id, teamId: frontendTeam.id,
      status: 'published', publishedAt: new Date('2026-06-10'), starCount: 56, downloads: 234,
    },
    {
      type: 'prompt', name: 'Pull Request 描述模板', slug: 'pr-description-template',
      description: '根据分支变更自动生成标准化的 PR 描述，包含变更摘要、测试计划、风险评估',
      content: {
        template: '# PR 描述生成\n\n请根据以下信息生成一份专业的 Pull Request 描述。\n\n## 分支信息\n- 源分支：{sourceBranch}\n- 目标分支：{targetBranch}\n- 变更文件数：{filesChanged}\n\n## 变更摘要\n{changeSummary}\n\n## 要求\n请包含以下章节：\n1. 📝 变更说明\n2. 🧪 测试计划\n3. 📸 截图（如有 UI 变更）\n4. ⚠️ 风险评估\n5. 📋 检查清单',
        variables: ['sourceBranch', 'targetBranch', 'filesChanged', 'changeSummary'],
        model: 'claude-sonnet-4-6',
        temperature: 0.3,
        metadata: { usageCount: 0, category: 'git' }
      },
      tags: ['git', 'pull-request', 'collaboration', 'template'], category: '开发工具',
      visibility: 'team', ownerId: zhangsan.id, teamId: frontendTeam.id,
      status: 'published', publishedAt: new Date('2026-06-09'), starCount: 48, downloads: 189,
    },
    {
      type: 'prompt', name: '发版说明生成器', slug: 'release-notes-generator',
      description: '根据版本变更历史自动生成结构化的 Release Notes，支持 GitHub Release 格式',
      content: {
        template: '# Release Notes 生成\n\n请根据以下信息生成 {version} 版本的 Release Notes。\n\n## 版本信息\n- 版本号：{version}\n- 发布日期：{releaseDate}\n\n## 变更列表\n{changelog}\n\n## 要求\n- 按类型分组（🎉 新功能 / 🐛 Bug修复 / 🔧 改进 / ⚠️ 破坏性变更）\n- 每条变更一句话描述\n- 底部附上贡献者名单\n- 格式：GitHub Flavored Markdown',
        variables: ['version', 'releaseDate', 'changelog'],
        model: 'claude-sonnet-4-6',
        temperature: 0.4,
        metadata: { usageCount: 0, category: 'release' }
      },
      tags: ['release', 'changelog', 'versioning', 'automation'], category: 'DevOps',
      visibility: 'public', ownerId: wangwu.id, teamId: backendTeam.id,
      status: 'published', publishedAt: new Date('2026-06-07'), starCount: 35, downloads: 156,
    },
    {
      type: 'prompt', name: '架构决策记录 (ADR)', slug: 'adr-template',
      description: '生成标准化的架构决策记录文档，帮助团队记录和追踪关键技术决策及其背景',
      content: {
        template: '# 架构决策记录 (ADR)\n\n## 标题\n{title}\n\n## 状态\n{status}  <!-- proposed / accepted / deprecated / superseded -->\n\n## 背景\n{context}\n\n## 决策\n{decision}\n\n## 考虑的方案\n{consideredOptions}\n\n## 后果\n### 正面影响\n{positiveConsequences}\n\n### 负面影响\n{negativeConsequences}\n\n## 相关 ADR\n{relatedAdrs}',
        variables: ['title', 'status', 'context', 'decision', 'consideredOptions', 'positiveConsequences', 'negativeConsequences', 'relatedAdrs'],
        model: 'claude-opus-4-8',
        temperature: 0.3,
        metadata: { usageCount: 0, category: 'architecture' }
      },
      tags: ['architecture', 'decision-record', 'documentation', 'adr'], category: '架构设计',
      visibility: 'public', ownerId: admin.id, teamId: aiTeam.id,
      status: 'published', publishedAt: new Date('2026-06-03'), starCount: 72, downloads: 298,
    },
    {
      type: 'prompt', name: '测试用例生成器', slug: 'test-case-generator',
      description: '根据函数签名和业务逻辑描述，自动生成全面的单元测试和集成测试用例',
      content: {
        template: '# 测试用例生成\n\n请为以下代码生成全面的测试用例。\n\n## 源代码\n```{language}\n{code}\n```\n\n## 要求\n- 测试框架：{testFramework}\n- 覆盖场景：正常路径、边界条件、异常处理、性能测试\n- 每个测试用例包含：描述、输入、预期输出、断言\n\n请生成可直接运行的测试代码。',
        variables: ['language', 'code', 'testFramework'],
        model: 'claude-sonnet-4-6',
        temperature: 0.2,
        metadata: { usageCount: 0, category: 'testing' }
      },
      tags: ['testing', 'unit-test', 'automation', 'quality'], category: '开发工具',
      visibility: 'team', ownerId: lisi.id, teamId: aiTeam.id,
      status: 'published', publishedAt: new Date('2026-06-11'), starCount: 41, downloads: 178,
    },
    {
      type: 'prompt', name: 'Bug 分析报告模板', slug: 'bug-analysis-report',
      description: '结构化的 Bug 分析报告模板，帮助团队系统性地记录和分析问题',
      content: {
        template: '# Bug 分析报告\n\n## 基本信息\n- Bug ID: {bugId}\n- 严重程度: {severity}  <!-- critical / major / minor / trivial -->\n- 发现日期: {foundDate}\n- 发现者: {reporter}\n- 负责模块: {module}\n\n## 问题描述\n{description}\n\n## 复现步骤\n{reproSteps}\n\n## 预期行为\n{expectedBehavior}\n\n## 实际行为\n{actualBehavior}\n\n## 根因分析\n{rootCause}\n\n## 修复方案\n{fix}\n\n## 预防措施\n{prevention}',
        variables: ['bugId', 'severity', 'foundDate', 'reporter', 'module', 'description', 'reproSteps', 'expectedBehavior', 'actualBehavior', 'rootCause', 'fix', 'prevention'],
        model: 'claude-haiku-4-5',
        temperature: 0.2,
        metadata: { usageCount: 0, category: 'quality' }
      },
      tags: ['bug', 'quality', 'report', 'template'], category: '质量保证',
      visibility: 'team', ownerId: zhangsan.id, teamId: frontendTeam.id,
      status: 'published', publishedAt: new Date('2026-06-02'), starCount: 28, downloads: 112,
    },
    {
      type: 'prompt', name: '周报生成助手', slug: 'weekly-report-assistant',
      description: '根据工作记录自动生成结构化周报，支持 Markdown 和纯文本两种格式输出',
      content: {
        template: '# 周报生成\n\n请根据以下工作记录生成 {startDate} 至 {endDate} 的周报。\n\n## 本周工作记录\n{workLog}\n\n## 要求\n- 格式：{format}（markdown / plain）\n- 包含章节：本周完成、进行中、下周计划、风险与阻塞\n- 语言风格：{tone}（正式 /  casual）\n\n请生成专业、简洁的周报。',
        variables: ['startDate', 'endDate', 'workLog', 'format', 'tone'],
        model: 'claude-haiku-4-5',
        temperature: 0.5,
        metadata: { usageCount: 0, category: 'productivity' }
      },
      tags: ['report', 'weekly', 'productivity', 'communication'], category: '效率工具',
      visibility: 'public', ownerId: admin.id, teamId: null,
      status: 'published', publishedAt: new Date('2026-06-12'), starCount: 88, downloads: 456,
    },
    {
      type: 'prompt', name: 'API 错误信息优化器', slug: 'api-error-message-optimizer',
      description: '优化 API 错误提示信息，使其对开发者更友好且包含足够的调试信息',
      content: {
        template: '# API 错误信息优化\n\n请优化以下 API 错误响应，使其符合 RFC 7807 (Problem Details) 规范。\n\n## 当前错误信息\n```json\n{currentError}\n```\n\n## 接口信息\n- 端点：{endpoint}\n- 方法：{method}\n\n## 要求\n- 包含清晰的错误描述\n- 提供可操作的解决建议\n- 不泄露敏感信息（如堆栈跟踪）\n- 适合 {audience} 阅读',
        variables: ['currentError', 'endpoint', 'method', 'audience'],
        model: 'claude-haiku-4-5',
        temperature: 0.3,
        metadata: { usageCount: 0, category: 'api' }
      },
      tags: ['api', 'error-handling', 'developer-experience'], category: '后端开发',
      visibility: 'team', ownerId: wangwu.id, teamId: backendTeam.id,
      status: 'published', publishedAt: new Date('2026-06-06'), starCount: 22, downloads: 89,
    },
    {
      type: 'prompt', name: '技术方案评审模板', slug: 'tech-review-template',
      description: '系统化的技术方案评审模板，从架构、性能、安全、可维护性等维度进行评审',
      content: {
        template: '# 技术方案评审\n\n## 方案概述\n{proposal}\n\n## 评审维度\n\n### 1. 架构合理性\n{architectureReview}\n\n### 2. 性能评估\n{performanceReview}\n\n### 3. 安全性\n{securityReview}\n\n### 4. 可维护性\n{maintainabilityReview}\n\n### 5. 扩展性\n{scalabilityReview}\n\n### 6. 成本评估\n{costReview}\n\n## 总体评估\n- 风险等级：{riskLevel}\n- 建议：{recommendation}',
        variables: ['proposal', 'architectureReview', 'performanceReview', 'securityReview', 'maintainabilityReview', 'scalabilityReview', 'costReview', 'riskLevel', 'recommendation'],
        model: 'claude-opus-4-8',
        temperature: 0.3,
        metadata: { usageCount: 0, category: 'architecture' }
      },
      tags: ['review', 'architecture', 'technical-design', 'evaluation'], category: '架构设计',
      visibility: 'team', ownerId: admin.id, teamId: aiTeam.id,
      status: 'published', publishedAt: new Date('2026-06-04'), starCount: 45, downloads: 167,
    },
    {
      type: 'prompt', name: 'Dockerfile 优化顾问', slug: 'dockerfile-optimizer',
      description: '分析和优化 Dockerfile，减小镜像体积、提升构建速度、增强安全性',
      content: {
        template: '# Dockerfile 优化\n\n请分析并优化以下 Dockerfile。\n\n## 当前 Dockerfile\n```dockerfile\n{dockerfile}\n```\n\n## 优化目标\n- {optimizationGoal}\n\n## 要求\n1. 减少镜像层数\n2. 使用多阶段构建\n3. 合理利用缓存\n4. 以非 root 用户运行\n5. 添加健康检查\n\n请给出优化后的 Dockerfile 和变更说明。',
        variables: ['dockerfile', 'optimizationGoal'],
        model: 'claude-sonnet-4-6',
        temperature: 0.2,
        metadata: { usageCount: 0, category: 'devops' }
      },
      tags: ['docker', 'optimization', 'devops', 'container'], category: 'DevOps',
      visibility: 'public', ownerId: wangwu.id, teamId: backendTeam.id,
      status: 'published', publishedAt: new Date('2026-06-01'), starCount: 63, downloads: 287,
    },

    // --- SKILLS (技能) ---
    {
      type: 'skill', name: 'React 组件开发技能包', slug: 'react-component-skill',
      description: 'React 函数组件开发最佳实践，包含 Hooks、Context、性能优化等核心技能',
      content: { instructions: '按照以下步骤创建 React 组件...', patterns: ['functional-component', 'hooks', 'context', 'memo', 'suspense'], difficulty: 'intermediate', estimatedHours: 8 },
      tags: ['react', 'component', 'frontend', 'typescript'], category: '前端开发',
      visibility: 'team', ownerId: zhangsan.id, teamId: frontendTeam.id,
      status: 'published', publishedAt: new Date('2026-05-15'), starCount: 55, downloads: 320,
    },
    {
      type: 'skill', name: 'NestJS 模块开发指南', slug: 'nestjs-module-guide',
      description: '从零搭建 NestJS 模块的完整指南，包含控制器、服务、DTO、测试',
      content: { instructions: '创建 NestJS 模块的步骤...', topics: ['controller', 'service', 'dto', 'guard', 'interceptor', 'test'], difficulty: 'beginner', estimatedHours: 4 },
      tags: ['nestjs', 'backend', 'typescript', 'api'], category: '后端开发',
      visibility: 'public', ownerId: wangwu.id, teamId: backendTeam.id,
      status: 'published', publishedAt: new Date('2026-04-20'), starCount: 89, downloads: 567,
    },
    {
      type: 'skill', name: 'Prisma ORM 最佳实践', slug: 'prisma-orm-best-practices',
      description: 'Prisma 数据建模、迁移管理、查询优化和关系处理的完整指南',
      content: { instructions: 'Prisma ORM 使用指南...', topics: ['schema-design', 'migrations', 'relations', 'performance', 'seeding'], difficulty: 'intermediate', estimatedHours: 6 },
      tags: ['prisma', 'database', 'orm', 'postgresql'], category: '后端开发',
      visibility: 'team', ownerId: zhaoliu.id, teamId: backendTeam.id,
      status: 'published', publishedAt: new Date('2026-05-10'), starCount: 43, downloads: 278,
    },

    // --- COMPONENTS (组件) ---
    {
      type: 'component', name: 'DataTable 高级表格', slug: 'datatable-component',
      description: '支持排序、筛选、分页、行选择、列拖拽的高级数据表格组件',
      content: { version: '2.1.0', framework: 'react', dependencies: ['clsx', 'framer-motion'], props: ['columns', 'data', 'sortable', 'selectable', 'paginated', 'exportable'] },
      tags: ['table', 'data', 'react', 'sorting'], category: '前端开发',
      visibility: 'team', ownerId: lisi.id, teamId: frontendTeam.id,
      status: 'published', publishedAt: new Date('2026-06-02'), starCount: 31, downloads: 189,
    },
    {
      type: 'component', name: 'RichTextEditor 富文本编辑器', slug: 'richtext-editor',
      description: '基于 Slate.js 的富文本编辑器，支持 Markdown 快捷输入、图片上传、代码高亮',
      content: { version: '1.5.0', framework: 'react', dependencies: ['slate', 'slate-react'], props: ['value', 'onChange', 'placeholder', 'readOnly', 'plugins'] },
      tags: ['editor', 'markdown', 'react', 'text'], category: '前端开发',
      visibility: 'team', ownerId: zhangsan.id, teamId: frontendTeam.id,
      status: 'published', publishedAt: new Date('2026-05-25'), starCount: 47, downloads: 234,
    },
    {
      type: 'component', name: 'FileUpload 文件上传器', slug: 'file-uploader',
      description: '支持拖拽上传、多文件、进度条、预览的文件上传组件，适配 MinIO/S3',
      content: { version: '3.0.1', framework: 'react', dependencies: ['axios'], props: ['accept', 'multiple', 'maxSize', 'onUpload', 'preview'] },
      tags: ['upload', 'file', 'drag-drop', 's3'], category: '前端开发',
      visibility: 'public', ownerId: lisi.id, teamId: frontendTeam.id,
      status: 'published', publishedAt: new Date('2026-04-15'), starCount: 72, downloads: 445,
    },

    // --- MCP (Model Context Protocol) ---
    {
      type: 'mcp', name: 'Filesystem MCP 服务', slug: 'filesystem-mcp',
      description: '提供文件系统访问能力的 MCP 服务，支持读写文件、目录遍历、文件搜索',
      content: { endpoint: '/mcp/filesystem', auth: 'api-key', capabilities: ['read', 'write', 'list', 'search'], rateLimit: 100 },
      tags: ['filesystem', 'mcp', 'tools'], category: '基础设施',
      visibility: 'team', ownerId: wangwu.id, teamId: backendTeam.id,
      status: 'published', publishedAt: new Date('2026-05-01'), starCount: 56, downloads: 312,
    },
    {
      type: 'mcp', name: 'Database MCP 连接器', slug: 'database-mcp',
      description: '通过 MCP 协议访问数据库，支持 PostgreSQL 和 MySQL 的查询和 Schema 管理',
      content: { endpoint: '/mcp/database', auth: 'jwt', capabilities: ['query', 'schema', 'migrate'], databases: ['postgresql', 'mysql'] },
      tags: ['database', 'mcp', 'postgresql', 'mysql'], category: '基础设施',
      visibility: 'team', ownerId: zhaoliu.id, teamId: backendTeam.id,
      status: 'published', publishedAt: new Date('2026-05-18'), starCount: 34, downloads: 178,
    },

    // --- PROTOCOLS (协议) ---
    {
      type: 'protocol', name: '内部服务通信协议 v2', slug: 'internal-service-protocol-v2',
      description: '微服务间通信的标准协议定义，包含请求格式、错误码、重试策略',
      content: { version: '2.0.0', format: 'JSON', transport: 'HTTP/2 + gRPC', errorCodes: { 1001: '参数错误', 1002: '认证失败', 2001: '服务超时' }, retryPolicy: { maxRetries: 3, backoff: 'exponential' } },
      tags: ['protocol', 'microservice', 'communication'], category: '架构',
      visibility: 'team', ownerId: wangwu.id, teamId: backendTeam.id,
      status: 'published', publishedAt: new Date('2026-04-10'), starCount: 28, downloads: 145,
    },

    // --- WORKFLOWS (工作流模板) ---
    {
      type: 'workflow', name: '前端 CI/CD 流水线', slug: 'frontend-cicd-pipeline',
      description: '标准前端项目 CI/CD 流程：代码检查 → 单元测试 → 构建 → 部署到测试环境',
      content: { stages: ['lint', 'test', 'build', 'deploy-staging'], tools: ['eslint', 'vitest', 'vite', 'docker'] },
      tags: ['cicd', 'frontend', 'automation'], category: 'DevOps',
      visibility: 'team', ownerId: zhangsan.id, teamId: frontendTeam.id,
      status: 'published', publishedAt: new Date('2026-06-03'), starCount: 22, downloads: 98,
    },
    {
      type: 'workflow', name: '数据库备份流程', slug: 'database-backup-workflow',
      description: '定时备份 PostgreSQL 数据库，支持全量和增量备份，自动上传至 MinIO',
      content: { schedule: '0 2 * * *', type: 'full', retention: '30d', storage: 'minio', notify: ['email'] },
      tags: ['backup', 'database', 'postgresql', 'automation'], category: '运维',
      visibility: 'team', ownerId: zhaoliu.id, teamId: backendTeam.id,
      status: 'published', publishedAt: new Date('2026-05-05'), starCount: 18, downloads: 76,
    },

    // --- TEMPLATES (模板) ---
    {
      type: 'template', name: 'React + Vite 项目模板', slug: 'react-vite-template',
      description: '开箱即用的 React 18 + Vite + TypeScript + Tailwind CSS 项目模板',
      content: { framework: 'react', bundler: 'vite', language: 'typescript', styling: 'tailwind', features: ['router', 'zustand', 'vitest', 'eslint', 'prettier'] },
      tags: ['react', 'vite', 'template', 'starter'], category: '前端开发',
      visibility: 'public', ownerId: zhangsan.id, teamId: frontendTeam.id,
      status: 'published', publishedAt: new Date('2026-03-01'), starCount: 156, downloads: 1234,
    },
    {
      type: 'template', name: 'NestJS 微服务模板', slug: 'nestjs-microservice-template',
      description: 'NestJS 微服务项目模板，包含 Prisma、JWT 认证、Swagger、Docker 配置',
      content: { framework: 'nestjs', database: 'postgresql', auth: 'jwt', features: ['prisma', 'swagger', 'docker', 'jest', 'bullmq'] },
      tags: ['nestjs', 'microservice', 'template', 'backend'], category: '后端开发',
      visibility: 'team', ownerId: wangwu.id, teamId: backendTeam.id,
      status: 'published', publishedAt: new Date('2026-03-15'), starCount: 94, downloads: 678,
    },

    // --- SNIPPETS (代码片段) ---
    {
      type: 'snippet', name: '通用分页查询工具', slug: 'pagination-helper',
      description: 'Prisma 通用分页查询封装，支持搜索、排序、字段筛选',
      content: { language: 'typescript', code: 'export async function paginatedQuery<T>(model, params) { const { page, pageSize, where, orderBy, include } = params; const [items, total] = await Promise.all([model.findMany({ where, orderBy, include, skip: (page-1)*pageSize, take: pageSize }), model.count({ where })]); return { items, meta: { page, pageSize, total, totalPages: Math.ceil(total/pageSize) } }; }' },
      tags: ['typescript', 'prisma', 'pagination', 'utility'], category: '后端开发',
      visibility: 'public', ownerId: zhaoliu.id, teamId: backendTeam.id,
      status: 'published', publishedAt: new Date('2026-05-30'), starCount: 83, downloads: 567,
    },
    {
      type: 'snippet', name: 'Zustand 持久化 Store 模板', slug: 'zustand-persist-template',
      description: '包含加载、错误处理、持久化的 Zustand Store 模板代码',
      content: { language: 'typescript', code: "import { create } from 'zustand'\nimport { persist } from 'zustand/middleware'\n\nexport const useStore = create<T>()(\n  persist(\n    (set) => ({\n      data: null,\n      isLoading: false,\n      error: null,\n      fetch: async () => { set({ isLoading: true }); try { const data = await api.get(); set({ data, isLoading: false }); } catch (e) { set({ error: e.message, isLoading: false }); } },\n    }),\n    { name: 'store-key', partialize: (s) => ({ data: s.data }) }\n  )\n)" },
      tags: ['zustand', 'react', 'state', 'typescript'], category: '前端开发',
      visibility: 'team', ownerId: lisi.id, teamId: frontendTeam.id,
      status: 'published', publishedAt: new Date('2026-06-10'), starCount: 41, downloads: 201,
    },
    {
      type: 'snippet', name: 'JWT 鉴权守卫 (NestJS)', slug: 'jwt-auth-guard-nestjs',
      description: '支持 @Public() 装饰器的 NestJS JWT 鉴权守卫实现',
      content: { language: 'typescript', code: "@Injectable()\nexport class JwtAuthGuard extends AuthGuard('jwt') {\n  constructor(private reflector: Reflector) { super(); }\n  canActivate(context: ExecutionContext) {\n    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [context.getHandler(), context.getClass()]);\n    if (isPublic) return true;\n    return super.canActivate(context);\n  }\n}" },
      tags: ['nestjs', 'jwt', 'auth', 'guard'], category: '后端开发',
      visibility: 'public', ownerId: wangwu.id, teamId: backendTeam.id,
      status: 'published', publishedAt: new Date('2026-05-12'), starCount: 61, downloads: 389,
    },
  ]

  const createdResources: any[] = []
  for (const r of resourceData) {
    const resource = await prisma.resource.upsert({
      where: { type_slug: { type: r.type, slug: r.slug } },
      update: r as any,
      create: r as any,
    })
    createdResources.push(resource)
    console.log(`📦 ${resource.type}: ${resource.name} (⭐${resource.starCount} 📥${resource.downloads})`)
  }

  // ==========================================
  // VERSIONS - for selected resources
  // ==========================================
  const versionedResources = createdResources.filter((r: any) => ['prompt', 'skill', 'component'].includes(r.type))
  for (const resource of versionedResources) {
    const r = resource as any
    const versionCount = r.type === 'prompt' ? 3 : 2
    for (let v = 1; v <= versionCount; v++) {
      const patch = versionCount - v
      await prisma.version.upsert({
        where: { resourceId_version: { resourceId: r.id, version: `1.0.${patch}` } },
        update: {},
        create: {
          resourceId: r.id,
          version: `1.0.${patch}`,
          tag: v === versionCount ? 'latest' : undefined,
          changelog: v === 1
            ? '初始版本'
            : v === 2
              ? '修复已知问题，优化性能\n- 改进错误处理逻辑\n- 更新依赖版本'
              : '重大更新\n- 新增变量支持\n- 优化模板结构\n- 提升响应速度 30%',
          content: { ...r.content as any, _version: v },
          authorId: r.ownerId,
          status: 'published',
          publishedAt: new Date(Date.now() - (versionCount - v) * 7 * 86400000),
          createdAt: new Date(Date.now() - (versionCount - v) * 7 * 86400000),
        },
      })
    }
  }
  console.log(`\n📋 Created versions for ${versionedResources.length} resources`)

  // ==========================================
  // ENVIRONMENTS
  // ==========================================
  const devEnv = await prisma.environment.create({
    data: {
      name: 'development', displayName: '开发环境',
      description: '本地开发环境，用于日常开发和调试',
      teamId: frontendTeam.id,
      variables: {
        NODE_ENV: 'development', PORT: '3000', API_URL: 'http://localhost:4000/api/v1',
        VITE_API_URL: 'http://localhost:4000/api/v1', LOG_LEVEL: 'debug',
      },
      secrets: { JWT_SECRET: 'dev-secret-xxx', DATABASE_URL: 'postgresql://localhost:5432/teamshare' },
      dependencies: { node: '>=20.0.0', pnpm: '>=8.0.0', typescript: '^5.4.0', vite: '^5.2.0', react: '^18.3.0' },
      status: 'active',
      health: { status: 'healthy', lastCheck: new Date(), checks: { database: 'ok', redis: 'ok', minio: 'disabled' } },
    },
  })
  console.log('🌍', devEnv.displayName)

  const stagingEnv = await prisma.environment.create({
    data: {
      name: 'staging', displayName: '预发布环境',
      description: '预发布测试环境，用于上线前的集成测试和产品验收',
      teamId: frontendTeam.id,
      variables: {
        NODE_ENV: 'staging', PORT: '3000', API_URL: 'https://staging-api.teamshare.com/api/v1',
        VITE_API_URL: 'https://staging-api.teamshare.com/api/v1', LOG_LEVEL: 'info',
      },
      secrets: { JWT_SECRET: 'staging-secret-yyy', DATABASE_URL: 'postgresql://staging-db:5432/teamshare' },
      dependencies: { node: '20.x', pnpm: '9.x', docker: '>=24.0.0' },
      status: 'active',
      health: { status: 'healthy', lastCheck: new Date(), checks: { database: 'ok', redis: 'ok', minio: 'ok' } },
    },
  })
  console.log('🌍', stagingEnv.displayName)

  const prodEnv = await prisma.environment.create({
    data: {
      name: 'production', displayName: '生产环境',
      description: '线上生产环境，运行正式服务，严格控制变更',
      teamId: frontendTeam.id,
      variables: {
        NODE_ENV: 'production', API_URL: 'https://api.teamshare.com/api/v1',
        LOG_LEVEL: 'warn', CORS_ORIGIN: 'https://teamshare.com',
      },
      secrets: { JWT_SECRET: 'prod-secret-zzz-rotated-monthly', DATABASE_URL: 'postgresql://prod-db:5432/teamshare' },
      dependencies: { node: '20.x', pnpm: '9.x', docker: '>=24.0.0', postgresql: '16.x', redis: '7.x' },
      status: 'active',
      health: { status: 'healthy', lastCheck: new Date(), checks: { database: 'ok', redis: 'ok', minio: 'ok' } },
    },
  })
  console.log('🌍', prodEnv.displayName)

  const backendDevEnv = await prisma.environment.create({
    data: {
      name: 'backend-dev', displayName: '后端开发环境',
      description: '后端服务开发环境，包含 PostgreSQL 和 Redis',
      teamId: backendTeam.id,
      variables: { NODE_ENV: 'development', PORT: '4000', DATABASE_URL: 'postgresql://localhost:5432/teamshare', REDIS_URL: 'redis://localhost:6379' },
      secrets: { JWT_SECRET: 'backend-dev-secret', MINIO_ACCESS_KEY: 'minioadmin', MINIO_SECRET_KEY: 'minioadmin' },
      dependencies: { node: '>=20.0.0', pnpm: '>=8.0.0', postgresql: '16.x', redis: '7.x' },
      status: 'active',
      health: { status: 'healthy', lastCheck: new Date(), checks: { database: 'ok', redis: 'ok' } },
    },
  })
  console.log('🌍', backendDevEnv.displayName)

  // Create environment snapshots
  const snapshots = await Promise.all([
    prisma.environmentSnapshot.create({
      data: {
        environmentId: stagingEnv.id, name: 'v1.0.0-rc1',
        description: '第一个发布候选版本的快照',
        snapshot: { variables: stagingEnv.variables as any, secrets: { masked: true }, dependencies: stagingEnv.dependencies as any, createdAt: new Date('2026-06-01') },
        createdAt: new Date('2026-06-01'),
      },
    }),
    prisma.environmentSnapshot.create({
      data: {
        environmentId: stagingEnv.id, name: 'v1.1.0-beta',
        description: '1.1.0 beta 版本快照，新增了监控模块',
        snapshot: { variables: stagingEnv.variables as any, secrets: { masked: true }, dependencies: stagingEnv.dependencies as any, createdAt: new Date('2026-06-08') },
        createdAt: new Date('2026-06-08'),
      },
    }),
  ])
  console.log('📸 Created', snapshots.length, 'environment snapshots')

  // ==========================================
  // WORKFLOWS
  // ==========================================
  // Workflow 1: Deploy pipeline
  const deployWorkflow = await prisma.workflow.create({
    data: {
      name: '一键部署流水线',
      description: '完整的部署流程：代码检查 → 构建 → 测试 → 部署 → 健康检查',
      teamId: frontendTeam.id,
      nodes: [
        { id: 'start', type: 'start', name: '开始', config: {}, position: { x: 0, y: 0 }, inputs: [], outputs: [] },
        { id: 'lint', type: 'task', name: '代码检查', config: { command: 'pnpm lint' }, position: { x: 180, y: 0 }, inputs: [], outputs: [] },
        { id: 'test', type: 'task', name: '单元测试', config: { command: 'pnpm test' }, position: { x: 360, y: -40 }, inputs: [], outputs: [] },
        { id: 'e2e', type: 'task', name: 'E2E 测试', config: { command: 'pnpm test:e2e' }, position: { x: 360, y: 40 }, inputs: [], outputs: [] },
        { id: 'parallel-gate', type: 'parallel', name: '并行测试', config: { maxConcurrency: 2 }, position: { x: 270, y: 0 }, inputs: [], outputs: [] },
        { id: 'build', type: 'task', name: '构建镜像', config: { command: 'docker build -t app .' }, position: { x: 540, y: 0 }, inputs: [], outputs: [] },
        { id: 'deploy', type: 'task', name: '部署服务', config: { command: 'docker compose up -d', retries: 2 }, position: { x: 720, y: 0 }, inputs: [], outputs: [] },
        { id: 'health', type: 'task', name: '健康检查', config: { command: 'curl -f http://localhost:4000/api/v1/monitoring/health' }, position: { x: 900, y: 0 }, inputs: [], outputs: [] },
        { id: 'end', type: 'end', name: '完成', config: {}, position: { x: 1080, y: 0 }, inputs: [], outputs: [] },
      ],
      edges: [
        { id: 'e1', source: 'start', target: 'lint' },
        { id: 'e2', source: 'lint', target: 'parallel-gate' },
        { id: 'e3', source: 'parallel-gate', target: 'test' },
        { id: 'e4', source: 'parallel-gate', target: 'e2e' },
        { id: 'e5', source: 'test', target: 'build' },
        { id: 'e6', source: 'e2e', target: 'build' },
        { id: 'e7', source: 'build', target: 'deploy' },
        { id: 'e8', source: 'deploy', target: 'health' },
        { id: 'e9', source: 'health', target: 'end' },
      ],
      retryPolicy: { maxRetries: 3, backoffType: 'exponential', initialDelay: 1000 },
      status: 'active',
    },
  })
  console.log('⚙️', deployWorkflow.name)

  // Workflow 2: Data migration
  const migrationWorkflow = await prisma.workflow.create({
    data: {
      name: '数据库迁移流程',
      description: '安全的数据库迁移流程：备份 → 迁移 → 验证 → 通知',
      teamId: backendTeam.id,
      nodes: [
        { id: 'start', type: 'start', name: '开始', config: {}, position: { x: 0, y: 0 }, inputs: [], outputs: [] },
        { id: 'backup', type: 'task', name: '数据备份', config: { command: 'pg_dump teamshare > backup.sql' }, position: { x: 180, y: 0 }, inputs: [], outputs: [] },
        { id: 'migrate', type: 'task', name: '执行迁移', config: { command: 'npx prisma migrate deploy', retries: 1 }, position: { x: 360, y: 0 }, inputs: [], outputs: [] },
        { id: 'verify', type: 'task', name: '验证数据', config: { script: 'node scripts/verify-migration.js' }, position: { x: 540, y: 0 }, inputs: [], outputs: [] },
        { id: 'condition', type: 'condition', name: '验证通过?', config: { expression: "outputs['verify'].exitCode === 0" }, position: { x: 720, y: 0 }, inputs: [], outputs: [] },
        { id: 'notify-ok', type: 'task', name: '发送成功通知', config: { command: 'echo "Migration OK"' }, position: { x: 900, y: -40 }, inputs: [], outputs: [] },
        { id: 'rollback', type: 'task', name: '回滚数据', config: { command: 'psql teamshare < backup.sql' }, position: { x: 900, y: 40 }, inputs: [], outputs: [] },
        { id: 'end', type: 'end', name: '结束', config: {}, position: { x: 1080, y: 0 }, inputs: [], outputs: [] },
      ],
      edges: [
        { id: 'e1', source: 'start', target: 'backup' },
        { id: 'e2', source: 'backup', target: 'migrate' },
        { id: 'e3', source: 'migrate', target: 'verify' },
        { id: 'e4', source: 'verify', target: 'condition' },
        { id: 'e5', source: 'condition', target: 'notify-ok', condition: "outputs['verify'].exitCode === 0" },
        { id: 'e6', source: 'condition', target: 'rollback', condition: "outputs['verify'].exitCode !== 0" },
        { id: 'e7', source: 'notify-ok', target: 'end' },
        { id: 'e8', source: 'rollback', target: 'end' },
      ],
      retryPolicy: { maxRetries: 1, backoffType: 'fixed', initialDelay: 5000 },
      status: 'active',
    },
  })
  console.log('⚙️', migrationWorkflow.name)

  // Workflow 3: Weekly report
  await prisma.workflow.create({
    data: {
      name: '周报自动生成',
      description: '每周五自动汇总团队工作，生成周报并发送通知',
      teamId: frontendTeam.id,
      triggerConfig: { type: 'cron', expression: '0 17 * * 5' },
      nodes: [
        { id: 'start', type: 'start', name: '开始', config: {}, position: { x: 0, y: 0 }, inputs: [], outputs: [] },
        { id: 'collect', type: 'task', name: '收集数据', config: { command: 'node scripts/collect-weekly-data.js' }, position: { x: 200, y: 0 }, inputs: [], outputs: [] },
        { id: 'generate', type: 'task', name: '生成报告', config: { script: 'node scripts/generate-report.js' }, position: { x: 400, y: 0 }, inputs: [], outputs: [] },
        { id: 'notify', type: 'task', name: '发送通知', config: { command: 'node scripts/send-notification.js' }, position: { x: 600, y: 0 }, inputs: [], outputs: [] },
        { id: 'end', type: 'end', name: '完成', config: {}, position: { x: 800, y: 0 }, inputs: [], outputs: [] },
      ],
      edges: [
        { id: 'e1', source: 'start', target: 'collect' },
        { id: 'e2', source: 'collect', target: 'generate' },
        { id: 'e3', source: 'generate', target: 'notify' },
        { id: 'e4', source: 'notify', target: 'end' },
      ],
      variables: { REPORT_TYPE: 'weekly', TEAM_ID: frontendTeam.id },
      status: 'active',
    },
  })
  console.log('⚙️ 周报自动生成')

  // ==========================================
  // WORKFLOW EXECUTIONS - sample execution history
  // ==========================================
  const now = Date.now()
  for (let i = 0; i < 5; i++) {
    const status = i < 3 ? 'success' : i === 3 ? 'failed' : 'success'
    await prisma.workflowExecution.create({
      data: {
        workflowId: deployWorkflow.id,
        status,
        trigger: i === 4 ? 'manual' : 'webhook',
        inputs: { branch: 'main', commit: `abc${i}def` },
        outputs: status === 'success' ? { deployUrl: `https://v1.${i}.teamshare.com` } : {},
        nodeExecutions: [
          { nodeId: 'lint', status: 'success', duration: 1234 + i * 100 },
          { nodeId: 'test', status: 'success', duration: 5678 + i * 200 },
          { nodeId: 'build', status: i === 3 ? 'failed' : 'success', duration: 8901 + i * 300 },
        ] as any,
        logs: [
          { timestamp: new Date(now - (5 - i) * 86400000), level: 'info', message: `构建 #${i + 1} 开始` },
          { timestamp: new Date(now - (5 - i) * 86400000 + 60000), level: 'info', message: '代码检查通过' },
          { timestamp: new Date(now - (5 - i) * 86400000 + 180000), level: status === 'failed' ? 'error' : 'info', message: status === 'failed' ? '构建失败: 类型错误' : '构建完成' },
        ] as any,
        startedAt: new Date(now - (5 - i) * 86400000),
        finishedAt: new Date(now - (5 - i) * 86400000 + 300000),
        duration: 300000 + i * 30000,
        createdAt: new Date(now - (5 - i) * 86400000),
      },
    })
  }
  console.log('📊 Created 5 workflow executions')

  // ==========================================
  // NOTIFICATIONS
  // ==========================================
  const notifications = [
    { userId: zhangsan.id, type: 'resource_starred', title: '你的提示词获得了新的收藏', message: 'SQL 优化顾问 获得了第 67 个收藏', read: false, createdAt: new Date(now - 3600000) },
    { userId: zhangsan.id, type: 'resource_downloaded', title: '你的资源被下载', message: 'React + Vite 项目模板 被下载了 100 次', read: false, createdAt: new Date(now - 7200000) },
    { userId: admin.id, type: 'team_invite', title: '新成员加入申请', message: '有新成员申请加入 AI 创新团队', read: false, createdAt: new Date(now - 86400000) },
    { userId: admin.id, type: 'workflow_failed', title: '工作流执行失败', message: '一键部署流水线 #4 执行失败: 构建失败', read: true, createdAt: new Date(now - 172800000) },
    { userId: wangwu.id, type: 'version_published', title: '新版本发布', message: 'SQL 优化顾问 v1.0.2 已发布', read: true, createdAt: new Date(now - 259200000) },
    { userId: lisi.id, type: 'resource_starred', title: '你的组件获得了新的收藏', message: 'FileUpload 文件上传器 获得了第 72 个收藏', read: false, createdAt: new Date(now - 345600000) },
    { userId: admin.id, type: 'system', title: '系统更新通知', message: '平台将于本周六凌晨 2:00-4:00 进行维护升级', read: false, createdAt: new Date(now - 432000000) },
    { userId: zhangsan.id, type: 'comment', title: '新的评论', message: '李四 评论了你的资源 "代码审查助手"', read: true, createdAt: new Date(now - 518400000) },
  ]
  for (const n of notifications) {
    await prisma.notification.create({ data: n })
  }
  console.log('🔔 Created', notifications.length, 'notifications')

  // ==========================================
  // AUDIT LOGS - sample activity
  // ==========================================
  const auditLogs = [
    { userId: admin.id, action: 'resource.create', resourceType: 'resource', details: { name: 'API 文档生成提示词' } },
    { userId: zhangsan.id, action: 'resource.publish', resourceType: 'resource', details: { name: 'React 组件开发技能包' } },
    { userId: wangwu.id, action: 'workflow.execute', resourceType: 'workflow', details: { workflow: '一键部署流水线', result: 'success' } },
    { userId: admin.id, action: 'team.create', resourceType: 'team', details: { name: 'AI 创新团队' } },
    { userId: lisi.id, action: 'resource.download', resourceType: 'resource', details: { name: 'Zustand 持久化 Store 模板' } },
    { userId: zhangsan.id, action: 'environment.snapshot', resourceType: 'environment', details: { env: 'staging', snapshot: 'v1.1.0-beta' } },
    { userId: wangwu.id, action: 'resource.star', resourceType: 'resource', details: { name: 'Prisma ORM 最佳实践' } },
    { userId: zhaoliu.id, action: 'version.create', resourceType: 'version', details: { version: '1.0.1', resource: '通用分页查询工具' } },
  ]
  for (const log of auditLogs) {
    await prisma.auditLog.create({
      data: {
        ...log,
        resourceId: (createdResources[Math.floor(Math.random() * createdResources.length)] as any).id,
        ipAddress: '127.0.0.1',
        userAgent: 'Mozilla/5.0 TeamShare Client',
        createdAt: new Date(Date.now() - Math.floor(Math.random() * 7 * 86400000)),
      },
    })
  }
  console.log('📝 Created', auditLogs.length, 'audit logs')

  // ==========================================
  // SUMMARY
  // ==========================================
  const counts = {
    users: await prisma.user.count(),
    teams: await prisma.team.count(),
    resources: await prisma.resource.count(),
    versions: await prisma.version.count(),
    environments: await prisma.environment.count(),
    snapshots: await prisma.environmentSnapshot.count(),
    workflows: await prisma.workflow.count(),
    executions: await prisma.workflowExecution.count(),
    notifications: await prisma.notification.count(),
    auditLogs: await prisma.auditLog.count(),
  }

  console.log('\n═══════════════════════════════════════')
  console.log('🎉 Seeding completed!')
  console.log('───────────────────────────────────────')
  console.log(`👤 Users:          ${counts.users}`)
  console.log(`👥 Teams:          ${counts.teams}`)
  console.log(`📦 Resources:      ${counts.resources} (${resourceData.length} new)`)
  console.log(`📋 Versions:       ${counts.versions}`)
  console.log(`🌍 Environments:   ${counts.environments}`)
  console.log(`📸 Snapshots:      ${counts.snapshots}`)
  console.log(`⚙️ Workflows:      ${counts.workflows}`)
  console.log(`📊 Executions:     ${counts.executions}`)
  console.log(`🔔 Notifications:  ${counts.notifications}`)
  console.log(`📝 Audit Logs:     ${counts.auditLogs}`)
  console.log('═══════════════════════════════════════')
  console.log('\n📋 Test Accounts:')
  console.log('   admin@teamshare.com    / admin123     (系统管理员)')
  console.log('   zhangsan@teamshare.com / zhangsan123  (前端开发)')
  console.log('   lisi@teamshare.com     / lisi123      (前端开发)')
  console.log('   wangwu@teamshare.com   / wangwu123    (后端开发)')
  console.log('   zhaoliu@teamshare.com  / zhaoliu123   (后端开发)\n')
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
