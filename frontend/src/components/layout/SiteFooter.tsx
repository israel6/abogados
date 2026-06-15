import { motion } from 'motion/react'
import { Link } from 'react-router-dom'
import { ScaleIcon } from '@components/icons/LegalIcons'
import '../../styles/footer.css'

const footerLinks = [
  { to: '/lawyers', label: 'Abogados' },
  { to: '/blog', label: 'Blog Jurídico' },
  { to: '/appointments', label: 'Citas' },
  { to: '/login', label: 'Acceso Clientes' },
]

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="site-footer__inner">
        <div className="site-footer__brand">
          <ScaleIcon className="site-footer__logo" />
          <div>
            <strong>Portal Bufete de Abogados</strong>
            <p>Asesoría legal de excelencia con tecnología de confianza institucional.</p>
          </div>
        </div>
        <nav className="site-footer__links" aria-label="Enlaces del pie de página">
          {footerLinks.map((link) => (
            <motion.div key={link.to} whileHover={{ y: -2 }} transition={{ duration: 0.15 }}>
              <Link to={link.to} className="footer-link">
                {link.label}
              </Link>
            </motion.div>
          ))}
        </nav>
      </div>
      <div className="site-footer__bottom">
        <p>&copy; {new Date().getFullYear()} Portal Bufete de Abogados</p>
        <p>RV Desarrolladora de Software</p>
      </div>
    </footer>
  )
}
