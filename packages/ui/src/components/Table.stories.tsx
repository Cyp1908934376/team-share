import type { Meta, StoryObj } from '@storybook/react'
import { Table } from './Table'
import { Badge } from './Badge'

const meta: Meta<typeof Table> = {
  title: 'Components/Table',
  component: Table,
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof Table>

const columns = [
  { key: 'name', label: '名称' },
  { key: 'type', label: '类型' },
  { key: 'status', label: '状态', render: (v: string) => (
    <Badge className={v === 'published' ? 'bg-system-green/10 text-system-green' : 'bg-fill-secondary text-label-secondary'}>
      {v === 'published' ? '已发布' : '草稿'}
    </Badge>
  )},
  { key: 'author', label: '作者' },
  { key: 'date', label: '日期' },
]

const data = [
  { name: 'API 文档生成器', type: 'prompt', status: 'published', author: 'admin', date: '2026-06-10' },
  { name: 'React 组件模板', type: 'component', status: 'published', author: 'zhangsan', date: '2026-06-08' },
  { name: 'NestJS 模块指南', type: 'skill', status: 'draft', author: 'wangwu', date: '2026-06-05' },
]

export const Default: Story = {
  render: () => <Table columns={columns} data={data} />,
}

export const Empty: Story = {
  render: () => <Table columns={columns} data={[]} />,
}
