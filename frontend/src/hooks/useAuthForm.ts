import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import authService, { LoginData, RegisterData } from '@services/authService'
import { useAuthStore } from '@hooks/useAuth'

export const useAuthForm = () => {
  const navigate = useNavigate()
  const { setUser, setToken, setError, setLoading } = useAuthStore()
  const [error, setLocalError] = useState<string | null>(null)

  const handleLogin = async (data: LoginData) => {
    try {
      setLoading(true)
      setLocalError(null)
      setError(null)

      const response = await authService.login(data)
      setUser(response.user as any)
      setToken(response.token)

      navigate('/dashboard')
    } catch (err: any) {
      const message = err.response?.data?.error || 'Login failed'
      setLocalError(message)
      setError(message)
    } finally {
      setLoading(false)
    }
  }

  const handleRegister = async (data: RegisterData) => {
    try {
      setLoading(true)
      setLocalError(null)
      setError(null)

      const response = await authService.register(data)
      setUser(response.user as any)
      setToken(response.token)

      navigate('/dashboard')
    } catch (err: any) {
      const message = err.response?.data?.error || 'Registration failed'
      setLocalError(message)
      setError(message)
    } finally {
      setLoading(false)
    }
  }

  return { handleLogin, handleRegister, error }
}
