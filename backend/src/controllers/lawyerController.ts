import { Response } from 'express'
import { CustomRequest } from '../types/express'
import {
  createLawyer,
  getAllLawyers,
  getLawyerById,
  getLawyersBySpecialization,
  updateLawyerProfile,
  updateLawyerRating,
  getLawyerSpecializations,
} from '@services/lawyerService'
import { body, validationResult } from 'express-validator'

export const validateCreateLawyer = [
  body('firstName').trim().notEmpty(),
  body('lastName').trim().notEmpty(),
  body('email').isEmail(),
  body('phone').trim().notEmpty(),
  body('specialization').trim().notEmpty(),
  body('bio').trim().notEmpty(),
  body('experience').isInt({ min: 0 }),
]

export const createLawyerHandler = async (req: CustomRequest, res: Response) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() })
    }

    const { firstName, lastName, email, phone, specialization, bio, experience, profileImageUrl } =
      req.body

    const lawyerId = await createLawyer(
      firstName,
      lastName,
      email,
      phone,
      specialization,
      bio,
      experience,
      profileImageUrl
    )

    res.status(201).json({
      message: 'Lawyer profile created successfully',
      lawyerId,
    })
  } catch (error) {
    console.error('Create lawyer error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}

export const getAllLawyersHandler = async (_req: CustomRequest, res: Response) => {
  try {
    const lawyers = await getAllLawyers()

    res.json({
      lawyers,
    })
  } catch (error) {
    console.error('Get lawyers error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}

export const getLawyerByIdHandler = async (req: CustomRequest, res: Response) => {
  try {
    const { id } = req.params

    const lawyer = await getLawyerById(id)
    if (!lawyer) {
      return res.status(404).json({ error: 'Lawyer not found' })
    }

    res.json({
      lawyer,
    })
  } catch (error) {
    console.error('Get lawyer error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}

export const getLawyersBySpecializationHandler = async (req: CustomRequest, res: Response) => {
  try {
    const { specialization } = req.query

    if (!specialization) {
      return res.status(400).json({ error: 'Specialization required' })
    }

    const lawyers = await getLawyersBySpecialization(specialization as string)

    res.json({
      lawyers,
    })
  } catch (error) {
    console.error('Get lawyers by specialization error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}

export const updateLawyerProfileHandler = async (req: CustomRequest, res: Response) => {
  try {
    const { id } = req.params
    const { bio, profileImageUrl, isAvailable } = req.body

    await updateLawyerProfile(id, bio, profileImageUrl, isAvailable)

    res.json({
      message: 'Lawyer profile updated successfully',
    })
  } catch (error) {
    console.error('Update lawyer error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}

export const ratelawyerHandler = async (req: CustomRequest, res: Response) => {
  try {
    const { id } = req.params
    const { rating, successCases } = req.body

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ error: 'Rating must be between 1 and 5' })
    }

    await updateLawyerRating(id, rating, successCases)

    res.json({
      message: 'Rating updated successfully',
    })
  } catch (error) {
    console.error('Rate lawyer error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}

export const getSpecializationsHandler = async (_req: CustomRequest, res: Response) => {
  try {
    const specializations = await getLawyerSpecializations()

    res.json({
      specializations,
    })
  } catch (error) {
    console.error('Get specializations error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}

export default {
  createLawyerHandler,
  getAllLawyersHandler,
  getLawyerByIdHandler,
  getLawyersBySpecializationHandler,
  updateLawyerProfileHandler,
  ratelawyerHandler,
  getSpecializationsHandler,
}
