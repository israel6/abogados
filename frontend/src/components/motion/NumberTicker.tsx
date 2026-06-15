import { useEffect, useRef, useState } from 'react'
import { motion, useInView } from 'motion/react'
import { useReducedMotion } from '@hooks/useReducedMotion'

interface NumberTickerProps {
  value: number
  suffix?: string
  prefix?: string
  duration?: number
  className?: string
}

export function NumberTicker({
  value,
  suffix = '',
  prefix = '',
  duration = 1.8,
  className = '',
}: NumberTickerProps) {
  const ref = useRef<HTMLSpanElement>(null)
  const inView = useInView(ref, { once: true, margin: '-40px' })
  const reducedMotion = useReducedMotion()
  const [display, setDisplay] = useState(reducedMotion ? value : 0)

  useEffect(() => {
    if (!inView) return
    if (reducedMotion) {
      setDisplay(value)
      return
    }

    let start: number | null = null
    let raf = 0

    const step = (ts: number) => {
      if (!start) start = ts
      const progress = Math.min((ts - start) / (duration * 1000), 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setDisplay(Math.round(value * eased))
      if (progress < 1) raf = requestAnimationFrame(step)
    }

    raf = requestAnimationFrame(step)
    return () => cancelAnimationFrame(raf)
  }, [inView, value, duration, reducedMotion])

  return (
    <motion.span ref={ref} className={className}>
      {prefix}{display.toLocaleString('es-EC')}{suffix}
    </motion.span>
  )
}
