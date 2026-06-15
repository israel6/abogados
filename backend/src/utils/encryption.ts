import crypto from 'crypto'
import bcrypt from 'bcryptjs'

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'default_32_character_encryption_key'

export const encryptData = (data: string): string => {
  if (ENCRYPTION_KEY.length !== 32) {
    throw new Error('Encryption key must be 32 characters long')
  }
  
  const iv = crypto.randomBytes(16)
  const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY), iv)
  
  let encrypted = cipher.update(data, 'utf8', 'hex')
  encrypted += cipher.final('hex')
  
  return iv.toString('hex') + ':' + encrypted
}

export const decryptData = (encryptedData: string): string => {
  if (ENCRYPTION_KEY.length !== 32) {
    throw new Error('Encryption key must be 32 characters long')
  }
  
  const parts = encryptedData.split(':')
  const iv = Buffer.from(parts[0], 'hex')
  const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY), iv)
  
  let decrypted = decipher.update(parts[1], 'hex', 'utf8')
  decrypted += decipher.final('utf8')
  
  return decrypted
}

export const hashPassword = async (password: string): Promise<string> => {
  const salt = await bcrypt.genSalt(10)
  return bcrypt.hash(password, salt)
}

export const comparePassword = async (password: string, hash: string): Promise<boolean> => {
  return bcrypt.compare(password, hash)
}

export default { encryptData, decryptData, hashPassword, comparePassword }
