# 本地开发指南

## 环境要求

- Node.js >= 20.0.0
- pnpm >= 8.0.0
- Docker Desktop

## 快速启动

### 1. 安装依赖

```bash
pnpm install
```

### 2. 启动基础设施

```bash
cd docker
docker-compose up -d
```

### 3. 配置环境变量

```bash
cp .env.example .env
```

### 4. 初始化数据库

```bash
cd apps/api
pnpm db:generate
pnpm db:push
pnpm db:seed
```

### 5. 启动开发服务器

```bash
pnpm dev
```

- 前端: http://localhost:3000
- API: http://localhost:4000
- API 文档: http://localhost:4000/api/docs

## 测试账号

- 管理员: admin@teamshare.com / admin123
- 开发者: zhangsan@teamshare.com / zhangsan123

## 常用命令

| 命令 | 说明 |
|------|------|
| `pnpm dev` | 启动所有服务 |
| `pnpm test` | 运行所有测试 |
| `pnpm lint` | 代码检查 |
| `pnpm build` | 构建生产版本 |
| `pnpm db:seed` | 重新填充种子数据 |

## 项目结构

```
apps/web/src/
├── app/          # 应用入口、布局、路由
├── components/   # UI 组件 (re-export from packages/ui)
├── features/     # 功能页面模块
├── hooks/        # 自定义 Hooks
├── services/     # API 服务层
├── stores/       # Zustand 状态管理
└── styles/       # 全局样式、主题
```
