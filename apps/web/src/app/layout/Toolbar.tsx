import { Search, Moon, Sun, Settings } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useTheme } from '../providers/ThemeProvider'
import { NotificationBell } from '@/components/common/NotificationBell'

export function Toolbar() {
  const { resolvedTheme, setTheme } = useTheme()
  const navigate = useNavigate()

  const toggleTheme = () => {
    setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')
  }

  const openSearch = () => {
    window.dispatchEvent(new CustomEvent('open-spotlight-search'))
  }

  return (
    <header className="backdrop-glass flex h-12 items-center justify-between border-b border-separator px-4">
      {/* Search */}
      <div className="flex items-center gap-3">
        <button
          onClick={openSearch}
          className="flex items-center gap-2 rounded-lg bg-fill-quaternary px-3 py-1.5 text-label-secondary transition-colors hover:bg-fill-tertiary"
        >
          <Search size={16} />
          <span className="text-footnote">搜索</span>
          <kbd className="ml-4 rounded border border-separator px-1.5 py-0.5 text-caption-2 text-label-tertiary">
            ⌘K
          </kbd>
        </button>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1">
        <button
          onClick={toggleTheme}
          className="rounded-lg p-2 text-label-secondary transition-colors hover:bg-fill-quaternary hover:text-label-primary"
          title={resolvedTheme === 'dark' ? '切换到亮色模式' : '切换到暗色模式'}
        >
          {resolvedTheme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
        </button>
        <NotificationBell />
        <button
          onClick={() => navigate('/settings')}
          className="rounded-lg p-2 text-label-secondary transition-colors hover:bg-fill-quaternary hover:text-label-primary"
        >
          <Settings size={18} />
        </button>
      </div>
    </header>
  )
}
