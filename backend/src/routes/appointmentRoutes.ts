import { Router } from 'express'
import { authMiddleware } from '@middleware/auth'
import {
  createAppointmentHandler,
  getMyAppointments,
  getLawyerAppointments,
  getAvailableSlotsHandler,
  updateAppointmentStatusHandler,
  validateCreateAppointment,
} from '@controllers/appointmentController'

const router = Router()

// Get available slots (public)
router.get('/available-slots', getAvailableSlotsHandler)

// Protected routes
router.post('/', authMiddleware, validateCreateAppointment, createAppointmentHandler)
router.get('/my-appointments', authMiddleware, getMyAppointments)
router.get('/lawyer-appointments', authMiddleware, getLawyerAppointments)
router.put('/:id/status', authMiddleware, updateAppointmentStatusHandler)

export default router
