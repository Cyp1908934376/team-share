import { describe, it, expect, beforeEach, vi } from 'vitest'

// Mock the auth service
vi.mock('@/services/auth', () => ({
  authService: {
    login: vi.fn(),
    register: vi.fn(),
    logout: vi.fn(),
    getProfile: vi.fn(),
    isAuthenticated: vi.fn(),
  },
}))

import { useAuthStore } from '../authStore'
import { authService } from '@/services/auth'

describe('authStore', () => {
  const mockUser = {
    id: 'user-1',
    username: 'testuser',
    email: 'test@example.com',
    displayName: 'Test User',
    role: 'user',
  }

  const mockToken = 'mock-jwt-token'

  beforeEach(() => {
    // Reset the store to initial state
    useAuthStore.setState({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
    })
    vi.clearAllMocks()
  })

  describe('login', () => {
    it('should set user and token on successful login', async () => {
      ;(authService.login as ReturnType<typeof vi.fn>).mockResolvedValue({
        user: mockUser,
        token: mockToken,
      })

      await useAuthStore.getState().login('testuser', 'password123')

      const state = useAuthStore.getState()
      expect(state.user).toEqual(mockUser)
      expect(state.token).toBe(mockToken)
      expect(state.isAuthenticated).toBe(true)
      expect(state.isLoading).toBe(false)
      expect(state.error).toBeNull()
    })

    it('should set error on failed login', async () => {
      const error = new Error('用户名或密码错误')
      ;(authService.login as ReturnType<typeof vi.fn>).mockRejectedValue(error)

      await expect(
        useAuthStore.getState().login('testuser', 'wrongpass'),
      ).rejects.toThrow()

      const state = useAuthStore.getState()
      expect(state.error).toBe('用户名或密码错误')
      expect(state.isLoading).toBe(false)
      expect(state.isAuthenticated).toBe(false)
    })

    it('should set loading state during login', () => {
      ;(authService.login as ReturnType<typeof vi.fn>).mockImplementation(
        () => new Promise((resolve) => setTimeout(() => resolve({ user: mockUser, token: mockToken }), 100)),
      )

      useAuthStore.getState().login('testuser', 'pass')

      expect(useAuthStore.getState().isLoading).toBe(true)
    })
  })

  describe('register', () => {
    const registerData = {
      username: 'newuser',
      email: 'new@example.com',
      password: 'password123',
      displayName: 'New User',
    }

    it('should set user and token on successful registration', async () => {
      ;(authService.register as ReturnType<typeof vi.fn>).mockResolvedValue({
        user: { ...mockUser, ...registerData },
        token: mockToken,
      })

      await useAuthStore.getState().register(registerData)

      const state = useAuthStore.getState()
      expect(state.user).toBeTruthy()
      expect(state.isAuthenticated).toBe(true)
    })

    it('should set error on failed registration', async () => {
      const error = new Error('用户名或邮箱已存在')
      ;(authService.register as ReturnType<typeof vi.fn>).mockRejectedValue(error)

      await expect(
        useAuthStore.getState().register(registerData),
      ).rejects.toThrow()

      expect(useAuthStore.getState().error).toBe('用户名或邮箱已存在')
    })
  })

  describe('logout', () => {
    it('should clear state and call authService.logout', () => {
      // Set logged-in state first
      useAuthStore.setState({
        user: mockUser,
        token: mockToken,
        isAuthenticated: true,
      })

      useAuthStore.getState().logout()

      const state = useAuthStore.getState()
      expect(state.user).toBeNull()
      expect(state.token).toBeNull()
      expect(state.isAuthenticated).toBe(false)
      expect(authService.logout).toHaveBeenCalledTimes(1)
    })
  })

  describe('fetchProfile', () => {
    it('should update user from profile', async () => {
      ;(authService.isAuthenticated as ReturnType<typeof vi.fn>).mockReturnValue(true)
      const updatedUser = { ...mockUser, displayName: 'Updated Name' }
      ;(authService.getProfile as ReturnType<typeof vi.fn>).mockResolvedValue(updatedUser)

      await useAuthStore.getState().fetchProfile()

      expect(useAuthStore.getState().user).toEqual(updatedUser)
      expect(useAuthStore.getState().isAuthenticated).toBe(true)
    })

    it('should not fetch if not authenticated', async () => {
      ;(authService.isAuthenticated as ReturnType<typeof vi.fn>).mockReturnValue(false)

      await useAuthStore.getState().fetchProfile()

      expect(authService.getProfile).not.toHaveBeenCalled()
    })

    it('should handle error gracefully', async () => {
      ;(authService.isAuthenticated as ReturnType<typeof vi.fn>).mockReturnValue(true)
      ;(authService.getProfile as ReturnType<typeof vi.fn>).mockRejectedValue(new Error('Network error'))

      await useAuthStore.getState().fetchProfile()

      expect(useAuthStore.getState().isLoading).toBe(false)
    })
  })

  describe('clearError', () => {
    it('should clear error state', () => {
      useAuthStore.setState({ error: 'Some error' })

      useAuthStore.getState().clearError()

      expect(useAuthStore.getState().error).toBeNull()
    })
  })
})
