// =============================================
// ChatWidget — Asistente IA Jurídico Flotante
// Portal Bufete de Abogados
// =============================================

import React, { useState, useRef, useEffect, useCallback } from 'react'
import ReactMarkdown from 'react-markdown'
import './ChatWidget.css'
import { sendMessage, ChatMessage } from '../../services/aiService'

const SUGGESTIONS = [
  '¿Cuáles son mis derechos si me despidieron?',
  '¿Cómo tramito un divorcio en Ecuador?',
  'Necesito asesoría sobre un contrato',
  '¿Qué hago si me detienen?',
]

const formatTime = (date: Date): string =>
  date.toLocaleTimeString('es-EC', { hour: '2-digit', minute: '2-digit' })

export const ChatWidget: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [conversationId, setConversationId] = useState<string | undefined>()
  const [error, setError] = useState<string | null>(null)
  const [isMock, setIsMock] = useState(false)
  const [hasNewMessage, setHasNewMessage] = useState(false)

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // Scroll automático al último mensaje
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [messages, isLoading, scrollToBottom])

  // Focus en el input al abrir
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => textareaRef.current?.focus(), 300)
      setHasNewMessage(false)
    }
  }, [isOpen])

  // Auto-resize del textarea
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value)
    const ta = e.target
    ta.style.height = 'auto'
    ta.style.height = Math.min(ta.scrollHeight, 100) + 'px'
  }

  const handleSend = async (messageText?: string) => {
    const text = (messageText || input).trim()
    if (!text || isLoading) return

    setError(null)
    setInput('')
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
    }

    const userMsg: ChatMessage = {
      role: 'user',
      content: text,
      timestamp: new Date(),
    }
    setMessages((prev) => [...prev, userMsg])
    setIsLoading(true)

    try {
      const result = await sendMessage(text, conversationId)
      setConversationId(result.conversationId)
      setIsMock(result.mock)

      const assistantMsg: ChatMessage = {
        role: 'assistant',
        content: result.reply,
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, assistantMsg])

      // Notificar si el chat está cerrado
      if (!isOpen) {
        setHasNewMessage(true)
      }
    } catch (err: any) {
      const errorMsg = err?.response?.data?.error || err.message || 'Error de conexión'
      if (errorMsg.includes('Límite')) {
        setError(errorMsg)
      } else {
        setMessages((prev) => [
          ...prev,
          {
            role: 'assistant',
            content: 'Lo siento, hubo un problema al procesar su consulta. Por favor intente de nuevo o [agende una cita](/appointments).',
            timestamp: new Date(),
          },
        ])
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleToggle = () => {
    setIsOpen((prev) => !prev)
  }

  return (
    <>
      {/* Panel de Chat */}
      {isOpen && (
        <div className="chat-panel" role="dialog" aria-label="Asistente Jurídico IA">
          {/* Header */}
          <div className="chat-header">
            <div className="chat-header-avatar">⚖️</div>
            <div className="chat-header-info">
              <p className="chat-header-name">Asistente Jurídico IA</p>
              <div className="chat-header-status">
                <span className="status-dot" />
                <span className="status-text">En línea — Especialista Legal</span>
              </div>
            </div>
            <button
              className="chat-close-btn"
              onClick={handleToggle}
              aria-label="Cerrar chat"
            >
              ✕
            </button>
          </div>

          {/* Mensajes */}
          <div className="chat-messages" role="log" aria-live="polite">
            {messages.length === 0 && (
              <div className="chat-welcome">
                <div className="chat-welcome-icon">⚖️</div>
                <h4>¿En qué puedo ayudarle?</h4>
                <p>Soy su asistente jurídico. Puedo orientarle sobre temas legales en Ecuador.</p>
                <div className="chat-suggestions">
                  {SUGGESTIONS.map((s, i) => (
                    <button
                      key={i}
                      className="suggestion-btn"
                      onClick={() => handleSend(s)}
                      disabled={isLoading}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {messages.map((msg, i) => (
              <div key={i} className={`chat-message ${msg.role}`}>
                <div className="message-avatar">
                  {msg.role === 'assistant' ? '⚖️' : '👤'}
                </div>
                <div>
                  <div className="message-bubble">
                    {msg.role === 'assistant' ? (
                      <ReactMarkdown>{msg.content}</ReactMarkdown>
                    ) : (
                      msg.content
                    )}
                  </div>
                  <div className="message-time">{formatTime(msg.timestamp)}</div>
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="typing-indicator">
                <div className="message-avatar">⚖️</div>
                <div className="typing-dots">
                  <span /><span /><span />
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Error */}
          {error && <div className="chat-error">⚠️ {error}</div>}

          {/* Mock notice */}
          {isMock && (
            <div className="chat-mock-notice">
              ⚙️ Modo demostración — Configure ANTHROPIC_API_KEY para respuestas reales
            </div>
          )}

          {/* Input */}
          <div className="chat-input-area">
            <textarea
              ref={textareaRef}
              className="chat-input"
              value={input}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              placeholder="Escriba su consulta legal..."
              rows={1}
              disabled={isLoading}
              maxLength={2000}
              aria-label="Mensaje al asistente"
            />
            <button
              className="chat-send-btn"
              onClick={() => handleSend()}
              disabled={!input.trim() || isLoading}
              aria-label="Enviar mensaje"
            >
              ➤
            </button>
          </div>
        </div>
      )}

      {/* FAB Button */}
      <button
        className={`chat-fab ${isOpen ? 'open' : ''}`}
        onClick={handleToggle}
        aria-label={isOpen ? 'Cerrar asistente' : 'Abrir asistente jurídico'}
        id="chat-widget-fab"
      >
        <span className="chat-fab-icon">{isOpen ? '✕' : '⚖️'}</span>
        {hasNewMessage && !isOpen && <span className="chat-fab-badge" />}
      </button>
    </>
  )
}

export default ChatWidget
