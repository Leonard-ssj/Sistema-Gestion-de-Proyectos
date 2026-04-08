"use client"
import React, { useEffect, useRef } from "react"
import { animate, svg, utils } from "animejs"

export function AnimeMorphSvg({ className }: { className?: string }) {
  const containerRef = useRef<HTMLDivElement>(null)
  
  // Guardar ID y referencias para limpiar la recursión onComplete si se desmonta
  const animationRef = useRef<any>(null)
  const isMounted = useRef(true)

  useEffect(() => {
    isMounted.current = true
    if (!containerRef.current) return

    // Limitamos la búsqueda estricta a nuestro contenedor para no afectar otras SVGs
    const polygons = containerRef.current.querySelectorAll("polygon")
    if (polygons.length < 2) return

    const path1 = polygons[0]
    const path2 = polygons[1]

    // Función pura de utilería extraída del demo de Anime.js v4
    function generatePoints() {
      const total = utils.random(4, 64)
      const r1 = utils.random(4, 56)
      const r2 = 56
      // En JS moderno evitamos el `isOdd = n => n % 2`, es equivalente
      const isOdd = (n: number) => n % 2 !== 0
      
      let points = ""
      const l = isOdd(total) ? total + 1 : total
      
      for (let i = 0; i < l; i++) {
        const r = isOdd(i) ? r1 : r2
        const a = (2 * Math.PI * i / l) - Math.PI / 2
        
        // Coordenadas calculadas y redondeadas
        const x = 152 + utils.round(r * Math.cos(a), 0)
        const y = 56 + utils.round(r * Math.sin(a), 0)
        
        points += `${x},${y} `
      }
      return points.trim()
    }

    // Lógica recursiva solicitada (Morphing Infinito)
    function animateRandomPoints() {
      if (!isMounted.current) return

      // Guard: si el contenedor no está visible en el DOM, no animar
      // (p.ej. la página está en display:none o el componente está desmontado)
      const container = containerRef.current
      if (!container || !document.body.contains(container)) return

      // Actualizar el atributo points en path-2 (nuestro target oculto)
      utils.set(path2, { points: generatePoints() })

      // Wrapping try/catch para absorber el getTotalLength en elementos no renderizados
      try {
        animationRef.current = animate(path1, {
          points: svg.morphTo(path2),
          ease: 'inOutCirc',
          duration: 1200,
          onComplete: animateRandomPoints
        })
      } catch {
        // Reintentar después de un breve delay si el SVG aún no está renderizado
        setTimeout(animateRandomPoints, 500)
      }
    }

    animateRandomPoints()

    return () => {
      isMounted.current = false
      if (animationRef.current) {
        animationRef.current.pause()
      }
    }
  }, [])

  return (
    <div ref={containerRef} className={className}>
      <svg viewBox="0 0 304 112" className="w-full h-full text-primary opacity-80 drop-shadow-lg">
        <g strokeWidth="2" stroke="currentColor" strokeLinejoin="round" fill="none" fillRule="evenodd">
          {/* Geometría visible que mutará orgánicamente */}
          <polygon id="path-1" points="152,4 170,38 204,56 170,74 152,108 134,74 100,56 134,38"></polygon>
          {/* Geometría fantasma — visibility:hidden mantiene el render tree para que getTotalLength funcione */}
          <polygon style={{ visibility: "hidden" }} id="path-2" points="152,4 170,38 204,56 170,74 152,108 134,74 100,56 134,38"></polygon>
        </g>
      </svg>
    </div>
  )
}
