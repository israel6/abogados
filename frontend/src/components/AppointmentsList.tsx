import { useAppointments } from '@hooks/useAppointments'
import '../styles/appointments.css'

export function AppointmentsList() {
  const { appointments, isLoading, error } = useAppointments()

  if (isLoading) {
    return <div className="loading">Cargando citas...</div>
  }

  if (error) {
    return <div className="error-message">{error}</div>
  }

  if (appointments.length === 0) {
    return (
      <div className="empty-state">
        <p>No hay citas agendadas</p>
        <small>Agenda una cita para comenzar</small>
      </div>
    )
  }

  return (
    <div className="appointments-list">
      <h2>Mis Citas</h2>
      <div className="appointments-grid">
        {appointments.map((appointment) => (
          <div key={appointment.AppointmentId} className="appointment-card">
            <div className="appointment-header">
              <h3>{appointment.Title}</h3>
              <span className={`status status-${appointment.Status.toLowerCase()}`}>
                {appointment.Status === 'pending' && 'Pendiente'}
                {appointment.Status === 'confirmed' && 'Confirmada'}
                {appointment.Status === 'cancelled' && 'Cancelada'}
                {appointment.Status === 'completed' && 'Completada'}
              </span>
            </div>

            <div className="appointment-body">
              {appointment.Description && (
                <p className="description">{appointment.Description}</p>
              )}

              <div className="appointment-details">
                <div className="detail-item">
                  <span className="label">📅 Inicio:</span>
                  <span>
                    {new Date(appointment.StartTime).toLocaleString('es-ES')}
                  </span>
                </div>

                <div className="detail-item">
                  <span className="label">⏱️ Fin:</span>
                  <span>{new Date(appointment.EndTime).toLocaleString('es-ES')}</span>
                </div>

                {appointment.Location && (
                  <div className="detail-item">
                    <span className="label">📍 Ubicación:</span>
                    <span>{appointment.Location}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="appointment-footer">
              <small>
                Creada: {new Date(appointment.CreatedAt).toLocaleDateString('es-ES')}
              </small>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
