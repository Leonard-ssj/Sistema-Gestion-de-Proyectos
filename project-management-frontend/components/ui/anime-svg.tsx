"use client"
import React, { useEffect, useRef } from "react"
import { animate } from "animejs"

export function AnimeSvg({ className }: { className?: string }) {
  const svgRef = useRef<SVGSVGElement>(null)

  useEffect(() => {
    if (!svgRef.current) return

    const turbulence = svgRef.current.querySelector("feTurbulence")
    const displacement = svgRef.current.querySelector("feDisplacementMap")
    const polygon = svgRef.current.querySelector("polygon")

    // Aplicar animación a los filtros SVG
    if (turbulence && displacement) {
      animate([turbulence, displacement], {
        baseFrequency: 0.05,
        scale: 15,
        alternate: true,
        loop: true,
        duration: 4000,
        ease: 'easeInOutSine'
      })
    }

    // Aplicar animación geométrica al polígono
    if (polygon) {
      animate(polygon, {
        points: '64 68.64 8.574 100 63.446 67.68 64 4 64.554 67.68 119.426 100',
        alternate: true,
        loop: true,
        duration: 5000,
        ease: 'easeInOutQuad'
      })
    }
  }, [])

  return (
    <div className={className}>
      <svg ref={svgRef} width="128" height="128" viewBox="0 0 128 128" className="text-primary drop-shadow-xl opacity-90">
        <filter id="displacementFilter">
          <feTurbulence type="turbulence" numOctaves="2" baseFrequency="0" result="turbulence"/>
          <feDisplacementMap in2="turbulence" in="SourceGraphic" scale="1" xChannelSelector="R" yChannelSelector="G"/>
        </filter>
        <polygon 
          points="64 128 8.574 96 8.574 32 64 0 119.426 32 119.426 96"  
          fill="currentColor"
          style={{ filter: "url(#displacementFilter)" }}
        />
      </svg>
    </div>
  )
}
