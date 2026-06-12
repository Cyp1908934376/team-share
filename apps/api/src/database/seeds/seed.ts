import { PrismaClient } from '@prisma/client'
import * as bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  // Create admin user
  const adminPassword = await bcrypt.hash('admin123', 10)
  const admin = await prisma.user.upsert({
    where: { email: 'admin@teamshare.com' },
    update: {},
    create: {
      username: 'admin',
      email: 'admin@teamshare.com',
      displayName: '管理员',
      passwordHash: adminPassword,
      role: 'admin',
    },
  })
  console.log('✅ Created admin user:', admin.username)

  // Create demo user
  const demoPassword = await bcrypt.hash('demo123', 10)
  const demo = await prisma.user.upsert({
    where: { email: 'demo@teamshare.com' },
    update: {},
    create: {
      username: 'demo',
      email: 'demo@teamshare.com',
      displayName: '演示用户',
      passwordHash: demoPassword,
      role: 'user',
    },
  })
  console.log('✅ Created demo user:', demo.username)

  // Create demo team
  const team = await prisma.team.upsert({
    where: { slug: 'frontend-team' },
    update: {},
    create: {
      name: '前端团队',
      slug: 'frontend-team',
      description: '负责前端开发的团队',
      members: {
        create: [
          { userId: admin.id, role: 'owner' },
          { userId: demo.id, role: 'member' },
        ],
      },
    },
  })
  console.log('✅ Created team:', team.name)

  // Create demo resources
  const promptResource = await prisma.resource.create({
    data: {
      type: 'prompt',
      name: 'API 文档生成提示词',
      slug: 'api-doc-generator',
      description: '用于生成 API 文档的提示词模板',
      content: {
        template: '请为以下 API 生成详细的文档...',
        variables: ['apiName', 'endpoints', 'parameters'],
      },
      tags: ['api', 'documentation', 'generator'],
      category: '开发工具',
      visibility: 'team',
      ownerId: admin.id,
      teamId: team.id,
      status: 'published',
      publishedAt: new Date(),
    },
  })
  console.log('✅ Created resource:', promptResource.name)

  const skillResource = await prisma.resource.create({
    data: {
      type: 'skill',
      name: 'React 组件开发技能',
      slug: 'react-component-dev',
      description: 'React 组件开发最佳实践',
      content: {
        instructions: '按照以下步骤创建 React 组件...',
        patterns: ['functional-component', 'hooks', 'context'],
      },
      tags: ['react', 'component', 'frontend'],
      category: '前端开发',
      visibility: 'team',
      ownerId: demo.id,
      teamId: team.id,
      status: 'published',
      publishedAt: new Date(),
    },
  })
  console.log('✅ Created resource:', skillResource.name)

  // Create demo environment
  const env = await prisma.environment.create({
    data: {
      name: 'development',
      displayName: '开发环境',
      description: '本地开发环境配置',
      teamId: team.id,
      variables: {
        NODE_ENV: 'development',
        PORT: '3000',
        API_URL: 'http://localhost:4000',
      },
      dependencies: {
        node: '>=20.0.0',
        pnpm: '>=8.0.0',
      },
    },
  })
  console.log('✅ Created environment:', env.name)

  // Create demo workflow
  const workflow = await prisma.workflow.create({
    data: {
      name: '一键部署',
      description: '完整的部署流程：构建 → 测试 → 部署',
      teamId: team.id,
      nodes: [
        { id: 'start', type: 'start', name: '开始', config: {}, position: { x: 0, y: 0 }, inputs: [], outputs: [] },
        { id: 'build', type: 'task', name: '构建', config: { command: 'pnpm build' }, position: { x: 200, y: 0 }, inputs: [], outputs: [] },
        { id: 'test', type: 'task', name: '测试', config: { command: 'pnpm test' }, position: { x: 400, y: 0 }, inputs: [], outputs: [] },
        { id: 'deploy', type: 'task', name: '部署', config: { command: 'pnpm deploy' }, position: { x: 600, y: 0 }, inputs: [], outputs: [] },
        { id: 'end', type: 'end', name: '完成', config: {}, position: { x: 800, y: 0 }, inputs: [], outputs: [] },
      ],
      edges: [
        { id: 'e1', source: 'start', target: 'build' },
        { id: 'e2', source: 'build', target: 'test' },
        { id: 'e3', source: 'test', target: 'deploy' },
        { id: 'e4', source: 'deploy', target: 'end' },
      ],
      status: 'active',
    },
  })
  console.log('✅ Created workflow:', workflow.name)

  console.log('🎉 Seeding completed!')
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
