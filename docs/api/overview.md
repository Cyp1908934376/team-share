# API 概览

## 基础信息

- **Base URL**: `/api/v1`
- **认证方式**: Bearer Token (JWT)
- **文档地址**: `/api/docs` (Swagger UI)

## 通用规范

### 响应格式

```json
{
  "code": 0,
  "message": "success",
  "data": {},
  "meta": {
    "page": 1,
    "pageSize": 20,
    "total": 100,
    "totalPages": 5
  }
}
```

### 错误格式

```json
{
  "code": 401,
  "message": "未授权访问",
  "path": "/api/v1/resources",
  "timestamp": "2026-06-13T12:00:00.000Z"
}
```

### HTTP 状态码

| 状态码 | 说明 |
|--------|------|
| 200 | 请求成功 |
| 201 | 创建成功 |
| 400 | 参数错误 |
| 401 | 未认证 |
| 403 | 无权限 |
| 404 | 资源不存在 |
| 422 | 验证失败 |
| 500 | 服务器错误 |

## 端点总览

### 认证
| 方法 | 路径 | 说明 |
|------|------|------|
| POST | `/auth/register` | 用户注册 |
| POST | `/auth/login` | 用户登录 |
| GET | `/auth/me` | 获取当前用户 |
| POST | `/auth/change-password` | 修改密码 |

### 资源
| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/resources` | 资源列表（支持分页/筛选/搜索） |
| POST | `/resources` | 创建资源 |
| GET | `/resources/:id` | 资源详情 |
| PUT | `/resources/:id` | 更新资源 |
| DELETE | `/resources/:id` | 删除资源 |
| POST | `/resources/:id/star` | 收藏/取消收藏 |
| POST | `/resources/:id/publish` | 发布资源 |
| POST | `/resources/:id/upload` | 上传文件 (MinIO) |
| GET | `/resources/:id/file` | 获取文件下载链接 |
| GET | `/resources/:id/versions` | 版本列表 |
| POST | `/resources/:id/versions` | 创建版本 |

### 环境
| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/environments` | 环境列表 |
| POST | `/environments` | 创建环境 |
| GET | `/environments/:id` | 环境详情 |
| POST | `/environments/:id/snapshot` | 创建快照 |
| GET | `/environments/:id/health` | 健康检查 |

### 工作流
| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/workflows` | 工作流列表 |
| POST | `/workflows` | 创建工作流 |
| GET | `/workflows/:id` | 工作流详情 |
| POST | `/workflows/:id/execute` | 执行工作流 |
| GET | `/workflows/:id/executions` | 执行历史 |
| POST | `/workflows/:id/webhook` | Webhook 触发 |

### 监控
| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/monitoring/stats` | 系统统计 |
| GET | `/monitoring/dashboard` | 仪表盘数据 |
| GET | `/monitoring/health` | 系统健康检查 |
| GET | `/monitoring/metrics` | Prometheus 指标 |
| GET | `/monitoring/alerts` | 告警规则列表 |

## 查询参数

### 分页
```
?page=1&pageSize=20
```

### 资源筛选
```
?type=prompt&status=published&search=react&tags=frontend,component&sort=stars
```
