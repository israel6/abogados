import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'motion/react'
import { useAuthStore } from '@hooks/useAuth'
import { PageShell } from '@components/layout/PageShell'
import { PageHero } from '@components/layout/PageHero'
import { SpotlightCard } from '@components/motion/SpotlightCard'
import { MotionButton } from '@components/ui/MotionButton'
import {
  CalendarIcon,
  CreditCardIcon,
  BookIcon,
  UsersIcon,
} from '@components/icons/LegalIcons'
import '../styles/dashboard.css'

const dashboardItems = [
  {
    icon: CalendarIcon,
    title: 'Citas',
    description: 'Agenda y gestiona tus citas con nuestros abogados.',
    path: '/appointments',
    label: 'Ir a Citas',
  },
  {
    icon: CreditCardIcon,
    title: 'Pagos',
    description: 'Realiza pagos de manera segura en línea.',
    path: '/payments',
    label: 'Realizar Pago',
  },
  {
    icon: BookIcon,
    title: 'Blog',
    description: 'Lee artículos jurídicos y actualizaciones legales.',
    path: '/blog',
    label: 'Leer Blog',
  },
  {
    icon: UsersIcon,
    title: 'Abogados',
    description: 'Conoce a nuestro equipo de profesionales.',
    path: '/lawyers',
    label: 'Ver Abogados',
  },
]

export function Dashboard() {
  const { user, logout } = useAuthStore()
  const navigate = useNavigate()

  useEffect(() => {
    if (!user) navigate('/login')
  }, [user, navigate])

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  if (!user) {
    return <div className="dashboard-loading">Cargando...</div>
  }

  return (
    <PageShell>
      <PageHero
        eyebrow={`Bienvenido, ${user.fullName}`}
        title="Mi Portal"
        subtitle="Acceda a todas las funcionalidades del bufete de forma segura y organizada."
      >
        <MotionButton variant="ghost" className="btn-logout-hero" onClick={handleLogout}>
          Cerrar Sesión
        </MotionButton>
      </PageHero>
      <div className="page-content">
        <div className="dashboard-grid">
          {dashboardItems.map((item, i) => (
            <SpotlightCard key={item.path} className="dashboard-item">
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08, duration: 0.4 }}
              >
                <div className="dashboard-item__icon">
                  <item.icon />
                </div>
                <h3>{item.title}</h3>
                <p>{item.description}</p>
                <MotionButton
                  variant="secondary"
                  onClick={() => navigate(item.path)}
                >
                  {item.label}
                </MotionButton>
              </motion.div>
            </SpotlightCard>
          ))}
        </div>
      </div>
    </PageShell>
  )
}
