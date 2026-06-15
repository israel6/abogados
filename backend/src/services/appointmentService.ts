import { executeQuery } from '@config/database'
import { getUserById } from '@services/authService'
import { enqueue } from './notificationQueueService'
import { appointmentConfirmation, appointmentCancellation } from './emailTemplates'

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

export const createAppointment = async (
  clientId: string,
  lawyerId: string,
  title: string,
  description: string,
  startTime: string,
  endTime: string,
  location: string
): Promise<string> => {
  const query = `
    DECLARE @AppointmentId UNIQUEIDENTIFIER;
    EXEC [appointments].[sp_CreateAppointment]
      @ClientId = @clientId,
      @LawyerId = @lawyerId,
      @Title = @title,
      @Description = @description,
      @StartTime = @startTime,
      @EndTime = @endTime,
      @Location = @location,
      @AppointmentId = @AppointmentId OUTPUT;
    
    SELECT @AppointmentId as AppointmentId;
  `

  const result = await executeQuery(query, {
    clientId,
    lawyerId,
    title,
    description,
    startTime,
    endTime,
    location,
  })

  const appointmentId = result.recordset[0].AppointmentId

  // Encolar notificación de confirmación (no-blocking)
  try {
    // Obtener datos reales del cliente y del abogado
    const [client, lawyer] = await Promise.all([
      getUserById(clientId),
      getUserById(lawyerId),
    ])
    const clientEmail = client?.Email ?? ''
    const clientPhone = client?.Phone ?? ''
    const clientName = client?.FullName ?? 'Cliente'
    const lawyerName = lawyer?.FullName ?? 'Abogado'

    const { subject, html, text } = appointmentConfirmation({
      clientName,
      lawyerName,
      lawyerSpecialty: 'Asesor Legal',
      title,
      startTime: new Date(startTime),
      endTime: new Date(endTime),
      location,
      appointmentId,
    })

    if (clientEmail) {
      enqueue({
        channel: 'email',
        recipient: clientEmail,
        subject,
        body: text,
        htmlBody: html,
        templateType: 'appointment_confirmation',
        referenceId: appointmentId,
        maxAttempts: 3,
      })
    }

    if (clientPhone) {
      enqueue({
        channel: 'whatsapp',
        recipient: clientPhone,
        body: `✅ *Cita Confirmada*\n\n📋 ${title}\n📅 ${new Date(startTime).toLocaleDateString('es-EC')}\n\nLe esperamos. Puede gestionar su cita en nuestro portal.`,
        templateType: 'appointment_confirmation',
        referenceId: appointmentId,
        maxAttempts: 2,
      })
    }

    console.log(`[AppointmentService] Notifications queued for appointment ${appointmentId}`)
  } catch (notifError) {
    console.warn('[AppointmentService] Could not queue notifications:', notifError)
  }

  return appointmentId
}

export const getAppointmentsByClient = async (clientId: string): Promise<Appointment[]> => {
  const query = `
    SELECT 
      [AppointmentId], [ClientId], [LawyerId], [Title], [Description],
      [StartTime], [EndTime], [Status], [Location], [GoogleCalendarEventId],
      [CreatedAt], [UpdatedAt]
    FROM [appointments].[Appointments]
    WHERE [ClientId] = @clientId
    ORDER BY [StartTime] DESC
  `

  const result = await executeQuery(query, { clientId })
  return result.recordset
}

export const getAppointmentsByLawyer = async (lawyerId: string): Promise<Appointment[]> => {
  const query = `
    SELECT 
      [AppointmentId], [ClientId], [LawyerId], [Title], [Description],
      [StartTime], [EndTime], [Status], [Location], [GoogleCalendarEventId],
      [CreatedAt], [UpdatedAt]
    FROM [appointments].[Appointments]
    WHERE [LawyerId] = @lawyerId
    ORDER BY [StartTime] DESC
  `

  const result = await executeQuery(query, { lawyerId })
  return result.recordset
}

export const getAppointmentById = async (appointmentId: string): Promise<Appointment | null> => {
  const query = `
    SELECT 
      [AppointmentId], [ClientId], [LawyerId], [Title], [Description],
      [StartTime], [EndTime], [Status], [Location], [GoogleCalendarEventId],
      [CreatedAt], [UpdatedAt]
    FROM [appointments].[Appointments]
    WHERE [AppointmentId] = @appointmentId
  `

  const result = await executeQuery(query, { appointmentId })
  if (result.recordset.length === 0) {
    return null
  }
  return result.recordset[0]
}

export const updateAppointmentStatus = async (
  appointmentId: string,
  status: 'confirmed' | 'cancelled' | 'completed'
): Promise<void> => {
  const query = `
    UPDATE [appointments].[Appointments]
    SET [Status] = @status, [UpdatedAt] = GETUTCDATE()
    WHERE [AppointmentId] = @appointmentId
  `

  await executeQuery(query, { appointmentId, status })

  // Notificar cancelación
  if (status === 'cancelled') {
    try {
      const appointment = await getAppointmentById(appointmentId)
      const client = appointment ? await getUserById(appointment.ClientId) : null
      const { subject, html, text } = appointmentCancellation({
        clientName: client?.FullName ?? 'Cliente',
        title: appointment?.Title ?? 'Su cita',
        startTime: appointment ? new Date(appointment.StartTime) : new Date(),
      })
      if (client?.Email) {
        enqueue({
          channel: 'email',
          recipient: client.Email,
          subject,
          body: text,
          htmlBody: html,
          templateType: 'appointment_cancellation',
          referenceId: appointmentId,
          maxAttempts: 3,
        })
      }
    } catch (notifError) {
      console.warn('[AppointmentService] Could not queue cancellation notification:', notifError)
    }
  }
}

export const getAvailableSlots = async (
  lawyerId: string,
  startDate: string,
  endDate: string
): Promise<any[]> => {
  const query = `
    EXEC [appointments].[sp_GetAvailableSlots]
      @LawyerId = @lawyerId,
      @StartDate = @startDate,
      @EndDate = @endDate
  `

  const result = await executeQuery(query, { lawyerId, startDate, endDate })
  return result.recordset
}

export default {
  createAppointment,
  getAppointmentsByClient,
  getAppointmentsByLawyer,
  getAppointmentById,
  updateAppointmentStatus,
  getAvailableSlots,
}
