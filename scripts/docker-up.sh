#!/bin/bash
set -e

MODE=${1:-dev}

echo "🐳 Team Share - Docker 启动"
echo "=========================="
echo "模式: $MODE"

cd docker

if [ "$MODE" = "prod" ]; then
  echo "📦 启动生产环境..."
  docker compose -f docker-compose.prod.yml up -d --build
  echo ""
  echo "✨ 生产环境已启动！"
  echo "  访问: http://localhost"
else
  echo "📦 启动开发环境（数据库服务）..."
  docker compose up -d
  echo ""
  echo "✨ 数据库服务已启动！"
  echo "  PostgreSQL: localhost:5432"
  echo "  Redis: localhost:6379"
  echo "  MinIO: localhost:9001"
fi
