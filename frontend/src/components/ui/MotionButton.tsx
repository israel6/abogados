import { motion, type HTMLMotionProps } from 'motion/react'

type Variant = 'primary' | 'outline' | 'outline-light' | 'ghost' | 'secondary'

interface MotionButtonProps extends HTMLMotionProps<'button'> {
  variant?: Variant
}

const variantClass: Record<Variant, string> = {
  primary: 'btn-cta',
  outline: 'btn-outline',
  'outline-light': 'btn-outline-light',
  ghost: 'btn-ghost',
  secondary: 'btn-secondary',
}

export function MotionButton({
  variant = 'primary',
  className = '',
  children,
  ...props
}: MotionButtonProps) {
  return (
    <motion.button
      type="button"
      className={`${variantClass[variant]} ${className}`.trim()}
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.98 }}
      transition={{ duration: 0.18, ease: 'easeOut' }}
      {...props}
    >
      {children}
    </motion.button>
  )
}
