import { PaymentForm } from '@components/PaymentForm'
import { PaymentHistory } from '@components/PaymentHistory'
import '../styles/payments.css'

export function Payments() {
  return (
    <div className="payments-container">
      <header className="payments-header">
        <h1>Centro de Pagos</h1>
        <p>Realiza pagos de manera segura con Payphone</p>
      </header>

      <main className="payments-main">
        <div className="payments-grid-layout">
          <section className="form-section">
            <PaymentForm />
          </section>

          <section className="history-section">
            <PaymentHistory />
          </section>
        </div>
      </main>
    </div>
  )
}
