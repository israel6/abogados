import { Router } from 'express'
import { authMiddleware } from '@middleware/auth'
import {
  initiatePayment,
  getMyPayments,
  getPaymentDetailsHandler,
  handlePayphoneWebhook,
  getPaymentStatsHandler,
  validateCreatePayment,
} from '@controllers/paymentController'

const router = Router()

// Payphone webhook (public, secured by signature)
router.post('/webhook/payphone', handlePayphoneWebhook)

// Protected routes
router.post('/', authMiddleware, validateCreatePayment, initiatePayment)
router.get('/', authMiddleware, getMyPayments)
router.get('/stats', authMiddleware, getPaymentStatsHandler)
router.get('/:id', authMiddleware, getPaymentDetailsHandler)

export default router
