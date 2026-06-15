import { executeQuery } from '@config/database'
import { getUserById } from '@services/authService'
import { enqueue } from './notificationQueueService'
import { paymentConfirmation } from './emailTemplates'

export interface Payment {
  PaymentId: string
  AppointmentId: string | null
  UserId: string
  Amount: number
  Currency: string
  Status: 'pending' | 'completed' | 'failed' | 'refunded'
  PaymentMethod: string | null
  TransactionId: string | null
  PayphoneReference: string | null
  FailureReason: string | null
  CreatedAt: string
  UpdatedAt: string
}

// =============================================
// Crear un pago pendiente (antes de redirigir a Payphone)
// =============================================
export const createPayment = async (
  userId: string,
  amount: number,
  currency: string,
  appointmentId?: string
): Promise<string> => {
  // Genera un PaymentId propio; usamos INSERT directo ya que el SP
  // de sp_RecordPayment está diseñado para confirmación post-pago.
  const query = `
    DECLARE @PaymentId UNIQUEIDENTIFIER = NEWID();
    INSERT INTO [payments].[Payments]
      ([PaymentId], [UserId], [Amount], [Currency], [Status], [AppointmentId], [PaymentMethod])
    VALUES
      (@PaymentId, @userId, @amount, @currency, 'pending', @appointmentId, 'payphone');
    SELECT @PaymentId AS PaymentId;
  `
  const result = await executeQuery(query, {
    userId,
    amount,
    currency,
    appointmentId: appointmentId || null,
  })
  return result.recordset[0].PaymentId
}

// =============================================
// Confirmar pago (llamado desde webhook de Payphone)
// =============================================
export const confirmPayment = async (
  paymentId: string,
  transactionId: string,
  payphoneReference?: string
): Promise<void> => {
  // Obtener datos del pago antes de actualizar (para la notificación)
  const payment = await getPaymentById(paymentId)
  if (!payment) throw new Error(`Payment ${paymentId} not found`)

  // Actualizar pago y confirmar la cita asociada (si existe) en una transacción
  await executeQuery(
    `UPDATE [payments].[Payments]
     SET [Status] = 'completed',
         [TransactionId] = @transactionId,
         [PayphoneReference] = @payphoneReference,
         [UpdatedAt] = GETUTCDATE()
     WHERE [PaymentId] = @paymentId;

     -- Confirmar la cita si está asociada
     UPDATE [appointments].[Appointments]
     SET [Status] = 'confirmed', [UpdatedAt] = GETUTCDATE()
     WHERE [AppointmentId] = @appointmentId
       AND [AppointmentId] IS NOT NULL;`,
    {
      paymentId,
      transactionId,
      payphoneReference: payphoneReference || null,
      appointmentId: payment.AppointmentId || null,
    }
  )

  // Notificar al usuario por email
  try {
    const user = await getUserById(payment.UserId)
    if (user) {
      const { subject, html, text } = paymentConfirmation({
        clientName: user.FullName,
        amount: payment.Amount,
        currency: payment.Currency,
        transactionId,
        description: `Pago de cita #${payment.AppointmentId ?? paymentId}`,
        paymentDate: new Date(),
      })
      enqueue({
        channel: 'email',
        recipient: user.Email,
        subject,
        body: text,
        htmlBody: html,
        templateType: 'payment_confirmation',
        referenceId: paymentId,
        maxAttempts: 3,
      })
      console.log(`[PaymentService] Receipt notification queued for ${paymentId} → ${user.Email}`)
    }
  } catch (notifError) {
    console.warn('[PaymentService] Could not queue payment notification:', notifError)
  }
}

// =============================================
// Marcar pago como fallido
// =============================================
export const failPayment = async (
  paymentId: string,
  reason: string
): Promise<void> => {
  await executeQuery(
    `UPDATE [payments].[Payments]
     SET [Status] = 'failed',
         [FailureReason] = @reason,
         [UpdatedAt] = GETUTCDATE()
     WHERE [PaymentId] = @paymentId`,
    { paymentId, reason }
  )
}

// =============================================
// Obtener pagos de un usuario
// =============================================
export const getPaymentsByUser = async (userId: string): Promise<Payment[]> => {
  const result = await executeQuery(
    `SELECT [PaymentId], [AppointmentId], [UserId], [Amount], [Currency], [Status],
            [PaymentMethod], [TransactionId], [PayphoneReference], [FailureReason],
            [CreatedAt], [UpdatedAt]
     FROM [payments].[Payments]
     WHERE [UserId] = @userId
     ORDER BY [CreatedAt] DESC`,
    { userId }
  )
  return result.recordset
}

// =============================================
// Obtener un pago por ID
// =============================================
export const getPaymentById = async (paymentId: string): Promise<Payment | null> => {
  const result = await executeQuery(
    `SELECT [PaymentId], [AppointmentId], [UserId], [Amount], [Currency], [Status],
            [PaymentMethod], [TransactionId], [PayphoneReference], [FailureReason],
            [CreatedAt], [UpdatedAt]
     FROM [payments].[Payments]
     WHERE [PaymentId] = @paymentId`,
    { paymentId }
  )
  return result.recordset[0] ?? null
}

// =============================================
// Estadísticas de pagos de un usuario
// =============================================
export const getPaymentStats = async (
  userId: string,
  startDate?: string,
  endDate?: string
): Promise<any> => {
  const result = await executeQuery(
    `SELECT
       COUNT(*)                                                          AS TotalTransactions,
       SUM(CASE WHEN [Status] = 'completed' THEN [Amount] ELSE 0 END)  AS TotalCompleted,
       SUM(CASE WHEN [Status] = 'pending'   THEN [Amount] ELSE 0 END)  AS TotalPending,
       SUM(CASE WHEN [Status] = 'failed'    THEN [Amount] ELSE 0 END)  AS TotalFailed
     FROM [payments].[Payments]
     WHERE [UserId] = @userId
       ${startDate ? 'AND [CreatedAt] >= @startDate' : ''}
       ${endDate   ? 'AND [CreatedAt] <= @endDate'   : ''}`,
    { userId, startDate: startDate ?? null, endDate: endDate ?? null }
  )
  return result.recordset[0]
}

// Mantener compatibilidad con nombre anterior usado en el webhook
export const updatePaymentStatus = confirmPayment

export default {
  createPayment,
  confirmPayment,
  failPayment,
  updatePaymentStatus,
  getPaymentsByUser,
  getPaymentById,
  getPaymentStats,
}
