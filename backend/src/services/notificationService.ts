// =============================================
// Notification Service — SendGrid + Twilio
// Portal Bufete de Abogados
// =============================================

import sgMail from '@sendgrid/mail'
import twilio from 'twilio'
import { executeQuery } from '@config/database'

// SendGrid — configurar al primer uso (solo con API key válida SG.*)
let sgConfigured = false
function hasValidSendGridKey(): boolean {
  const key = process.env.SENDGRID_API_KEY
  return !!key && key.startsWith('SG.')
}
function getSgMail() {
  if (!sgConfigured && hasValidSendGridKey()) {
    sgMail.setApiKey(process.env.SENDGRID_API_KEY!)
    sgConfigured = true
  }
  return sgMail
}

// Twilio — instancia lazy para evitar crash con credenciales placeholder
let _twilioClient: ReturnType<typeof twilio> | null = null
function getTwilioClient() {
  if (_twilioClient) return _twilioClient
  const sid = process.env.TWILIO_ACCOUNT_SID
  const token = process.env.TWILIO_AUTH_TOKEN
  if (sid?.startsWith('AC') && token) {
    _twilioClient = twilio(sid, token)
  }
  return _twilioClient
}

const isMockMode = () =>
  process.env.NOTIFICATION_MOCK === 'true' || !hasValidSendGridKey()

const FROM_EMAIL = process.env.FROM_EMAIL || 'noreply@bufete-legal.com'
const FROM_NAME = process.env.FROM_NAME || 'Bufete de Abogados'
const TWILIO_FROM = () => process.env.TWILIO_FROM_NUMBER || process.env.TWILIO_PHONE_NUMBER || ''

export interface NotificationResult {
  success: boolean
  channel: 'email' | 'sms' | 'whatsapp'
  messageId?: string
  error?: string
  mock?: boolean
}

// =============================================
// Log en base de datos
// =============================================
async function logNotification(params: {
  channel: 'email' | 'sms' | 'whatsapp'
  recipient: string
  subject?: string
  templateType: string
  status: 'sent' | 'failed' | 'skipped'
  userId?: string
  referenceId?: string
  errorMessage?: string
}): Promise<void> {
  try {
    await executeQuery(
      `INSERT INTO [notifications].[NotificationLog]
        ([Channel], [Recipient], [Subject], [TemplateType], [Status],
         [UserId], [ReferenceId], [ErrorMessage], [Attempts], [SentAt])
       VALUES
        (@channel, @recipient, @subject, @templateType, @status,
         @userId, @referenceId, @errorMessage, 1,
         CASE WHEN @status = 'sent' THEN GETUTCDATE() ELSE NULL END)`,
      params
    )
  } catch {
    // Log silencioso — no bloquea el flujo principal
    console.warn('[NotificationService] Could not log notification to DB')
  }
}

// =============================================
// Email via SendGrid
// =============================================
export async function sendEmail(params: {
  to: string
  subject: string
  htmlBody: string
  textBody: string
  templateType: string
  userId?: string
  referenceId?: string
}): Promise<NotificationResult> {
  if (isMockMode()) {
    console.log(`[MOCK EMAIL] To: ${params.to} | Subject: ${params.subject}`)
    await logNotification({
      channel: 'email', recipient: params.to,
      subject: params.subject, templateType: params.templateType,
      status: 'sent', userId: params.userId, referenceId: params.referenceId,
      errorMessage: 'MOCK_MODE',
    })
    return { success: true, channel: 'email', messageId: `mock-${Date.now()}`, mock: true }
  }

  try {
    const [response] = await getSgMail().send({
      to: params.to,
      from: { email: FROM_EMAIL, name: FROM_NAME },
      subject: params.subject,
      html: params.htmlBody,
      text: params.textBody,
    })

    await logNotification({
      channel: 'email', recipient: params.to,
      subject: params.subject, templateType: params.templateType,
      status: 'sent', userId: params.userId, referenceId: params.referenceId,
    })

    return {
      success: true,
      channel: 'email',
      messageId: response.headers['x-message-id'] as string,
    }
  } catch (error: any) {
    const errorMsg = error?.message || 'Unknown error'
    console.error('[NotificationService] Email failed:', errorMsg)

    await logNotification({
      channel: 'email', recipient: params.to,
      subject: params.subject, templateType: params.templateType,
      status: 'failed', userId: params.userId, referenceId: params.referenceId,
      errorMessage: errorMsg,
    })

    return { success: false, channel: 'email', error: errorMsg }
  }
}

// =============================================
// SMS via Twilio
// =============================================
export async function sendSMS(params: {
  to: string
  body: string
  templateType: string
  userId?: string
  referenceId?: string
}): Promise<NotificationResult> {
  if (isMockMode() || !getTwilioClient()) {
    console.log(`[MOCK SMS] To: ${params.to} | Body: ${params.body.substring(0, 80)}...`)
    await logNotification({
      channel: 'sms', recipient: params.to,
      templateType: params.templateType, status: 'sent',
      userId: params.userId, referenceId: params.referenceId,
      errorMessage: 'MOCK_MODE',
    })
    return { success: true, channel: 'sms', messageId: `mock-sms-${Date.now()}`, mock: true }
  }

  try {
    const message = await getTwilioClient()!.messages.create({
      body: params.body,
      from: TWILIO_FROM(),
      to: params.to,
    })

    await logNotification({
      channel: 'sms', recipient: params.to,
      templateType: params.templateType, status: 'sent',
      userId: params.userId, referenceId: params.referenceId,
    })

    return { success: true, channel: 'sms', messageId: message.sid }
  } catch (error: any) {
    const errorMsg = error?.message || 'Unknown error'
    await logNotification({
      channel: 'sms', recipient: params.to,
      templateType: params.templateType, status: 'failed',
      userId: params.userId, referenceId: params.referenceId,
      errorMessage: errorMsg,
    })
    return { success: false, channel: 'sms', error: errorMsg }
  }
}

// =============================================
// WhatsApp via Twilio
// =============================================
export async function sendWhatsApp(params: {
  to: string
  body: string
  templateType: string
  userId?: string
  referenceId?: string
}): Promise<NotificationResult> {
  if (isMockMode() || !getTwilioClient()) {
    console.log(`[MOCK WHATSAPP] To: ${params.to} | Body: ${params.body.substring(0, 80)}...`)
    await logNotification({
      channel: 'whatsapp', recipient: params.to,
      templateType: params.templateType, status: 'sent',
      userId: params.userId, referenceId: params.referenceId,
      errorMessage: 'MOCK_MODE',
    })
    return { success: true, channel: 'whatsapp', messageId: `mock-wa-${Date.now()}`, mock: true }
  }

  try {
    const message = await getTwilioClient()!.messages.create({
      body: params.body,
      from: `whatsapp:${TWILIO_FROM()}`,
      to: `whatsapp:${params.to}`,
    })

    await logNotification({
      channel: 'whatsapp', recipient: params.to,
      templateType: params.templateType, status: 'sent',
      userId: params.userId, referenceId: params.referenceId,
    })

    return { success: true, channel: 'whatsapp', messageId: message.sid }
  } catch (error: any) {
    const errorMsg = error?.message || 'Unknown error'
    await logNotification({
      channel: 'whatsapp', recipient: params.to,
      templateType: params.templateType, status: 'failed',
      userId: params.userId, referenceId: params.referenceId,
      errorMessage: errorMsg,
    })
    return { success: false, channel: 'whatsapp', error: errorMsg }
  }
}

// =============================================
// Obtener historial de notificaciones
// =============================================
export async function getNotificationHistory(limit = 50, userId?: string): Promise<any[]> {
  const query = userId
    ? `SELECT TOP(@limit) * FROM [notifications].[NotificationLog]
       WHERE [UserId] = @userId ORDER BY [CreatedAt] DESC`
    : `SELECT TOP(@limit) * FROM [notifications].[NotificationLog]
       ORDER BY [CreatedAt] DESC`

  const result = await executeQuery(query, { limit, userId: userId || null })
  return result.recordset
}

export default {
  sendEmail,
  sendSMS,
  sendWhatsApp,
  getNotificationHistory,
}
