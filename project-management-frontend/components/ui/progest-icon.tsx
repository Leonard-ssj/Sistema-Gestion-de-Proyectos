import * as React from "react"
import { cn } from "@/lib/utils"

interface ProGestIconProps extends React.SVGProps<SVGSVGElement> {
  /** Tamaño total del ícono (width y height). Default: 32 */
  size?: number
}

/**
 * Ícono oficial de ProGest.
 * Carpeta 3D verde estilo macOS/iOS app-icon.
 * Úsalo en lugar de <FolderKanban> cada vez que representes la marca.
 */
export function ProGestIcon({ size = 32, className, ...rest }: ProGestIconProps) {
  const id = React.useId().replace(/:/g, "")
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 40 40"
      fill="none"
      aria-label="ProGest logo"
      className={cn("shrink-0", className)}
      {...rest}
    >
      <defs>
        {/* Fondo: gradiente verde fresco → verde esmeralda */}
        <linearGradient id={`${id}-bg`} x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse">
          <stop offset="0%"   stopColor="#4ade80" />
          <stop offset="100%" stopColor="#16a34a" />
        </linearGradient>

        {/* Sombra inferior del ícono */}
        <filter id={`${id}-shadow`} x="-10%" y="-10%" width="120%" height="120%">
          <feDropShadow dx="0" dy="2" stdDeviation="2" floodColor="#14532d" floodOpacity="0.35" />
        </filter>

        {/* Luz interior del folder (parte frontal) */}
        <linearGradient id={`${id}-front`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor="rgba(255,255,255,0.97)" />
          <stop offset="100%" stopColor="rgba(255,255,255,0.80)" />
        </linearGradient>

        {/* Luz del folder posterior / lomo (parte trasera, más tenue) */}
        <linearGradient id={`${id}-back`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor="rgba(255,255,255,0.45)" />
          <stop offset="100%" stopColor="rgba(255,255,255,0.22)" />
        </linearGradient>

        {/* Líneas de contenido interiores */}
        <linearGradient id={`${id}-line`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%"   stopColor="rgba(22,163,74,0.55)" />
          <stop offset="100%" stopColor="rgba(22,163,74,0.20)" />
        </linearGradient>

        {/* Brillo superior tipo gloss */}
        <linearGradient id={`${id}-gloss`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor="rgba(255,255,255,0.30)" />
          <stop offset="100%" stopColor="rgba(255,255,255,0)" />
        </linearGradient>
      </defs>

      {/* ── Fondo redondeado del app-icon ─────────────────────────────── */}
      <rect width="40" height="40" rx="10" fill={`url(#${id}-bg)`} filter={`url(#${id}-shadow)`} />

      {/* ── Brillo superior (gloss) ───────────────────────────────────── */}
      <rect x="0" y="0" width="40" height="20" rx="10" fill={`url(#${id}-gloss)`} />
      <rect x="0" y="10" width="40" height="10" fill={`url(#${id}-gloss)`} />

      {/* ── Folder posterior (lomo + tab) ─────────────────────────────── */}
      {/* Tab de la carpeta trasera */}
      <path
        d="M8 16 L8 18 L32 18 L32 16 C32 14.9 31.1 14 30 14 L18.5 14 L16.5 12 L10 12 C8.9 12 8 12.9 8 14 Z"
        fill={`url(#${id}-back)`}
      />
      {/* Cuerpo de la carpeta trasera */}
      <rect x="8" y="17" width="24" height="13" rx="1.5" fill={`url(#${id}-back)`} />

      {/* ── Folder principal (frente) ─────────────────────────────────── */}
      <rect x="8" y="19" width="24" height="13" rx="2" fill={`url(#${id}-front)`} />

      {/* ── Líneas de "archivos" interiores ──────────────────────────── */}
      <rect x="12" y="22.5" width="16" height="1.8" rx="0.9" fill={`url(#${id}-line)`} />
      <rect x="12" y="25.5" width="11" height="1.8" rx="0.9" fill={`url(#${id}-line)`} />
      <rect x="12" y="28.5" width="13" height="1.8" rx="0.9" fill={`url(#${id}-line)`} />
    </svg>
  )
}
