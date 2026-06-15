// =============================================
// Conversation Service — Historial de Chat IA
// Portal Bufete de Abogados
// =============================================

import { executeQuery } from '@config/database'

export interface Conversation {
  ConversationId: string
  UserId: string | null
  SessionToken: string | null
  Title: string | null
  CaseType: string | null
  Status: 'active' | 'closed'
  TotalTokensUsed: number
  CreatedAt: string
  UpdatedAt: string
}

export interface Message {
  MessageId: string
  ConversationId: string
  Role: 'user' | 'assistant' | 'system'
  Content: string
  TokensUsed: number
  ModelUsed: string | null
  CreatedAt: string
}

// =============================================
// Crear nueva conversación
// =============================================
export const createConversation = async (
  userId?: string,
  sessionToken?: string
): Promise<string> => {
  const query = `
    DECLARE @ConvId UNIQUEIDENTIFIER = NEWID();
    INSERT INTO [ai].[Conversations] ([ConversationId], [UserId], [SessionToken])
    VALUES (@ConvId, @userId, @sessionToken);
    SELECT @ConvId AS ConversationId;
  `
  const result = await executeQuery(query, {
    userId: userId || null,
    sessionToken: sessionToken || null,
  })
  return result.recordset[0].ConversationId
}

// =============================================
// Guardar mensaje en conversación
// =============================================
export const addMessage = async (
  conversationId: string,
  role: 'user' | 'assistant',
  content: string,
  tokensUsed = 0,
  modelUsed?: string
): Promise<void> => {
  await executeQuery(
    `INSERT INTO [ai].[Messages] ([ConversationId], [Role], [Content], [TokensUsed], [ModelUsed])
     VALUES (@conversationId, @role, @content, @tokensUsed, @modelUsed);

     UPDATE [ai].[Conversations]
     SET [TotalTokensUsed] = [TotalTokensUsed] + @tokensUsed,
         [UpdatedAt] = GETUTCDATE()
     WHERE [ConversationId] = @conversationId`,
    { conversationId, role, content, tokensUsed, modelUsed: modelUsed || null }
  )
}

// =============================================
// Obtener historial de una conversación
// =============================================
export const getHistory = async (
  conversationId: string,
  limit = 20
): Promise<Message[]> => {
  const result = await executeQuery(
    `SELECT TOP(@limit) [MessageId], [ConversationId], [Role], [Content],
       [TokensUsed], [ModelUsed], [CreatedAt]
     FROM [ai].[Messages]
     WHERE [ConversationId] = @conversationId
     ORDER BY [CreatedAt] ASC`,
    { conversationId, limit }
  )
  return result.recordset
}

// =============================================
// Obtener conversaciones de un usuario
// =============================================
export const getUserConversations = async (userId: string): Promise<Conversation[]> => {
  const result = await executeQuery(
    `SELECT [ConversationId], [UserId], [SessionToken], [Title],
       [CaseType], [Status], [TotalTokensUsed], [CreatedAt], [UpdatedAt]
     FROM [ai].[Conversations]
     WHERE [UserId] = @userId
     ORDER BY [UpdatedAt] DESC`,
    { userId }
  )
  return result.recordset
}

// =============================================
// Actualizar metadata de conversación
// =============================================
export const updateConversationMeta = async (
  conversationId: string,
  title?: string,
  caseType?: string
): Promise<void> => {
  await executeQuery(
    `UPDATE [ai].[Conversations]
     SET [Title] = COALESCE(@title, [Title]),
         [CaseType] = COALESCE(@caseType, [CaseType]),
         [UpdatedAt] = GETUTCDATE()
     WHERE [ConversationId] = @conversationId`,
    { conversationId, title: title || null, caseType: caseType || null }
  )
}

// =============================================
// Eliminar conversación (GDPR)
// =============================================
export const deleteConversation = async (
  conversationId: string,
  userId: string
): Promise<boolean> => {
  const result = await executeQuery(
    `DELETE FROM [ai].[Conversations]
     WHERE [ConversationId] = @conversationId AND [UserId] = @userId`,
    { conversationId, userId }
  )
  return result.rowsAffected[0] > 0
}

// =============================================
// Eliminar todas las conversaciones de un usuario
// =============================================
export const deleteAllUserConversations = async (userId: string): Promise<void> => {
  await executeQuery(
    `DELETE FROM [ai].[Conversations] WHERE [UserId] = @userId`,
    { userId }
  )
}

export default {
  createConversation,
  addMessage,
  getHistory,
  getUserConversations,
  updateConversationMeta,
  deleteConversation,
  deleteAllUserConversations,
}
