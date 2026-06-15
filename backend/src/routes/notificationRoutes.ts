// =============================================
// Notification Routes
// Portal Bufete de Abogados
// =============================================

import { Router } from 'express'
import { authMiddleware } from '@middleware/auth'
import {
  getHistory,
  getQueueStatusHandler,
  processQueueHandler,
  sendTestNotification,
  sendAppointmentReminder,
} from '@controllers/notificationController'

const router = Router()

// Todas las rutas requieren autenticación de admin
router.use(authMiddleware)

// Historial de notificaciones
router.get('/history', getHistory)

// Estado de la cola
router.get('/queue-status', getQueueStatusHandler)

// Forzar procesamiento de cola
router.post('/process-queue', processQueueHandler)

// Test de notificación
router.post('/test', sendTestNotification)

// Enviar recordatorio de cita manualmente
router.post('/send-appointment-reminder', sendAppointmentReminder)

export default router
