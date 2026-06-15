import jwt from 'jsonwebtoken'
import { Response, NextFunction } from 'express'
import { CustomRequest } from '../types/express'

const JWT_SECRET = process.env.JWT_SECRET || 'your_secret_key'
const JWT_EXPIRY = process.env.JWT_EXPIRY || '7d'

export const generateToken = (userId: string, email: string, role: string): string => {
  return jwt.sign(
    { userId, email, role },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRY } as any
  )
}

export const verifyToken = (token: string): any => {
  try {
    return jwt.verify(token, JWT_SECRET)
  } catch (error) {
    throw new Error('Invalid token')
  }
}

export const authMiddleware = (req: CustomRequest, res: Response, next: NextFunction) => {
  try {
    const token = req.headers.authorization?.split(' ')[1]

    if (!token) {
      return res.status(401).json({ error: 'No token provided' })
    }

    const decoded = verifyToken(token)
    req.user = decoded
    next()
  } catch (error) {
    return res.status(401).json({ error: 'Invalid token' })
  }
}

/**
 * Middleware de autorización por rol.
 * Úsalo después de authMiddleware.
 * Ejemplo: router.use(authMiddleware, requireRole('admin'))
 */
export const requireRole = (...roles: string[]) => {
  return (req: CustomRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' })
    }
    if (!req.user.role || !roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Forbidden: insufficient permissions' })
    }
    next()
  }
}

export default { generateToken, verifyToken, authMiddleware, requireRole }
