# 架构总览

## 系统架构

```
┌─────────────────────────────────────────────────────────────┐
│                        Nginx Ingress                         │
│                    (TLS + 路由分发)                           │
├──────────────────────┬──────────────────────────────────────┤
│         /            │              /api/*                   │
│      Web (React)     │         API (NestJS)                 │
│      Nginx:80        │         Node:4000                    │
│   静态文件服务         │     REST + WebSocket                │
└──────────────────────┴──────────────────────────────────────┤
│                   中间件层                                    │
│  ┌─────────┐  ┌─────────┐  ┌────────────┐  ┌───────────┐  │
│  │  Redis  │  │  MinIO  │  │ PostgreSQL │  │  BullMQ   │  │
│  │ 缓存/Session│ │ 文件存储 │  │  主数据库   │  │  消息队列  │  │
│  └─────────┘  └─────────┘  └────────────┘  └───────────┘  │
│                                                             │
│  监控栈                                                      │
│  ┌───────────┐  ┌───────────┐  ┌────────────────────┐      │
│  │ Prometheus│  │  Grafana  │  │ ELK (Logs)         │      │
│  └───────────┘  └───────────┘  └────────────────────┘      │
└─────────────────────────────────────────────────────────────┘
```

## 技术选型

| 层 | 技术 | 说明 |
|----|------|------|
| 前端 | React 18 + Vite + Tailwind | Apple Design 设计语言 |
| 后端 | NestJS 10 + Prisma + TypeScript | 模块化企业级框架 |
| 数据库 | PostgreSQL 16 | 主数据库 |
| 缓存 | Redis 7 | Session / 查询缓存 / 限流 |
| 存储 | MinIO | S3 兼容对象存储 |
| 队列 | BullMQ (Redis-backed) | 工作流异步执行 / 通知分发 |
| 容器 | Docker + Kubernetes | 开发/生产环境 |
| CI/CD | GitHub Actions | 自动化测试与部署 |
| 监控 | Prometheus + Grafana | 指标收集与可视化 |

## 项目结构

```
team-share/
├── apps/
│   ├── web/          # React 前端
│   └── api/          # NestJS 后端
├── packages/
│   ├── shared/       # 共享类型、常量、工具
│   ├── ui/           # UI 组件库 (Apple Design)
│   └── config/       # ESLint / TypeScript 配置
├── k8s/              # Kubernetes 部署配置
├── docker/           # Docker 配置 + 监控
└── docs/             # 项目文档
```
