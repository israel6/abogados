import { motion, useScroll, useTransform } from 'motion/react'
import { useRef, useState } from 'react'
import { useReducedMotion } from '@hooks/useReducedMotion'
import '../../styles/motion.css'

interface ParallaxFloatProps {
  src: string
  alt: string
  className?: string
  speed?: number
}

export function ParallaxFloat({ src, alt, className = '', speed = 0.15 }: ParallaxFloatProps) {
  const ref = useRef<HTMLDivElement>(null)
  const [hidden, setHidden] = useState(false)
  const reducedMotion = useReducedMotion()
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] })
  const y = useTransform(scrollYProgress, [0, 1], reducedMotion ? [0, 0] : [-40 * speed, 40 * speed])

  if (hidden) return null

  return (
    <motion.div ref={ref} className={`parallax-float ${className}`.trim()} style={{ y }}>
      <motion.img
        src={src}
        alt={alt}
        loading="lazy"
        onError={() => setHidden(true)}
        animate={reducedMotion ? {} : { y: [0, -8, 0] }}
        transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
      />
    </motion.div>
  )
}
