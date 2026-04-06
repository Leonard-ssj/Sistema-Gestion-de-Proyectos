"use client"
import React from "react"

interface AnimeTextDrawProps {
  className?: string
  text?: string
  fontSize?: number
  strokeWidth?: number
  viewBoxHeight?: number
  delay?: number
  filterId?: string   // ID estático para evitar hydration mismatch
}

export function AnimeTextDraw({
  className,
  text = "La plataforma completa para gestionar proyectos",
  fontSize = 72,
  strokeWidth = 2,
  viewBoxHeight = 240,
  delay = 0,
  filterId = "glow-draw"
}: AnimeTextDrawProps) {

  const words = text.split(" ")
  const half = Math.ceil(words.length / 2)
  const line1 = words.slice(0, half).join(" ")
  const line2 = words.slice(half).join(" ")

  // Duraciones más lentas (5.5s de trazado, fill reveal a los 5s)
  const delayA    = `${delay}s`
  const delayB    = `${delay + 0.6}s`
  const fillDelayA = `${delay + 4}s`
  const fillDelayB = `${delay + 4.6}s`

  return (
    <div className={className}>
      <svg
        viewBox={`0 0 1000 ${viewBoxHeight}`}
        className="w-full h-auto overflow-visible"
        aria-label={text}
        role="heading"
        aria-level={1}
        // Suprimir hydration mismatch en atributos del SVG interno
        suppressHydrationWarning
      >
        <defs>
          <filter id={filterId} x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Línea 1 — trazado lento 5.5s */}
        <text
          x="50%"
          y="44%"
          textAnchor="middle"
          fontSize={fontSize}
          fontWeight="800"
          fontFamily="Inter, system-ui, sans-serif"
          letterSpacing="-2"
          fill="currentColor"
          fillOpacity={0}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          strokeDasharray="3000"
          strokeDashoffset="3000"
          strokeOpacity={0}
          filter={`url(#${filterId})`}
          suppressHydrationWarning
        >
          <animate attributeName="stroke-dashoffset" from="3000" to="0"
            begin={delayA} dur="5.5s" fill="freeze" calcMode="spline"
            keySplines="0.25 0.46 0.45 0.94" />
          <animate attributeName="stroke-opacity" from="0" to="1"
            begin={delayA} dur="0.15s" fill="freeze" />
          <animate attributeName="stroke-opacity" from="1" to="0"
            begin={fillDelayA} dur="1.2s" fill="freeze" />
          <animate attributeName="fill-opacity" from="0" to="1"
            begin={fillDelayA} dur="1.4s" fill="freeze" />
          {line1}
        </text>

        {/* Línea 2 — con 0.6s de retraso orgánico */}
        <text
          x="50%"
          y="88%"
          textAnchor="middle"
          fontSize={fontSize}
          fontWeight="800"
          fontFamily="Inter, system-ui, sans-serif"
          letterSpacing="-2"
          fill="currentColor"
          fillOpacity={0}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          strokeDasharray="3000"
          strokeDashoffset="3000"
          strokeOpacity={0}
          filter={`url(#${filterId})`}
          suppressHydrationWarning
        >
          <animate attributeName="stroke-dashoffset" from="3000" to="0"
            begin={delayB} dur="5.5s" fill="freeze" calcMode="spline"
            keySplines="0.25 0.46 0.45 0.94" />
          <animate attributeName="stroke-opacity" from="0" to="1"
            begin={delayB} dur="0.15s" fill="freeze" />
          <animate attributeName="stroke-opacity" from="1" to="0"
            begin={fillDelayB} dur="1.2s" fill="freeze" />
          <animate attributeName="fill-opacity" from="0" to="1"
            begin={fillDelayB} dur="1.4s" fill="freeze" />
          {line2}
        </text>
      </svg>
    </div>
  )
}
