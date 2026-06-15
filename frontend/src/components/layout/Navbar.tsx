import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion, useScroll, useTransform } from 'motion/react'
import { useAuthStore } from '@hooks/useAuth'
import { ScaleIcon } from '@components/icons/LegalIcons'
import { MotionButton } from '@components/ui/MotionButton'
import { MotionNavLink } from '@components/ui/MotionNavLink'
import '../../styles/navbar.css'

export function Navbar() {
  const navigate = useNavigate()
  const { isAuthenticated } = useAuthStore()
  const [scrolled, setScrolled] = useState(false)
  const { scrollY } = useScroll()
  const navShadow = useTransform(scrollY, [0, 80], [0, 1])

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <motion.nav
      className={`site-navbar${scrolled ? ' site-navbar--scrolled' : ''}`}
      aria-label="Navegación principal"
      style={{ boxShadow: scrolled ? 'var(--shadow-md)' : 'var(--shadow-sm)' }}
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
    >
      <div className="site-navbar__inner">
        <Link to="/" className="site-navbar__brand">
          <motion.div
            whileHover={{ rotate: -8 }}
            transition={{ duration: 0.25 }}
          >
            <ScaleIcon className="site-navbar__logo" />
          </motion.div>
          <span>
            <strong>Bufete Legal</strong>
            <small>Est. 2009 · Quito</small>
          </span>
        </Link>

        <div className="site-navbar__links">
          <MotionNavLink to="/lawyers">Abogados</MotionNavLink>
          <MotionNavLink to="/blog">Blog</MotionNavLink>
          <MotionNavLink to="/ai-assistant">Asistente IA</MotionNavLink>
        </div>

        <div className="site-navbar__actions">
          {isAuthenticated ? (
            <MotionButton variant="primary" className="btn-nav-primary" onClick={() => navigate('/dashboard')}>
              Mi Portal
            </MotionButton>
          ) : (
            <>
              <MotionButton variant="ghost" className="btn-nav-ghost" onClick={() => navigate('/login')}>
                Iniciar Sesión
              </MotionButton>
              <MotionButton variant="primary" className="btn-nav-primary" onClick={() => navigate('/register')}>
                Agendar Consulta
              </MotionButton>
            </>
          )}
        </div>
      </div>
      <motion.div
        className="site-navbar__progress"
        style={{ scaleX: navShadow, transformOrigin: 'left' }}
        aria-hidden="true"
      />
    </motion.nav>
  )
}
