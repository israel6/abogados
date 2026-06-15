import { useRef, useEffect } from 'react'
import { useReducedMotion } from '@hooks/useReducedMotion'
import '../../styles/motion.css'

interface FilmGrainProps {
  intensity?: number
  fps?: number
}

export function FilmGrain({ intensity = 0.05, fps = 10 }: FilmGrainProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const rafRef = useRef(0)
  const reducedMotion = useReducedMotion()

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || reducedMotion) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const updateSize = () => {
      canvas.width = Math.ceil(canvas.offsetWidth * 0.4)
      canvas.height = Math.ceil(canvas.offsetHeight * 0.4)
    }
    updateSize()
    window.addEventListener('resize', updateSize)

    let lastFrame = 0
    const interval = 1000 / fps

    const render = (time: number) => {
      if (time - lastFrame < interval) {
        rafRef.current = requestAnimationFrame(render)
        return
      }
      lastFrame = time
      const w = canvas.width
      const h = canvas.height
      const imgData = ctx.createImageData(w, h)
      const data = imgData.data
      for (let i = 0; i < data.length; i += 4) {
        const v = Math.random() * 255
        data[i] = v
        data[i + 1] = v
        data[i + 2] = v
        data[i + 3] = 255
      }
      ctx.putImageData(imgData, 0, 0)
      rafRef.current = requestAnimationFrame(render)
    }

    rafRef.current = requestAnimationFrame(render)
    return () => {
      cancelAnimationFrame(rafRef.current)
      window.removeEventListener('resize', updateSize)
    }
  }, [fps, reducedMotion])

  return (
    <canvas
      ref={canvasRef}
      className="film-grain"
      style={{ opacity: intensity }}
      aria-hidden="true"
    />
  )
}
