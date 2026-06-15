import { type ReactNode } from 'react'
import { motion } from 'motion/react'
import { MeshGradient } from '@components/motion/MeshGradient'
import { FilmGrain } from '@components/motion/FilmGrain'
import '../../styles/pages.css'

interface PageHeroProps {
  index?: string
  eyebrow?: string
  title: string
  subtitle?: string
  children?: ReactNode
}

export function PageHero({ index, eyebrow, title, subtitle, children }: PageHeroProps) {
  return (
    <header className="page-hero">
      <MeshGradient className="page-hero__mesh" opacity={0.4} />
      <FilmGrain intensity={0.04} />
      <div className="page-hero__inner">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {index && <span className="page-hero__index">{index}</span>}
          {eyebrow && <span className="page-hero__eyebrow">{eyebrow}</span>}
          <h1>{title}</h1>
          {subtitle && <p className="page-hero__subtitle">{subtitle}</p>}
          {children}
        </motion.div>
      </div>
    </header>
  )
}
