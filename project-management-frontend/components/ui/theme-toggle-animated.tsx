"use client"

import * as React from "react"
import { useTheme } from "next-themes"
import { cn } from "@/lib/utils"

export function ThemeToggleAnimated() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)

  // Evitar hydration mismatch
  React.useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return <div className="w-12 h-6 rounded-full bg-slate-950/20 animate-pulse" />
  }

  const isLight = theme === "light"

  const toggleTheme = (event: React.MouseEvent | React.ChangeEvent) => {
    const nextTheme = isLight ? "dark" : "light"
    
    // Si el navegador no soporta View Transitions, simplemente cambiamos el tema
    if (!document.startViewTransition) {
      setTheme(nextTheme)
      return
    }

    // Calculamos la posición del clic para que el círculo se expanda desde allí
    // Si no es un evento de ratón (ej. teclado), usamos el centro del botón
    let x = 0
    let y = 0
    
    if ("clientX" in event) {
      x = event.clientX
      y = event.clientY
    } else {
      const rect = event.target instanceof HTMLElement ? event.target.getBoundingClientRect() : { left: 0, top: 0, width: 0, height: 0 }
      x = rect.left + rect.width / 2
      y = rect.top + rect.height / 2
    }

    // Seteamos las variables CSS en el root para que el keyframe las use
    document.documentElement.style.setProperty("--circle-x", `${x}px`)
    document.documentElement.style.setProperty("--circle-y", `${y}px`)

    // Iniciamos la transición de vista de la web
    document.startViewTransition(() => {
      setTheme(nextTheme)
    })
  }

  return (
    <div className="relative inline-flex items-center">
      <input
        type="checkbox"
        id="theme-toggle"
        className="peer hidden"
        checked={isLight}
        onChange={toggleTheme}
      />
      <label
        htmlFor="theme-toggle"
        onClick={(e) => {
          // Prevenimos el click normal para manejarlo nosotros con las coordenadas
          e.preventDefault()
          toggleTheme(e)
        }}
        className={cn(
          "relative block h-7 w-14 cursor-pointer rounded-full p-1 transition-all duration-1000",
          "bg-slate-950 border border-white/10 shadow-inner shadow-black/50",
          "peer-checked:bg-[#568eef]"
        )}
      >
        <div
          className={cn(
            "relative h-5 w-5 rounded-full transition-all duration-1000 ease-in-out",
            "bg-gray-100 shadow-[0_0_15px_rgba(255,255,255,0.8)]",
            "peer-checked:translate-x-7 peer-checked:bg-[#f4e94e] peer-checked:shadow-[0_0_20px_rgba(249,240,104,1)]",
            "translate-x-0"
          )}
          style={{
            transform: isLight ? "translateX(28px)" : "translateX(0)",
            backgroundColor: isLight ? "#f4e94e" : "#f1f5f9",
            boxShadow: isLight ? "0 0 20px rgba(249,240,104,1)" : "0 0 15px rgba(255,255,255,0.8)"
          }}
        >
          <div className={cn("transition-all duration-1000", isLight ? "opacity-0 scale-0" : "opacity-100 scale-100")}>
            <div className="absolute top-3 left-1 h-1 w-1 rounded-full bg-gray-300/50" />
            <div className="absolute top-3.5 left-2.5 h-0.5 w-0.5 rounded-full bg-gray-300/50" />
            <div className="absolute top-1.5 left-2.5 h-1.5 w-1.5 rounded-full bg-gray-300/50" />
          </div>
        </div>
      </label>
    </div>
  )
}
