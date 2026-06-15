import { ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuthStore } from '@hooks/useAuth'

interface ProtectedRouteProps {
  children: ReactNode
  /** Si se indica, solo usuarios con ese rol pueden entrar. */
  requiredRole?: 'client' | 'lawyer' | 'admin'
  /** Ruta a la que redirigir si no tiene el rol (por defecto: '/dashboard') */
  redirectTo?: string
}

export function ProtectedRoute({
  children,
  requiredRole,
  redirectTo = '/dashboard',
}: ProtectedRouteProps) {
  const { isAuthenticated, isLoading, user } = useAuthStore()

  if (isLoading) {
    return <div>Cargando...</div>
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  if (requiredRole && user?.role !== requiredRole) {
    return <Navigate to={redirectTo} replace />
  }

  return <>{children}</>
}
