import { AppRoutes } from './routes'
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts'

function App() {
  useKeyboardShortcuts()
  return <AppRoutes />
}

export default App
