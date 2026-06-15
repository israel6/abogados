import { useReducedMotion } from '@hooks/useReducedMotion'
import '../../styles/motion.css'

const HERO_VIDEO =
  'https://videos.pexels.com/video-files/6073504/6073504-hd_1920_1080_25fps.mp4'

const HERO_POSTER =
  'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=1920&q=80'

interface HeroVideoProps {
  className?: string
}

export function HeroVideo({ className = '' }: HeroVideoProps) {
  const reducedMotion = useReducedMotion()

  if (reducedMotion) {
    return (
      <div
        className={`hero-video hero-video--static ${className}`.trim()}
        style={{ backgroundImage: `url(${HERO_POSTER})` }}
        aria-hidden="true"
      />
    )
  }

  return (
    <div className={`hero-video ${className}`.trim()} aria-hidden="true">
      <video
        autoPlay
        muted
        loop
        playsInline
        poster={HERO_POSTER}
        className="hero-video__el"
      >
        <source src={HERO_VIDEO} type="video/mp4" />
      </video>
      <div className="hero-video__overlay" />
    </div>
  )
}
