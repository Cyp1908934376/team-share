# 部署指南

## Docker Compose 部署

```bash
# 构建镜像
pnpm build

# 启动生产环境
cd docker
docker-compose -f docker-compose.prod.yml up -d
```

## Kubernetes 部署

### 前置条件
- Kubernetes 集群 (v1.26+)
- kubectl 配置
- Nginx Ingress Controller
- cert-manager (可选)

### 部署步骤

```bash
# 构建并推送镜像
docker build -f docker/api.Dockerfile -t ghcr.io/your-org/team-share-api:latest .
docker build -f docker/web.Dockerfile -t ghcr.io/your-org/team-share-web:latest .
docker push ghcr.io/your-org/team-share-api:latest
docker push ghcr.io/your-org/team-share-web:latest

# 修改 k8s/base/secret.yaml 中的密钥

# 应用 K8s 配置
kubectl apply -k k8s/overlays/prod

# 查看状态
kubectl get pods -n team-share
kubectl get ingress -n team-share
```

## CI/CD (GitHub Actions)

自动化流程：
1. **CI**: 每次 push/PR → lint + type-check + test
2. **Deploy**: main 分支 push → Docker 构建 + K8s 部署

## 环境变量

| 变量 | 说明 | 默认值 |
|------|------|--------|
| `DATABASE_URL` | PostgreSQL 连接串 | - |
| `REDIS_URL` | Redis 连接串 | `redis://localhost:6379` |
| `JWT_SECRET` | JWT 签名密钥 | - |
| `MINIO_ENDPOINT` | MinIO 地址 | `localhost` |
| `MINIO_ACCESS_KEY` | MinIO 访问密钥 | `minioadmin` |
| `MINIO_SECRET_KEY` | MinIO 秘密密钥 | - |
| `CORS_ORIGIN` | 允许的跨域来源 | `http://localhost:3000` |
