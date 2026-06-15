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
const isVercel = Boolean(process.env.VERCEL)

const corsOrigins = [
  process.env.APP_URL,
  process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : undefined,
  process.env.VERCEL_BRANCH_URL,
].filter(Boolean) as string[]

// Middleware
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(cors({
  origin: corsOrigins.length > 0 ? corsOrigins : true,
  credentials: true,
}))
app.use(requestLogger)

const api = express.Router()

api.get('/health', (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    database: isDatabaseAvailable() ? 'connected' : 'disconnected',
    timestamp: new Date(),
  })
})

api.use('/auth', authRoutes)
api.use('/appointments', appointmentRoutes)
api.use('/payments', paymentRoutes)
api.use('/blog', blogRoutes)
api.use('/lawyers', lawyerRoutes)
api.use('/admin', adminRoutes)
api.use('/notifications', notificationRoutes)
api.use('/ai', aiRoutes)

app.use('/api', api)

// Error handling
app.use(errorHandler)

// 404 handler
app.use((_req: Request, res: Response) => {
  res.status(404).json({ error: 'Route not found' })
})

const bootDatabase = async () => {
  try {
    await initializeDatabase()
    if (!isVercel) {
      startScheduler(60_000)
      console.log('✓ Notification queue scheduler started')
    }
  } catch (error) {
    console.error('✗ Database unavailable — running in limited mode (no DB queries will work)')
    if (!isVercel) {
      console.error('  → Habilita TCP/IP en SQL Server Configuration Manager y reinicia el servicio')
    }
  }
}

void bootDatabase()

if (!isVercel) {
  app.listen(PORT, () => {
    console.log(`✓ Server running on http://localhost:${PORT}`)
    console.log(`✓ Environment: ${process.env.NODE_ENV}`)
  })
}

export default app
