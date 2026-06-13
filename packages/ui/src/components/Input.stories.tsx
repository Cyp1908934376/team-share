import type { Meta, StoryObj } from '@storybook/react'
import { Input } from './Input'

const meta: Meta<typeof Input> = {
  title: 'Components/Input',
  component: Input,
  tags: ['autodocs'],
  argTypes: {
    error: { control: 'boolean' },
  },
}

export default meta
type Story = StoryObj<typeof Input>

export const Default: Story = { args: { placeholder: '请输入内容...' } }
export const WithLabel: Story = { args: { label: '用户名', placeholder: '请输入用户名' } }
export const WithHelper: Story = { args: { label: '邮箱', helperText: '我们将不会公开您的邮箱地址' } }
export const Error: Story = { args: { label: '密码', type: 'password', error: true, helperText: '密码长度至少为6位' } }
export const Disabled: Story = { args: { label: '只读', value: '不可编辑', disabled: true } }
export const Search: Story = { args: { placeholder: '搜索资源...', icon: '🔍' } }
