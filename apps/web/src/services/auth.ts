import { api } from './api'
import { API_ENDPOINTS } from '@team-share/shared'

interface LoginRequest {
  usernameOrEmail: string
  password: string
}

interface RegisterRequest {
  username: string
  email: string
  password: string
  displayName?: string
}

interface AuthResponse {
  user: {
    id: string
    username: string
    email: string
    displayName?: string
    avatar?: string
    role: string
  }
  token: string
}

export const authService = {
  async login(data: LoginRequest): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>(API_ENDPOINTS.AUTH.LOGIN, data)
    localStorage.setItem('token', response.token)
    return response
  },

  async register(data: RegisterRequest): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>(API_ENDPOINTS.AUTH.REGISTER, data)
    localStorage.setItem('token', response.token)
    return response
  },

  async getProfile(): Promise<any> {
    return api.get(API_ENDPOINTS.AUTH.ME)
  },

  logout() {
    localStorage.removeItem('token')
    window.location.href = '/login'
  },

  isAuthenticated(): boolean {
    return !!localStorage.getItem('token')
  },
}
