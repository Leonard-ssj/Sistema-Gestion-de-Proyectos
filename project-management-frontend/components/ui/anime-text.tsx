"use client"
import React, { useEffect, useRef, useState } from "react"
import { animate, stagger, splitText } from "animejs"
import { cn } from "@/lib/utils"

interface AnimeTextProps {
  text: string
  className?: string
  as?: React.ElementType
}

export function AnimeText({ text, className, as: Tag = "h2" }: AnimeTextProps) {
  const textRef = useRef<HTMLElement>(null)
  const [mounted, setMounted] = useState(false)

  // Prevenir discrepancias de hidratación forzando el render final en el cliente
  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted || !textRef.current) return

    // Bloqueo de seguridad para Strict Mode de React
    if (textRef.current.hasAttribute("data-anime-initialized")) return
    textRef.current.setAttribute("data-anime-initialized", "true")

    try {
      // 1. Utilizamos la función nativa de animejs v4 asegurando el nivel de palabras
      const { chars, words } = splitText(textRef.current, { words: true, chars: true })
      
      if (!chars || chars.length === 0) return

      // Proteger el layout: Evitar que una palabra se rompa en dos líneas (ej. p-ara)
      if (words) {
        words.forEach((word: HTMLElement) => {
          word.style.display = "inline-block"
          word.style.whiteSpace = "nowrap"
          // Mantener al menos un margen natural en caso de espacios vacios
          if (word.innerHTML.includes("&nbsp;")) word.style.minWidth = "0.25em"
        })
      }

      // 2. Aplicar propiedades CSS seguras para evitar colapso de layout a las letras
      chars.forEach((char: HTMLElement) => {
        char.style.display = "inline-block"
        // Ocultar al inicio para evitar que se vea el texto antes del salto
        if (char.innerHTML !== " " && char.innerHTML !== "&nbsp;") {
          char.style.opacity = "0" 
        }
      })

      // 3. Ejecutar física de animación estricta solicitada
      animate(chars, {
        opacity: [0, 1], // Fundido de entrada suave
        y: [20, 0], // Ligera revelación de abajo hacia arriba
        scale: [0.8, 1], // Crecimiento orgánico
        duration: 1400, // Tiempo extendido y lujoso
        delay: stagger(60, { start: 100 }), // Efecto cascada relajado
        ease: 'outQuart', // Matemática de frenado progresivo
        loopDelay: 8000, // Pausa muy extensa para no distraer la lectura
        loop: true
      })
      
    } catch (e) {
      console.error("Anime.js animation failed:", e)
    }

  }, [mounted])

  if (!mounted) {
    // Retornamos el elemento estático idéntico durante SSR para evitar errores
    return (
      <Tag className={cn(className, "opacity-0")}>
        {text}
      </Tag>
    )
  }

  return (
    <Tag ref={textRef} className={className}>
      {text}
    </Tag>
  )
}
