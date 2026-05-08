import { useEffect, useRef } from 'react'
import { useThemeContext } from '@/App'

// Lightweight canvas particle system - no external lib, ~2KB
export default function ParticleBackground() {
  const canvasRef = useRef(null)
  const { isDark } = useThemeContext()

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')

    const color = isDark ? '139,92,246' : '124,58,237'

    let W = 0, H = 0
    let animId = null
    const PARTICLE_COUNT = 38
    const LINK_DIST = 130

    class Particle {
      constructor() { this.reset() }
      reset() {
        this.x  = Math.random() * W
        this.y  = Math.random() * H
        this.vx = (Math.random() - 0.5) * 0.4
        this.vy = (Math.random() - 0.5) * 0.4
        this.r  = Math.random() * 1.8 + 0.8
        this.a  = Math.random() * 0.4 + 0.15
      }
      update() {
        this.x += this.vx
        this.y += this.vy
        if (this.x < 0 || this.x > W) this.vx *= -1
        if (this.y < 0 || this.y > H) this.vy *= -1
      }
      draw() {
        ctx.beginPath()
        ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(${color},${this.a})`
        ctx.fill()
      }
    }

    let particles = []

    const resize = () => {
      W = canvas.width  = canvas.offsetWidth
      H = canvas.height = canvas.offsetHeight
      // recreate on resize so they spread properly
      particles = Array.from({ length: PARTICLE_COUNT }, () => new Particle())
    }

    const draw = () => {
      ctx.clearRect(0, 0, W, H)

      // links
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x
          const dy = particles[i].y - particles[j].y
          const dist = Math.sqrt(dx * dx + dy * dy)
          if (dist < LINK_DIST) {
            const alpha = (1 - dist / LINK_DIST) * 0.18
            ctx.beginPath()
            ctx.moveTo(particles[i].x, particles[i].y)
            ctx.lineTo(particles[j].x, particles[j].y)
            ctx.strokeStyle = `rgba(${color},${alpha})`
            ctx.lineWidth = 1
            ctx.stroke()
          }
        }
      }

      particles.forEach(p => { p.update(); p.draw() })
      animId = requestAnimationFrame(draw)
    }

    resize()
    draw()

    const ro = new ResizeObserver(resize)
    ro.observe(canvas)

    return () => {
      cancelAnimationFrame(animId)
      ro.disconnect()
    }
  }, [isDark])

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none"
      style={{ zIndex: 0 }}
    />
  )
}
