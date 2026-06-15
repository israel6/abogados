import client from './api'

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

export const lawyerService = {
  getAllLawyers: async (): Promise<{ lawyers: Lawyer[] }> => {
    const response = await client.get('/lawyers')
    return response.data
  },

  getLawyerById: async (lawyerId: string): Promise<{ lawyer: Lawyer }> => {
    const response = await client.get(`/lawyers/${lawyerId}`)
    return response.data
  },

  getLawyersBySpecialization: async (
    specialization: string
  ): Promise<{ lawyers: Lawyer[] }> => {
    const response = await client.get('/lawyers/by-specialization', {
      params: { specialization },
    })
    return response.data
  },

  getSpecializations: async (): Promise<{ specializations: string[] }> => {
    const response = await client.get('/lawyers/specializations')
    return response.data
  },

  updateLawyerProfile: async (
    lawyerId: string,
    data: { bio?: string; profileImageUrl?: string; isAvailable?: boolean }
  ): Promise<{ message: string }> => {
    const response = await client.put(`/lawyers/${lawyerId}`, data)
    return response.data
  },

  rateLawyer: async (
    lawyerId: string,
    rating: number,
    successCases?: number
  ): Promise<{ message: string }> => {
    const response = await client.post(`/lawyers/${lawyerId}/rate`, {
      rating,
      successCases,
    })
    return response.data
  },
}

export default lawyerService
