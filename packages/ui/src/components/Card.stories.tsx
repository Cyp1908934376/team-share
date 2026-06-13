import type { Meta, StoryObj } from '@storybook/react'
import { Card, CardHeader, CardContent, CardFooter } from './Card'
import { Button } from './Button'

const meta: Meta<typeof Card> = {
  title: 'Components/Card',
  component: Card,
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof Card>

export const Default: Story = {
  render: () => (
    <Card>
      <CardHeader>
        <h3 className="text-headline">卡片标题</h3>
        <p className="text-callout text-label-secondary">卡片副标题</p>
      </CardHeader>
      <CardContent>
        <p className="text-body">这是卡片的主要内容区域。可以放置任意内容。</p>
      </CardContent>
      <CardFooter>
        <div className="flex gap-2">
          <Button variant="secondary">取消</Button>
          <Button>确认</Button>
        </div>
      </CardFooter>
    </Card>
  ),
}

export const ResourceCard: Story = {
  render: () => (
    <Card className="p-4">
      <div className="flex items-start justify-between mb-3">
        <div className="w-10 h-10 rounded-lg bg-system-blue/10 flex items-center justify-center">
          <span className="text-xl">📝</span>
        </div>
      </div>
      <h4 className="text-headline mb-1">代码审查助手</h4>
      <p className="text-callout text-label-secondary mb-3 line-clamp-2">
        帮助团队进行代码审查的提示词模板
      </p>
      <div className="flex gap-2 mb-3">
        <span className="px-2 py-0.5 bg-system-blue/10 text-system-blue text-caption-2 rounded">代码</span>
        <span className="px-2 py-0.5 bg-system-green/10 text-system-green text-caption-2 rounded">安全</span>
      </div>
      <div className="flex items-center gap-4 text-footnote text-label-tertiary">
        <span>👤 admin</span>
        <span>⭐ 38</span>
        <span>📥 203</span>
      </div>
    </Card>
  ),
}
