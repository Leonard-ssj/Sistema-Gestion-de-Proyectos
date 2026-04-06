"use client"

import { useEffect, useRef } from "react"

export function InteractiveGridBg() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    let width = canvas.width = window.innerWidth
    let height = canvas.height = window.innerHeight

    const mouse = { x: -9999, y: -9999 }
    const squareSize = 80
    const grid: any[] = []
    let animationFrameId: number

    function initGrid() {
      grid.length = 0
      for (let x = 0; x < width; x += squareSize) {
        for (let y = 0; y < height; y += squareSize) {
          grid.push({
            x,
            y,
            alpha: 0,
            fading: false,
            lastTouched: 0,
          })
        }
      }
    }

    function getCellAt(x: number, y: number) {
      return grid.find(cell =>
        x >= cell.x && x < cell.x + squareSize &&
        y >= cell.y && y < cell.y + squareSize
      )
    }

    const handleResize = () => {
      width = canvas.width = window.innerWidth
      height = canvas.height = window.innerHeight
      initGrid()
    }

    const handleMouseMove = (e: MouseEvent) => {
      mouse.x = e.clientX
      mouse.y = e.clientY

      const cell = getCellAt(mouse.x, mouse.y)
      if (cell && cell.alpha === 0) {
        cell.alpha = 1
        cell.lastTouched = Date.now()
        cell.fading = false
      }
    }

    window.addEventListener("resize", handleResize)
    window.addEventListener("mousemove", handleMouseMove)

    function drawGrid() {
      if (!ctx || !canvas) return
      ctx.clearRect(0, 0, width, height)
      const now = Date.now()

      for (let i = 0; i < grid.length; i++) {
        const cell = grid[i]

        // Start fading after 500ms
        if (cell.alpha > 0 && !cell.fading && now - cell.lastTouched > 500) {
          cell.fading = true
        }

        if (cell.fading) {
          cell.alpha -= 0.02
          if (cell.alpha <= 0) {
            cell.alpha = 0
            cell.fading = false
          }
        }

        if (cell.alpha > 0) {
          const centerX = cell.x + squareSize / 2
          const centerY = cell.y + squareSize / 2

          const gradient = ctx.createRadialGradient(
            centerX, centerY, 5,
            centerX, centerY, squareSize
          )
          
          // Using #3C91E6 (Info Blue) to match system aesthetics
          gradient.addColorStop(0, `rgba(60, 145, 230, ${cell.alpha * 0.8})`)
          gradient.addColorStop(1, `rgba(60, 145, 230, 0)`)

          ctx.strokeStyle = gradient
          ctx.lineWidth = 1.3
          ctx.strokeRect(cell.x + 0.5, cell.y + 0.5, squareSize - 1, squareSize - 1)
        }
      }

      animationFrameId = requestAnimationFrame(drawGrid)
    }

    initGrid()
    drawGrid()

    return () => {
      window.removeEventListener("resize", handleResize)
      window.removeEventListener("mousemove", handleMouseMove)
      cancelAnimationFrame(animationFrameId)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full pointer-events-none z-[0] opacity-50 dark:opacity-100 mix-blend-multiply dark:mix-blend-screen"
    />
  )
}
