import type { Meta, StoryObj } from '@storybook/react'
import { useState } from 'react'
import { Modal } from './Modal'
import { Button } from './Button'

const meta: Meta<typeof Modal> = {
  title: 'Components/Modal',
  component: Modal,
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof Modal>

export const Default: Story = {
  render: () => {
    const [open, setOpen] = useState(true)
    return (
      <div>
        <Button onClick={() => setOpen(true)}>打开弹窗</Button>
        <Modal open={open} onClose={() => setOpen(false)} title="确认操作">
          <p className="text-callout mb-6">确定要删除此资源吗？此操作不可撤销。</p>
          <div className="flex justify-end gap-3">
            <Button variant="secondary" onClick={() => setOpen(false)}>取消</Button>
            <Button variant="danger" onClick={() => setOpen(false)}>删除</Button>
          </div>
        </Modal>
      </div>
    )
  },
}

export const Alert: Story = {
  render: () => {
    const [open, setOpen] = useState(true)
    return (
      <div>
        <Modal open={open} onClose={() => setOpen(false)} title="成功">
          <div className="text-center py-4">
            <div className="w-12 h-12 rounded-full bg-system-green/10 flex items-center justify-center mx-auto mb-3">
              <span className="text-2xl">✅</span>
            </div>
            <p className="text-headline">操作成功</p>
            <p className="text-callout text-label-secondary mt-1">资源已成功发布</p>
          </div>
          <div className="flex justify-center mt-4">
            <Button onClick={() => setOpen(false)}>知道了</Button>
          </div>
        </Modal>
      </div>
    )
  },
}
