import { NavLink, useNavigate } from 'react-router-dom'
import {
  Home,
  Layers,
  Server,
  GitBranch,
  Activity,
  Package,
  Workflow,
  Users,
  ChevronDown,
  ChevronLeft,
  Plus,
} from 'lucide-react'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/utils/cn'

interface NavItem {
  label: string
  icon: React.ReactNode
  path: string
}

const mainNavItems: NavItem[] = [
  { label: '首页', icon: <Home size={20} />, path: '/' },
  { label: '资源', icon: <Layers size={20} />, path: '/resources' },
  { label: '环境', icon: <Server size={20} />, path: '/environments' },
  { label: '工作流', icon: <Workflow size={20} />, path: '/workflows' },
  { label: '版本', icon: <GitBranch size={20} />, path: '/versions' },
  { label: '团队', icon: <Users size={20} />, path: '/teams' },
  { label: '监控', icon: <Activity size={20} />, path: '/monitoring' },
]

const resourceTypes = [
  { label: '提示词', count: 12 },
  { label: '技能', count: 8 },
  { label: '组件', count: 24 },
  { label: 'MCP', count: 5 },
  { label: '模板', count: 3 },
]

interface SidebarProps {
  collapsed?: boolean
  onToggleCollapse?: () => void
}

export function Sidebar({ collapsed = false, onToggleCollapse }: SidebarProps) {
  const navigate = useNavigate()
  const [isResourcesExpanded, setIsResourcesExpanded] = useState(true)

  return (
    <motion.aside
      initial={false}
      animate={{ width: collapsed ? 64 : 240 }}
      transition={{ duration: 0.2, ease: 'easeInOut' }}
      className="backdrop-glass-sidebar flex flex-col border-r border-separator overflow-hidden"
    >
      {/* Logo */}
      <div className="flex h-12 items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <Package size={24} className="text-system-blue flex-shrink-0" />
          <AnimatePresence>
            {!collapsed && (
              <motion.span
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: 'auto' }}
                exit={{ opacity: 0, width: 0 }}
                transition={{ duration: 0.15 }}
                className="text-headline font-semibold whitespace-nowrap"
              >
                Team Share
              </motion.span>
            )}
          </AnimatePresence>
        </div>
        {onToggleCollapse && (
          <button
            onClick={onToggleCollapse}
            className={cn(
              'rounded-lg p-1.5 text-label-secondary transition-colors hover:bg-fill-quaternary',
              collapsed && 'mx-auto'
            )}
          >
            <ChevronLeft
              size={16}
              className={cn(
                'transition-transform duration-200',
                collapsed && 'rotate-180'
              )}
            />
          </button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto overflow-x-hidden px-2 py-2">
        {/* Main Navigation */}
        <ul className="space-y-0.5">
          {mainNavItems.map((item) => (
            <li key={item.path}>
              <NavLink
                to={item.path}
                className={({ isActive }) =>
                  cn(
                    'flex items-center gap-3 rounded-lg px-3 py-2 text-subheadline transition-colors',
                    isActive
                      ? 'bg-system-blue/10 text-system-blue'
                      : 'text-label-secondary hover:bg-fill-quaternary hover:text-label-primary',
                    collapsed && 'justify-center px-0'
                  )
                }
                title={collapsed ? item.label : undefined}
              >
                <span className="flex-shrink-0">{item.icon}</span>
                <AnimatePresence>
                  {!collapsed && (
                    <motion.span
                      initial={{ opacity: 0, width: 0 }}
                      animate={{ opacity: 1, width: 'auto' }}
                      exit={{ opacity: 0, width: 0 }}
                      transition={{ duration: 0.15 }}
                      className="whitespace-nowrap"
                    >
                      {item.label}
                    </motion.span>
                  )}
                </AnimatePresence>
              </NavLink>
            </li>
          ))}
        </ul>

        {/* Resource Types Section */}
        <AnimatePresence>
          {!collapsed && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="mt-6"
            >
              <button
                onClick={() => setIsResourcesExpanded(!isResourcesExpanded)}
                className="flex w-full items-center justify-between px-3 py-1.5 text-caption-1 uppercase tracking-wider text-label-tertiary"
              >
                <span>资源类型</span>
                <ChevronDown
                  size={14}
                  className={cn(
                    'transition-transform duration-200',
                    !isResourcesExpanded && '-rotate-90'
                  )}
                />
              </button>

              <AnimatePresence>
                {isResourcesExpanded && (
                  <motion.ul
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.15 }}
                    className="mt-1 space-y-0.5 overflow-hidden"
                  >
                    {resourceTypes.map((type) => (
                      <li key={type.label}>
                        <button className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-subheadline text-label-secondary transition-colors hover:bg-fill-quaternary hover:text-label-primary">
                          <span>{type.label}</span>
                          <span className="rounded-full bg-fill-quaternary px-2 py-0.5 text-caption-2 text-label-tertiary">
                            {type.count}
                          </span>
                        </button>
                      </li>
                    ))}
                  </motion.ul>
                )}
              </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* Bottom Actions — Apple-style subtle */}
      <div className="border-t border-separator p-2">
        <button
          onClick={() => navigate('/resources/new')}
          className={cn(
            'flex w-full items-center gap-2 rounded-lg px-3 py-2 text-subheadline text-label-secondary transition-colors hover:bg-fill-quaternary hover:text-label-primary',
            collapsed && 'justify-center px-0'
          )}
          title={collapsed ? '新建资源' : undefined}
        >
          <Plus size={18} className="flex-shrink-0" />
          <AnimatePresence>
            {!collapsed && (
              <motion.span
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: 'auto' }}
                exit={{ opacity: 0, width: 0 }}
                transition={{ duration: 0.15 }}
                className="whitespace-nowrap"
              >
                新建资源
              </motion.span>
            )}
          </AnimatePresence>
        </button>
      </div>
    </motion.aside>
  )
}
