import { useState } from 'react'
import paymentService from '@services/paymentService'
import '../styles/payments.css'

interface PaymentFormProps {
  appointmentId?: string
}

export function PaymentForm({ appointmentId }: PaymentFormProps) {
  const [formData, setFormData] = useState({
    amount: 0 as number | string,
    currency: 'USD',
    paymentMethod: 'payphone' as const,
    description: '',
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [paymentId, setPaymentId] = useState<string | null>(null)

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'amount' ? parseFloat(value) || '' : value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (typeof formData.amount !== 'number' || !formData.amount || formData.amount <= 0) {
      setError('Por favor ingresa un monto válido')
      return
    }

    try {
      setIsLoading(true)
      const result = await paymentService.initiatePayment({
        amount: formData.amount as number,
        currency: formData.currency,
        paymentMethod: formData.paymentMethod,
        description: formData.description,
        appointmentId,
      })

      setPaymentId(result.paymentId)

      // Redirect to Payphone if needed
      // window.location.href = result.redirectUrl
    } catch (err: any) {
      setError(err.response?.data?.error || 'No se pudo procesar el pago')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form className="payment-form" onSubmit={handleSubmit}>
      <h2>Realizar Pago</h2>

      {error && <div className="error-message">{error}</div>}
      {paymentId && (
        <div className="success-message">
          Pago iniciado. ID: {paymentId}
          <br />
          <small>Serás redirigido a Payphone para completar el pago.</small>
        </div>
      )}

      <div className="form-group">
        <label htmlFor="amount">Monto *</label>
        <div className="amount-input-group">
          <select name="currency" value={formData.currency} onChange={handleChange}>
            <option value="USD">USD $</option>
            <option value="PEN">PEN S/</option>
            <option value="MXN">MXN $</option>
            <option value="COP">COP $</option>
          </select>
          <input
            type="number"
            id="amount"
            name="amount"
            value={formData.amount}
            onChange={handleChange}
            placeholder="0.00"
            step="0.01"
            required
          />
        </div>
      </div>

      <div className="form-group">
        <label htmlFor="paymentMethod">Método de Pago *</label>
        <select
          id="paymentMethod"
          name="paymentMethod"
          value={formData.paymentMethod}
          onChange={handleChange}
          required
        >
          <option value="payphone">Payphone</option>
          <option value="credit_card">Tarjeta de Crédito</option>
          <option value="bank_transfer">Transferencia Bancaria</option>
        </select>
      </div>

      <div className="form-group">
        <label htmlFor="description">Descripción (Concepto)</label>
        <textarea
          id="description"
          name="description"
          value={formData.description}
          onChange={handleChange}
          placeholder="Ej: Pago de consulta legal"
          rows={3}
        />
      </div>

      <button type="submit" className="btn-primary" disabled={isLoading}>
        {isLoading ? 'Procesando...' : 'Proceder al Pago'}
      </button>
    </form>
  )
}
