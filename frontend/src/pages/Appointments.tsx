import { CreateAppointmentForm } from '@components/CreateAppointmentForm'
import { AppointmentsList } from '@components/AppointmentsList'
import '../styles/appointments.css'

export function Appointments() {
  return (
    <div className="appointments-container">
      <header className="appointments-header">
        <h1>Gestor de Citas</h1>
        <p>Agenda y gestiona tus citas con nuestros abogados</p>
      </header>

      <main className="appointments-main">
        <div className="appointments-grid-layout">
          <section className="form-section">
            <CreateAppointmentForm />
          </section>

          <section className="list-section">
            <AppointmentsList />
          </section>
        </div>
      </main>
    </div>
  )
}
