"use client"

import { useEffect, useRef } from "react"
import { CloudDownload } from "lucide-react"
import gsap from "gsap"

export function AnimatedExportButton({ onExport }: { onExport: () => void }) {
  const containerRef = useRef<HTMLDivElement>(null)
  const tooltipRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const container = containerRef.current
    const tooltip = tooltipRef.current
    if (!container || !tooltip) return

    // Base state
    gsap.set(tooltip, { yPercent: -50 })

    const tl = gsap.timeline({ paused: true })
    
    tl.fromTo(tooltip, 
      {
        opacity: 0,
        scale: 0.2,
        xPercent: 70,
      },
      {
        opacity: 1,
        scale: 1,
        xPercent: 0, 
        duration: 1,
        ease: "expo.inOut",
      }
    )
    
    tl.addPause()
    const exitTime = tl.duration()
    
    tl.to(tooltip, {
      yPercent: 400,
      rotation: "random([-90, 90, -45, 45, -180, 180])",
      opacity: 0,
      duration: 0.6
    })

    const handleEnter = () => {
      if (tl.time() < exitTime) {
        tl.play()
      } else {
        tl.restart()
      }
    }

    const handleLeave = () => {
      if (tl.time() < exitTime) {
        tl.reverse()
      } else {
        tl.invalidate().play()
      }
    }

    container.addEventListener("mouseenter", handleEnter)
    container.addEventListener("mouseleave", handleLeave)

    return () => {
      container.removeEventListener("mouseenter", handleEnter)
      container.removeEventListener("mouseleave", handleLeave)
      tl.kill()
    }
  }, [])

  return (
    <div className="relative z-[2] flex cursor-pointer" ref={containerRef}>
      <div 
        ref={tooltipRef}
        className="absolute right-[calc(100%+14px)] top-1/2 w-[160px] text-xs leading-snug p-[10px] bg-white rounded-[10px] pointer-events-none shadow-xl border border-admin-grey before:content-[''] before:absolute before:top-1/2 before:-translate-y-1/2 before:left-[100%] before:border-[8px] before:border-transparent before:border-l-white"
        style={{ opacity: 0 }}
      >
        <span className="font-[700] block text-[#3C91E6] mb-1">Exportar CSV</span>
        <span className="text-gray-700">Descarga métricas y tareas del dashboard.</span>
      </div>
      
      <button 
        onClick={onExport}
        className="h-[40px] px-[20px] rounded-[10px] bg-[#1a1a1a] text-white flex items-center justify-center gap-[10px] font-semibold outline-none shadow-md z-[2] transition-colors hover:bg-[#2a2a2a]"
      >
        <CloudDownload className="h-5 w-5" />
        <span className="text">Exportar Datos</span>
      </button>
    </div>
  )
}
