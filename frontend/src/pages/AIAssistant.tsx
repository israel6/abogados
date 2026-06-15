// =============================================
// AIAssistant Page — Página completa del Asistente IA
// Portal Bufete de Abogados
// =============================================

import React, { useState } from 'react'
import { precalifyCase, PrecalifyResult } from '../services/aiService'
import '../styles/ai-assistant.css'

const CASE_TYPES = [
  { icon: '💼', label: 'Derecho Laboral', desc: 'Despidos, contratos, acoso laboral' },
  { icon: '👨‍👩‍👧', label: 'Derecho de Familia', desc: 'Divorcio, custodia, alimentos' },
  { icon: '🏛️', label: 'Derecho Penal', desc: 'Delitos, garantías, defensa' },
  { icon: '📋', label: 'Derecho Civil', desc: 'Contratos, deudas, propiedad' },
  { icon: '🏢', label: 'Derecho Mercantil', desc: 'Empresas, sociedades' },
  { icon: '💰', label: 'Derecho Tributario', desc: 'Impuestos, SRI' },
]

const URGENCY_CONFIG = {
  alta: { color: '#f44336', label: '🔴 Urgencia Alta', bg: 'rgba(244,67,54,0.1)' },
  media: { color: '#ff9800', label: '🟡 Urgencia Media', bg: 'rgba(255,152,0,0.1)' },
  baja: { color: '#4caf50', label: '🟢 Urgencia Baja', bg: 'rgba(76,175,80,0.1)' },
}

const AIAssistant: React.FC = () => {
  const [description, setDescription] = useState('')
  const [result, setResult] = useState<PrecalifyResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [charCount, setCharCount] = useState(0)

  const handleDescriptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setDescription(e.target.value)
    setCharCount(e.target.value.length)
  }

  const handlePrecalify = async () => {
    if (description.trim().length < 20) {
      setError('Por favor describa su caso con al menos 20 caracteres.')
      return
    }
    setError(null)
    setLoading(true)
    try {
      const data = await precalifyCase(description)
      setResult(data)
    } catch (err: any) {
      setError(err?.response?.data?.error || 'Error al analizar su caso. Intente nuevamente.')
    } finally {
      setLoading(false)
    }
  }

  const handleReset = () => {
    setResult(null)
    setDescription('')
    setCharCount(0)
    setError(null)
  }

  const urgencyCfg = result ? URGENCY_CONFIG[result.urgency] : null

  return (
    <div className="ai-assistant-page">
      {/* Hero */}
      <section className="ai-hero">
        <div className="ai-hero-bg" />
        <div className="ai-hero-content">
          <div className="ai-hero-badge">⚖️ Powered by Claude AI</div>
          <h1 className="ai-hero-title">Asistente Jurídico <span>Inteligente</span></h1>
          <p className="ai-hero-subtitle">
            Obtenga una evaluación preliminar de su caso de forma gratuita, confidencial e inmediata.
          </p>
        </div>
      </section>

      {/* Areas de práctica */}
      <section className="ai-areas">
        <div className="ai-container">
          <h2>Áreas de Especialización</h2>
          <div className="ai-areas-grid">
            {CASE_TYPES.map((ct, i) => (
              <div key={i} className="ai-area-card">
                <span className="ai-area-icon">{ct.icon}</span>
                <h3>{ct.label}</h3>
                <p>{ct.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Formulario de precalificación */}
      <section className="ai-precalify">
        <div className="ai-container">
          <div className="ai-precalify-card">
            <div className="ai-precalify-header">
              <div className="ai-precalify-icon">🔍</div>
              <h2>Evaluación Preliminar Gratuita</h2>
              <p>Describa su situación y nuestro sistema de IA analizará su caso al instante</p>
            </div>

            {!result ? (
              <div className="ai-form">
                <div className="ai-form-group">
                  <label htmlFor="case-description">Describe tu situación legal:</label>
                  <textarea
                    id="case-description"
                    className="ai-textarea"
                    value={description}
                    onChange={handleDescriptionChange}
                    placeholder="Ejemplo: Trabajé 3 años en una empresa y me despidieron sin aviso ni motivo aparente el mes pasado. No me han pagado la liquidación completa..."
                    rows={6}
                    maxLength={3000}
                    disabled={loading}
                  />
                  <div className="ai-char-count">
                    <span className={charCount < 20 ? 'ai-char-warning' : ''}>{charCount}</span>
                    /3000 caracteres
                    {charCount < 20 && charCount > 0 && (
                      <span className="ai-char-hint"> (mínimo 20)</span>
                    )}
                  </div>
                </div>

                {error && <div className="ai-error-msg">{error}</div>}

                <button
                  className="ai-submit-btn"
                  onClick={handlePrecalify}
                  disabled={loading || description.trim().length < 20}
                  id="btn-precalify"
                >
                  {loading ? (
                    <>
                      <span className="ai-spinner" />
                      Analizando su caso...
                    </>
                  ) : (
                    <>🔍 Analizar mi caso</>
                  )}
                </button>

                <p className="ai-disclaimer">
                  🔒 Su información es completamente confidencial. Esta es una orientación preliminar,
                  no constituye asesoría legal formal.
                </p>
              </div>
            ) : (
              <div className="ai-result">
                {/* Resultado del análisis */}
                <div className="ai-result-header">
                  <div className="ai-result-check">✅</div>
                  <h3>Análisis Completado</h3>
                  {result.mock && (
                    <span className="ai-mock-badge">Modo Demo</span>
                  )}
                </div>

                <div className="ai-result-grid">
                  <div className="ai-result-item">
                    <span className="ai-result-label">Tipo de Caso</span>
                    <span className="ai-result-value">{result.caseType}</span>
                  </div>
                  <div className="ai-result-item">
                    <span className="ai-result-label">Área Recomendada</span>
                    <span className="ai-result-value">{result.recommendedArea}</span>
                  </div>
                  <div
                    className="ai-result-item ai-result-urgency"
                    style={{ background: urgencyCfg?.bg, borderColor: urgencyCfg?.color }}
                  >
                    <span className="ai-result-label">Nivel de Urgencia</span>
                    <span className="ai-result-value" style={{ color: urgencyCfg?.color }}>
                      {urgencyCfg?.label}
                    </span>
                  </div>
                </div>

                <div className="ai-result-summary">
                  <h4>📋 Resumen del Caso</h4>
                  <p>{result.summary}</p>
                </div>

                <div className="ai-result-next">
                  <h4>⚡ Próximo Paso Recomendado</h4>
                  <p>{result.nextStep}</p>
                </div>

                <div className="ai-result-actions">
                  <a href="/appointments" className="ai-btn-primary" id="btn-schedule-from-ai">
                    📅 Agendar Consulta
                  </a>
                  <button className="ai-btn-secondary" onClick={handleReset}>
                    🔄 Analizar otro caso
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Garantías */}
      <section className="ai-guarantees">
        <div className="ai-container">
          <div className="ai-guarantees-grid">
            {[
              { icon: '🔒', title: 'Confidencial', desc: 'Su información está protegida y es completamente privada' },
              { icon: '⚡', title: 'Inmediato', desc: 'Análisis en segundos, disponible 24/7 sin esperas' },
              { icon: '🎯', title: 'Especializado', desc: 'IA entrenada en legislación ecuatoriana y latinoamericana' },
              { icon: '💰', title: 'Gratuito', desc: 'La evaluación preliminar no tiene ningún costo' },
            ].map((g, i) => (
              <div key={i} className="ai-guarantee-item">
                <span className="ai-guarantee-icon">{g.icon}</span>
                <h3>{g.title}</h3>
                <p>{g.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}

export default AIAssistant
