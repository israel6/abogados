import client from './api'

export interface Appointment {
  AppointmentId: string
  ClientId: string
  LawyerId: string
  Title: string
  Description: string
  StartTime: string
  EndTime: string
  Status: 'pending' | 'confirmed' | 'cancelled' | 'completed'
  Location: string
  GoogleCalendarEventId: string | null
  CreatedAt: string
  UpdatedAt: string
}

export interface CreateAppointmentData {
  lawyerId: string
  title: string
  description?: string
  startTime: string
  endTime: string
  location?: string
}

export const appointmentService = {
  createAppointment: async (data: CreateAppointmentData): Promise<{ appointmentId: string }> => {
    const response = await client.post('/appointments', data)
    return response.data
  },

  getMyAppointments: async (): Promise<{ appointments: Appointment[] }> => {
    const response = await client.get('/appointments/my-appointments')
    return response.data
  },

  getLawyerAppointments: async (): Promise<{ appointments: Appointment[] }> => {
    const response = await client.get('/appointments/lawyer-appointments')
    return response.data
  },

  getAvailableSlots: async (lawyerId: string, startDate: string, endDate: string) => {
    const response = await client.get('/appointments/available-slots', {
      params: { lawyerId, startDate, endDate },
    })
    return response.data
  },

  updateAppointmentStatus: async (
    appointmentId: string,
    status: 'confirmed' | 'cancelled' | 'completed'
  ): Promise<{ message: string }> => {
    const response = await client.put(`/appointments/${appointmentId}/status`, { status })
    return response.data
  },
}

export default appointmentService
