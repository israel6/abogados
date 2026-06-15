import type { ReactNode } from 'react'
import { motion } from 'motion/react'
import { Link, type LinkProps } from 'react-router-dom'

interface MotionNavLinkProps extends LinkProps {
  children: ReactNode
}

export function MotionNavLink({ children, className = '', ...props }: MotionNavLinkProps) {
  return (
    <Link {...props} className={`motion-nav-link ${className}`.trim()}>
      <motion.span
        className="motion-nav-link__text"
        whileHover={{ y: -1 }}
        transition={{ duration: 0.15 }}
      >
        {children}
      </motion.span>
      <motion.span
        className="motion-nav-link__line"
        initial={{ scaleX: 0 }}
        whileHover={{ scaleX: 1 }}
        transition={{ duration: 0.22, ease: 'easeOut' }}
      />
    </Link>
  )
}
