import { useEffect, useState } from 'react'
import paymentService, { Payment } from '@services/paymentService'
import '../styles/payments.css'

export function PaymentHistory() {
  const [payments, setPayments] = useState<Payment[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadPayments = async () => {
      try {
        setIsLoading(true)
        const data = await paymentService.getMyPayments()
        setPayments(data.payments)
      } catch (err: any) {
        setError(err.response?.data?.error || 'Failed to load payments')
      } finally {
        setIsLoading(false)
      }
    }

    loadPayments()
  }, [])

  if (isLoading) {
    return <div className="loading">Cargando pagos...</div>
  }

  if (error) {
    return <div className="error-message">{error}</div>
  }

  if (payments.length === 0) {
    return (
      <div className="empty-state">
        <p>No hay pagos registrados</p>
        <small>Los pagos que realices aparecerán aquí</small>
      </div>
    )
  }

  return (
    <div className="payment-history">
      <h2>Historial de Pagos</h2>
      <div className="payments-table">
        <table>
          <thead>
            <tr>
              <th>Fecha</th>
              <th>Monto</th>
              <th>Moneda</th>
              <th>Método</th>
              <th>Descripción</th>
              <th>Estado</th>
            </tr>
          </thead>
          <tbody>
            {payments.map((payment) => (
              <tr key={payment.PaymentId}>
                <td>{new Date(payment.CreatedAt).toLocaleDateString('es-ES')}</td>
                <td className="amount">{payment.Amount.toFixed(2)}</td>
                <td>{payment.Currency}</td>
                <td>
                  {payment.PaymentMethod === 'payphone' && 'Payphone'}
                  {payment.PaymentMethod === 'credit_card' && 'Tarjeta'}
                  {payment.PaymentMethod === 'bank_transfer' && 'Transferencia'}
                </td>
                <td>{payment.Description}</td>
                <td>
                  <span className={`status status-${payment.Status}`}>
                    {payment.Status === 'pending' && 'Pendiente'}
                    {payment.Status === 'completed' && 'Completado'}
                    {payment.Status === 'failed' && 'Fallido'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
