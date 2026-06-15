import { Response } from 'express'
import { CustomRequest } from '../types/express'
import { registerUser, getUserByEmail } from '@services/authService'
import { generateToken } from '@middleware/auth'
import { comparePassword } from '@utils/encryption'
import { body, validationResult } from 'express-validator'

export const validateRegister = [
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 8 }),
  body('fullName').trim().notEmpty(),
  body('phone').optional().trim(),
]

export const validateLogin = [
  body('email').isEmail().normalizeEmail(),
  body('password').notEmpty(),
]

export const register = async (req: CustomRequest, res: Response) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() })
    }

    const { email, password, fullName, phone } = req.body

    const user = await registerUser(email, password, fullName, phone, 'client')

    const token = generateToken(user.userId, user.email, 'client')

    res.status(201).json({
      message: 'User registered successfully',
      user: {
        userId: user.userId,
        email: user.email,
        fullName: user.fullName,
      },
      token,
    })
  } catch (error: any) {
    if (error.message === 'Email already exists') {
      return res.status(409).json({ error: 'Email already exists' })
    }
    console.error('Register error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}

export const login = async (req: CustomRequest, res: Response) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() })
    }

    const { email, password } = req.body

    const user = await getUserByEmail(email)
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' })
    }

    const isPasswordValid = await comparePassword(password, user.PasswordHash)
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid email or password' })
    }

    const token = generateToken(user.UserId, user.Email, user.Role)

    res.json({
      message: 'Login successful',
      user: {
        userId: user.UserId,
        email: user.Email,
        fullName: user.FullName,
        role: user.Role,
      },
      token,
    })
  } catch (error) {
    console.error('Login error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}

export const logout = (_req: CustomRequest, res: Response) => {
  res.json({ message: 'Logout successful' })
}

export const getProfile = async (req: CustomRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' })
    }

    const user = await getUserByEmail(req.user.email)
    if (!user) {
      return res.status(404).json({ error: 'User not found' })
    }

    res.json({
      userId: user.UserId,
      email: user.Email,
      fullName: user.FullName,
      phone: user.Phone,
      role: user.Role,
    })
  } catch (error) {
    console.error('Get profile error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}
