import type { Meta, StoryObj } from '@storybook/react'
import { Button } from './Button'

const meta: Meta<typeof Button> = {
  title: 'Components/Button',
  component: Button,
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['primary', 'secondary', 'tertiary', 'danger', 'ghost', 'outline'],
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg', 'icon'],
    },
    loading: { control: 'boolean' },
    disabled: { control: 'boolean' },
  },
}

export default meta
type Story = StoryObj<typeof Button>

export const Primary: Story = { args: { children: 'Primary 按钮', variant: 'primary' } }
export const Secondary: Story = { args: { children: 'Secondary 按钮', variant: 'secondary' } }
export const Tertiary: Story = { args: { children: 'Tertiary 按钮', variant: 'tertiary' } }
export const Danger: Story = { args: { children: '删除', variant: 'danger' } }
export const Ghost: Story = { args: { children: '工具栏', variant: 'ghost' } }
export const Small: Story = { args: { children: '小按钮', size: 'sm' } }
export const Large: Story = { args: { children: '大按钮', size: 'lg' } }
export const Loading: Story = { args: { children: '加载中', loading: true } }
export const Disabled: Story = { args: { children: '已禁用', disabled: true } }
