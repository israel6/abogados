// =============================================
// Notification Queue Service — Reintentos automáticos
// Portal Bufete de Abogados
// =============================================

import { sendEmail, sendSMS, sendWhatsApp } from './notificationService'

export type NotificationChannel = 'email' | 'sms' | 'whatsapp'

export interface QueuedNotification {
  id: string
  channel: NotificationChannel
  recipient: string
  subject?: string
  body: string
  htmlBody?: string
  templateType: string
  userId?: string
  referenceId?: string
  attempts: number
  maxAttempts: number
  nextRetry: Date
  status: 'pending' | 'processing' | 'sent' | 'failed'
  createdAt: Date
}

// Cola en memoria (en producción reemplazar con Bull/Redis o SQL)
const queue: Map<string, QueuedNotification> = new Map()
let schedulerInterval: NodeJS.Timeout | null = null

// =============================================
// Enqueue — Agregar notificación a la cola
// =============================================
export function enqueue(notification: Omit<QueuedNotification, 'id' | 'attempts' | 'nextRetry' | 'status' | 'createdAt'>): string {
  const id = `notif-${Date.now()}-${Math.random().toString(36).substring(7)}`
  const item: QueuedNotification = {
    ...notification,
    id,
    attempts: 0,
    maxAttempts: notification.maxAttempts || 3,
    nextRetry: new Date(),
    status: 'pending',
    createdAt: new Date(),
  }
  queue.set(id, item)
  console.log(`[NotificationQueue] Enqueued ${item.channel} to ${item.recipient} (id: ${id})`)
  return id
}

// =============================================
// Process — Ejecutar cola de pendientes
// =============================================
export async function processQueue(): Promise<void> {
  const now = new Date()
  const pending = Array.from(queue.values()).filter(
    (n) => n.status === 'pending' && n.nextRetry <= now
  )

  if (pending.length === 0) return

  console.log(`[NotificationQueue] Processing ${pending.length} notification(s)...`)

  await Promise.allSettled(
    pending.map(async (notification) => {
      notification.status = 'processing'
      notification.attempts += 1

      try {
        let result
        if (notification.channel === 'email') {
          result = await sendEmail({
            to: notification.recipient,
            subject: notification.subject!,
            htmlBody: notification.htmlBody || notification.body,
            textBody: notification.body,
            templateType: notification.templateType,
            userId: notification.userId,
            referenceId: notification.referenceId,
          })
        } else if (notification.channel === 'sms') {
          result = await sendSMS({
            to: notification.recipient,
            body: notification.body,
            templateType: notification.templateType,
            userId: notification.userId,
            referenceId: notification.referenceId,
          })
        } else {
          result = await sendWhatsApp({
            to: notification.recipient,
            body: notification.body,
            templateType: notification.templateType,
            userId: notification.userId,
            referenceId: notification.referenceId,
          })
        }

        if (result.success) {
          notification.status = 'sent'
          queue.delete(notification.id) // Limpiar cola si exitoso
        } else {
          throw new Error(result.error || 'Unknown error')
        }
      } catch (error: any) {
        if (notification.attempts >= notification.maxAttempts) {
          notification.status = 'failed'
          console.error(`[NotificationQueue] FAILED after ${notification.attempts} attempts: ${notification.id}`)
        } else {
          // Reintento exponencial: 1min, 5min, 15min
          const backoffMs = Math.pow(3, notification.attempts) * 60 * 1000
          notification.nextRetry = new Date(Date.now() + backoffMs)
          notification.status = 'pending'
          console.warn(`[NotificationQueue] Retry scheduled in ${backoffMs / 1000}s for: ${notification.id}`)
        }
      }
    })
  )
}

// =============================================
// Scheduler — Procesar cada 60 segundos
// =============================================
export function startScheduler(intervalMs = 60_000): void {
  if (schedulerInterval) return // Ya está corriendo

  schedulerInterval = setInterval(async () => {
    await processQueue()
  }, intervalMs)

  console.log(`✓ Notification queue scheduler started (every ${intervalMs / 1000}s)`)
}

export function stopScheduler(): void {
  if (schedulerInterval) {
    clearInterval(schedulerInterval)
    schedulerInterval = null
    console.log('✓ Notification queue scheduler stopped')
  }
}

export function getQueueStatus(): { pending: number; failed: number; total: number } {
  const all = Array.from(queue.values())
  return {
    total: all.length,
    pending: all.filter((n) => n.status === 'pending').length,
    failed: all.filter((n) => n.status === 'failed').length,
  }
}

export default {
  enqueue,
  processQueue,
  startScheduler,
  stopScheduler,
  getQueueStatus,
}
