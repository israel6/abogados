import { Router } from 'express'
import { authMiddleware, requireRole } from '@middleware/auth'
import {
  getDashboardStats,
  getRecentAppointments,
  getRecentPayments,
  getSystemHealth,
} from '@controllers/adminController'

const router = Router()

// All admin routes require authentication AND admin role
router.use(authMiddleware, requireRole('admin'))

// Dashboard stats
router.get('/stats', getDashboardStats)
router.get('/appointments/recent', getRecentAppointments)
router.get('/payments/recent', getRecentPayments)
router.get('/health', getSystemHealth)

export default router
