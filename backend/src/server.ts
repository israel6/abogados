import 'dotenv/config'
import express, { Express, Request, Response } from 'express'
import cors from 'cors'
import { initializeDatabase, isDatabaseAvailable } from '@config/database'
import { errorHandler } from '@middleware/errorHandler'
import { requestLogger } from '@middleware/requestLogger'
import authRoutes from '@routes/authRoutes'
import appointmentRoutes from '@routes/appointmentRoutes'
import paymentRoutes from '@routes/paymentRoutes'
import blogRoutes from '@routes/blogRoutes'
import lawyerRoutes from '@routes/lawyerRoutes'
import adminRoutes from '@routes/adminRoutes'
import notificationRoutes from '@routes/notificationRoutes'
import aiRoutes from '@routes/aiRoutes'
import { startScheduler } from '@services/notificationQueueService'

const app: Express = express()
const PORT = process.env.PORT || 3000

// Middleware
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(cors({
  origin: process.env.APP_URL || 'http://localhost:5173',
  credentials: true,
}))
app.use(requestLogger)

// Health check
app.get('/health', (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    database: isDatabaseAvailable() ? 'connected' : 'disconnected',
    timestamp: new Date(),
  })
})

// API Routes
app.use('/auth', authRoutes)
app.use('/appointments', appointmentRoutes)
app.use('/payments', paymentRoutes)
app.use('/blog', blogRoutes)
app.use('/lawyers', lawyerRoutes)
app.use('/admin', adminRoutes)
app.use('/notifications', notificationRoutes)
app.use('/ai', aiRoutes)

// Error handling
app.use(errorHandler)

// 404 handler
app.use((_req: Request, res: Response) => {
  res.status(404).json({ error: 'Route not found' })
})

// Initialize and start server
const startServer = async () => {
  // Start HTTP server first so health check works immediately
  app.listen(PORT, () => {
    console.log(`✓ Server running on http://localhost:${PORT}`)
    console.log(`✓ Environment: ${process.env.NODE_ENV}`)
  })

  // Then connect to DB (non-blocking startup)
  try {
    await initializeDatabase()

    // Start notification queue scheduler only when DB is available
    startScheduler(60_000)
    console.log('✓ Notification queue scheduler started')
  } catch (error) {
    console.error('✗ Database unavailable — running in limited mode (no DB queries will work)')
    console.error('  → Habilita TCP/IP en SQL Server Configuration Manager y reinicia el servicio')
    console.error('  → Luego reinicia el backend con: npm run dev')
  }
}

startServer()
