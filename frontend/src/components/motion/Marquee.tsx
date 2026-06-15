import { type ReactNode } from 'react'
import { useReducedMotion } from '@hooks/useReducedMotion'
import '../../styles/motion.css'

interface MarqueeProps {
  children: ReactNode
  speed?: number
  className?: string
}

export function Marquee({ children, speed = 40, className = '' }: MarqueeProps) {
  const reducedMotion = useReducedMotion()

  return (
    <div className={`marquee ${className}`.trim()} aria-hidden={reducedMotion}>
      <div
        className="marquee__track"
        style={{ animationDuration: reducedMotion ? '0s' : `${speed}s` }}
      >
        <div className="marquee__content">{children}</div>
        {!reducedMotion && <div className="marquee__content" aria-hidden="true">{children}</div>}
      </div>
    </div>
  )
}
