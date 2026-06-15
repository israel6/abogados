import { useRef, useEffect, useCallback } from 'react'
import { useReducedMotion } from '@hooks/useReducedMotion'
import '../../styles/motion.css'

function createNoise() {
  const perm = new Uint8Array(512)
  const grad3 = [
    [1, 1, 0], [-1, 1, 0], [1, -1, 0], [-1, -1, 0],
    [1, 0, 1], [-1, 0, 1], [1, 0, -1], [-1, 0, -1],
    [0, 1, 1], [0, -1, 1], [0, 1, -1], [0, -1, -1],
  ]
  const p = Array.from({ length: 256 }, () => Math.floor(Math.random() * 256))
  for (let i = 0; i < 512; i++) perm[i] = p[i & 255]

  function dot(g: number[], x: number, y: number) {
    return g[0] * x + g[1] * y
  }

  return function noise2D(xin: number, yin: number) {
    const F2 = 0.5 * (Math.sqrt(3) - 1)
    const G2 = (3 - Math.sqrt(3)) / 6
    const s = (xin + yin) * F2
    const i = Math.floor(xin + s)
    const j = Math.floor(yin + s)
    const t = (i + j) * G2
    const x0 = xin - (i - t)
    const y0 = yin - (j - t)
    const i1 = x0 > y0 ? 1 : 0
    const j1 = x0 > y0 ? 0 : 1
    const x1 = x0 - i1 + G2
    const y1 = y0 - j1 + G2
    const x2 = x0 - 1 + 2 * G2
    const y2 = y0 - 1 + 2 * G2
    const ii = i & 255
    const jj = j & 255
    const gi0 = perm[ii + perm[jj]] % 12
    const gi1 = perm[ii + i1 + perm[jj + j1]] % 12
    const gi2 = perm[ii + 1 + perm[jj + 1]] % 12
    let n0 = 0, n1 = 0, n2 = 0
    let t0 = 0.5 - x0 * x0 - y0 * y0
    if (t0 >= 0) { t0 *= t0; n0 = t0 * t0 * dot(grad3[gi0], x0, y0) }
    let t1 = 0.5 - x1 * x1 - y1 * y1
    if (t1 >= 0) { t1 *= t1; n1 = t1 * t1 * dot(grad3[gi1], x1, y1) }
    let t2 = 0.5 - x2 * x2 - y2 * y2
    if (t2 >= 0) { t2 *= t2; n2 = t2 * t2 * dot(grad3[gi2], x2, y2) }
    return 70 * (n0 + n1 + n2)
  }
}

function hexToRgb(hex: string): [number, number, number] {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  return result
    ? [parseInt(result[1], 16), parseInt(result[2], 16), parseInt(result[3], 16)]
    : [0, 0, 0]
}

interface MeshGradientProps {
  className?: string
  colors?: string[]
  speed?: number
  opacity?: number
}

export function MeshGradient({
  className = '',
  colors = ['#0a0f1a', '#1a2f5c', '#1e3a6e', '#a86808', '#0f172a'],
  speed = 0.00035,
  opacity = 0.55,
}: MeshGradientProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const noiseRef = useRef(createNoise())
  const rafRef = useRef(0)
  const reducedMotion = useReducedMotion()

  const draw = useCallback(
    (time: number) => {
      const canvas = canvasRef.current
      if (!canvas) return
      const ctx = canvas.getContext('2d')
      if (!ctx) return

      const w = canvas.width
      const h = canvas.height
      const noise = noiseRef.current
      const rgbColors = colors.map(hexToRgb)
      const t = reducedMotion ? 0 : time * speed
      const step = 4
      const imgData = ctx.createImageData(w, h)
      const data = imgData.data

      for (let y = 0; y < h; y += step) {
        for (let x = 0; x < w; x += step) {
          let value = 0
          let amplitude = 1
          let frequency = 1
          let maxAmp = 0
          for (let o = 0; o < 4; o++) {
            value += noise(x * 0.002 * frequency + t, y * 0.002 * frequency + t * 0.7) * amplitude
            maxAmp += amplitude
            amplitude *= 0.5
            frequency *= 2
          }
          value = (value / maxAmp + 1) * 0.5
          const warpX = Math.sin(y * 0.003 + t * 2) * 0.08
          const warped = Math.max(0, Math.min(1, value + warpX))
          const colorPos = warped * (rgbColors.length - 1)
          const ci = Math.floor(colorPos)
          const cf = colorPos - ci
          const c1 = rgbColors[Math.min(ci, rgbColors.length - 1)]
          const c2 = rgbColors[Math.min(ci + 1, rgbColors.length - 1)]
          const r = Math.round(c1[0] + (c2[0] - c1[0]) * cf)
          const g = Math.round(c1[1] + (c2[1] - c1[1]) * cf)
          const b = Math.round(c1[2] + (c2[2] - c1[2]) * cf)
          for (let dy = 0; dy < step && y + dy < h; dy++) {
            for (let dx = 0; dx < step && x + dx < w; dx++) {
              const idx = ((y + dy) * w + (x + dx)) * 4
              data[idx] = r
              data[idx + 1] = g
              data[idx + 2] = b
              data[idx + 3] = 255
            }
          }
        }
      }
      ctx.putImageData(imgData, 0, 0)
      if (!reducedMotion) rafRef.current = requestAnimationFrame(draw)
    },
    [colors, speed, reducedMotion]
  )

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const updateSize = () => {
      const rect = canvas.getBoundingClientRect()
      canvas.width = Math.max(1, rect.width * 0.3)
      canvas.height = Math.max(1, rect.height * 0.3)
    }

    updateSize()
    window.addEventListener('resize', updateSize)
    rafRef.current = requestAnimationFrame(draw)

    return () => {
      cancelAnimationFrame(rafRef.current)
      window.removeEventListener('resize', updateSize)
    }
  }, [draw])

  return (
    <canvas
      ref={canvasRef}
      className={`mesh-gradient ${className}`.trim()}
      style={{ opacity }}
      aria-hidden="true"
    />
  )
}
