import client from './api'

export interface Payment {
  PaymentId: string
  UserId: string
  Amount: number
  Currency: string
  Status: 'pending' | 'completed' | 'failed'
  PaymentMethod: 'payphone' | 'credit_card' | 'bank_transfer'
  TransactionId: string | null
  Description: string
  Metadata: Record<string, any>
  CreatedAt: string
  UpdatedAt: string
}

export interface InitiatePaymentData {
  amount: number
  currency: string
  paymentMethod: 'payphone' | 'credit_card' | 'bank_transfer'
  description: string
  appointmentId?: string
}

export const paymentService = {
  initiatePayment: async (
    data: InitiatePaymentData
  ): Promise<{ paymentId: string; redirectUrl: string }> => {
    const response = await client.post('/payments', data)
    return response.data
  },

  getMyPayments: async (): Promise<{ payments: Payment[] }> => {
    const response = await client.get('/payments')
    return response.data
  },

  getPaymentDetails: async (paymentId: string): Promise<{ payment: Payment }> => {
    const response = await client.get(`/payments/${paymentId}`)
    return response.data
  },

  getPaymentStats: async (startDate?: string, endDate?: string) => {
    const params: Record<string, string> = {}
    if (startDate) params.startDate = startDate
    if (endDate) params.endDate = endDate

    const response = await client.get('/payments/stats', { params })
    return response.data
  },
}

export default paymentService
