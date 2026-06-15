import client from './api'

export interface LoginData {
  email: string
  password: string
}

export interface RegisterData {
  email: string
  password: string
  fullName: string
  phone?: string
}

export interface AuthResponse {
  message: string
  user: {
    userId: string
    email: string
    fullName: string
    role?: string
  }
  token: string
}

export interface User {
  userId: string
  email: string
  fullName: string
  phone?: string
  role: 'client' | 'lawyer' | 'admin'
}

export const authService = {
  register: async (data: RegisterData): Promise<AuthResponse> => {
    const response = await client.post('/auth/register', data)
    return response.data
  },

  login: async (data: LoginData): Promise<AuthResponse> => {
    const response = await client.post('/auth/login', data)
    return response.data
  },

  logout: async (): Promise<void> => {
    await client.post('/auth/logout')
  },

  getProfile: async (): Promise<User> => {
    const response = await client.get('/auth/profile')
    return response.data
  },
}

export default authService
