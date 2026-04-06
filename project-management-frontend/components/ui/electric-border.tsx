"use client"

import React, { useId } from "react"
import { cn } from "@/lib/utils"

interface ElectricBorderProps {
  children: React.ReactNode
  className?: string
  innerClassName?: string
}

/**
 * ElectricBorder - Versión DRAMÁTICA.
 * Implementa un efecto líquido/eléctrico mediante filtros SVG complejos y capas de brillo.
 * Basado en la referencia aportada por el usuario (Vladimir/FreeFrontend).
 */
export function ElectricBorder({
  children,
  className,
  innerClassName,
}: ElectricBorderProps) {
  const id = useId().replace(/:/g, "")

  return (
    <div className={cn("relative inline-flex items-center justify-center pt-1 px-1", className)}>
      <style dangerouslySetInnerHTML={{
        __html: `
        :root {
          --eb-primary: var(--primary);
          --eb-light: oklch(from var(--primary) l c h);
          --eb-gradient: oklch(from var(--primary) 0.3 calc(c / 2) h / 0.4);
        }

        .eb-card-container {
          padding: 1px;
          border-radius: 9999px; /* Forçado para badges redondos */
          position: relative;
          background: linear-gradient(
              -30deg,
              var(--eb-gradient),
              transparent,
              var(--eb-gradient)
            ),
            linear-gradient(
              to bottom,
              var(--background),
              var(--background)
            );
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .eb-inner-container {
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .eb-border-outer {
          border: 1px solid color-mix(in srgb, var(--eb-primary) 50%, transparent);
          border-radius: 9999px;
          padding: 1px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .eb-main-effect {
          position: absolute;
          inset: -2px;
          border-radius: inherit;
          border: 2px solid var(--eb-primary);
          filter: url(#turbulent-displace-${id});
          pointer-events: none;
          z-index: 2;
        }

        .eb-glow-1 {
          border: 1px solid color-mix(in srgb, var(--eb-primary) 60%, transparent);
          border-radius: inherit;
          position: absolute;
          inset: 0;
          filter: blur(1px);
          pointer-events: none;
        }

        .eb-glow-2 {
          border: 1px solid var(--eb-light);
          border-radius: inherit;
          position: absolute;
          inset: 0;
          filter: blur(4px);
          pointer-events: none;
        }

        .eb-overlay-1 {
          position: absolute;
          inset: 0;
          border-radius: inherit;
          opacity: 0.8;
          mix-blend-mode: overlay;
          transform: scale(1.1);
          filter: blur(8px);
          background: linear-gradient(-30deg, white, transparent 30%, transparent 70%, white);
          pointer-events: none;
        }

        .eb-background-glow {
          position: absolute;
          inset: 0;
          border-radius: inherit;
          filter: blur(16px);
          transform: scale(1.15);
          opacity: 0.25;
          z-index: -1;
          background: linear-gradient(-30deg, var(--eb-light), transparent, var(--eb-primary));
          pointer-events: none;
        }
      `}} />

      {/* ── Filtro SVG (Definición Global Única por ID) ── */}
      <svg width="0" height="0" className="absolute pointer-events-none opacity-0">
        <defs>
          <filter id={`turbulent-displace-${id}`} colorInterpolationFilters="sRGB" x="-20%" y="-20%" width="140%" height="140%">
            <feTurbulence type="turbulence" baseFrequency="0.015" numOctaves="8" result="noise1" seed="1" />
            <feOffset in="noise1" dx="0" dy="0" result="offsetNoise1">
              <animate attributeName="dy" values="100; 0" dur="8s" repeatCount="indefinite" calcMode="linear" />
            </feOffset>

            <feTurbulence type="turbulence" baseFrequency="0.015" numOctaves="8" result="noise2" seed="1" />
            <feOffset in="noise2" dx="0" dy="0" result="offsetNoise2">
              <animate attributeName="dy" values="0; -100" dur="8s" repeatCount="indefinite" calcMode="linear" />
            </feOffset>

            <feTurbulence type="turbulence" baseFrequency="0.015" numOctaves="8" result="noise1" seed="2" />
            <feOffset in="noise1" dx="0" dy="0" result="offsetNoise3">
              <animate attributeName="dx" values="100; 0" dur="8s" repeatCount="indefinite" calcMode="linear" />
            </feOffset>

            <feTurbulence type="turbulence" baseFrequency="0.015" numOctaves="8" result="noise2" seed="2" />
            <feOffset in="noise2" dx="0" dy="0" result="offsetNoise4">
              <animate attributeName="dx" values="0; -100" dur="8s" repeatCount="indefinite" calcMode="linear" />
            </feOffset>

            <feComposite in="offsetNoise1" in2="offsetNoise2" result="part1" />
            <feComposite in="offsetNoise3" in2="offsetNoise4" result="part2" />
            <feBlend in="part1" in2="part2" mode="color-dodge" result="combinedNoise" />

            <feDisplacementMap in="SourceGraphic" in2="combinedNoise" scale="22" xChannelSelector="R" yChannelSelector="B" />
          </filter>
        </defs>
      </svg>

      <div className={cn("eb-card-container", className)}>
        <div className="eb-inner-container">
          <div className="eb-border-outer">
            <div className="eb-main-effect" />
            <div className="eb-glow-1" />
            <div className="eb-glow-2" />
            <div className="eb-overlay-1" />
            <div className="eb-background-glow" />
            
            {/* ── Contenido ── */}
            <div className={cn("relative z-10 rounded-full px-4 py-1", innerClassName)}>
              {children}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
