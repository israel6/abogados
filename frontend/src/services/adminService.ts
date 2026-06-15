import client from './api'

export interface DashboardStats {
  totalUsers: number
  totalLawyers: number
  totalAppointments: number
  pendingAppointments: number
  totalRevenue: number
  publishedArticles: number
}

export interface RecentAppointment {
  AppointmentId: string
  Title: string
  StartTime: string
  Status: string
  ClientName: string
  LawyerName: string
}

export interface RecentPayment {
  PaymentId: string
  Amount: number
  Currency: string
  Status: string
  CreatedAt: string
  UserName: string
}

export const adminService = {
  getDashboardStats: async (): Promise<{ stats: DashboardStats }> => {
    const response = await client.get('/admin/stats')
    return response.data
  },

  getRecentAppointments: async (): Promise<{ appointments: RecentAppointment[] }> => {
    const response = await client.get('/admin/appointments/recent')
    return response.data
  },

  getRecentPayments: async (): Promise<{ payments: RecentPayment[] }> => {
    const response = await client.get('/admin/payments/recent')
    return response.data
  },

  getSystemHealth: async () => {
    const response = await client.get('/admin/health')
    return response.data
  },
}

export default adminService
