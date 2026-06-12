import { forwardRef, type HTMLAttributes, createContext, useContext } from 'react'
import { cn } from '../utils/cn'

interface TabsContextType {
  value: string
  onValueChange: (value: string) => void
}

const TabsContext = createContext<TabsContextType | undefined>(undefined)

function useTabs() {
  const context = useContext(TabsContext)
  if (!context) {
    throw new Error('Tabs components must be used within a Tabs provider')
  }
  return context
}

export interface TabsProps extends HTMLAttributes<HTMLDivElement> {
  value: string
  onValueChange: (value: string) => void
}

export const Tabs = forwardRef<HTMLDivElement, TabsProps>(
  ({ className, value, onValueChange, children, ...props }, ref) => {
    return (
      <TabsContext.Provider value={{ value, onValueChange }}>
        <div ref={ref} className={cn('', className)} {...props}>
          {children}
        </div>
      </TabsContext.Provider>
    )
  }
)

Tabs.displayName = 'Tabs'

export interface TabsListProps extends HTMLAttributes<HTMLDivElement> {}

export const TabsList = forwardRef<HTMLDivElement, TabsListProps>(
  ({ className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'flex items-center gap-1 border-b border-separator',
          className
        )}
        {...props}
      />
    )
  }
)

TabsList.displayName = 'TabsList'

export interface TabsTriggerProps extends HTMLAttributes<HTMLButtonElement> {
  value: string
}

export const TabsTrigger = forwardRef<HTMLButtonElement, TabsTriggerProps>(
  ({ className, value, children, ...props }, ref) => {
    const { value: selectedValue, onValueChange } = useTabs()
    const isActive = selectedValue === value

    return (
      <button
        ref={ref}
        className={cn(
          'relative px-4 py-2.5 text-subheadline font-medium transition-colors',
          isActive
            ? 'text-system-blue'
            : 'text-label-secondary hover:text-label-primary',
          className
        )}
        onClick={() => onValueChange(value)}
        {...props}
      >
        {children}
        {isActive && (
          <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-system-blue" />
        )}
      </button>
    )
  }
)

TabsTrigger.displayName = 'TabsTrigger'

export interface TabsContentProps extends HTMLAttributes<HTMLDivElement> {
  value: string
}

export const TabsContent = forwardRef<HTMLDivElement, TabsContentProps>(
  ({ className, value, children, ...props }, ref) => {
    const { value: selectedValue } = useTabs()

    if (selectedValue !== value) return null

    return (
      <div ref={ref} className={cn('', className)} {...props}>
        {children}
      </div>
    )
  }
)

TabsContent.displayName = 'TabsContent'
