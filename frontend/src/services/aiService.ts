// =============================================
// AI Service — Frontend API Client
// Portal Bufete de Abogados
// =============================================

import axios from 'axios'

const API_BASE = import.meta.env.VITE_API_URL || '/api'

const api = axios.create({
  baseURL: API_BASE,
  withCredentials: true,
})

// Interceptor para token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// =============================================
// Tipos
// =============================================
export interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

export interface ChatResponse {
  reply: string
  conversationId: string
  tokensUsed: number
  mock: boolean
}

export interface PrecalifyResult {
  caseType: string
  urgency: 'alta' | 'media' | 'baja'
  recommendedArea: string
  summary: string
  nextStep: string
  mock: boolean
}

export interface Conversation {
  ConversationId: string
  Title: string | null
  CaseType: string | null
  Status: 'active' | 'closed'
  TotalTokensUsed: number
  CreatedAt: string
  UpdatedAt: string
}

// =============================================
// Enviar mensaje al chatbot (requiere login)
// =============================================
export const sendMessage = async (
  message: string,
  conversationId?: string
): Promise<ChatResponse> => {
  const response = await api.post('/ai/chat', { message, conversationId })
  return response.data
}

// =============================================
// Precalificación pública (sin login)
// =============================================
export const precalifyCase = async (description: string): Promise<PrecalifyResult> => {
  const response = await api.post('/ai/precalify', { description })
  return response.data.data
}

// =============================================
// Obtener historial de conversaciones
// =============================================
export const getChatHistory = async (): Promise<Conversation[]> => {
  const response = await api.get('/ai/history')
  return response.data.data
}

// =============================================
// Borrar historial completo
// =============================================
export const clearChatHistory = async (): Promise<void> => {
  await api.delete('/ai/history')
}

// =============================================
// Borrar conversación específica
// =============================================
export const deleteConversation = async (conversationId: string): Promise<void> => {
  await api.delete(`/ai/history/${conversationId}`)
}

export default {
  sendMessage,
  precalifyCase,
  getChatHistory,
  clearChatHistory,
  deleteConversation,
}
