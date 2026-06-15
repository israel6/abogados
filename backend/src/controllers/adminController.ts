import { Response } from 'express'
import { CustomRequest } from '../types/express'
import { executeQuery } from '@config/database'

export const getDashboardStats = async (_req: CustomRequest, res: Response) => {
  try {
    const query = `
      SELECT
        (SELECT COUNT(*) FROM [auth].[Users]) as TotalUsers,
        (SELECT COUNT(*) FROM [auth].[Lawyers]) as TotalLawyers,
        (SELECT COUNT(*) FROM [appointments].[Appointments]) as TotalAppointments,
        (SELECT COUNT(*) FROM [appointments].[Appointments] WHERE [Status] = 'pending') as PendingAppointments,
        (SELECT SUM([Amount]) FROM [payments].[Payments] WHERE [Status] = 'completed') as TotalRevenue,
        (SELECT COUNT(*) FROM [blog].[Articles] WHERE [IsPublished] = 1) as PublishedArticles
    `

    const result = await executeQuery(query, {})
    const stats = result.recordset[0]

    res.json({
      stats: {
        totalUsers: stats.TotalUsers,
        totalLawyers: stats.TotalLawyers,
        totalAppointments: stats.TotalAppointments,
        pendingAppointments: stats.PendingAppointments,
        totalRevenue: stats.TotalRevenue || 0,
        publishedArticles: stats.PublishedArticles,
      },
    })
  } catch (error) {
    console.error('Get dashboard stats error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}

export const getRecentAppointments = async (_req: CustomRequest, res: Response) => {
  try {
    const query = `
      SELECT TOP 10
        a.[AppointmentId], a.[Title], a.[StartTime], a.[Status],
        u.[FullName] as ClientName, l.[FirstName] + ' ' + l.[LastName] as LawyerName
      FROM [appointments].[Appointments] a
      INNER JOIN [auth].[Users] u ON a.[ClientId] = u.[UserId]
      INNER JOIN [auth].[Lawyers] l ON a.[LawyerId] = l.[LawyerId]
      ORDER BY a.[StartTime] DESC
    `

    const result = await executeQuery(query, {})

    res.json({
      appointments: result.recordset,
    })
  } catch (error) {
    console.error('Get recent appointments error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}

export const getRecentPayments = async (_req: CustomRequest, res: Response) => {
  try {
    const query = `
      SELECT TOP 10
        p.[PaymentId], p.[Amount], p.[Currency], p.[Status], p.[CreatedAt],
        u.[FullName] as UserName
      FROM [payments].[Payments] p
      INNER JOIN [auth].[Users] u ON p.[UserId] = u.[UserId]
      ORDER BY p.[CreatedAt] DESC
    `

    const result = await executeQuery(query, {})

    res.json({
      payments: result.recordset,
    })
  } catch (error) {
    console.error('Get recent payments error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}

export const getSystemHealth = async (_req: CustomRequest, res: Response) => {
  try {
    const query = `
      SELECT
        @@VERSION as SQLVersion,
        DB_NAME() as DatabaseName,
        DATABASEPROPERTYEX(DB_NAME(), 'Status') as DatabaseStatus
    `

    const result = await executeQuery(query, {})

    res.json({
      health: {
        status: 'healthy',
        database: result.recordset[0],
        timestamp: new Date().toISOString(),
      },
    })
  } catch (error) {
    console.error('Get system health error:', error)
    res.status(500).json({
      health: {
        status: 'unhealthy',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
    })
  }
}

export default {
  getDashboardStats,
  getRecentAppointments,
  getRecentPayments,
  getSystemHealth,
}
