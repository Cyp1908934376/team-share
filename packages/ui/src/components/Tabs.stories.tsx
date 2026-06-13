import type { Meta, StoryObj } from '@storybook/react'
import { Tabs, TabsList, TabsTrigger, TabsContent } from './Tabs'

const meta: Meta<typeof Tabs> = {
  title: 'Components/Tabs',
  component: Tabs,
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof Tabs>

export const Default: Story = {
  render: () => (
    <Tabs defaultValue="tab1">
      <TabsList>
        <TabsTrigger value="tab1">基本信息</TabsTrigger>
        <TabsTrigger value="tab2">版本历史</TabsTrigger>
        <TabsTrigger value="tab3">使用统计</TabsTrigger>
      </TabsList>
      <TabsContent value="tab1" className="p-4">
        <p>基本信息内容</p>
      </TabsContent>
      <TabsContent value="tab2" className="p-4">
        <p>版本历史内容</p>
      </TabsContent>
      <TabsContent value="tab3" className="p-4">
        <p>使用统计内容</p>
      </TabsContent>
    </Tabs>
  ),
}
