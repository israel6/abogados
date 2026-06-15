import { Response } from 'express'
import { CustomRequest } from '../types/express'
import {
  createAppointment,
  getAppointmentsByClient,
  getAppointmentsByLawyer,
  getAppointmentById,
  updateAppointmentStatus,
  getAvailableSlots,
} from '@services/appointmentService'
import { body, validationResult } from 'express-validator'

export const validateCreateAppointment = [
  body('lawyerId').isUUID(),
  body('title').trim().notEmpty(),
  body('description').optional().trim(),
  body('startTime').isISO8601(),
  body('endTime').isISO8601(),
  body('location').optional().trim(),
]

export const createAppointmentHandler = async (req: CustomRequest, res: Response) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() })
    }

    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' })
    }

    const { lawyerId, title, description, startTime, endTime, location } = req.body

    const appointmentId = await createAppointment(
      req.user.userId,
      lawyerId,
      title,
      description || '',
      startTime,
      endTime,
      location || ''
    )

    res.status(201).json({
      message: 'Appointment created successfully',
      appointmentId,
    })
  } catch (error: any) {
    if (error.message.includes('Time slot not available')) {
      return res.status(409).json({ error: 'Time slot not available' })
    }
    console.error('Create appointment error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}

export const getMyAppointments = async (req: CustomRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' })
    }

    const appointments = await getAppointmentsByClient(req.user.userId)

    res.json({
      appointments,
    })
  } catch (error) {
    console.error('Get appointments error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}

export const getLawyerAppointments = async (req: CustomRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' })
    }

    const appointments = await getAppointmentsByLawyer(req.user.userId)

    res.json({
      appointments,
    })
  } catch (error) {
    console.error('Get lawyer appointments error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}

export const getAvailableSlotsHandler = async (req: CustomRequest, res: Response) => {
  try {
    const { lawyerId, startDate, endDate } = req.query

    if (!lawyerId || !startDate || !endDate) {
      return res.status(400).json({ error: 'Missing required parameters' })
    }

    const slots = await getAvailableSlots(
      lawyerId as string,
      startDate as string,
      endDate as string
    )

    res.json({
      slots,
    })
  } catch (error) {
    console.error('Get available slots error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}

export const updateAppointmentStatusHandler = async (req: CustomRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' })
    }

    const { id } = req.params
    const { status } = req.body

    if (!id) {
      return res.status(400).json({ error: 'Appointment ID required' })
    }

    if (!['confirmed', 'cancelled', 'completed'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' })
    }

    const appointment = await getAppointmentById(id)
    if (!appointment) {
      return res.status(404).json({ error: 'Appointment not found' })
    }

    // Only allow client or lawyer to update their own appointments
    if (
      appointment.ClientId !== req.user.userId &&
      appointment.LawyerId !== req.user.userId
    ) {
      return res.status(403).json({ error: 'Forbidden' })
    }

    await updateAppointmentStatus(id, status)

    res.json({
      message: 'Appointment updated successfully',
    })
  } catch (error) {
    console.error('Update appointment error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}

export default {
  createAppointmentHandler,
  getMyAppointments,
  getLawyerAppointments,
  getAvailableSlotsHandler,
  updateAppointmentStatusHandler,
}
