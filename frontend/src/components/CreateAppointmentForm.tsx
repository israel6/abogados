import { useState, useEffect } from 'react'
import appointmentService from '@services/appointmentService'
import lawyerService, { Lawyer } from '@services/lawyerService'
import '../styles/appointments.css'

interface CreateAppointmentFormProps {
  onSuccess?: () => void
}

export function CreateAppointmentForm({ onSuccess }: CreateAppointmentFormProps) {
  const [formData, setFormData] = useState({
    lawyerId: '',
    title: '',
    description: '',
    startTime: '',
    endTime: '',
    location: '',
  })
  const [lawyers, setLawyers] = useState<Lawyer[]>([])
  const [lawyersLoading, setLawyersLoading] = useState(true)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  // Cargar lista de abogados disponibles
  useEffect(() => {
    lawyerService
      .getAllLawyers()
      .then(({ lawyers: data }) => setLawyers(data))
      .catch(() => setError('No se pudieron cargar los abogados'))
      .finally(() => setLawyersLoading(false))
  }, [])

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(false)

    if (!formData.lawyerId || !formData.title || !formData.startTime || !formData.endTime) {
      setError('Por favor completa todos los campos requeridos')
      return
    }

    if (new Date(formData.endTime) <= new Date(formData.startTime)) {
      setError('La hora de fin debe ser posterior a la hora de inicio')
      return
    }

    try {
      setIsLoading(true)
      await appointmentService.createAppointment(formData)
      setSuccess(true)
      setFormData({ lawyerId: '', title: '', description: '', startTime: '', endTime: '', location: '' })
      onSuccess?.()
      setTimeout(() => setSuccess(false), 3000)
    } catch (err: any) {
      setError(err.response?.data?.error || 'No se pudo crear la cita')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form className="appointment-form" onSubmit={handleSubmit}>
      <h2>Agendar Nueva Cita</h2>

      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">Cita agendada exitosamente</div>}

      <div className="form-group">
        <label htmlFor="lawyerId">Abogado *</label>
        <select
          id="lawyerId"
          name="lawyerId"
          value={formData.lawyerId}
          onChange={handleChange}
          required
          disabled={lawyersLoading}
        >
          <option value="">
            {lawyersLoading ? 'Cargando abogados...' : 'Selecciona un abogado'}
          </option>
          {lawyers.map((lawyer) => (
            <option key={lawyer.LawyerId} value={lawyer.LawyerId}>
              {lawyer.FirstName} {lawyer.LastName} — {lawyer.Specialization}
            </option>
          ))}
        </select>
      </div>

      <div className="form-group">
        <label htmlFor="title">Asunto de la Cita *</label>
        <input
          type="text"
          id="title"
          name="title"
          value={formData.title}
          onChange={handleChange}
          placeholder="Ej: Consulta sobre contrato de trabajo"
          required
        />
      </div>

      <div className="form-group">
        <label htmlFor="description">Descripción</label>
        <textarea
          id="description"
          name="description"
          value={formData.description}
          onChange={handleChange}
          placeholder="Proporciona detalles sobre tu caso"
          rows={4}
        />
      </div>

      <div className="form-row">
        <div className="form-group">
          <label htmlFor="startTime">Fecha y Hora de Inicio *</label>
          <input
            type="datetime-local"
            id="startTime"
            name="startTime"
            value={formData.startTime}
            onChange={handleChange}
            min={new Date().toISOString().slice(0, 16)}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="endTime">Fecha y Hora de Fin *</label>
          <input
            type="datetime-local"
            id="endTime"
            name="endTime"
            value={formData.endTime}
            onChange={handleChange}
            min={formData.startTime || new Date().toISOString().slice(0, 16)}
            required
          />
        </div>
      </div>

      <div className="form-group">
        <label htmlFor="location">Ubicación</label>
        <input
          type="text"
          id="location"
          name="location"
          value={formData.location}
          onChange={handleChange}
          placeholder="Ej: Oficina principal, Calle 5 #123"
        />
      </div>

      <button type="submit" className="btn-primary" disabled={isLoading || lawyersLoading}>
        {isLoading ? 'Agendando...' : 'Agendar Cita'}
      </button>
    </form>
  )
}
