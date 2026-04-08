"use client"

import { useEffect, useRef, useState } from "react"

// ── Contenido de ProGest adaptado al modal ───────────────────────────────────
const MODAL_TITLE    = "Arquitectura de Gestión Integral"
const MODAL_VERSION  = "v001.progest-enterprise"
const MODAL_BODY_P1  = "Componentes estrictos para el control del ciclo de vida de cualquier proyecto o desarrollo corporativo. Cada módulo opera con permisos granulares, trazabilidad de cambios y sincronización en tiempo real."
const MODAL_BODY_P2  = "¿Deseas explorar el Dashboard de ProGest ahora mismo?"
const MODAL_CONFIRM_HREF = "/auth/register"

// ── Letras del botón desglosadas para el glitch ──────────────────────────────
const TRIGGER_LETTERS = ["E", "x", "p", "l", "o", "r", "a", "r"]

export function CyberModal() {
  const [open, setOpen]           = useState(false)
  const [action, setAction]       = useState<"Proceed" | "Cancel" | null>(null)
  const [upgrading, setUpgrading] = useState(false)
  const [glitching, setGlitching] = useState(false)

  const glitchRef  = useRef<HTMLDivElement>(null)
  const glitchTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  // ── Audio (solo cliente) ───────────────────────────────────────────────────
  const audio = useRef<{
    slide: HTMLAudioElement | null
    accept: HTMLAudioElement | null
    reject: HTMLAudioElement | null
  }>({ slide: null, accept: null, reject: null })

  useEffect(() => {
    if (typeof window === "undefined") return
    audio.current.slide  = new Audio("https://cdn.freesound.org/previews/367/367997_6512973-lq.mp3")
    audio.current.accept = new Audio("https://cdn.freesound.org/previews/220/220166_4100837-lq.mp3")
    audio.current.reject = new Audio("https://cdn.freesound.org/previews/657/657950_6142149-lq.mp3")
  }, [])

  // ── Glitch loop cuando el modal está abierto ───────────────────────────────
  const scheduleGlitch = (firstTime: boolean) => {
    const delay = firstTime ? 1500 : Math.random() * 10_000 + 2_000
    glitchTimer.current = setTimeout(() => {
      setGlitching(true)
      setTimeout(() => {
        setGlitching(false)
        scheduleGlitch(false)
      }, 2000)
    }, delay)
  }

  // ── Abrir modal ────────────────────────────────────────────────────────────
  const openModal = () => {
    setOpen(true)
    setAction(null)
    setTimeout(() => {
      audio.current.slide && (audio.current.slide.currentTime = 0, audio.current.slide.play().catch(() => {}))
    }, 200)
    scheduleGlitch(true)
  }

  // ── Cerrar modal ───────────────────────────────────────────────────────────
  const closeModal = (act: "Proceed" | "Cancel") => {
    setAction(act)
    if (glitchTimer.current) clearTimeout(glitchTimer.current)
    setGlitching(false)
    const sfx = act === "Proceed" ? audio.current.accept : audio.current.reject
    if (sfx) { sfx.currentTime = 0; sfx.play().catch(() => {}) }
    setTimeout(() => {
      setOpen(false)
      setAction(null)
      if (act === "Proceed") window.location.href = MODAL_CONFIRM_HREF
    }, 400)
  }

  // ── Trigger de botón con animación de glitch ───────────────────────────────
  const handleTrigger = () => {
    if (open || upgrading) return
    setUpgrading(true)
    setTimeout(() => {
      setUpgrading(false)
      openModal()
    }, 600)
  }

  // ── Teclado global ────────────────────────────────────────────────────────
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "u" || e.key === "U") handleTrigger()
    }
    window.addEventListener("keydown", handleKey)
    return () => window.removeEventListener("keydown", handleKey)
  })

  useEffect(() => {
    if (!open) return
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeModal("Cancel")
      else if (e.key === "Enter") closeModal("Proceed")
    }
    window.addEventListener("keydown", handleKey)
    return () => window.removeEventListener("keydown", handleKey)
  }, [open])

  return (
    <>
      <style>{`
        /* ── Cyber fuente ── */
        @font-face {
          font-family: Cyber;
          src: url('https://assets.codepen.io/605876/Blender-Pro-Bold.otf');
          font-display: swap;
        }

        /* ── Variables de tema (consumen shadcn/ui) ── */
        .cyber-root {
          --accent:  hsl(var(--primary));
          --shadow:  hsl(var(--primary) / 0.5);
          --border:  2px;
          --corner:  12px;
          --clip: polygon(
            0 0, 100% 0,
            100% calc(100% - var(--corner)),
            calc(100% - var(--corner)) 100%,
            0 100%
          );
          font-family: Cyber, 'SF Pro Text', sans-serif;
        }

        /* ── Clip paths de glitch ── */
        .cyber-glitch-btn {
          --shimmy-distance: 5;
          --clip-one:   polygon(0 2%,100% 2%,100% 95%,95% 95%,95% 90%,85% 90%,85% 95%,8% 95%,0 70%);
          --clip-two:   polygon(0 78%,100% 78%,100% 100%,95% 100%,95% 90%,85% 90%,85% 100%,8% 100%,0 78%);
          --clip-three: polygon(0 44%,100% 44%,100% 54%,95% 54%,85% 54%,8% 54%,0 54%);
          --clip-four:  polygon(0 0,100% 0,100% 0,95% 0,85% 0,8% 0,0 0);
          --clip-five:  polygon(0 0,100% 0,100% 0,95% 0,85% 0,8% 0,0 0);
          --clip-six:   polygon(0 40%,100% 40%,100% 85%,95% 85%,85% 85%,8% 85%,0 70%);
          --clip-seven: polygon(0 63%,100% 63%,100% 80%,95% 80%,85% 80%,8% 80%,0 70%);
        }

        .cyber-modal-glitch {
          --shimmy-distance: 2;
          --clip-one:   polygon(0 2%,100% 2%,100% 95%,95% 95%,95% 90%,85% 90%,85% 95%,8% 95%,0 70%);
          --clip-two:   polygon(0 78%,100% 78%,100% 100%,95% 100%,95% 90%,85% 90%,85% 100%,8% 100%,0 78%);
          --clip-three: polygon(0 44%,100% 44%,100% 54%,95% 54%,85% 54%,8% 54%,0 54%);
          --clip-four:  polygon(0 0,100% 0,100% 0,95% 0,85% 0,8% 0,0 0);
          --clip-five:  polygon(0 0,100% 0,100% 0,95% 0,85% 0,8% 0,0 0);
          --clip-six:   polygon(0 40%,100% 40%,100% 85%,95% 85%,85% 85%,8% 85%,0 70%);
          --clip-seven: polygon(0 63%,100% 63%,100% 80%,95% 80%,85% 80%,8% 80%,0 70%);
        }

        @keyframes cyber-glitch {
          0%                    { clip-path: var(--clip-one); }
          2%,8%                 { clip-path: var(--clip-two);   transform: translateX(calc(var(--shimmy-distance) * -1%)); }
          6%                    { clip-path: var(--clip-two);   transform: translateX(calc(var(--shimmy-distance) * 1%)); }
          9%                    { clip-path: var(--clip-two);   transform: translateX(0); }
          10%                   { clip-path: var(--clip-three); transform: translateX(calc(var(--shimmy-distance) * 1%)); }
          13%                   { clip-path: var(--clip-three); transform: translateX(0); }
          14%,21%               { clip-path: var(--clip-four);  transform: translateX(calc(var(--shimmy-distance) * 1%)); }
          25%                   { clip-path: var(--clip-five);  transform: translateX(calc(var(--shimmy-distance) * 1%)); }
          30%                   { clip-path: var(--clip-five);  transform: translateX(calc(var(--shimmy-distance) * -1%)); }
          35%,45%               { clip-path: var(--clip-six);   transform: translateX(calc(var(--shimmy-distance) * -1%)); }
          40%                   { clip-path: var(--clip-six);   transform: translateX(calc(var(--shimmy-distance) * 1%)); }
          50%                   { clip-path: var(--clip-six);   transform: translateX(0); }
          55%                   { clip-path: var(--clip-seven); transform: translateX(calc(var(--shimmy-distance) * 1%)); }
          60%                   { clip-path: var(--clip-seven); transform: translateX(0); }
          31%,61%,100%          { clip-path: var(--clip-four); }
        }

        @keyframes cyber-flicker {
          0%   { opacity: 0; }
          100% { opacity: 1; }
        }

        @keyframes cyber-scan {
          0%   { transform: translateY(0);      opacity: 0.6; }
          45%  { transform: translateY(450%);   opacity: 0.6; }
          50%  { transform: translateY(450%);   opacity: 0;   }
          55%  { transform: translateY(0);      opacity: 0;   }
          100% { transform: translateY(0);      opacity: 0.6; }
        }

        /* ── Botón cyber ── */
        .cyber-btn {
          all: unset;
          cursor: pointer;
          position: relative;
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem 0.75rem;
          color: var(--accent);
          text-transform: uppercase;
          font-family: Cyber, sans-serif;
          overflow: hidden;
          border: 0;
          background: transparent;
          min-width: 140px;
        }
        .cyber-btn:is(:hover,:focus-visible) { color: canvas; }
        .cyber-btn:is(:hover,:focus-visible) .cyber-backdrop { background: var(--accent); }
        .cyber-btn:is(:hover,:focus-visible) kbd { color: var(--accent); }

        .cyber-backdrop {
          position: absolute;
          inset: 0;
          z-index: -1;
          clip-path: var(--clip);
          background: light-dark(hsl(0 0% 100% / 0.35), hsl(0 0% 0% / 0.35));
          backdrop-filter: saturate(180%) blur(6px);
          pointer-events: none;
        }
        .cyber-backdrop::before {
          content: '';
          position: absolute;
          inset: 0;
          background: var(--accent);
          border: var(--border) solid transparent;
          clip-path: var(--clip);
          mask: linear-gradient(#0000 0% 100%), linear-gradient(#fff 0% 100%);
          mask-clip: padding-box, border-box;
          mask-repeat: no-repeat;
          mask-composite: intersect;
          z-index: 2;
        }
        .cyber-corner {
          position: absolute;
          bottom: 0;
          right: 0;
          height: var(--corner);
          width: var(--corner);
        }
        .cyber-corner::after {
          content: '';
          height: calc(var(--border) * 2);
          width: 200%;
          position: absolute;
          top: 50%; left: 50%;
          translate: -50% -50%;
          transform: rotate(135deg);
          background: var(--accent);
        }

        .cyber-btn kbd {
          display: inline-grid;
          place-items: center;
          width: 22px;
          height: 22px;
          border-radius: 50%;
          background: var(--accent);
          color: canvas;
          font-size: 8px;
          font-weight: bold;
          flex-shrink: 0;
        }
        .cyber-btn kbd svg { width: 65%; }

        /* ── Glitch overlay en botón trigger ── */
        .cyber-btn-glitch {
          display: none;
          position: absolute;
          inset: 0;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem 0.75rem;
          pointer-events: none;
          color: var(--accent);
        }
        .cyber-btn-glitch .cyber-backdrop { background: canvas; }
        .cyber-btn:is(:hover,:focus-visible) .cyber-btn-glitch {
          display: flex;
          animation: cyber-glitch 2s infinite;
        }
        .cyber-btn-glitch kbd { opacity: 0; }
        .cyber-letters { display: flex; }
        .cyber-letters span:nth-of-type(2),
        .cyber-letters span:nth-of-type(5) { scale: 1 -1; }
        .cyber-letters span:nth-of-type(3),
        .cyber-letters span:nth-of-type(6),
        .cyber-letters span:nth-of-type(7) { scale: -1 -1; }

        /* ── Modal ── */
        .cyber-modal-overlay {
          position: fixed;
          inset: 0;
          z-index: 50;
          display: flex;
          align-items: center;
          justify-content: center;
          background: hsl(0 0% 0% / 0.5);
          backdrop-filter: blur(4px);
          animation: cyber-flicker 0.3s ease-out both;
        }
        .cyber-modal-overlay.closing {
          animation: cyber-flicker 0.25s ease-in reverse both;
        }

        .cyber-modal {
          position: relative;
          width: clamp(340px, 55vw, 500px);
          color: var(--accent);
          background: transparent;
          overflow: visible;
          font-family: Cyber, sans-serif;
        }
        .cyber-modal::before,
        .cyber-modal::after {
          content: '';
          position: absolute;
          top: 1px; bottom: 1px;
          right: 100%;
          width: 1rem;
          border: var(--border) solid var(--accent);
          translate: var(--border) 0;
          backdrop-filter: saturate(180%) blur(6px);
          animation: cyber-flicker 0.3s ease-out 0.2s both;
        }
        .cyber-modal::before {
          background: var(--accent);
          mask: linear-gradient(#fff, hsl(0 0% 100% / 0.6) 15% 95%, #fff);
        }

        .cyber-modal-body {
          backdrop-filter: saturate(180%) blur(8px);
          clip-path: inset(0 -4px 0 0);
          background: light-dark(hsl(0 0% 98% / 0.85), hsl(220 20% 8% / 0.9));
        }
        .cyber-modal-content {
          padding: 1.25rem;
          position: relative;
        }

        .cyber-modal h2 {
          padding-bottom: 0.5rem;
          margin: 0 0 0.75rem 0;
          text-transform: uppercase;
          font-size: 1.05rem;
          position: relative;
          letter-spacing: 0.05em;
        }
        .cyber-modal h2::after {
          content: '';
          height: var(--border);
          position: absolute;
          top: 100%; left: 0; right: 0;
          background: var(--accent);
        }

        .cyber-modal p {
          font-size: 0.78rem;
          line-height: 1.55;
          opacity: 0.85;
          margin: 0.5rem 0;
          font-family: 'SF Pro Text', sans-serif;
          letter-spacing: 0;
        }

        .cyber-version {
          position: absolute;
          right: 6px; top: 6px;
          font-size: 7px;
          opacity: 0.4;
        }

        /* glitch capa del modal */
        .cyber-modal-glitch {
          position: absolute;
          inset: 0;
          padding: 1.25rem;
          color: var(--shadow);
          z-index: -1;
          animation-duration: 2s;
          animation-timing-function: steps(1);
        }
        .cyber-modal-glitch.active {
          animation-name: cyber-glitch;
        }

        .cyber-modal-actions {
          display: flex;
          align-items: center;
          justify-content: flex-end;
          gap: 0.5rem;
          padding: 1rem 0 0;
          position: absolute;
          top: 100%;
          width: 100%;
        }

        /* side accent bar */
        .cyber-body-backdrop {
          position: absolute;
          inset: 0;
        }
        .cyber-body-backdrop::after {
          content: '';
          position: absolute;
          left: 100%;
          top: 2rem;
          width: calc(2 * var(--border));
          height: 40%;
          background: var(--accent);
          opacity: 0.7;
          clip-path: polygon(0 0, 0 100%, 100% calc(100% - 6px), 100% 6px);
        }
      `}</style>

      {/* ── Sección contenedor ─────────────────────────────────────────────── */}
      <section className="bg-background border-t">
        <div className="mx-auto max-w-[64rem] px-4 py-16 md:py-24 cyber-root">
          {/* Encabezado */}
          <div className="flex flex-col items-center text-center gap-4 mb-12">
            <div
              className="inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-xs font-medium mb-2"
              style={{ color: "var(--accent)", borderColor: "var(--accent)", opacity: 0.8 }}
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary" />
              </span>
              Sistema Activo — ProGest Enterprise
            </div>
            <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Arquitectura de gestión integral
            </h2>
            <p className="max-w-[42rem] text-muted-foreground sm:text-lg">
              Componentes estrictos para el control del ciclo de vida de cualquier proyecto o desarrollo corporativo.
            </p>
          </div>

          {/* ── Cards de módulos ─────────────────────────────────────────── */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-12">
            {[
              { title: "Dashboard Inteligente",  desc: "Métricas en tiempo real, actividad reciente, tareas vencidas y progreso general." },
              { title: "Gestión de Tareas",      desc: "Crea, asigna y prioriza con niveles de urgencia, checklists y comentarios." },
              { title: "Board Kanban",           desc: "Arrastra y suelta tarjetas entre columnas para visualizar el flujo de trabajo." },
              { title: "Timeline / Gantt",       desc: "Visualiza fechas de inicio y vencimiento en una línea de tiempo con progreso." },
              { title: "Reportes y Analítica",   desc: "Gráficos de distribución por estado, prioridad y exportación a CSV." },
              { title: "Seguridad por Roles",    desc: "Control de acceso granular: cada usuario ve solo lo que le corresponde." },
            ].map((m) => (
              <div
                key={m.title}
                className="rounded-xl border p-5 bg-card hover:bg-muted/20 transition-colors cursor-default group relative overflow-hidden"
                style={{ borderColor: "hsl(var(--primary) / 0.2)" }}
              >
                <div
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                  style={{ background: "radial-gradient(circle at 50% 0%, hsl(var(--primary) / 0.08), transparent 70%)" }}
                />
                <h3
                  className="font-bold text-sm mb-2 uppercase tracking-wider"
                  style={{ fontFamily: "Cyber, sans-serif", color: "var(--accent)" }}
                >
                  {m.title}
                </h3>
                <p className="text-xs text-muted-foreground leading-relaxed">{m.desc}</p>
                <div
                  className="absolute bottom-0 left-0 h-[2px] w-0 group-hover:w-full transition-all duration-500"
                  style={{ background: "var(--accent)" }}
                />
              </div>
            ))}
          </div>

          {/* ── Trigger Zone ─────────────────────────────────────────────── */}
          <div className="relative mt-4 flex flex-col items-center gap-6">
            {/* Banner glassmorphism con borde accent */}
            <div
              className="relative w-full max-w-2xl overflow-hidden rounded-xl border px-8 py-6 text-center"
              style={{
                borderColor: "hsl(var(--primary) / 0.5)",
                background: "light-dark(hsl(0 0% 100% / 0.06), hsl(220 20% 5% / 0.6))",
                backdropFilter: "saturate(180%) blur(12px)",
                boxShadow: "0 0 40px hsl(var(--primary) / 0.15), inset 0 0 0 1px hsl(var(--primary) / 0.1)",
              }}
            >
              {/* Línea de escaneo animada */}
              <div
                className="pointer-events-none absolute inset-x-0 top-0 h-[2px] opacity-60"
                style={{
                  background: "linear-gradient(90deg, transparent 0%, var(--accent) 50%, transparent 100%)",
                  animation: "cyber-scan 3s linear infinite",
                }}
              />
              {/* Corner decorativo */}
              <div className="absolute top-2 left-2 w-4 h-4 border-t-2 border-l-2" style={{ borderColor: "var(--accent)" }} />
              <div className="absolute top-2 right-2 w-4 h-4 border-t-2 border-r-2" style={{ borderColor: "var(--accent)" }} />
              <div className="absolute bottom-2 left-2 w-4 h-4 border-b-2 border-l-2" style={{ borderColor: "var(--accent)" }} />
              <div className="absolute bottom-2 right-2 w-4 h-4 border-b-2 border-r-2" style={{ borderColor: "var(--accent)" }} />

              {/* Hint text */}
              <p
                className="mb-5 text-sm tracking-[0.2em] uppercase"
                style={{ fontFamily: "Cyber, sans-serif", color: "hsl(var(--primary) / 0.85)" }}
              >
                Presiona&nbsp;
                <span
                  className="inline-grid place-items-center rounded font-black text-xs"
                  style={{
                    width: "26px", height: "26px",
                    background: "var(--accent)",
                    color: "#000",
                    boxShadow: "0 0 12px var(--accent), 0 0 4px var(--accent)",
                    fontFamily: "Cyber, monospace",
                    verticalAlign: "middle",
                    letterSpacing: 0,
                  }}
                >U</span>
                &nbsp;o haz clic para explorar el producto
              </p>

              {/* Botón principal grande */}
              <button
                className={"cyber-btn cyber-glitch-btn cyber-root" + (upgrading ? " opacity-60" : "")}
                aria-label="Explorar ProGest"
                onClick={handleTrigger}
                style={{
                  fontSize: "1.1rem",
                  padding: "0.7rem 2.5rem",
                  minWidth: "220px",
                  letterSpacing: "0.15em",
                  boxShadow: "0 0 20px hsl(var(--primary) / 0.3)",
                }}
              >
                <span className="cyber-backdrop"><span className="cyber-corner" /></span>
                <kbd style={{ width: 28, height: 28, fontSize: 10 }}>E</kbd>
                <span>Explorar ProGest</span>
                {/* Glitch overlay */}
                <div className="cyber-btn-glitch" aria-hidden>
                  <span className="cyber-backdrop"><span className="cyber-corner" /></span>
                  <kbd style={{ opacity: 0, width: 28, height: 28 }}>E</kbd>
                  <span className="cyber-letters">
                    {TRIGGER_LETTERS.map((l, i) => <span key={i}>{l}</span>)}
                  </span>
                </div>
              </button>

              {/* Sub-hint */}
              <p
                className="mt-4 text-[10px] tracking-widest uppercase"
                style={{ color: "hsl(var(--primary) / 0.4)", fontFamily: "Cyber, sans-serif" }}
              >
                Sistema ProGest Enterprise — v1.0.0
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Modal cyberpunk ──────────────────────────────────────────────────── */}
      {open && (
        <div
          className={"cyber-modal-overlay cyber-root" + (action ? " closing" : "")}
          onClick={(e) => { if (e.target === e.currentTarget) closeModal("Cancel") }}
          role="dialog"
          aria-modal="true"
          aria-label="Panel de arquitectura ProGest"
        >
          <div className="cyber-modal">
            {/* Cuerpo */}
            <div className="cyber-modal-body">
              <div className="cyber-body-backdrop" />
              <div className="cyber-modal-content">
                <div className="cyber-version">{MODAL_VERSION}</div>
                <h2><span>{MODAL_TITLE}</span></h2>
                <div>
                  <p>{MODAL_BODY_P1}</p>
                  <p>{MODAL_BODY_P2}</p>
                </div>
                {/* Capa glitch del contenido del modal */}
                <div
                  ref={glitchRef}
                  className={"cyber-modal-glitch" + (glitching ? " active" : "")}
                  aria-hidden
                >
                  <h2><span>{MODAL_TITLE}</span></h2>
                  <div>
                    <p>{MODAL_BODY_P1}</p>
                    <p>{MODAL_BODY_P2}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Acciones */}
            <div className="cyber-modal-actions">
              <button
                className="cyber-btn cyber-root"
                aria-label="Cancelar"
                data-action="Cancel"
                onClick={() => closeModal("Cancel")}
              >
                <span className="cyber-backdrop"><span className="cyber-corner" /></span>
                <kbd>esc</kbd>
                <span>Cancelar</span>
              </button>
              <button
                autoFocus
                className="cyber-btn cyber-root"
                aria-label="Proceder"
                data-action="Proceed"
                onClick={() => closeModal("Proceed")}
              >
                <span className="cyber-backdrop"><span className="cyber-corner" /></span>
                <kbd>
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 4v7a4 4 0 0 1-4 4H4" />
                    <path d="m9 10-5 5 5 5" />
                  </svg>
                </kbd>
                <span>Proceder</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
