import { useNavigate } from 'react-router-dom'
import { motion } from 'motion/react'
import { useAuthStore } from '@hooks/useAuth'
import { Navbar } from '@components/layout/Navbar'
import { SiteFooter } from '@components/layout/SiteFooter'
import { MotionButton } from '@components/ui/MotionButton'
import { MeshGradient } from '@components/motion/MeshGradient'
import { FilmGrain } from '@components/motion/FilmGrain'
import { HeroVideo } from '@components/motion/HeroVideo'
import { ParallaxFloat } from '@components/motion/ParallaxFloat'
import { SpotlightCard } from '@components/motion/SpotlightCard'
import { NumberTicker } from '@components/motion/NumberTicker'
import { Marquee } from '@components/motion/Marquee'
import { BorderBeam } from '@components/motion/BorderBeam'
import {
  CalendarIcon,
  CreditCardIcon,
  BookIcon,
  UsersIcon,
  BellIcon,
  SparklesIcon,
  ShieldIcon,
  LockIcon,
  CheckCircleIcon,
  ScaleIcon,
} from '@components/icons/LegalIcons'
import '../styles/home.css'

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.07 } },
}

const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, ease: 'easeOut' as const },
  },
}

const fadeUpDelayed = (i: number) => ({
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.09, duration: 0.5, ease: 'easeOut' as const },
  },
})

const practiceAreas = [
  'Derecho Civil',
  'Derecho Laboral',
  'Derecho Penal',
  'Derecho Mercantil',
  'Derecho de Familia',
  'Derecho Tributario',
]

const features = [
  { icon: CalendarIcon, title: 'Agendamiento Inteligente', description: 'Reserva citas con confirmación automática y recordatorios integrados.' },
  { icon: CreditCardIcon, title: 'Pagos Seguros', description: 'Honorarios en línea vía Payphone: tarjeta, débito o transferencia.' },
  { icon: BookIcon, title: 'Blog Jurídico', description: 'Análisis legal actualizado y casos de éxito documentados.' },
  { icon: UsersIcon, title: 'Perfiles Profesionales', description: 'Especialidades, trayectoria y credenciales de cada abogado.' },
  { icon: BellIcon, title: 'Notificaciones', description: 'Alertas por email y WhatsApp para citas y pagos pendientes.' },
  { icon: SparklesIcon, title: 'Asistente IA', description: 'Orientación legal preliminar disponible las 24 horas.' },
]

const securityItems = [
  { icon: LockIcon, title: 'Cifrado AES-256', description: 'Protección de datos con estándar bancario internacional.' },
  { icon: ShieldIcon, title: 'Autenticación JWT', description: 'Sesiones verificadas con tokens de corta duración.' },
  { icon: CheckCircleIcon, title: 'HTTPS / TLS 1.3', description: 'Comunicación cifrada de extremo a extremo.' },
  { icon: LockIcon, title: 'Contraseñas Seguras', description: 'Hash bcrypt. Nunca almacenadas en texto plano.' },
]

const stats = [
  { value: 15, suffix: '+', label: 'Años de experiencia' },
  { value: 2400, suffix: '+', label: 'Casos atendidos' },
  { value: 98, suffix: '%', label: 'Clientes satisfechos' },
]

const FLOAT_IMG_1 = 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=400&q=80'
const FLOAT_IMG_2 = 'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=400&q=80'

export default function Home() {
  const navigate = useNavigate()
  const { isAuthenticated } = useAuthStore()

  return (
    <div className="home">
      <Navbar />

      <section className="hero">
        <HeroVideo />
        <MeshGradient opacity={0.35} />
        <FilmGrain intensity={0.045} />
        <div className="hero__grid-line hero__grid-line--v" aria-hidden="true" />
        <ParallaxFloat src={FLOAT_IMG_1} alt="" className="parallax-float--1" speed={0.2} />
        <ParallaxFloat src={FLOAT_IMG_2} alt="" className="parallax-float--2" speed={0.12} />
        <div className="hero__inner">
          <motion.div
            className="hero__content"
            variants={stagger}
            initial="hidden"
            animate="visible"
          >
            <motion.span className="hero__eyebrow" variants={fadeUp}>
              Bufete de Abogados · Ecuador
            </motion.span>
            <motion.h1 variants={fadeUp}>
              Defendemos sus derechos con{' '}
              <em>excelencia</em> y confianza
            </motion.h1>
            <motion.p className="hero__lead" variants={fadeUp}>
              Un portal digital diseñado para gestionar consultas, pagos y
              seguimiento legal con la precisión que su caso exige.
            </motion.p>
            <motion.div className="hero__actions" variants={fadeUp}>
              {isAuthenticated ? (
                <MotionButton variant="primary" onClick={() => navigate('/dashboard')}>
                  Ir a Mi Portal
                </MotionButton>
              ) : (
                <>
                  <MotionButton variant="primary" onClick={() => navigate('/register')}>
                    Agendar Consulta Gratuita
                  </MotionButton>
                  <MotionButton variant="outline" onClick={() => navigate('/lawyers')}>
                    Conocer Abogados
                  </MotionButton>
                </>
              )}
            </motion.div>
          </motion.div>

          <motion.div
            className="hero__stats"
            initial="hidden"
            animate="visible"
            variants={stagger}
          >
            {stats.map((stat, i) => (
              <motion.div key={stat.label} className="hero__stat" variants={fadeUpDelayed(i)}>
                <strong>
                  <NumberTicker value={stat.value} suffix={stat.suffix} />
                </strong>
                <span>{stat.label}</span>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      <section className="marquee-band" aria-hidden="true">
        <Marquee speed={50}>
          {practiceAreas.map((area) => (
            <span key={area}>{area}</span>
          ))}
        </Marquee>
      </section>

      <section className="trust-bar" aria-label="Credenciales del bufete">
        <motion.div
          className="trust-bar__inner"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-20px' }}
          variants={stagger}
        >
          {[
            { icon: ShieldIcon, text: 'Licenciados y certificados' },
            { icon: ScaleIcon, text: '6 áreas de práctica legal' },
            { icon: CheckCircleIcon, text: 'Confidencialidad garantizada' },
          ].map((item) => (
            <motion.div key={item.text} className="trust-bar__item" variants={fadeUp}>
              <item.icon />
              <span>{item.text}</span>
            </motion.div>
          ))}
        </motion.div>
      </section>

      <section className="section features" aria-labelledby="features-heading">
        <motion.div
          className="section__header"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <span className="section__index">01</span>
          <span className="section__eyebrow">Servicios Digitales</span>
          <h2 id="features-heading">Todo en un solo portal</h2>
          <p>Gestione su relación con el bufete con transparencia, seguridad y eficiencia.</p>
        </motion.div>
        <div className="features__grid">
          {features.map((feature, i) => (
            <SpotlightCard key={feature.title} className="feature-card">
              <span className="feature-card__index">{String(i + 1).padStart(2, '0')}</span>
              <div className="feature-card__icon">
                <feature.icon />
              </div>
              <h3>{feature.title}</h3>
              <p>{feature.description}</p>
            </SpotlightCard>
          ))}
        </div>
      </section>

      <section className="section cta-band" aria-labelledby="cta-heading">
        <BorderBeam>
          <motion.div
            className="cta-band__inner"
            initial={{ opacity: 0, y: 32 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.55 }}
          >
            <span className="section__index section__index--light">02</span>
            <h2 id="cta-heading">¿Necesita asesoría legal urgente?</h2>
            <p>Nuestro equipo evaluará su caso y orientará los próximos pasos con claridad.</p>
            <div className="cta-band__actions">
              <MotionButton variant="primary" onClick={() => navigate('/appointments')}>
                Reservar Cita
              </MotionButton>
              <MotionButton variant="outline-light" onClick={() => navigate('/ai-assistant')}>
                Consultar Asistente IA
              </MotionButton>
            </div>
          </motion.div>
        </BorderBeam>
      </section>

      <section className="section security" aria-labelledby="security-heading">
        <MeshGradient
          className="security__mesh"
          colors={['#0a0f1a', '#1a2f5c', '#0f172a', '#1e3a6e']}
          opacity={0.25}
        />
        <motion.div
          className="section__header section__header--light"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <span className="section__index section__index--light">03</span>
          <span className="section__eyebrow">Seguridad Empresarial</span>
          <h2 id="security-heading">Protección de datos de nivel institucional</h2>
        </motion.div>
        <div className="security__grid">
          {securityItems.map((item, i) => (
            <motion.div
              key={item.title}
              className="security-card"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08, duration: 0.45 }}
              whileHover={{ backgroundColor: 'rgba(255,255,255,0.08)' }}
            >
              <motion.div whileHover={{ rotate: 5 }} transition={{ duration: 0.2 }}>
                <item.icon />
              </motion.div>
              <h4>{item.title}</h4>
              <p>{item.description}</p>
            </motion.div>
          ))}
        </div>
      </section>

      <SiteFooter />
    </div>
  )
}
