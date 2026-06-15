import { useEffect, useState } from 'react'
import appointmentService, { Appointment } from '@services/appointmentService'

export const useAppointments = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const loadAppointments = async (type: 'client' | 'lawyer' = 'client') => {
    try {
      setIsLoading(true)
      setError(null)
      const data =
        type === 'client'
          ? await appointmentService.getMyAppointments()
          : await appointmentService.getLawyerAppointments()
      setAppointments(data.appointments)
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to load appointments')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadAppointments()
  }, [])

  return { appointments, isLoading, error, loadAppointments }
}
