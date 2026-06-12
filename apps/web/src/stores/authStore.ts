import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { authService } from '@/services/auth'

interface User {
  id: string
  username: string
  email: string
  displayName?: string
  avatar?: string
  role: string
}

interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null

  login: (usernameOrEmail: string, password: string) => Promise<void>
  register: (data: { username: string; email: string; password: string; displayName?: string }) => Promise<void>
  logout: () => void
  fetchProfile: () => Promise<void>
  clearError: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      login: async (usernameOrEmail: string, password: string) => {
        set({ isLoading: true, error: null })
        try {
          const response = await authService.login({ usernameOrEmail, password })
          set({
            user: response.user,
            token: response.token,
            isAuthenticated: true,
            isLoading: false,
          })
        } catch (error: any) {
          set({
            error: error.message || '登录失败',
            isLoading: false,
          })
          throw error
        }
      },

      register: async (data) => {
        set({ isLoading: true, error: null })
        try {
          const response = await authService.register(data)
          set({
            user: response.user,
            token: response.token,
            isAuthenticated: true,
            isLoading: false,
          })
        } catch (error: any) {
          set({
            error: error.message || '注册失败',
            isLoading: false,
          })
          throw error
        }
      },

      logout: () => {
        authService.logout()
        set({
          user: null,
          token: null,
          isAuthenticated: false,
        })
      },

      fetchProfile: async () => {
        if (!authService.isAuthenticated()) return

        set({ isLoading: true })
        try {
          const user = await authService.getProfile()
          set({ user, isAuthenticated: true, isLoading: false })
        } catch {
          set({ isLoading: false })
        }
      },

      clearError: () => set({ error: null }),
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
)
