import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useUIStore } from '@/stores/uiStore'
import { useTheme } from '@/app/providers/ThemeProvider'

export function useKeyboardShortcuts() {
  const navigate = useNavigate()
  const { toggleSidebar, toggleInspector, openModal } = useUIStore()
  const { theme, setTheme } = useTheme()

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0
      const mod = isMac ? e.metaKey : e.ctrlKey

      // Cmd/Ctrl+K — Open Spotlight search (handled by SpotlightSearch component)
      // Cmd/Ctrl+N — New resource
      if (mod && e.key === 'n') {
        e.preventDefault()
        navigate('/resources/new')
      }

      // Cmd/Ctrl+S — Already handled by form submissions naturally

      // Cmd/Ctrl+Shift+L — Toggle theme
      if (mod && e.shiftKey && e.key === 'L') {
        e.preventDefault()
        setTheme(theme === 'dark' ? 'light' : 'dark')
      }

      // Cmd/Ctrl+B — Toggle sidebar
      if (mod && e.key === 'b') {
        e.preventDefault()
        toggleSidebar()
      }

      // Cmd/Ctrl+I — Toggle inspector
      if (mod && e.key === 'i') {
        e.preventDefault()
        toggleInspector()
      }

      // Cmd/Ctrl+1..9 — Navigate to sidebar tabs
      if (mod && e.key >= '1' && e.key <= '9') {
        e.preventDefault()
        const tabs: Record<string, string> = {
          '1': '/',
          '2': '/resources',
          '3': '/environments',
          '4': '/workflows',
          '5': '/versions',
          '6': '/teams',
          '7': '/monitoring',
        }
        const path = tabs[e.key]
        if (path) navigate(path)
      }

      // Escape — Close modal / deselect
      if (e.key === 'Escape') {
        // uiStore.closeModal is handled in individual modal components via onClose
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [navigate, toggleSidebar, toggleInspector, theme, setTheme, openModal])
}
