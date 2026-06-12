#!/bin/bash
set -e

echo "🌱 Team Share - 填充种子数据"
echo "============================"

cd apps/api

echo "生成 Prisma 客户端..."
pnpm db:generate

echo "推送数据库结构..."
pnpm db:push

echo "填充种子数据..."
pnpm db:seed

echo ""
echo "✨ 种子数据填充完成！"
echo ""
echo "Demo 账号："
echo "  管理员: admin / admin123456"
echo "  普通用户: demo / demo123456"
