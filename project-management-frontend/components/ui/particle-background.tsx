"use client"

import { useEffect, useRef } from "react"

// ── Paleta de colores adaptada a los 4 temas de ProGest ──────────────────────
// Se lee el tema activo del atributo data-theme en <html> para seleccionar
// la paleta adecuada. Los colores son hardcoded (no CSS variables) para poder
// usarlos directamente en el canvas 2D.
const THEME_PALETTES: Record<string, string[]> = {
  dark: [
    "#3b82f6", "#3b82f6", "#3b82f6", // azul primario (más frecuente)
    "#8b5cf6",                         // violeta
    "#06b6d4",                         // cyan
    "#1e293b",                         // fondo neutro oscuro
  ],
  light: [
    "#2563eb", "#2563eb", "#2563eb",
    "#7c3aed",
    "#0891b2",
    "#e2e8f0",
  ],
  sunset: [
    "#f97316", "#f97316", "#f97316",
    "#ec4899",
    "#eab308",
    "#1c1917",
  ],
  sunrise: [
    "#f59e0b", "#f59e0b", "#f59e0b",
    "#ef4444",
    "#84cc16",
    "#fffbeb",
  ],
}

const MAX_PARTICLES = 75

// ── Tipos ────────────────────────────────────────────────────────────────────
type ParticleType = "bubble" | "line"

interface ParticleState {
  id: number
  type: ParticleType
  inBounds: boolean
  coords: { x: number; y: number }
  velocity: { x: number; y: number }
  alpha: number
  color: string
  hex: string
  strokeWidth: number
  // bubble
  diameter?: number
  // line
  angle?: number
  length?: number
  rotateSpeed?: number
  rotateClockwise?: boolean
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function hexToRGBA(hex: string, alpha: number) {
  const h = hex.replace("#", "")
  const r = parseInt(h.substring(0, 2), 16)
  const g = parseInt(h.substring(2, 4), 16)
  const b = parseInt(h.substring(4, 6), 16)
  return `rgba(${r},${g},${b},${alpha})`
}

function sample<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

function randomizeType(): ParticleType {
  const pool: ParticleType[] = ["bubble", "bubble", "bubble", "bubble", "line"]
  return sample(pool)
}

function getCircleDiameter() {
  let d = 0
  while (d < 2) d = Math.random() * 7 * 2
  return d
}

function getCurrentPalette(): string[] {
  if (typeof document === "undefined") return THEME_PALETTES.dark
  const theme = document.documentElement.getAttribute("data-theme") ?? "dark"
  return THEME_PALETTES[theme] ?? THEME_PALETTES.dark
}

function createParticle(id: number, canvasW: number, canvasH: number): ParticleState {
  const type = randomizeType()
  const hex = sample(getCurrentPalette())
  const alpha = 0.1
  const p: ParticleState = {
    id,
    type,
    inBounds: false,
    coords: {
      x: Math.round(Math.random() * canvasW),
      y: Math.round(Math.random() * canvasH),
    },
    velocity: {
      x: (Math.random() < 0.5 ? -1 : 1) * Math.random() * 0.7,
      y: (Math.random() < 0.5 ? -1 : 1) * Math.random() * 0.7,
    },
    alpha,
    hex,
    color: hexToRGBA(hex, alpha),
    strokeWidth: Math.random() * (Math.random() > 0.5 ? 1.5 : 2.5),
  }

  if (type === "bubble") {
    p.diameter = getCircleDiameter()
  } else {
    p.angle = Math.atan2(p.coords.y, p.coords.x)
    p.length = sample([5, 7, 3, 10])
    p.rotateSpeed = sample([10, 30, 60, 120])
    p.rotateClockwise = Math.random() < 0.5
  }

  return p
}

function withinBounds(p: ParticleState, canvasW: number, canvasH: number): boolean {
  const boundX = canvasW / 2 + 5
  const boundY = canvasH / 2 + 5
  const x = p.coords.x / 2
  const y = p.coords.y / 2
  return !((x > boundX || x < -5) || (y > boundY || y < -5))
}

function updateParticle(p: ParticleState, canvasW: number, canvasH: number): boolean {
  if (p.alpha < 1) {
    p.alpha = Math.min(1, p.alpha + 0.01)
    p.color = hexToRGBA(p.hex, p.alpha)
  }
  p.coords.x += p.velocity.x
  p.coords.y += p.velocity.y

  if (p.type === "line" && p.rotateSpeed !== undefined && p.angle !== undefined) {
    const angle = Math.PI / p.rotateSpeed
    p.angle += p.rotateClockwise ? -Math.abs(angle) : Math.abs(angle)
  }

  p.inBounds = withinBounds(p, canvasW, canvasH)
  return p.inBounds
}

function drawParticle(ctx: CanvasRenderingContext2D, p: ParticleState) {
  ctx.lineWidth = p.strokeWidth
  ctx.strokeStyle = p.color
  ctx.save()

  if (p.type === "line" && p.angle !== undefined && p.length !== undefined) {
    ctx.translate(p.coords.x / 2, p.coords.y / 2)
    ctx.rotate(p.angle)
    ctx.beginPath()
    ctx.moveTo(-p.length / 2, 0)
    ctx.lineTo(p.length / 2, 0)
  } else if (p.type === "bubble" && p.diameter !== undefined) {
    ctx.beginPath()
    ctx.arc(p.coords.x, p.coords.y, p.diameter, 0, Math.PI * 2, false)
  }

  ctx.stroke()
  ctx.restore()
}

// ── Componente principal ──────────────────────────────────────────────────────
export function ParticleBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    let particles: ParticleState[] = []
    let rafId: number
    let pidCounter = 0

    // Ajustar tamaño del canvas al viewport (×2 para HiDPI)
    const resize = () => {
      const w = window.innerWidth
      const h = window.innerHeight
      canvas.width  = w * 2
      canvas.height = h * 2
      canvas.style.width  = `${w}px`
      canvas.style.height = `${h}px`
    }

    const generate = () => {
      while (particles.length < MAX_PARTICLES) {
        particles.push(createParticle(pidCounter++, canvas.width, canvas.height))
      }
    }

    const loop = () => {
      // Reponer partículas que salen del canvas
      if (particles.length < MAX_PARTICLES - 5) generate()

      // Actualizar posiciones y filtrar las que se fueron
      particles = particles.filter((p) => updateParticle(p, canvas.width, canvas.height))

      // Dibujar frame
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      particles.forEach((p) => drawParticle(ctx, p))

      rafId = requestAnimationFrame(loop)
    }

    resize()
    generate()
    loop()

    window.addEventListener("resize", resize)

    // ── Limpieza anti memory-leak ──────────────────────────────────────────
    return () => {
      cancelAnimationFrame(rafId)
      window.removeEventListener("resize", resize)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="fixed inset-0 pointer-events-none"
      style={{ zIndex: -1, display: "block" }}
    />
  )
}
