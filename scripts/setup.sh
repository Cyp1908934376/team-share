#!/bin/bash
set -e

echo "🚀 Team Share - 环境初始化"
echo "========================="

# Check prerequisites
check_command() {
  if ! command -v "$1" &> /dev/null; then
    echo "❌ 未找到 $1，请先安装"
    exit 1
  fi
  echo "✅ $1 已安装"
}

echo ""
echo "检查依赖..."
check_command node
check_command pnpm
check_command docker

# Install dependencies
echo ""
echo "📦 安装依赖..."
pnpm install

# Copy env file
if [ ! -f .env ]; then
  cp .env.example .env
  echo "✅ 已创建 .env 文件（请根据需要修改配置）"
fi

# Start Docker services
echo ""
echo "🐳 启动 Docker 服务..."
cd docker
docker compose up -d
cd ..

# Wait for PostgreSQL to be ready
echo ""
echo "⏳ 等待数据库就绪..."
sleep 5

# Generate Prisma client
echo ""
echo "🔧 生成 Prisma 客户端..."
cd apps/api
pnpm db:generate

# Push database schema
echo ""
echo "📊 推送数据库结构..."
pnpm db:push

# Seed database
echo ""
echo "🌱 填充种子数据..."
pnpm db:seed

cd ../..

echo ""
echo "✨ 初始化完成！"
echo ""
echo "启动开发服务器："
echo "  pnpm dev"
echo ""
echo "访问地址："
echo "  前端: http://localhost:5173"
echo "  后端: http://localhost:3000"
echo "  API 文档: http://localhost:3000/api/docs"
echo "  MinIO 控制台: http://localhost:9001"
echo ""
