"use client"

import React, { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"

interface AnimatedFolderProps {
  hasLink?: boolean
  className?: string
  size?: number
}

/**
 * AnimatedFolder - Un componente de folder interactivo y "Theme-Aware".
 * Implementa una animación de apertura, caída de documentos y partículas.
 */
export function AnimatedFolder({
  hasLink = false,
  className,
  size = 100,
}: AnimatedFolderProps) {
  const [isHovered, setIsHovered] = useState(false)

  // Desactivar animaciones complejas si hasLink es true
  const canAnimate = !hasLink

  return (
    <div
      className={cn("relative flex items-center justify-center select-none cursor-pointer", className)}
      style={{ width: size, height: size }}
      onMouseEnter={() => canAnimate && setIsHovered(true)}
      onMouseLeave={() => canAnimate && setIsHovered(false)}
    >
      {/* ── Folder Back (La parte de atrás) ── */}
      <motion.svg
        viewBox="0 0 48 48"
        className="absolute inset-0 w-full h-full"
        animate={{
          scaleY: isHovered ? 1.05 : 1,
        }}
        transition={{ type: "spring", stiffness: 300, damping: 15 }}
      >
        <path
          d="
            M  3.50  7.50
            C  3.50  5.29   5.28  3.50   7.49  3.50
            C 13.17  3.50  23.18  3.50  26.00  3.50
            C 30.00  3.50  28.00  6.00  32.00  6.00
            C 34.21  6.00  37.87  6.00  40.71  6.00
            C 42.93  6.00  44.73  7.82  44.71 10.04
            L 44.54 25.04
            C 44.52 27.24  42.74 29.00  40.54 29.00
            H  7.50
            C  5.29 29.00   3.50 27.21   3.50 25.00
            V  7.50
            Z
          "
          fill="var(--primary)"
          style={{ opacity: 0.8 }}
        />
      </motion.svg>

      {/* ── Documentos / Páginas (Interior) ── */}
      <AnimatePresence>
        {isHovered && (
          <>
            {/* Página 1 (Fija al abrir) */}
            <motion.div
              key="page-1"
              initial={{ y: 0, scale: 0.7, opacity: 0 }}
              animate={{ y: -20, scale: 0.85, opacity: 1 }}
              exit={{ y: 0, scale: 0.7, opacity: 0 }}
              className="absolute w-[55%] h-[55%] bg-card rounded-[4px] shadow-lg border border-border/50 z-10"
              transition={{ delay: 0.1 }}
            />
            
            {/* Página 2 (La que cae/vuela) */}
            <motion.div
              key="page-2"
              initial={{ y: -60, scale: 0.5, opacity: 0 }}
              animate={{ y: -10, scale: 0.95, opacity: 1 }}
              exit={{ y: 20, scale: 0.5, opacity: 0 }}
              className="absolute w-[65%] h-[40%] bg-white dark:bg-slate-200 rounded-[6px] shadow-xl z-20"
              transition={{ 
                y: { type: "spring", stiffness: 200, damping: 20 },
                opacity: { duration: 0.2 }
              }}
            />
          </>
        )}
      </AnimatePresence>

      {/* ── Folder Front (La solapa) ── */}
      <motion.svg
        viewBox="0 0 48 48"
        className="absolute inset-0 w-full h-full z-30 drop-shadow-2xl"
        animate={{
          scaleY: isHovered ? 0.85 : 1,
          skewX: isHovered ? -2 : 0,
        }}
        transition={{ type: "spring", stiffness: 350, damping: 12 }}
      >
        <defs>
          <linearGradient id="folderGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop 
              offset="0%" 
              style={{ stopColor: "color-mix(in srgb, var(--primary), white 25%)", stopOpacity: 1 }} 
            />
            <stop 
              offset="100%" 
              style={{ stopColor: "color-mix(in srgb, var(--primary), black 15%)", stopOpacity: 1 }} 
            />
          </linearGradient>
        </defs>
        <path
          d="
            M  2.36 24.31
            C  2.17 23.09   3.11 22.00   4.34 22.00
            H 40.90
            C 41.80 22.00  42.33 23.00  41.83 23.75
            L 41.40 24.40
            C 41.16 24.76  41.16 25.24  41.40 25.60
            V 25.60
            C 41.73 26.10  42.40 26.23  42.90 25.90
            L 43.50 25.50
            V 25.50
            C 44.75 24.88  46.17 25.93  45.94 27.31
            L 43.57 41.17
            C 43.24 43.09  41.57 44.50  39.63 44.50
            H  8.93
            C  6.95 44.50   5.28 43.06   4.97 41.11
            L  2.36 24.31
            Z
          "
          fill="url(#folderGradient)"
        />
      </motion.svg>
      
      {/* ── Partículas sutiles (Fondo) ── */}
      {isHovered && canAnimate && (
        <div className="absolute inset-0 pointer-events-none">
           {[...Array(4)].map((_, i) => (
             <motion.div
               key={i}
               className="absolute bg-primary rounded-full opacity-20"
               initial={{ scale: 0, x: 0, y: 0 }}
               animate={{ 
                 scale: [0, 1.5, 0],
                 x: (i % 2 === 0 ? 1 : -1) * 30 * Math.random(),
                 y: -40 * Math.random() - 20
               }}
               transition={{ 
                 duration: 1.5, 
                 repeat: Infinity, 
                 delay: i * 0.3 
               }}
               style={{ width: 8, height: 8 }}
             />
           ))}
        </div>
      )}
    </div>
  )
}
