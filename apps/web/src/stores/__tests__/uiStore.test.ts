import { describe, it, expect, beforeEach } from 'vitest'
import { useUIStore } from '../uiStore'

describe('uiStore', () => {
  beforeEach(() => {
    useUIStore.setState({
      sidebarCollapsed: false,
      inspectorOpen: false,
      activeModal: null,
      sidebarTab: 'resources',
    })
  })

  describe('toggleSidebar', () => {
    it('should toggle sidebar collapsed state', () => {
      expect(useUIStore.getState().sidebarCollapsed).toBe(false)

      useUIStore.getState().toggleSidebar()
      expect(useUIStore.getState().sidebarCollapsed).toBe(true)

      useUIStore.getState().toggleSidebar()
      expect(useUIStore.getState().sidebarCollapsed).toBe(false)
    })
  })

  describe('setSidebarCollapsed', () => {
    it('should set sidebar collapsed directly', () => {
      useUIStore.getState().setSidebarCollapsed(true)
      expect(useUIStore.getState().sidebarCollapsed).toBe(true)

      useUIStore.getState().setSidebarCollapsed(false)
      expect(useUIStore.getState().sidebarCollapsed).toBe(false)
    })
  })

  describe('toggleInspector', () => {
    it('should toggle inspector panel', () => {
      expect(useUIStore.getState().inspectorOpen).toBe(false)

      useUIStore.getState().toggleInspector()
      expect(useUIStore.getState().inspectorOpen).toBe(true)
    })
  })

  describe('setInspectorOpen', () => {
    it('should set inspector state directly', () => {
      useUIStore.getState().setInspectorOpen(true)
      expect(useUIStore.getState().inspectorOpen).toBe(true)
      useUIStore.getState().setInspectorOpen(false)
      expect(useUIStore.getState().inspectorOpen).toBe(false)
    })
  })

  describe('openModal / closeModal', () => {
    it('should open and close modal', () => {
      useUIStore.getState().openModal('create-resource')
      expect(useUIStore.getState().activeModal).toBe('create-resource')

      useUIStore.getState().closeModal()
      expect(useUIStore.getState().activeModal).toBeNull()
    })
  })

  describe('setSidebarTab', () => {
    it('should set active sidebar tab', () => {
      useUIStore.getState().setSidebarTab('workflows')
      expect(useUIStore.getState().sidebarTab).toBe('workflows')
    })
  })
})
