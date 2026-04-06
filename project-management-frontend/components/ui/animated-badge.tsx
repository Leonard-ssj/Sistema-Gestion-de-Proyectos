"use client"

import { useEffect, useRef, type ReactNode } from "react"

interface AnimatedBadgeProps {
  icon?: ReactNode
  text: string
  className?: string
}

/**
 * Badge con animación de onda char-por-char usando anime.js waapi + splitText.
 * Cada letra sube y baja en cascada creando un efecto de ola continua.
 */
export function AnimatedBadge({ icon, text, className }: AnimatedBadgeProps) {
  const textRef = useRef<HTMLSpanElement>(null)
  const animationRef = useRef<Animation[]>([])

  useEffect(() => {
    if (!textRef.current) return

    let cancelled = false

    async function init() {
      const { waapi, stagger, splitText } = await import("animejs")
      if (cancelled || !textRef.current) return

      // Limpiar animaciones previas
      animationRef.current.forEach((a) => a.cancel())

      // Split de chars
      const { chars } = splitText(textRef.current, { words: false, chars: true })
      if (!chars || chars.length === 0) return

      // Estilo inline en cada char para overflow visible
      chars.forEach((c) => {
        ;(c as HTMLElement).style.display = "inline-block"
      })

      const animations = waapi.animate(chars as HTMLElement[], {
        translate: ["0 0", "0 -0.35rem"],
        delay: stagger(55),
        duration: 480,
        loop: true,
        alternate: true,
        ease: "inOut(2)",
      })

      // waapi.animate puede devolver un array o un solo objeto
      animationRef.current = Array.isArray(animations)
        ? (animations as Animation[])
        : [animations as unknown as Animation]
    }

    init()

    return () => {
      cancelled = true
      animationRef.current.forEach((a) => {
        try { a.cancel() } catch (_) {}
      })
    }
  }, [text])

  return (
    <div
      className={`inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/8 px-4 py-1.5 text-xs font-medium text-primary ${className ?? ""}`}
      style={{ overflow: "visible" }}
    >
      {icon}
      <span
        ref={textRef}
        style={{ display: "inline-flex", alignItems: "center", overflow: "visible", lineHeight: 1.6 }}
      >
        {text}
      </span>
    </div>
  )
}
