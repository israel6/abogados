import { AdminDashboard } from '@components/AdminDashboard'
import '../styles/admin.css'

export function Admin() {
  return (
    <div className="admin-container">
      <header className="admin-header">
        <h1>Panel Administrativo</h1>
        <p>Gestión y monitoreo del sistema</p>
      </header>

      <main className="admin-main">
        <AdminDashboard />
      </main>
    </div>
  )
}
