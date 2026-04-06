"use client"

import React from "react"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

interface LogoProps {
  className?: string
  showText?: boolean
  size?: number
}

/**
 * Logo - La identidad visual central de ProGest.
 * Utiliza una versión estática y optimizada del folder con gradientes dinámicos del tema.
 */
export function Logo({ className, showText = true, size = 32 }: LogoProps) {
  return (
    <div className={cn("flex items-center gap-2.5", className)}>
      <motion.div
        className="relative shrink-0"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        style={{ width: size, height: size }}
      >
        {/* Glow sutil — mismo color que el tema */}
        <div 
          className="absolute inset-[-4px] rounded-full blur-[8px] opacity-20 pointer-events-none"
          style={{ backgroundColor: "var(--primary)" }}
        />

        {/* Backdrop / Fuelle del folder */}
        <svg viewBox="0 0 48 48" className="absolute inset-0 w-full h-full opacity-60">
          <path
            d="M 3.5 7.5 C 3.5 5.29 5.28 3.5 7.49 3.5 C 13.17 3.5 23.18 3.5 26 3.5 C 30 3.5 28 6 32 6 C 34.21 6 37.87 6 40.71 6 C 42.93 6 44.73 7.82 44.71 10.04 L 44.54 25.04 C 44.52 27.24 42.74 29 40.54 29 H 7.5 C 5.29 29 3.5 27.21 3.5 25 V 7.5 Z"
            fill="var(--primary)"
          />
        </svg>

        {/* Cara frontal con degradado */}
        <svg viewBox="0 0 48 48" className="relative inset-0 w-full h-full drop-shadow-[0_2px_4px_rgba(0,0,0,0.1)]">
          <defs>
            <linearGradient id="logoGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop 
                offset="0%" 
                style={{ stopColor: "color-mix(in srgb, var(--primary), white 20%)", stopOpacity: 1 }} 
              />
              <stop 
                offset="100%" 
                style={{ stopColor: "color-mix(in srgb, var(--primary), black 10%)", stopOpacity: 1 }} 
              />
            </linearGradient>
          </defs>
          <path
            d="M 2.36 24.31 C 2.17 23.09 3.11 22 4.34 22 H 40.9 C 41.8 22 42.33 23 41.83 23.75 L 41.4 24.4 C 41.16 24.76 41.16 25.24 41.4 25.6 V 25.6 C 41.73 26.1 42.4 26.23 42.9 25.9 L 43.5 25.5 V 25.5 C 44.75 24.88 46.17 25.93 45.94 27.31 L 43.57 41.17 C 43.24 43.09 41.57 44.5 39.63 44.5 H 8.93 C 6.95 44.5 5.28 43.06 4.97 41.11 L 2.36 24.31 Z"
            fill="url(#logoGradient)"
          />
        </svg>
      </motion.div>

      {showText && (
        <span className="text-xl font-black tracking-tighter leading-none italic select-none">
          Pro<span className="text-primary italic">Gest</span>
        </span>
      )}
    </div>
  )
}
