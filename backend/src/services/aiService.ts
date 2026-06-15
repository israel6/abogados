// =============================================
// AI Service — Integración Claude (Anthropic)
// Portal Bufete de Abogados
// =============================================

import Anthropic from '@anthropic-ai/sdk'
import { createConversation, addMessage, getHistory, updateConversationMeta } from './conversationService'

let client: Anthropic | null = null

if (process.env.ANTHROPIC_API_KEY) {
  client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
}

const MODEL = process.env.AI_MODEL || 'claude-opus-4-5'
const MAX_TOKENS = parseInt(process.env.AI_MAX_TOKENS || '1500')
const MOCK_MODE = !process.env.ANTHROPIC_API_KEY

// Rate limiting en memoria: userId -> { count, resetAt }
const rateLimitMap = new Map<string, { count: number; resetAt: Date }>()
const MAX_REQUESTS_PER_HOUR = 20

// =============================================
// System Prompt especializado en derecho
// =============================================
const SYSTEM_PROMPT = `Eres un asistente jurídico virtual especializado del Bufete de Abogados. 
Tu función es brindar orientación legal preliminar a clientes en Ecuador y Latinoamérica.

ÁREAS DE ESPECIALIZACIÓN:
- Derecho Civil: contratos, propiedad, herencias, familia, divorcio
- Derecho Laboral: despidos, indemnizaciones, acoso laboral, contratos de trabajo
- Derecho Penal: delitos, garantías procesales, medidas cautelares
- Derecho Mercantil: empresas, sociedades, contratos comerciales
- Derecho Administrativo: trámites, recursos, contratos públicos
- Derecho de Familia: custodia, alimentos, adopción, violencia doméstica
- Derecho Tributario: impuestos, SRI, obligaciones fiscales

REGLAS DE CONDUCTA:
1. Responde SIEMPRE en español, con tono profesional y empático
2. Cuando el caso requiere atención urgente o especializada, recomienda agendar una cita
3. NUNCA garantices resultados legales específicos
4. Cita la legislación ecuatoriana cuando sea relevante (COGEP, Código Civil, Código del Trabajo, etc.)
5. Si el caso es fuera de Ecuador, adapta tu respuesta al sistema legal mencionado
6. Mantén la confidencialidad y no solicites información extremadamente sensible por este canal
7. Para casos de violencia doméstica o emergencias legales, proporciona siempre la línea de emergencias

FORMATO DE RESPUESTAS:
- Usa párrafos claros y organizados
- Cuando aplique, enumera pasos o derechos del usuario
- Termina con una pregunta relevante o recomendación de acción
- Respuestas concisas pero completas (máx 400 palabras por respuesta)

INFORMACIÓN DEL BUFETE:
- Horario de atención: Lunes a Viernes 8:00-18:00, Sábados 9:00-13:00
- Para agendar cita: ir a la sección "Citas" del portal
- Consultas urgentes: disponibles con cargo adicional`

// =============================================
// Rate limiting
// =============================================
function checkRateLimit(userId: string): { allowed: boolean; remaining: number } {
  const now = new Date()
  const entry = rateLimitMap.get(userId)

  if (!entry || entry.resetAt <= now) {
    rateLimitMap.set(userId, {
      count: 1,
      resetAt: new Date(now.getTime() + 60 * 60 * 1000), // 1 hora
    })
    return { allowed: true, remaining: MAX_REQUESTS_PER_HOUR - 1 }
  }

  if (entry.count >= MAX_REQUESTS_PER_HOUR) {
    return { allowed: false, remaining: 0 }
  }

  entry.count += 1
  return { allowed: true, remaining: MAX_REQUESTS_PER_HOUR - entry.count }
}

// =============================================
// Respuesta mock para desarrollo sin API key
// =============================================
function getMockResponse(userMessage: string): string {
  const lower = userMessage.toLowerCase()

  if (lower.includes('divorcio') || lower.includes('separación')) {
    return `**Orientación sobre Divorcio en Ecuador**\n\nEl divorcio en Ecuador puede tramitarse de dos formas:\n\n1. **Divorcio por mutuo consentimiento**: Ambas partes acuerdan separarse. Se puede realizar ante Notario Público si no hay hijos menores o bienes en disputa.\n\n2. **Divorcio contencioso**: Cuando hay desacuerdo. Se presenta demanda ante el Juez de Familia.\n\n**Causales más comunes** según el Art. 110 del Código Civil:\n- Adulterio\n- Sevicia o crueldad\n- Abandono injustificado\n- Amenaza grave a la vida del cónyuge\n\n¿Me puede indicar si tienen hijos menores de edad o bienes inmuebles en común? Esto determinará el proceso más adecuado para su caso.`
  }

  if (lower.includes('despido') || lower.includes('laboral') || lower.includes('trabajo')) {
    return `**Orientación sobre Despido Laboral en Ecuador**\n\nSi fue despedido sin causa justa, tiene derecho a:\n\n- **Desahucio**: Equivalente al 25% de la última remuneración por cada año de servicio\n- **Décimo tercer sueldo** proporcional\n- **Décimo cuarto sueldo** proporcional  \n- **Vacaciones** no gozadas\n- **Fondos de Reserva** (si aplica)\n\n⚠️ Tiene **3 años** para reclamar por la vía judicial según el Art. 635 del Código del Trabajo.\n\n¿Cuánto tiempo trabajó en la empresa y cuál era su salario mensual? Con esa información puedo orientarle sobre el monto aproximado que le corresponde.`
  }

  if (lower.includes('contrato') || lower.includes('deuda') || lower.includes('civil')) {
    return `**Orientación sobre Derecho Civil**\n\nPara asuntos civiles en Ecuador, el **Código Orgánico General de Procesos (COGEP)** regula los procedimientos judiciales.\n\nLos plazos de prescripción más importantes son:\n- Acciones personales: **5 años**\n- Acciones reales: **10-15 años**\n- Acciones de cobro: **5 años**\n\nPara proteger sus derechos, le recomiendo:\n1. Reunir toda la documentación relacionada\n2. Documentar fechas y hechos importantes\n3. Consultar con un abogado especialista\n\n¿Podría describirme brevemente la naturaleza del contrato o acuerdo en disputa?`
  }

  return `**Asistente Jurídico Virtual** *(Modo demostración)*\n\nGracias por su consulta. Soy el asistente virtual del Bufete de Abogados, especializado en derecho ecuatoriano.\n\nPuedo orientarle en temas de:\n- ⚖️ Derecho Civil y Familia\n- 💼 Derecho Laboral\n- 🏛️ Derecho Penal\n- 📋 Derecho Mercantil\n- 🏢 Derecho Administrativo\n\n¿Podría describirme con más detalle su situación legal para brindarle una orientación más específica?\n\n> *Nota: Para una asesoría completa y vinculante, le recomendamos [agendar una cita](/appointments) con uno de nuestros abogados especializados.*`
}

// =============================================
// Chat principal con Claude
// =============================================
export interface ChatResult {
  reply: string
  conversationId: string
  tokensUsed: number
  mock: boolean
}

export const chat = async (params: {
  message: string
  conversationId?: string
  userId?: string
  sessionToken?: string
}): Promise<ChatResult> => {
  const { message, userId, sessionToken } = params

  // Rate limiting
  const rateLimitKey = userId || sessionToken || 'anonymous'
  const { allowed, remaining } = checkRateLimit(rateLimitKey)
  if (!allowed) {
    throw new Error(`Límite de consultas alcanzado. Por favor espere una hora antes de continuar. (Límite: ${MAX_REQUESTS_PER_HOUR}/hora)`)
  }
  if (remaining <= 3) {
    console.warn(`[AIService] User ${rateLimitKey} has ${remaining} requests remaining this hour`)
  }

  // Obtener o crear conversación
  let conversationId = params.conversationId
  if (!conversationId) {
    conversationId = await createConversation(userId, sessionToken)
  }

  // Obtener historial previo
  const history = await getHistory(conversationId, 10)
  const previousMessages = history.map((m) => ({
    role: m.Role as 'user' | 'assistant',
    content: m.Content,
  }))

  // Guardar mensaje del usuario
  await addMessage(conversationId, 'user', message, 0)

  // Mock mode
  if (MOCK_MODE || !client) {
    const mockReply = getMockResponse(message)
    await addMessage(conversationId, 'assistant', mockReply, 0, 'mock')

    // Detectar tipo de caso para metadata
    const lower = message.toLowerCase()
    const caseType = lower.includes('divorcio') ? 'familia'
      : lower.includes('despido') || lower.includes('laboral') ? 'laboral'
      : lower.includes('penal') || lower.includes('delito') ? 'penal'
      : lower.includes('contrato') ? 'civil'
      : 'general'

    await updateConversationMeta(conversationId, message.substring(0, 100), caseType)

    return { reply: mockReply, conversationId, tokensUsed: 0, mock: true }
  }

  // Llamada real a Claude
  const messagesPayload = [
    ...previousMessages,
    { role: 'user' as const, content: message },
  ]

  const response = await client.messages.create({
    model: MODEL,
    max_tokens: MAX_TOKENS,
    system: SYSTEM_PROMPT,
    messages: messagesPayload,
  })

  const reply = response.content[0].type === 'text'
    ? response.content[0].text
    : 'Lo siento, no pude procesar su consulta en este momento.'

  const tokensUsed = response.usage.input_tokens + response.usage.output_tokens

  // Guardar respuesta
  await addMessage(conversationId, 'assistant', reply, tokensUsed, MODEL)

  // Actualizar metadata de la conversación
  await updateConversationMeta(conversationId, message.substring(0, 100))

  return { reply, conversationId, tokensUsed, mock: false }
}

// =============================================
// Precalificación de casos (sin login)
// Para captura de leads
// =============================================
export interface PrecalifyResult {
  caseType: string
  urgency: 'alta' | 'media' | 'baja'
  recommendedArea: string
  summary: string
  nextStep: string
  mock: boolean
}

export const precalifyCase = async (description: string): Promise<PrecalifyResult> => {
  if (MOCK_MODE || !client) {
    // Análisis básico sin IA real
    const lower = description.toLowerCase()
    const caseType = lower.includes('despido') || lower.includes('trabajo') ? 'Derecho Laboral'
      : lower.includes('divorcio') || lower.includes('familia') || lower.includes('hijo') ? 'Derecho de Familia'
      : lower.includes('penal') || lower.includes('delito') || lower.includes('denuncia') ? 'Derecho Penal'
      : lower.includes('empresa') || lower.includes('contrato') || lower.includes('deuda') ? 'Derecho Civil/Mercantil'
      : lower.includes('impuesto') || lower.includes('sri') ? 'Derecho Tributario'
      : 'Derecho Civil'

    const urgency = lower.includes('urgente') || lower.includes('emergencia') || lower.includes('detención') ? 'alta'
      : lower.includes('plazo') || lower.includes('vencimiento') ? 'media'
      : 'baja'

    return {
      caseType,
      urgency,
      recommendedArea: caseType,
      summary: `Su caso parece relacionado con ${caseType}. Basado en su descripción, identificamos los elementos principales de su situación.`,
      nextStep: urgency === 'alta'
        ? 'Le recomendamos contactarnos URGENTEMENTE. Puede llamarnos ahora o agendar una cita de emergencia.'
        : 'Le recomendamos agendar una consulta con uno de nuestros especialistas para evaluar su caso en detalle.',
      mock: true,
    }
  }

  const prompt = `Analiza este caso legal brevemente y responde SOLO en JSON con este formato exacto:
{
  "caseType": "tipo de caso en 2-4 palabras",
  "urgency": "alta|media|baja",
  "recommendedArea": "área del derecho especializada",
  "summary": "resumen del caso en 2 oraciones",
  "nextStep": "próximo paso recomendado en 1 oración"
}

Caso: ${description}`

  const response = await client.messages.create({
    model: MODEL,
    max_tokens: 400,
    system: 'Eres un asistente legal que analiza casos y responde SOLO en JSON válido.',
    messages: [{ role: 'user', content: prompt }],
  })

  const text = response.content[0].type === 'text' ? response.content[0].text : '{}'

  try {
    const parsed = JSON.parse(text.replace(/```json\n?|\n?```/g, ''))
    return { ...parsed, mock: false }
  } catch {
    return {
      caseType: 'Caso Legal General',
      urgency: 'media',
      recommendedArea: 'Derecho Civil',
      summary: 'Su caso requiere análisis detallado por parte de un especialista.',
      nextStep: 'Agende una consulta con uno de nuestros abogados.',
      mock: false,
    }
  }
}

export default { chat, precalifyCase }
