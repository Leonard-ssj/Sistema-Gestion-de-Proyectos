"use client"
import React, { useEffect, useRef } from "react"
import { animate, random } from "animejs"

export function InteractiveDotGrid({ className }: { className?: string }) {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!containerRef.current) return
    
    const container = containerRef.current
    const cells = Array.from(container.querySelectorAll('.dot-cell')) as HTMLElement[]
    
    let clicked = false
    let reset_all = false
    const pull_distance = 80 // Distancia elástica del cursor

    // 1. Guardar la posición inicial pura de cada dot
    const updateCellPositions = () => {
      cells.forEach((cell: any) => {
        const rect = cell.getBoundingClientRect()
        cell.center_position = {
          x: (rect.left + rect.right) / 2,
          y: (rect.top + rect.bottom) / 2,
        }
      })
    }

    // Pequeño timeout para asegurar que el DOM cargó las medidas
    setTimeout(updateCellPositions, 100)
    window.addEventListener('resize', updateCellPositions)

    // 2. Atracción elástica al Mouse (Físicas simuladas)
    const handlePointerMove = (e: PointerEvent | { clientX: number, clientY: number }) => {
      if (clicked) return

      const pointer_x = e.clientX
      const pointer_y = e.clientY
      
      if (pointer_x === undefined || pointer_y === undefined) return

      cells.forEach((cell: any) => {
        if (!cell.center_position) return
        
        const diff_x = pointer_x - cell.center_position.x
        const diff_y = pointer_y - cell.center_position.y
        const distance = Math.sqrt(diff_x * diff_x + diff_y * diff_y)

        if (distance < pull_distance) {
          const percent = 1 - (distance / pull_distance) // Invertido para que atraiga más en el centro
          cell.pulled = true
          animate(cell, {
            translateX: diff_x * percent * 0.5,
            translateY: diff_y * percent * 0.5,
            scale: 1.2, // Bonus: brilla/crece sutilmente cuando se acerca
            duration: 200,
            ease: 'outQuad'
          })
        } else {
          if (!cell.pulled) return
          cell.pulled = false
          animate(cell, {
            translateX: 0,
            translateY: 0,
            scale: 1,
            duration: 800,
            ease: 'spring(1, 80, 10, 0)'
          })
        }
      })

      if (reset_all) {
        reset_all = false
        animate(cells, {
          translateX: 0,
          translateY: 0,
          scale: 1,
          duration: 1000,
          ease: 'spring(1, 80, 10, 0)'
        })
      }
    }

    // 3. Explosión de gravedad simulada con AnimeJS (GSAP Physics2D Fallback)
    const handleCellClick = (e: MouseEvent, i: number) => {
      if (clicked) return
      clicked = true

      cells.forEach((cell: any, index: number) => {
        // Distribuimos la explosión como una fuente parabólica
        const angle = (Math.random() * 60 + 240) * (Math.PI / 180) // Ángulos hacia arriba
        const velocity = Math.random() * 400 + 400 
        
        animate(cell, {
          translateX: [
            { to: Math.cos(angle) * velocity, duration: 800, ease: 'outExpo' },
            { to: 0, duration: 800, delay: 200, ease: 'spring(1, 80, 10, 0)' }
          ],
          translateY: [
            { to: Math.sin(angle) * velocity, duration: 500, ease: 'outExpo' },
            { to: 800, duration: 1000, ease: 'inQuad' }, // Gravedad cayendo
            { to: 0, duration: 800, delay: 200, ease: 'spring(1, 80, 10, 0)' }
          ],
          rotate: [
            { to: random(-360, 360), duration: 1000 },
            { to: 0, duration: 800, delay: 200 }
          ],
          scale: [
            { to: 0.5, duration: 500 },
            { to: 1, duration: 800, delay: 1200 }
          ],
          delay: Math.abs(index - i) * 10, // Efecto "Stagger" radial desde donde clickeaste
          onComplete: () => {
            if (index === cells.length - 1) {
              clicked = false
              reset_all = true
              updateCellPositions()
              handlePointerMove({ clientX: -pull_distance, clientY: -pull_distance } as any)
            }
          }
        })
      })
    }

    window.addEventListener('pointermove', handlePointerMove as any)
    
    cells.forEach((cell: any, i) => {
      cell.addEventListener('pointerup', (e: MouseEvent) => handleCellClick(e, i))
    })

    return () => {
      window.removeEventListener('resize', updateCellPositions)
      window.removeEventListener('pointermove', handlePointerMove as any)
    }
  }, [])

  return (
    <div className={`fixed inset-0 overflow-hidden -z-10 pointer-events-auto flex justify-center items-center ${className || ''}`}>
      <div 
        ref={containerRef} 
        className="dot-grid-container flex flex-col gap-6 sm:gap-8 opacity-[0.18] select-none"
      >
        {Array.from({ length: 24 }).map((_, rowsIndex) => (
          <div key={`row-${rowsIndex}`} className="dot-row flex gap-6 sm:gap-8">
            {Array.from({ length: 46 }).map((_, cellIndex) => (
              <div 
                key={`cell-${rowsIndex}-${cellIndex}`} 
                className="dot-cell w-[5px] h-[5px] rounded-full bg-foreground cursor-pointer will-change-transform shadow-sm"
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}
