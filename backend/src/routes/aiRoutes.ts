// =============================================
// AI Routes — Chatbot Jurídico
// Portal Bufete de Abogados
// =============================================

import { Router } from 'express'
import { authMiddleware } from '@middleware/auth'
import {
  chatWithAI,
  precalifyCaseHandler,
  getChatHistory,
  clearHistory,
  deleteConversationHandler,
} from '@controllers/aiController'

const router = Router()

// Ruta pública — Precalificación de casos (lead generation)
router.post('/precalify', precalifyCaseHandler)

// Rutas autenticadas
router.post('/chat', authMiddleware, chatWithAI)
router.get('/history', authMiddleware, getChatHistory)
router.delete('/history', authMiddleware, clearHistory)
router.delete('/history/:conversationId', authMiddleware, deleteConversationHandler)

export default router
