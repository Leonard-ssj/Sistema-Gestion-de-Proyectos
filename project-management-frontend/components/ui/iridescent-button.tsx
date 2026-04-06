"use client"

import { useRef, type MouseEvent, type ReactNode, type CSSProperties } from "react"
import { cn } from "@/lib/utils"

interface IridescentButtonProps {
  children: ReactNode
  className?: string
  variant?: "default" | "ghost"
  size?: "sm" | "md" | "lg"
  onClick?: () => void
  href?: string
  type?: "button" | "submit"
  disabled?: boolean
}

export function IridescentButton({
  children,
  className,
  variant = "default",
  size = "sm",
  onClick,
  type = "button",
  disabled,
}: IridescentButtonProps) {
  const btnRef = useRef<HTMLButtonElement>(null)

  function handlePointerMove(e: MouseEvent<HTMLButtonElement>) {
    const el = btnRef.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    const centerX = rect.left + rect.width / 2
    const centerY = rect.top + rect.height / 2
    el.style.setProperty("--coord-x", String(e.clientX - centerX))
    el.style.setProperty("--coord-y", String(centerY - e.clientY))
  }

  function handlePointerLeave() {
    const el = btnRef.current
    if (!el) return
    el.style.setProperty("--coord-x", "0")
    el.style.setProperty("--coord-y", "0")
  }

  const isGhost = variant === "ghost"

  return (
    <>
      <style>{`
        @property --irid-shadow-opacity  { syntax:"<number>"; inherits:true; initial-value:0; }
        @property --irid-shadow-spread   { syntax:"<number>"; inherits:true; initial-value:0; }
        @property --irid-bg-opacity      { syntax:"<number>"; inherits:true; initial-value:0; }
        @property --irid-after-opacity   { syntax:"<number>"; inherits:true; initial-value:0; }
        @property --coord-y              { syntax:"<number>"; inherits:true; initial-value:0; }
        @property --coord-x              { syntax:"<number>"; inherits:true; initial-value:0; }

        .irid-btn {
          --coord-y: 0;
          --coord-x: 0;
          --irid-shadow-opacity: 0;
          --irid-shadow-spread: 0;
          --irid-bg-opacity: 0;
          --irid-after-opacity: 0;

          --c-red:    hsl(3   93% 48% / var(--irid-bg-opacity));
          --c-orange: hsl(26  91% 52% / var(--irid-bg-opacity));
          --c-olive:  hsl(65  89% 46% / var(--irid-bg-opacity));
          --c-lime:   hsl(122 86% 48% / var(--irid-bg-opacity));
          --c-teal:   hsl(181 78% 50% / var(--irid-bg-opacity));
          --c-blue:   hsl(219 95% 56% / var(--irid-bg-opacity));
          --c-purple: hsl(269 95% 56% / var(--irid-bg-opacity));
          --c-pink:   hsl(327 96% 47% / var(--irid-bg-opacity));

          --irid-gradient: conic-gradient(from 180deg,
            var(--c-red)    0%,
            var(--c-orange) 12.5%,
            var(--c-olive)  25%,
            var(--c-lime)   37.5%,
            var(--c-teal)   50%,
            var(--c-blue)   62.5%,
            var(--c-purple) 75%,
            var(--c-pink)   87.5%,
            var(--c-red)    100%
          );

          --irid-timing:
            --coord-y             .07s linear,
            --coord-x             .07s linear,
            --irid-shadow-opacity .28s ease,
            --irid-shadow-spread  .28s ease,
            --irid-bg-opacity     .28s ease,
            --irid-after-opacity  .28s ease,
            box-shadow            .28s ease,
            background-image      .28s ease;

          all: unset;
          cursor: pointer;
          border-radius: 0.75rem;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          position: relative;
          overflow: hidden;
          font-weight: 600;
          font-family: inherit;
          transition: var(--irid-timing);
          background-image: var(--irid-gradient);
          box-shadow: 0 8px calc(var(--irid-shadow-spread) * 1px) -8px
            rgb(0 0 0 / calc(var(--irid-shadow-opacity) * 1%));
        }

        .irid-btn::after {
          content: '';
          pointer-events: none;
          display: block;
          position: absolute;
          border-radius: 0.75rem;
          width: 180%;
          height: 180%;
          background-image: var(--irid-gradient);
          filter: saturate(2) blur(5px);
          transform: translate(
            calc(var(--coord-x) / 1.5 * 1px),
            calc(var(--coord-y) / 1.5 * -1px)
          );
          opacity: calc(var(--irid-after-opacity) / 3);
          transition: var(--irid-timing);
        }

        .irid-btn:hover {
          --irid-shadow-opacity: 18;
          --irid-shadow-spread: 18;
          --irid-after-opacity: 0.7;
          --irid-bg-opacity: 0.18;
        }
        .irid-btn:active {
          --irid-shadow-opacity: 28;
          --irid-shadow-spread: 28;
          --irid-after-opacity: 0.9;
          --irid-bg-opacity: 0.28;
        }

        .irid-inner {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          border-radius: 0.6rem;
          pointer-events: none;
          position: relative;
          z-index: 1;
        }

        /* ---- SIZE variants ---- */
        .irid-btn-sm .irid-inner { padding: 0.3rem 0.75rem; font-size: 0.875rem; }
        .irid-btn-md .irid-inner { padding: 0.45rem 1rem;   font-size: 0.9375rem; }
        .irid-btn-lg .irid-inner { padding: 0.6rem 1.4rem;  font-size: 1rem; }

        /* ---- DEFAULT (solid) ---- */
        .irid-btn-default .irid-inner {
          background: hsl(var(--primary));
          color: hsl(var(--primary-foreground));
          box-shadow:
            inset 0 2px 1px rgb(255 255 255 / 20%),
            inset 0 -2px 3px rgb(0 0 0 / 12%);
        }

        /* ---- GHOST (outline style) ---- */
        .irid-btn-ghost {
          background-image: var(--irid-gradient);
          border: 1px solid rgb(255 255 255 / 10%);
        }
        .irid-btn-ghost .irid-inner {
          background: hsl(var(--background) / 0.85);
          color: hsl(var(--foreground));
          box-shadow:
            inset 0 2px 1px rgb(255 255 255 / 8%),
            inset 0 -2px 3px rgb(0 0 0 / 6%);
          backdrop-filter: blur(4px);
        }
      `}</style>

      <button
        ref={btnRef}
        type={type}
        disabled={disabled}
        onClick={onClick}
        onPointerMove={handlePointerMove}
        onPointerLeave={handlePointerLeave}
        className={cn(
          "irid-btn",
          `irid-btn-${size}`,
          `irid-btn-${variant}`,
          disabled && "opacity-50 cursor-not-allowed",
          className
        )}
      >
        <div className="irid-inner">{children}</div>
      </button>
    </>
  )
}
