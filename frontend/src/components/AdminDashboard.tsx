import { useEffect, useState } from 'react'
import adminService, { DashboardStats, RecentAppointment, RecentPayment } from '@services/adminService'
import '../styles/admin.css'

export function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [appointments, setAppointments] = useState<RecentAppointment[]>([])
  const [payments, setPayments] = useState<RecentPayment[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true)
        const [statsData, appointmentsData, paymentsData] = await Promise.all([
          adminService.getDashboardStats(),
          adminService.getRecentAppointments(),
          adminService.getRecentPayments(),
        ])

        setStats(statsData.stats)
        setAppointments(appointmentsData.appointments)
        setPayments(paymentsData.payments)
      } catch (err: any) {
        setError(err.response?.data?.error || 'Failed to load admin data')
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [])

  if (isLoading) {
    return <div className="loading">Cargando dashboard administrativo...</div>
  }

  if (error) {
    return <div className="error-message">{error}</div>
  }

  return (
    <div className="admin-dashboard">
      <h1>Dashboard Administrativo</h1>

      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">👥</div>
          <div className="stat-content">
            <h3>Usuarios</h3>
            <p className="stat-value">{stats?.totalUsers || 0}</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">⚖️</div>
          <div className="stat-content">
            <h3>Abogados</h3>
            <p className="stat-value">{stats?.totalLawyers || 0}</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">📅</div>
          <div className="stat-content">
            <h3>Citas</h3>
            <p className="stat-value">{stats?.totalAppointments || 0}</p>
            <small>Pendientes: {stats?.pendingAppointments || 0}</small>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">💰</div>
          <div className="stat-content">
            <h3>Ingresos</h3>
            <p className="stat-value">${(stats?.totalRevenue || 0).toFixed(2)}</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">📚</div>
          <div className="stat-content">
            <h3>Artículos</h3>
            <p className="stat-value">{stats?.publishedArticles || 0}</p>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="activity-section">
        <div className="activity-card">
          <h2>Citas Recientes</h2>
          <table className="activity-table">
            <thead>
              <tr>
                <th>Cliente</th>
                <th>Abogado</th>
                <th>Asunto</th>
                <th>Fecha</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>
              {appointments.map((appt) => (
                <tr key={appt.AppointmentId}>
                  <td>{appt.ClientName}</td>
                  <td>{appt.LawyerName}</td>
                  <td>{appt.Title}</td>
                  <td>{new Date(appt.StartTime).toLocaleDateString('es-ES')}</td>
                  <td>
                    <span className={`status status-${appt.Status.toLowerCase()}`}>
                      {appt.Status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="activity-card">
          <h2>Pagos Recientes</h2>
          <table className="activity-table">
            <thead>
              <tr>
                <th>Usuario</th>
                <th>Monto</th>
                <th>Moneda</th>
                <th>Fecha</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>
              {payments.map((payment) => (
                <tr key={payment.PaymentId}>
                  <td>{payment.UserName}</td>
                  <td>{payment.Amount.toFixed(2)}</td>
                  <td>{payment.Currency}</td>
                  <td>{new Date(payment.CreatedAt).toLocaleDateString('es-ES')}</td>
                  <td>
                    <span className={`status status-${payment.Status.toLowerCase()}`}>
                      {payment.Status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
