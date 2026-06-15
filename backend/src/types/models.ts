export interface User {
  id: string
  email: string
  fullName: string
  phone: string
  role: 'client' | 'lawyer' | 'admin'
  passwordHash: string
  createdAt: Date
  updatedAt: Date
}

export interface Appointment {
  id: string
  clientId: string
  lawyerId: string
  title: string
  description: string
  startDate: Date
  endDate: Date
  status: 'pending' | 'confirmed' | 'cancelled'
  createdAt: Date
  updatedAt: Date
}

export interface Payment {
  id: string
  appointmentId: string
  amount: number
  currency: string
  status: 'pending' | 'completed' | 'failed'
  transactionId: string
  createdAt: Date
  updatedAt: Date
}
