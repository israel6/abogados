import { Response } from 'express'
import { CustomRequest } from '../types/express'
import {
  createPayment,
  confirmPayment,
  failPayment,
  getPaymentsByUser,
  getPaymentById,
  getPaymentStats,
} from '@services/paymentService'
import { body, validationResult } from 'express-validator'
import crypto from 'crypto'
import axios from 'axios'

// =============================================
// Validaciones
// =============================================
export const validateCreatePayment = [
  body('amount').isFloat({ min: 0.01 }).withMessage('amount must be > 0'),
  body('currency').isIn(['USD', 'PEN', 'MXN', 'COP']).withMessage('currency not supported'),
  body('appointmentId').optional().isUUID().withMessage('appointmentId must be a valid UUID'),
]

// =============================================
// Iniciar pago con Payphone
// =============================================
export const initiatePayment = async (req: CustomRequest, res: Response) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() })
    }
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' })
    }

    const { amount, currency, appointmentId } = req.body

    const paymentId = await createPayment(
      req.user.userId,
      parseFloat(amount),
      currency,
      appointmentId
    )

    // Integración con Payphone Button API
    const payphoneToken = process.env.PAYPHONE_TOKEN
    const payphoneStoreId = process.env.PAYPHONE_STORE_ID
    const appUrl = process.env.APP_URL || 'http://localhost:5173'

    if (payphoneToken && payphoneStoreId) {
      try {
        const payphoneRes = await axios.post(
          'https://pay.payphonetodoesposible.com/api/button/Prepare',
          {
            amount: Math.round(parseFloat(amount) * 100), // centavos
            amountWithTax: 0,
            amountWithoutTax: Math.round(parseFloat(amount) * 100),
            tax: 0,
            currency,
            storeId: payphoneStoreId,
            reference: paymentId,
            clientTransactionId: paymentId,
            responseUrl: `${appUrl}/payments/callback`,
            cancellationUrl: `${appUrl}/payments/cancelled`,
          },
          {
            headers: {
              Authorization: `Bearer ${payphoneToken}`,
              'Content-Type': 'application/json',
            },
          }
        )
        const { payWithPayphone } = payphoneRes.data
        return res.status(201).json({ paymentId, redirectUrl: payWithPayphone })
      } catch (ppError: any) {
        console.error('[PaymentController] Payphone API error:', ppError.response?.data ?? ppError.message)
        // Devolver paymentId igual, el frontend puede mostrar error o reintentar
        return res.status(502).json({
          error: 'Payment gateway error',
          paymentId,
        })
      }
    }

    // Modo desarrollo sin credenciales de Payphone
    res.status(201).json({
      paymentId,
      message: 'Payment created (dev mode — no Payphone credentials configured)',
      redirectUrl: null,
    })
  } catch (error) {
    console.error('Initiate payment error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}

// =============================================
// Webhook de Payphone (confirmación/rechazo)
// =============================================
export const handlePayphoneWebhook = async (req: any, res: Response) => {
  try {
    // Verificar firma HMAC del webhook
    const signature = req.headers['x-payphone-signature'] as string | undefined
    const webhookSecret = process.env.PAYPHONE_WEBHOOK_SECRET

    if (webhookSecret && signature) {
      const expectedSignature = crypto
        .createHmac('sha256', webhookSecret)
        .update(JSON.stringify(req.body))
        .digest('hex')

      if (signature !== expectedSignature) {
        return res.status(401).json({ error: 'Invalid webhook signature' })
      }
    }

    const { clientTransactionId, id: transactionId, transactionStatus } = req.body

    if (!clientTransactionId) {
      return res.status(400).json({ error: 'Missing clientTransactionId' })
    }

    if (transactionStatus === 'Approved') {
      await confirmPayment(clientTransactionId, String(transactionId), clientTransactionId)
    } else {
      const reason = req.body.message ?? transactionStatus ?? 'Payment declined'
      await failPayment(clientTransactionId, reason)
    }

    res.json({ received: true })
  } catch (error) {
    console.error('Payphone webhook error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}

// =============================================
// Listar pagos del usuario autenticado
// =============================================
export const getMyPayments = async (req: CustomRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' })
    }
    const payments = await getPaymentsByUser(req.user.userId)
    res.json({ payments })
  } catch (error) {
    console.error('Get payments error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}

// =============================================
// Detalle de un pago
// =============================================
export const getPaymentDetailsHandler = async (req: CustomRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' })
    }

    const payment = await getPaymentById(req.params.id)
    if (!payment) {
      return res.status(404).json({ error: 'Payment not found' })
    }
    if (payment.UserId !== req.user.userId && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Forbidden' })
    }

    res.json({ payment })
  } catch (error) {
    console.error('Get payment error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}

// =============================================
// Estadísticas de pagos
// =============================================
export const getPaymentStatsHandler = async (req: CustomRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' })
    }
    const { startDate, endDate } = req.query
    const stats = await getPaymentStats(
      req.user.userId,
      startDate as string | undefined,
      endDate as string | undefined
    )
    res.json({ stats })
  } catch (error) {
    console.error('Get payment stats error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}

export default {
  initiatePayment,
  handlePayphoneWebhook,
  getMyPayments,
  getPaymentDetailsHandler,
  getPaymentStatsHandler,
}
