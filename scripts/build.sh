#!/bin/bash
set -e

echo "🔨 Team Share - 构建项目"
echo "========================"

# Clean previous builds
echo ""
echo "🧹 清理旧构建..."
pnpm clean

# Install dependencies
echo ""
echo "📦 安装依赖..."
pnpm install

# Generate Prisma client
echo ""
echo "🔧 生成 Prisma 客户端..."
cd apps/api
pnpm db:generate
cd ../..

# Build all packages
echo ""
echo "🏗️ 构建所有包..."
pnpm build

echo ""
echo "✨ 构建完成！"
echo ""
echo "构建产物："
echo "  前端: apps/web/dist"
echo "  后端: apps/api/dist"
