import { Router } from 'express'
import { authMiddleware } from '@middleware/auth'
import {
  createLawyerHandler,
  getAllLawyersHandler,
  getLawyerByIdHandler,
  getLawyersBySpecializationHandler,
  updateLawyerProfileHandler,
  ratelawyerHandler,
  getSpecializationsHandler,
  validateCreateLawyer,
} from '@controllers/lawyerController'

const router = Router()

// Public routes
router.get('/specializations', getSpecializationsHandler)
router.get('/', getAllLawyersHandler)
router.get('/:id', getLawyerByIdHandler)
router.get('/by-specialization', getLawyersBySpecializationHandler)

// Protected routes
router.post('/', authMiddleware, validateCreateLawyer, createLawyerHandler)
router.put('/:id', authMiddleware, updateLawyerProfileHandler)
router.post('/:id/rate', authMiddleware, ratelawyerHandler)

export default router
