import { executeQuery } from '@config/database'
import { hashPassword } from '@utils/encryption'

export interface UserRow {
  UserId: string
  Email: string
  FullName: string
  Phone: string
  Role: string
  PasswordHash: string
  IsActive: number
}

export const registerUser = async (
  email: string,
  password: string,
  fullName: string,
  phone: string,
  role: 'client' | 'lawyer' | 'admin'
) => {
  const passwordHash = await hashPassword(password)

  const query = `
    DECLARE @UserId UNIQUEIDENTIFIER;
    EXEC [auth].[sp_CreateUser]
      @Email = @email,
      @FullName = @fullName,
      @Phone = @phone,
      @Role = @role,
      @PasswordHash = @passwordHash,
      @UserId = @UserId OUTPUT;
    
    SELECT @UserId as UserId;
  `

  const result = await executeQuery(query, {
    email,
    fullName,
    phone,
    role,
    passwordHash,
  })

  return {
    userId: result.recordset[0].UserId,
    email,
    fullName,
  }
}

export const getUserByEmail = async (email: string): Promise<UserRow | null> => {
  const query = `
    EXEC [auth].[sp_GetUserByEmail] @Email = @email
  `

  const result = await executeQuery(query, { email })

  if (result.recordset.length === 0) {
    return null
  }

  return result.recordset[0]
}

export const getUserById = async (userId: string): Promise<UserRow | null> => {
  const query = `
    SELECT 
      [UserId], [Email], [FullName], [Phone], [Role], [PasswordHash], [IsActive],
      [CreatedAt], [UpdatedAt]
    FROM [auth].[Users]
    WHERE [UserId] = @userId
  `

  const result = await executeQuery(query, { userId })

  if (result.recordset.length === 0) {
    return null
  }

  return result.recordset[0]
}

export default {
  registerUser,
  getUserByEmail,
  getUserById,
}
