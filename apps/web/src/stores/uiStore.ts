import { create } from 'zustand'
import { persist } from 'zustand/middleware'

type ModalType = 'create-resource' | 'create-environment' | 'create-workflow' | 'create-team' | 'settings' | null

interface UIState {
  sidebarCollapsed: boolean
  inspectorOpen: boolean
  activeModal: ModalType
  sidebarTab: string

  // Actions
  toggleSidebar: () => void
  setSidebarCollapsed: (collapsed: boolean) => void
  toggleInspector: () => void
  setInspectorOpen: (open: boolean) => void
  openModal: (modal: ModalType) => void
  closeModal: () => void
  setSidebarTab: (tab: string) => void
}

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      sidebarCollapsed: false,
      inspectorOpen: false,
      activeModal: null,
      sidebarTab: 'resources',

      toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),

      setSidebarCollapsed: (collapsed: boolean) => set({ sidebarCollapsed: collapsed }),

      toggleInspector: () => set((state) => ({ inspectorOpen: !state.inspectorOpen })),

      setInspectorOpen: (open: boolean) => set({ inspectorOpen: open }),

      openModal: (modal: ModalType) => set({ activeModal: modal }),

      closeModal: () => set({ activeModal: null }),

      setSidebarTab: (tab: string) => set({ sidebarTab: tab }),
    }),
    {
      name: 'ui-storage',
      partialize: (state) => ({
        sidebarCollapsed: state.sidebarCollapsed,
        inspectorOpen: state.inspectorOpen,
        sidebarTab: state.sidebarTab,
      }),
    }
  )
)
