import { Router } from 'express'
import { authMiddleware } from '@middleware/auth'
import {
  register,
  login,
  logout,
  getProfile,
  validateRegister,
  validateLogin,
} from '@controllers/authController'

const router = Router()

// Public routes
router.post('/register', validateRegister, register)
router.post('/login', validateLogin, login)

// Protected routes
router.post('/logout', authMiddleware, logout)
router.get('/profile', authMiddleware, getProfile)

export default router
