import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Search,
  Layers,
  Server,
  Workflow,
  Settings,
  Plus,
  FileText,
  Command,
} from 'lucide-react'
import { resourcesService } from '@/services/resources'
import { RESOURCE_TYPE_LABELS } from '@team-share/shared'
import { cn } from '@/utils/cn'

interface SearchResult {
  id: string
  type: 'resource' | 'command' | 'setting'
  title: string
  description?: string
  icon: React.ReactNode
  action: () => void
}

export function SpotlightSearch() {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const navigate = useNavigate()

  const { data: resources } = useQuery({
    queryKey: ['search-resources', query],
    queryFn: () => resourcesService.findAll({ search: query, pageSize: 5 }),
    enabled: open && query.length > 0,
  })

  // Keyboard shortcut and custom event
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setOpen((prev) => !prev)
      }
      if (e.key === 'Escape') {
        setOpen(false)
      }
    }

    const handleOpenSearch = () => setOpen(true)

    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('open-spotlight-search', handleOpenSearch)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('open-spotlight-search', handleOpenSearch)
    }
  }, [])

  // Reset query when closing
  useEffect(() => {
    if (!open) {
      setQuery('')
    }
  }, [open])

  const commands: SearchResult[] = [
    {
      id: 'new-resource',
      type: 'command',
      title: '新建资源',
      description: '创建一个新的资源',
      icon: <Plus size={16} className="text-system-blue" />,
      action: () => {
        navigate('/resources/new')
        setOpen(false)
      },
    },
    {
      id: 'go-resources',
      type: 'command',
      title: '前往资源管理',
      icon: <Layers size={16} className="text-system-blue" />,
      action: () => {
        navigate('/resources')
        setOpen(false)
      },
    },
    {
      id: 'go-environments',
      type: 'command',
      title: '前往环境管理',
      icon: <Server size={16} className="text-system-green" />,
      action: () => {
        navigate('/environments')
        setOpen(false)
      },
    },
    {
      id: 'go-workflows',
      type: 'command',
      title: '前往工作流',
      icon: <Workflow size={16} className="text-system-purple" />,
      action: () => {
        navigate('/workflows')
        setOpen(false)
      },
    },
    {
      id: 'go-settings',
      type: 'command',
      title: '前往设置',
      icon: <Settings size={16} className="text-label-secondary" />,
      action: () => {
        navigate('/settings')
        setOpen(false)
      },
    },
  ]

  const resourceResults: SearchResult[] =
    resources?.items?.map((resource: any) => ({
      id: resource.id,
      type: 'resource',
      title: resource.name,
      description: RESOURCE_TYPE_LABELS[resource.type] || resource.type,
      icon: <FileText size={16} className="text-system-blue" />,
      action: () => {
        navigate(`/resources/${resource.id}`)
        setOpen(false)
      },
    })) || []

  const filteredCommands = commands.filter((cmd) =>
    cmd.title.toLowerCase().includes(query.toLowerCase())
  )

  const allResults = query.length > 0 ? [...resourceResults, ...filteredCommands] : commands

  const [selectedIndex, setSelectedIndex] = useState(0)

  useEffect(() => {
    setSelectedIndex(0)
  }, [query])

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault()
        setSelectedIndex((prev) => Math.min(prev + 1, allResults.length - 1))
      } else if (e.key === 'ArrowUp') {
        e.preventDefault()
        setSelectedIndex((prev) => Math.max(prev - 1, 0))
      } else if (e.key === 'Enter' && allResults[selectedIndex]) {
        e.preventDefault()
        allResults[selectedIndex].action()
      }
    },
    [allResults, selectedIndex]
  )

  return createPortal(
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-[20vh]">
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          />

          {/* Search Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.98, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.98, y: -10 }}
            transition={{ duration: 0.15 }}
            className="relative z-10 w-full max-w-lg overflow-hidden rounded-xl bg-bg-elevated shadow-apple-4"
          >
            {/* Search Input */}
            <div className="flex items-center gap-3 border-b border-separator px-4 py-3">
              <Search size={18} className="text-label-tertiary" />
              <input
                autoFocus
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="搜索资源、命令、设置..."
                className="flex-1 bg-transparent text-body text-label-primary outline-none placeholder:text-label-tertiary"
              />
              <kbd className="rounded border border-separator px-1.5 py-0.5 text-caption-2 text-label-tertiary">
                ESC
              </kbd>
            </div>

            {/* Results */}
            <div className="max-h-[300px] overflow-y-auto p-2">
              {allResults.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8">
                  <Search size={24} className="text-label-tertiary" />
                  <p className="mt-2 text-footnote text-label-tertiary">
                    未找到结果
                  </p>
                </div>
              ) : (
                <>
                  {/* Commands Section */}
                  {filteredCommands.length > 0 && (
                    <div>
                      <p className="px-3 py-1.5 text-caption-1 text-label-tertiary">
                        命令
                      </p>
                      {filteredCommands.map((result, index) => (
                        <button
                          key={result.id}
                          onClick={result.action}
                          onMouseEnter={() => setSelectedIndex(index)}
                          className={cn(
                            'flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left transition-colors',
                            selectedIndex === index
                              ? 'bg-system-blue/10 text-system-blue'
                              : 'text-label-primary hover:bg-fill-quaternary'
                          )}
                        >
                          {result.icon}
                          <div className="flex-1">
                            <p className="text-subheadline">{result.title}</p>
                            {result.description && (
                              <p className="text-caption-1 text-label-tertiary">
                                {result.description}
                              </p>
                            )}
                          </div>
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Resources Section */}
                  {resourceResults.length > 0 && (
                    <div className="mt-2">
                      <p className="px-3 py-1.5 text-caption-1 text-label-tertiary">
                        资源
                      </p>
                      {resourceResults.map((result, index) => {
                        const actualIndex = filteredCommands.length + index
                        return (
                          <button
                            key={result.id}
                            onClick={result.action}
                            onMouseEnter={() => setSelectedIndex(actualIndex)}
                            className={cn(
                              'flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left transition-colors',
                              selectedIndex === actualIndex
                                ? 'bg-system-blue/10 text-system-blue'
                                : 'text-label-primary hover:bg-fill-quaternary'
                            )}
                          >
                            {result.icon}
                            <div className="flex-1">
                              <p className="text-subheadline">{result.title}</p>
                              {result.description && (
                                <p className="text-caption-1 text-label-tertiary">
                                  {result.description}
                                </p>
                              )}
                            </div>
                          </button>
                        )
                      })}
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between border-t border-separator px-4 py-2">
              <div className="flex items-center gap-4 text-caption-1 text-label-tertiary">
                <span className="flex items-center gap-1">
                  <kbd className="rounded border border-separator px-1">↑</kbd>
                  <kbd className="rounded border border-separator px-1">↓</kbd>
                  导航
                </span>
                <span className="flex items-center gap-1">
                  <kbd className="rounded border border-separator px-1">↵</kbd>
                  选择
                </span>
              </div>
              <span className="text-caption-1 text-label-tertiary">
                <Command size={12} className="inline" /> K 打开搜索
              </span>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  )
}
