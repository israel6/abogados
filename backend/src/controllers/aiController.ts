// =============================================
// AI Controller — Chatbot Jurídico Claude
// Portal Bufete de Abogados
// =============================================

import { Request, Response } from 'express'
import { chat, precalifyCase } from '@services/aiService'
import {
  getUserConversations,
  deleteAllUserConversations,
  deleteConversation,
} from '@services/conversationService'

// =============================================
// POST /ai/chat
// Chat principal (requiere autenticación)
// =============================================
export const chatWithAI = async (req: Request, res: Response): Promise<void> => {
  try {
    const { message, conversationId } = req.body
    const userId = (req as any).user?.userId

    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      res.status(400).json({ error: 'El mensaje no puede estar vacío' })
      return
    }

    if (message.length > 2000) {
      res.status(400).json({ error: 'El mensaje no puede superar 2000 caracteres' })
      return
    }

    const result = await chat({
      message: message.trim(),
      conversationId,
      userId,
    })

    res.json({
      reply: result.reply,
      conversationId: result.conversationId,
      tokensUsed: result.tokensUsed,
      mock: result.mock,
    })
  } catch (error: any) {
    if (error.message?.includes('Límite de consultas')) {
      res.status(429).json({ error: error.message })
      return
    }
    console.error('[AIController] chatWithAI error:', error)
    res.status(500).json({ error: 'Error al procesar su consulta. Por favor intente nuevamente.' })
  }
}

// =============================================
// POST /ai/precalify
// Precalificación pública (sin login)
// Para captación de leads
// =============================================
export const precalifyCaseHandler = async (req: Request, res: Response): Promise<void> => {
  try {
    const { description } = req.body

    if (!description || typeof description !== 'string' || description.trim().length < 20) {
      res.status(400).json({
        error: 'Por favor describa su caso con al menos 20 caracteres para una evaluación adecuada',
      })
      return
    }

    if (description.length > 3000) {
      res.status(400).json({ error: 'La descripción no puede superar 3000 caracteres' })
      return
    }

    const result = await precalifyCase(description.trim())

    res.json({
      data: result,
      message: 'Análisis preliminar completado',
    })
  } catch (error: any) {
    console.error('[AIController] precalifyCaseHandler error:', error)
    res.status(500).json({ error: 'Error al analizar su caso. Por favor intente nuevamente.' })
  }
}

// =============================================
// GET /ai/history
// Historial de conversaciones del usuario
// =============================================
export const getChatHistory = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user?.userId

    if (!userId) {
      res.status(401).json({ error: 'Autenticación requerida' })
      return
    }

    const conversations = await getUserConversations(userId)
    res.json({ data: conversations, count: conversations.length })
  } catch (error: any) {
    res.status(500).json({ error: error.message })
  }
}

// =============================================
// DELETE /ai/history
// Borrar todo el historial (GDPR)
// =============================================
export const clearHistory = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user?.userId

    if (!userId) {
      res.status(401).json({ error: 'Autenticación requerida' })
      return
    }

    await deleteAllUserConversations(userId)
    res.json({ message: 'Historial eliminado correctamente' })
  } catch (error: any) {
    res.status(500).json({ error: error.message })
  }
}

// =============================================
// DELETE /ai/history/:conversationId
// Borrar conversación específica
// =============================================
export const deleteConversationHandler = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user?.userId
    const { conversationId } = req.params

    if (!userId) {
      res.status(401).json({ error: 'Autenticación requerida' })
      return
    }

    const deleted = await deleteConversation(conversationId, userId)

    if (!deleted) {
      res.status(404).json({ error: 'Conversación no encontrada' })
      return
    }

    res.json({ message: 'Conversación eliminada correctamente' })
  } catch (error: any) {
    res.status(500).json({ error: error.message })
  }
}
