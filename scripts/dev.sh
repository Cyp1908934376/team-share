#!/bin/bash
set -e

echo "🚀 启动开发环境..."

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
  echo "❌ Docker 未运行，请先启动 Docker"
  exit 1
fi

# Start Docker services if not running
cd docker
docker compose up -d
cd ..

# Start dev servers
echo ""
echo "📦 启动开发服务器..."
pnpm dev
