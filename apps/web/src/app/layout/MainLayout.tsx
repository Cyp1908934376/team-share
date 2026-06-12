import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { Toolbar } from './Toolbar'
import { SpotlightSearch } from '@/components/common/SpotlightSearch'

export function MainLayout() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  return (
    <div className="flex h-screen overflow-hidden bg-bg-primary">
      {/* Spotlight Search */}
      <SpotlightSearch />

      {/* Sidebar */}
      <Sidebar
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
      />

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Toolbar */}
        <Toolbar />

        {/* Content */}
        <main className="flex-1 overflow-y-auto bg-bg-secondary p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
