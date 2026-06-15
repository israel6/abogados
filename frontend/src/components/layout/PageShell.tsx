import { type ReactNode } from 'react'
import { motion } from 'motion/react'
import { Navbar } from '@components/layout/Navbar'
import { SiteFooter } from '@components/layout/SiteFooter'
import '../../styles/pages.css'

interface PageShellProps {
  children: ReactNode
  showFooter?: boolean
  className?: string
}

export function PageShell({ children, showFooter = true, className = '' }: PageShellProps) {
  return (
    <div className={`page-shell ${className}`.trim()}>
      <Navbar />
      <motion.main
        className="page-shell__main"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4 }}
      >
        {children}
      </motion.main>
      {showFooter && <SiteFooter />}
    </div>
  )
}
