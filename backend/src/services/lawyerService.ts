import { executeQuery } from '@config/database'

export interface Lawyer {
  LawyerId: string
  UserId: string | null
  FirstName: string
  LastName: string
  Email: string
  Phone: string
  Specialization: string
  Bio: string
  Experience: number
  ProfileImageUrl: string | null
  IsAvailable: boolean
  SuccessCases: number
  Rating: number
  TotalReviews: number
  CreatedAt: string
  UpdatedAt: string
}

export const createLawyer = async (
  firstName: string,
  lastName: string,
  email: string,
  phone: string,
  specialization: string,
  bio: string,
  experience: number,
  profileImageUrl?: string
): Promise<string> => {
  const query = `
    DECLARE @LawyerId UNIQUEIDENTIFIER;
    INSERT INTO [auth].[Lawyers] 
      (FirstName, LastName, Email, Phone, Specialization, Bio, Experience, ProfileImageUrl, IsAvailable)
    VALUES
      (@firstName, @lastName, @email, @phone, @specialization, @bio, @experience, @profileImageUrl, 1);
    
    SELECT @LawyerId = CAST(SCOPE_IDENTITY() AS UNIQUEIDENTIFIER);
    SELECT @LawyerId as LawyerId;
  `

  const result = await executeQuery(query, {
    firstName,
    lastName,
    email,
    phone,
    specialization,
    bio,
    experience,
    profileImageUrl: profileImageUrl || null,
  })

  return result.recordset[0].LawyerId
}

export const getAllLawyers = async (): Promise<Lawyer[]> => {
  const query = `
    SELECT 
      [LawyerId], [UserId], [FirstName], [LastName], [Email], [Phone],
      [Specialization], [Bio], [Experience], [ProfileImageUrl], [IsAvailable],
      [SuccessCases], [Rating], [TotalReviews], [CreatedAt], [UpdatedAt]
    FROM [auth].[Lawyers]
    WHERE [IsAvailable] = 1
    ORDER BY [Rating] DESC
  `

  const result = await executeQuery(query, {})
  return result.recordset
}

export const getLawyerById = async (lawyerId: string): Promise<Lawyer | null> => {
  const query = `
    SELECT 
      [LawyerId], [UserId], [FirstName], [LastName], [Email], [Phone],
      [Specialization], [Bio], [Experience], [ProfileImageUrl], [IsAvailable],
      [SuccessCases], [Rating], [TotalReviews], [CreatedAt], [UpdatedAt]
    FROM [auth].[Lawyers]
    WHERE [LawyerId] = @lawyerId
  `

  const result = await executeQuery(query, { lawyerId })
  if (result.recordset.length === 0) {
    return null
  }
  return result.recordset[0]
}

export const getLawyersBySpecialization = async (specialization: string): Promise<Lawyer[]> => {
  const query = `
    SELECT 
      [LawyerId], [UserId], [FirstName], [LastName], [Email], [Phone],
      [Specialization], [Bio], [Experience], [ProfileImageUrl], [IsAvailable],
      [SuccessCases], [Rating], [TotalReviews], [CreatedAt], [UpdatedAt]
    FROM [auth].[Lawyers]
    WHERE [Specialization] = @specialization AND [IsAvailable] = 1
    ORDER BY [Rating] DESC
  `

  const result = await executeQuery(query, { specialization })
  return result.recordset
}

export const updateLawyerProfile = async (
  lawyerId: string,
  bio?: string,
  profileImageUrl?: string,
  isAvailable?: boolean
): Promise<void> => {
  let query = 'UPDATE [auth].[Lawyers] SET [UpdatedAt] = GETUTCDATE()'

  if (bio) query += ', [Bio] = @bio'
  if (profileImageUrl !== undefined) query += ', [ProfileImageUrl] = @profileImageUrl'
  if (isAvailable !== undefined) query += ', [IsAvailable] = @isAvailable'

  query += ' WHERE [LawyerId] = @lawyerId'

  await executeQuery(query, { lawyerId, bio: bio || null, profileImageUrl, isAvailable })
}

export const updateLawyerRating = async (
  lawyerId: string,
  newRating: number,
  successCases?: number
): Promise<void> => {
  const query = `
    UPDATE [auth].[Lawyers]
    SET 
      [Rating] = @newRating,
      [TotalReviews] = [TotalReviews] + 1,
      [SuccessCases] = COALESCE(@successCases, [SuccessCases]),
      [UpdatedAt] = GETUTCDATE()
    WHERE [LawyerId] = @lawyerId
  `

  await executeQuery(query, { lawyerId, newRating, successCases: successCases || null })
}

export const getLawyerSpecializations = async (): Promise<string[]> => {
  const query = `
    SELECT DISTINCT [Specialization]
    FROM [auth].[Lawyers]
    WHERE [IsAvailable] = 1
    ORDER BY [Specialization]
  `

  const result = await executeQuery(query, {})
  return result.recordset.map((row: any) => row.Specialization)
}

export default {
  createLawyer,
  getAllLawyers,
  getLawyerById,
  getLawyersBySpecialization,
  updateLawyerProfile,
  updateLawyerRating,
  getLawyerSpecializations,
}
