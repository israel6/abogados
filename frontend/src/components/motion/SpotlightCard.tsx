import { useRef, useState, type ReactNode, type MouseEvent } from 'react'
import { motion } from 'motion/react'
import '../../styles/motion.css'

interface SpotlightCardProps {
  children: ReactNode
  className?: string
}

export function SpotlightCard({ children, className = '' }: SpotlightCardProps) {
  const ref = useRef<HTMLDivElement>(null)
  const [pos, setPos] = useState({ x: 0, y: 0 })
  const [hovering, setHovering] = useState(false)

  const handleMove = (e: MouseEvent<HTMLDivElement>) => {
    const el = ref.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    setPos({ x: e.clientX - rect.left, y: e.clientY - rect.top })
  }

  return (
    <motion.div
      ref={ref}
      className={`spotlight-card ${className}`.trim()}
      onMouseMove={handleMove}
      onMouseEnter={() => setHovering(true)}
      onMouseLeave={() => setHovering(false)}
      whileHover={{ y: -6 }}
      transition={{ duration: 0.22, ease: 'easeOut' }}
      style={{
        ['--spotlight-x' as string]: `${pos.x}px`,
        ['--spotlight-y' as string]: `${pos.y}px`,
        ['--spotlight-opacity' as string]: hovering ? '1' : '0',
      }}
    >
      <div className="spotlight-card__glow" aria-hidden="true" />
      {children}
    </motion.div>
  )
}
