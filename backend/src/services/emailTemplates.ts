// =============================================
// Email Templates — HTML bonitos para notificaciones
// Portal Bufete de Abogados
// =============================================

const BASE_STYLE = `
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  background-color: #f4f6f9;
  margin: 0; padding: 0;
`

const CARD_STYLE = `
  max-width: 600px; margin: 40px auto; background: #ffffff;
  border-radius: 12px; overflow: hidden;
  box-shadow: 0 4px 20px rgba(0,0,0,0.08);
`

const HEADER_STYLE = `
  background: linear-gradient(135deg, #1a237e 0%, #283593 50%, #3949ab 100%);
  padding: 40px 32px; text-align: center; color: #ffffff;
`

const BODY_STYLE = `padding: 32px;`

const FOOTER_STYLE = `
  background: #f8f9fa; padding: 20px 32px; text-align: center;
  color: #6c757d; font-size: 12px; border-top: 1px solid #e9ecef;
`

const BUTTON_STYLE = `
  display: inline-block; padding: 14px 28px;
  background: linear-gradient(135deg, #1a237e, #3949ab);
  color: #ffffff !important; text-decoration: none;
  border-radius: 8px; font-weight: 600; font-size: 16px;
  margin: 20px 0;
`

const INFO_BOX_STYLE = `
  background: #f0f4ff; border-left: 4px solid #3949ab;
  padding: 16px 20px; border-radius: 0 8px 8px 0;
  margin: 20px 0;
`

function baseLayout(content: string, preheader?: string): string {
  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  ${preheader ? `<title>${preheader}</title>` : ''}
</head>
<body style="${BASE_STYLE}">
  <div style="${CARD_STYLE}">
    ${content}
    <div style="${FOOTER_STYLE}">
      <p>© ${new Date().getFullYear()} Bufete de Abogados. Todos los derechos reservados.</p>
      <p>Este es un correo automático, por favor no responda a este mensaje.</p>
    </div>
  </div>
</body>
</html>`
}

// =============================================
// Template: Bienvenida
// =============================================
export function welcomeEmail(params: {
  firstName: string
  email: string
}): { subject: string; html: string; text: string } {
  const subject = `¡Bienvenido/a a nuestro Bufete, ${params.firstName}!`
  const html = baseLayout(`
    <div style="${HEADER_STYLE}">
      <div style="font-size: 48px; margin-bottom: 12px;">⚖️</div>
      <h1 style="margin: 0; font-size: 26px; font-weight: 700;">¡Bienvenido/a!</h1>
      <p style="margin: 8px 0 0; opacity: 0.85; font-size: 15px;">Su cuenta ha sido creada exitosamente</p>
    </div>
    <div style="${BODY_STYLE}">
      <p style="font-size: 16px; color: #333; margin: 0 0 16px;">Estimado/a <strong>${params.firstName}</strong>,</p>
      <p style="color: #555; line-height: 1.6;">
        Es un placer darle la bienvenida a nuestra plataforma legal. Ahora tiene acceso a:
      </p>
      <ul style="color: #555; line-height: 1.8; padding-left: 20px;">
        <li>📅 Agendamiento de citas con nuestros abogados</li>
        <li>⚖️ Consultas con nuestro Asistente IA jurídico</li>
        <li>📋 Seguimiento de sus casos y documentos</li>
        <li>💳 Gestión de pagos y facturación</li>
      </ul>
      <div style="text-align: center;">
        <a href="${process.env.APP_URL || 'http://localhost:5173'}/dashboard" style="${BUTTON_STYLE}">
          Ingresar al Portal
        </a>
      </div>
      <p style="color: #777; font-size: 14px; margin-top: 20px;">
        Si no creó esta cuenta, ignore este correo o contáctenos inmediatamente.
      </p>
    </div>
  `, subject)

  const text = `Bienvenido/a ${params.firstName}. Su cuenta ha sido creada en el Bufete de Abogados. Ingrese en: ${process.env.APP_URL}/dashboard`

  return { subject, html, text }
}

// =============================================
// Template: Confirmación de Cita
// =============================================
export function appointmentConfirmation(params: {
  clientName: string
  lawyerName: string
  lawyerSpecialty: string
  title: string
  startTime: Date
  endTime: Date
  location: string
  appointmentId: string
}): { subject: string; html: string; text: string } {
  const dateStr = params.startTime.toLocaleDateString('es-EC', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  })
  const timeStr = `${params.startTime.toLocaleTimeString('es-EC', { hour: '2-digit', minute: '2-digit' })} - ${params.endTime.toLocaleTimeString('es-EC', { hour: '2-digit', minute: '2-digit' })}`

  const subject = `✅ Cita Confirmada — ${params.title}`
  const html = baseLayout(`
    <div style="${HEADER_STYLE}">
      <div style="font-size: 48px; margin-bottom: 12px;">📅</div>
      <h1 style="margin: 0; font-size: 24px; font-weight: 700;">Cita Confirmada</h1>
      <p style="margin: 8px 0 0; opacity: 0.85;">Ref: ${params.appointmentId.substring(0, 8).toUpperCase()}</p>
    </div>
    <div style="${BODY_STYLE}">
      <p style="font-size: 16px; color: #333;">Estimado/a <strong>${params.clientName}</strong>,</p>
      <p style="color: #555; line-height: 1.6;">
        Su cita ha sido confirmada. A continuación encontrará los detalles:
      </p>
      <div style="${INFO_BOX_STYLE}">
        <table style="width: 100%; border-collapse: collapse;">
          <tr><td style="padding: 6px 0; color: #666; width: 40%;">📋 Motivo</td><td style="color: #333; font-weight: 600;">${params.title}</td></tr>
          <tr><td style="padding: 6px 0; color: #666;">👨‍⚖️ Abogado</td><td style="color: #333; font-weight: 600;">${params.lawyerName}</td></tr>
          <tr><td style="padding: 6px 0; color: #666;">⚖️ Especialidad</td><td style="color: #333;">${params.lawyerSpecialty}</td></tr>
          <tr><td style="padding: 6px 0; color: #666;">📅 Fecha</td><td style="color: #333; font-weight: 600;">${dateStr}</td></tr>
          <tr><td style="padding: 6px 0; color: #666;">🕐 Hora</td><td style="color: #333; font-weight: 600;">${timeStr}</td></tr>
          <tr><td style="padding: 6px 0; color: #666;">📍 Lugar</td><td style="color: #333;">${params.location}</td></tr>
        </table>
      </div>
      <div style="text-align: center;">
        <a href="${process.env.APP_URL || 'http://localhost:5173'}/appointments" style="${BUTTON_STYLE}">
          Ver Mis Citas
        </a>
      </div>
      <p style="color: #777; font-size: 13px; margin-top: 16px;">
        ⚠️ Si necesita cancelar o reprogramar, hágalo con al menos 24 horas de anticipación.
      </p>
    </div>
  `, subject)

  const text = `Cita confirmada: ${params.title} con ${params.lawyerName} el ${dateStr} a las ${timeStr} en ${params.location}.`

  return { subject, html, text }
}

// =============================================
// Template: Recordatorio de Cita (24h antes)
// =============================================
export function appointmentReminder(params: {
  clientName: string
  lawyerName: string
  title: string
  startTime: Date
  location: string
}): { subject: string; html: string; text: string } {
  const timeStr = params.startTime.toLocaleTimeString('es-EC', { hour: '2-digit', minute: '2-digit' })

  const subject = `⏰ Recordatorio: Cita mañana a las ${timeStr}`
  const html = baseLayout(`
    <div style="${HEADER_STYLE}">
      <div style="font-size: 48px; margin-bottom: 12px;">⏰</div>
      <h1 style="margin: 0; font-size: 24px; font-weight: 700;">Recordatorio de Cita</h1>
      <p style="margin: 8px 0 0; opacity: 0.85;">Su cita es mañana</p>
    </div>
    <div style="${BODY_STYLE}">
      <p style="font-size: 16px; color: #333;">Estimado/a <strong>${params.clientName}</strong>,</p>
      <p style="color: #555; line-height: 1.6;">
        Le recordamos que tiene una cita programada para <strong>mañana</strong>:
      </p>
      <div style="${INFO_BOX_STYLE}">
        <p style="margin: 0; font-size: 18px; color: #1a237e; font-weight: 700;">${params.title}</p>
        <p style="margin: 8px 0 0; color: #555;">Con: ${params.lawyerName}</p>
        <p style="margin: 4px 0; color: #555;">🕐 ${timeStr} | 📍 ${params.location}</p>
      </div>
      <p style="color: #555; font-size: 14px;">
        <strong>Recomendaciones:</strong> Llegue 10 minutos antes y traiga documentación relevante a su caso.
      </p>
    </div>
  `, subject)

  const text = `Recordatorio: Tiene una cita mañana "${params.title}" con ${params.lawyerName} a las ${timeStr} en ${params.location}.`

  return { subject, html, text }
}

// =============================================
// Template: Cancelación de Cita
// =============================================
export function appointmentCancellation(params: {
  clientName: string
  title: string
  startTime: Date
  reason?: string
}): { subject: string; html: string; text: string } {
  const dateStr = params.startTime.toLocaleDateString('es-EC', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  })

  const subject = `❌ Cita Cancelada — ${params.title}`
  const html = baseLayout(`
    <div style="background: linear-gradient(135deg, #b71c1c, #c62828); padding: 40px 32px; text-align: center; color: #fff;">
      <div style="font-size: 48px; margin-bottom: 12px;">❌</div>
      <h1 style="margin: 0; font-size: 24px; font-weight: 700;">Cita Cancelada</h1>
    </div>
    <div style="${BODY_STYLE}">
      <p style="font-size: 16px; color: #333;">Estimado/a <strong>${params.clientName}</strong>,</p>
      <p style="color: #555; line-height: 1.6;">
        Le informamos que la siguiente cita ha sido cancelada:
      </p>
      <div style="background: #fff5f5; border-left: 4px solid #c62828; padding: 16px 20px; border-radius: 0 8px 8px 0; margin: 20px 0;">
        <p style="margin: 0; font-weight: 700; color: #c62828;">${params.title}</p>
        <p style="margin: 8px 0 0; color: #555;">📅 ${dateStr}</p>
        ${params.reason ? `<p style="margin: 8px 0 0; color: #555;">Motivo: ${params.reason}</p>` : ''}
      </div>
      <div style="text-align: center;">
        <a href="${process.env.APP_URL || 'http://localhost:5173'}/appointments" style="${BUTTON_STYLE}">
          Reagendar Cita
        </a>
      </div>
    </div>
  `, subject)

  const text = `Su cita "${params.title}" del ${dateStr} ha sido cancelada. Puede reagendar en ${process.env.APP_URL}/appointments`

  return { subject, html, text }
}

// =============================================
// Template: Confirmación de Pago
// =============================================
export function paymentConfirmation(params: {
  clientName: string
  amount: number
  currency: string
  transactionId: string
  description: string
  paymentDate: Date
}): { subject: string; html: string; text: string } {
  const dateStr = params.paymentDate.toLocaleDateString('es-EC', {
    year: 'numeric', month: 'long', day: 'numeric',
  })
  const formattedAmount = new Intl.NumberFormat('es-EC', {
    style: 'currency', currency: params.currency,
  }).format(params.amount)

  const subject = `✅ Pago Confirmado — ${formattedAmount}`
  const html = baseLayout(`
    <div style="background: linear-gradient(135deg, #1b5e20, #2e7d32); padding: 40px 32px; text-align: center; color: #fff;">
      <div style="font-size: 48px; margin-bottom: 12px;">💳</div>
      <h1 style="margin: 0; font-size: 24px; font-weight: 700;">Pago Confirmado</h1>
      <p style="font-size: 32px; font-weight: 700; margin: 12px 0 0;">${formattedAmount}</p>
    </div>
    <div style="${BODY_STYLE}">
      <p style="font-size: 16px; color: #333;">Estimado/a <strong>${params.clientName}</strong>,</p>
      <p style="color: #555;">Hemos recibido su pago exitosamente. Aquí está su recibo:</p>
      <div style="${INFO_BOX_STYLE}">
        <table style="width: 100%; border-collapse: collapse;">
          <tr><td style="padding: 6px 0; color: #666; width: 45%;">🔖 ID Transacción</td><td style="color: #333; font-weight: 600; font-family: monospace;">${params.transactionId}</td></tr>
          <tr><td style="padding: 6px 0; color: #666;">📋 Descripción</td><td style="color: #333;">${params.description}</td></tr>
          <tr><td style="padding: 6px 0; color: #666;">💰 Monto</td><td style="color: #1b5e20; font-weight: 700; font-size: 18px;">${formattedAmount}</td></tr>
          <tr><td style="padding: 6px 0; color: #666;">📅 Fecha</td><td style="color: #333;">${dateStr}</td></tr>
          <tr><td style="padding: 6px 0; color: #666;">✅ Estado</td><td style="color: #1b5e20; font-weight: 600;">Completado</td></tr>
        </table>
      </div>
      <p style="color: #777; font-size: 13px;">
        Guarde este comprobante para sus registros. Si tiene preguntas, contáctenos.
      </p>
    </div>
  `, subject)

  const text = `Pago confirmado por ${formattedAmount}. Transacción: ${params.transactionId}. Fecha: ${dateStr}.`

  return { subject, html, text }
}
