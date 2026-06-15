// =============================================
// Notification Controller
// Portal Bufete de Abogados
// =============================================

import { Request, Response } from 'express'
import { sendEmail, sendSMS, sendWhatsApp, getNotificationHistory } from '@services/notificationService'
import { getQueueStatus, processQueue } from '@services/notificationQueueService'
import { welcomeEmail } from '@services/emailTemplates'

// =============================================
// GET /notifications/history
// Historial de notificaciones (admin)
// =============================================
export const getHistory = async (req: Request, res: Response): Promise<void> => {
  try {
    const limit = parseInt(req.query.limit as string) || 50
    const userId = req.query.userId as string | undefined
    const history = await getNotificationHistory(limit, userId)
    res.json({ data: history, count: history.length })
  } catch (error: any) {
    res.status(500).json({ error: error.message })
  }
}

// =============================================
// GET /notifications/queue-status
// Estado actual de la cola (admin)
// =============================================
export const getQueueStatusHandler = (_req: Request, res: Response): void => {
  const status = getQueueStatus()
  res.json({ data: status })
}

// =============================================
// POST /notifications/process-queue
// Forzar procesamiento de cola (admin/cron)
// =============================================
export const processQueueHandler = async (_req: Request, res: Response): Promise<void> => {
  try {
    await processQueue()
    res.json({ message: 'Queue processed successfully' })
  } catch (error: any) {
    res.status(500).json({ error: error.message })
  }
}

// =============================================
// POST /notifications/test
// Enviar notificación de prueba (admin)
// =============================================
export const sendTestNotification = async (req: Request, res: Response): Promise<void> => {
  try {
    const { channel, recipient } = req.body

    if (!channel || !recipient) {
      res.status(400).json({ error: 'channel and recipient are required' })
      return
    }

    let result

    if (channel === 'email') {
      const { subject, html, text } = welcomeEmail({
        firstName: 'Usuario de Prueba',
        email: recipient,
      })
      result = await sendEmail({
        to: recipient,
        subject: `[TEST] ${subject}`,
        htmlBody: html,
        textBody: text,
        templateType: 'test',
      })
    } else if (channel === 'sms') {
      result = await sendSMS({
        to: recipient,
        body: '📢 Notificación de prueba del sistema - Bufete de Abogados',
        templateType: 'test',
      })
    } else if (channel === 'whatsapp') {
      result = await sendWhatsApp({
        to: recipient,
        body: '📢 *Notificación de prueba* del sistema del Bufete de Abogados',
        templateType: 'test',
      })
    } else {
      res.status(400).json({ error: 'Invalid channel. Use: email, sms, or whatsapp' })
      return
    }

    res.json({
      success: result.success,
      channel: result.channel,
      messageId: result.messageId,
      mock: result.mock || false,
    })
  } catch (error: any) {
    res.status(500).json({ error: error.message })
  }
}

// =============================================
// POST /notifications/send-appointment-reminder
// Enviar recordatorio manual (admin/cron)
// =============================================
export const sendAppointmentReminder = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, phone, lawyerName, title, startTime, location } = req.body

    const results = []

    if (email) {
      const startDate = new Date(startTime)
      const timeStr = startDate.toLocaleTimeString('es-EC', { hour: '2-digit', minute: '2-digit' })
      const result = await sendEmail({
        to: email,
        subject: `⏰ Recordatorio: Cita mañana a las ${timeStr}`,
        htmlBody: `<p>Recordatorio de cita: ${title} con ${lawyerName} en ${location}</p>`,
        textBody: `Recordatorio: Cita mañana "${title}" con ${lawyerName} a las ${timeStr} en ${location}`,
        templateType: 'appointment_reminder',
      })
      results.push(result)
    }

    if (phone) {
      const result = await sendWhatsApp({
        to: phone,
        body: `⏰ *Recordatorio de Cita*\n\n📋 ${title}\n👨‍⚖️ ${lawyerName}\n📍 ${location}\n\n¡Le esperamos mañana!`,
        templateType: 'appointment_reminder',
      })
      results.push(result)
    }

    res.json({ results })
  } catch (error: any) {
    res.status(500).json({ error: error.message })
  }
}
