import { useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from '@hooks/useAuth'
import { ProtectedRoute } from '@components/ProtectedRoute'
import Home from '@pages/Home'
import { Login } from '@pages/Login'
import { Register } from '@pages/Register'
import { Dashboard } from '@pages/Dashboard'
import { Appointments } from '@pages/Appointments'
import { Payments } from '@pages/Payments'
import { Blog } from '@pages/Blog'
import { BlogDetail } from '@pages/BlogDetail'
import { Lawyers } from '@pages/Lawyers'
import { Admin } from '@pages/Admin'
import AIAssistant from '@pages/AIAssistant'
import { ChatWidget } from '@components/ChatWidget/ChatWidget'
import './App.css'

function App() {
  const { initialize } = useAuthStore()

  useEffect(() => {
    initialize()
  }, [initialize])

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/blog" element={<Blog />} />
        <Route path="/blog/:slug" element={<BlogDetail />} />
        <Route path="/lawyers" element={<Lawyers />} />
        <Route path="/ai-assistant" element={<AIAssistant />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/appointments"
          element={
            <ProtectedRoute>
              <Appointments />
            </ProtectedRoute>
          }
        />
        <Route
          path="/payments"
          element={
            <ProtectedRoute>
              <Payments />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin"
          element={
            <ProtectedRoute requiredRole="admin">
              <Admin />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      {/* Chat Widget — visible en todas las páginas */}
      <ChatWidget />
    </Router>
  )
}

export default App
