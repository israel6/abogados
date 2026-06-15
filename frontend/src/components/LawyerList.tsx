import { useEffect, useState } from 'react'
import { motion } from 'motion/react'
import lawyerService, { Lawyer } from '@services/lawyerService'
import { SpotlightCard } from '@components/motion/SpotlightCard'
import { MotionButton } from '@components/ui/MotionButton'
import '../styles/lawyers.css'

export function LawyerList() {
  const [lawyers, setLawyers] = useState<Lawyer[]>([])
  const [filteredLawyers, setFilteredLawyers] = useState<Lawyer[]>([])
  const [specializations, setSpecializations] = useState<string[]>([])
  const [selectedSpecialization, setSelectedSpecialization] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true)
        const [lawyersData, specsData] = await Promise.all([
          lawyerService.getAllLawyers(),
          lawyerService.getSpecializations(),
        ])
        setLawyers(lawyersData.lawyers)
        setFilteredLawyers(lawyersData.lawyers)
        setSpecializations(specsData.specializations)
      } catch (err: unknown) {
        const msg = err && typeof err === 'object' && 'response' in err
          ? (err as { response?: { data?: { error?: string } } }).response?.data?.error
          : undefined
        setError(msg || 'Failed to load lawyers')
      } finally {
        setIsLoading(false)
      }
    }
    loadData()
  }, [])

  useEffect(() => {
    if (selectedSpecialization) {
      setFilteredLawyers(lawyers.filter((l) => l.Specialization === selectedSpecialization))
    } else {
      setFilteredLawyers(lawyers)
    }
  }, [selectedSpecialization, lawyers])

  if (isLoading) return <div className="loading">Cargando abogados...</div>
  if (error) return <div className="error-message">{error}</div>

  return (
    <div className="lawyer-list">
      <div className="lawyer-filters">
        <h3>Filtrar por especialidad</h3>
        <div className="filter-buttons">
          <MotionButton
            variant="ghost"
            className={`filter-btn ${!selectedSpecialization ? 'active' : ''}`}
            onClick={() => setSelectedSpecialization(null)}
          >
            Todos
          </MotionButton>
          {specializations.map((spec) => (
            <MotionButton
              key={spec}
              variant="ghost"
              className={`filter-btn ${selectedSpecialization === spec ? 'active' : ''}`}
              onClick={() => setSelectedSpecialization(spec)}
            >
              {spec}
            </MotionButton>
          ))}
        </div>
      </div>

      <div className="lawyers-grid">
        {filteredLawyers.map((lawyer, i) => (
          <SpotlightCard key={lawyer.LawyerId} className="lawyer-card">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05, duration: 0.4 }}
            >
              {lawyer.ProfileImageUrl && (
                <div className="lawyer-image">
                  <img src={lawyer.ProfileImageUrl} alt={`${lawyer.FirstName} ${lawyer.LastName}`} />
                </div>
              )}
              <div className="lawyer-info">
                <h3>{lawyer.FirstName} {lawyer.LastName}</h3>
                <span className="specialization">{lawyer.Specialization}</span>
                <div className="rating">
                  <span className="rating-stars">
                    {lawyer.Rating > 0 ? '★'.repeat(Math.round(lawyer.Rating)) : '—'}
                  </span>
                  <span className="rating-number">
                    {lawyer.Rating > 0 ? `${lawyer.Rating.toFixed(1)}/5` : 'Sin calificación'}
                  </span>
                </div>
                <p className="bio">{lawyer.Bio}</p>
                <div className="lawyer-stats">
                  <div className="stat">
                    <span className="label">Experiencia</span>
                    <span className="value">{lawyer.Experience} años</span>
                  </div>
                  <div className="stat">
                    <span className="label">Casos exitosos</span>
                    <span className="value">{lawyer.SuccessCases}</span>
                  </div>
                </div>
                <a href={`tel:${lawyer.Phone}`} className="btn-contact">
                  {lawyer.Phone}
                </a>
              </div>
            </motion.div>
          </SpotlightCard>
        ))}
      </div>

      {filteredLawyers.length === 0 && (
        <div className="empty-state">
          <p>No hay abogados disponibles en esta especialidad</p>
        </div>
      )}
    </div>
  )
}
