"use client"

import { MarketingHeader } from "@/components/marketing/marketing-header"
import { GsapLoader } from "@/components/ui/gsap-loader"
import Link from "next/link"
import { ArrowUpRight, Mail } from "lucide-react"
import { Logo } from "@/components/ui/logo"
import { motion } from "framer-motion"

const footerLinks = [
  {
    title: "Producto",
    links: [
      { label: "Características", href: "/product" },
      { label: "Planes y Precios", href: "/plans" },
      { label: "Seguridad", href: "/security" },
      { label: "Novedades", href: "/product" },
    ],
  },
  {
    title: "Compañía",
    links: [
      { label: "Acerca de", href: "/about" },
      { label: "Blog", href: "/about" },
      { label: "Contacto", href: "/contact" },
      { label: "FAQ", href: "/faq" },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Privacidad", href: "#" },
      { label: "Términos", href: "#" },
      { label: "Cookies", href: "#" },
    ],
  },
]

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <MarketingHeader />
      <main className="flex-1">{children}</main>

      {/* ── CSS por tema — el selector apunta al <footer id="pg-footer"> ── */}
      <style>{`
        #pg-footer {
          background:
            radial-gradient(ellipse 80% 60% at 20% 120%, #1D7AFC1a 0%, transparent 60%),
            radial-gradient(ellipse 60% 50% at 80% 115%, #60a5fa12 0%, transparent 55%),
            radial-gradient(ellipse 100% 40% at 50% 105%, #93c5fd0d 0%, transparent 50%),
            #F7F8F9;
        }
        [data-theme="dark"] #pg-footer {
          background:
            radial-gradient(ellipse 80% 60% at 15% 125%, #1D7AFC26 0%, transparent 60%),
            radial-gradient(ellipse 70% 55% at 88% 118%, #3b82f61a 0%, transparent 55%),
            radial-gradient(ellipse 90% 35% at 50% 108%, #0ea5e910 0%, transparent 50%),
            #101214;
        }
        [data-theme="sunset"] #pg-footer {
          background:
            radial-gradient(ellipse 80% 60% at 20% 125%, #C0AB9226 0%, transparent 60%),
            radial-gradient(ellipse 60% 50% at 80% 120%, #d4b8961a 0%, transparent 55%),
            radial-gradient(ellipse 90% 40% at 50% 108%, #a8976a12 0%, transparent 50%),
            #151c19;
        }
        [data-theme="sunrise"] #pg-footer {
          background:
            radial-gradient(ellipse 80% 60% at 20% 125%, #a04d6622 0%, transparent 60%),
            radial-gradient(ellipse 60% 50% at 80% 118%, #c0728418 0%, transparent 55%),
            radial-gradient(ellipse 90% 40% at 50% 108%, #f197aa10 0%, transparent 50%),
            #ecd2c5;
        }
      `}</style>

      <footer
        id="pg-footer"
        className="relative overflow-hidden border-t border-border/40"
      >
        {/* Fade sutil solo en los primeros 32px para suavizar la transición */}
        <div
          className="pointer-events-none absolute inset-x-0 top-0 z-10 h-8"
          style={{
            background: "linear-gradient(to bottom, var(--background), transparent)",
          }}
        />

        <div className="relative z-20 mx-auto max-w-6xl px-4 pt-16 pb-10">

          {/* Grid de columnas */}
          <div className="grid gap-10 md:grid-cols-[1.8fr_1fr_1fr_1fr]">

            {/* Columna de marca */}
            <div className="flex flex-col gap-5">
              <Link href="/" className="flex items-center gap-2.5 w-fit group">
                <Logo size={40} />
              </Link>
              <p className="text-base font-medium text-foreground/85 leading-relaxed max-w-[240px]">
                Gestión de proyectos profesional para equipos de cualquier industria. Simple, seguro y gratuito.
              </p>
            </div>

            {/* Columnas de links */}
            {footerLinks.map((group) => (
              <div key={group.title} className="flex flex-col gap-4">
                <h4 className="text-xs font-black uppercase tracking-widest text-foreground/70">
                  {group.title}
                </h4>
                <ul className="flex flex-col gap-3">
                  {group.links.map((link) => (
                    <li key={link.label}>
                      <Link
                        href={link.href}
                        className="group flex items-center gap-1 text-[15px] font-semibold text-foreground/80 hover:text-foreground transition-colors duration-150"
                      >
                        {link.label}
                        <ArrowUpRight className="h-3 w-3 opacity-0 -translate-x-1 group-hover:opacity-60 group-hover:translate-x-0 transition-all duration-150" />
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* ── Banner con loaders a los costados ── */}
          <div className="relative mt-12 flex items-center gap-4 rounded-2xl border border-primary/30 bg-primary/8 px-4 py-5 overflow-hidden">

            {/* Loader izquierdo */}
            <div className="hidden sm:flex shrink-0 items-center justify-center w-[96px] h-[88px]">
              <GsapLoader className="text-primary/50" />
            </div>

            {/* Contenido */}
            <div className="flex flex-1 flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/20 text-primary">
                  <Mail className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-base font-bold text-foreground">¿Preguntas o soporte?</p>
                  <p className="text-sm font-medium text-foreground/70">Escríbenos directamente a soporte@progest.com</p>
                </div>
              </div>
              <Link href="/contact">
                <motion.button
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.97 }}
                  className="shrink-0 rounded-xl border border-primary/40 bg-primary/15 px-5 py-2 text-sm font-bold text-primary hover:bg-primary/25 transition-colors duration-150"
                >
                  Contactar →
                </motion.button>
              </Link>
            </div>

            {/* Loader derecho */}
            <div className="hidden sm:flex shrink-0 items-center justify-center w-[96px] h-[88px]">
              <GsapLoader className="text-primary/50" />
            </div>
          </div>

          {/* Copyright */}
          <div className="mt-8 flex flex-col items-center justify-between gap-3 border-t border-border/50 pt-6 sm:flex-row">
            <p className="text-sm font-semibold text-foreground/70">
              © 2026 ProGest. Todos los derechos reservados por el Equipo 1.
            </p>
            <div className="flex gap-4 text-sm font-medium text-foreground/55">
              <span>Hecho con ♥ Para la materia de Implantación y Mantenimiento de Sistemas</span>
              <span>·</span>
              <span>v1.0.0 — MVP</span>
            </div>
          </div>

        </div>
      </footer>
    </div>
  )
}
