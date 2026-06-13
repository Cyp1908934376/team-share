import type { Meta, StoryObj } from '@storybook/react'
import { Badge } from './Badge'

const meta: Meta<typeof Badge> = {
  title: 'Components/Badge',
  component: Badge,
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof Badge>

export const Success: Story = {
  render: () => <Badge className="bg-system-green/10 text-system-green">已发布</Badge>,
}
export const Warning: Story = {
  render: () => <Badge className="bg-system-orange/10 text-system-orange">审核中</Badge>,
}
export const Error: Story = {
  render: () => <Badge className="bg-system-red/10 text-system-red">失败</Badge>,
}
export const Info: Story = {
  render: () => <Badge className="bg-system-blue/10 text-system-blue">提示词</Badge>,
}
export const Default: Story = {
  render: () => <Badge className="bg-fill-secondary text-label-secondary">默认</Badge>,
}
export const Pill: Story = {
  render: () => <Badge className="rounded-full bg-system-purple/10 text-system-purple px-3">高级</Badge>,
}
