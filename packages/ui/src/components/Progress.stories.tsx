import type { Meta, StoryObj } from '@storybook/react'
import { Progress } from './Progress'

const meta: Meta<typeof Progress> = {
  title: 'Components/Progress',
  component: Progress,
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof Progress>

export const Half: Story = { args: { value: 50 } }
export const Complete: Story = { args: { value: 100 } }
export const Empty: Story = { args: { value: 0 } }
export const WithLabel: Story = {
  render: () => (
    <div className="space-y-2">
      <div className="flex justify-between text-footnote">
        <span>部署进度</span><span>75%</span>
      </div>
      <Progress value={75} />
    </div>
  ),
}
