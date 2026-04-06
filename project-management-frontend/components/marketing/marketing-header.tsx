"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { IridescentButton } from "@/components/ui/iridescent-button"
import { Menu, X } from "lucide-react"
import { Logo } from "@/components/ui/logo"
import { cn } from "@/lib/utils"
import { useState, useRef } from "react"
import { ThemeSwitcher } from "@/components/ui/theme-switcher"

const links = [
  { label: "Producto",  href: "/product"  },
  { label: "Planes",    href: "/plans"    },
  { label: "Seguridad", href: "/security" },
  { label: "FAQ",       href: "/faq"      },
  { label: "Contacto",  href: "/contact"  },
  { label: "Acerca de", href: "/about"    },
]

export function MarketingHeader() {
  const pathname   = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)

  // Encuentra el índice activo para asignar el anchor-name CSS correctamente
  const activeIndex = links.findIndex((l) => pathname === l.href)

  return (
    <>
      {/* Keyframes + Anchor Positioning styles */}
      <style>{`
        /* ---------- scrolling mask fade-in/out ---------- */
        .progest-nav-list {
          --size: 4;
          display: flex;
          gap: 0;
          list-style-type: none;
          padding: 0 calc(var(--size) * 1ch);
          margin: 0;
          max-width: 100%;
          overflow: auto;
          scrollbar-width: none;
          scrollbar-color: transparent transparent;
          transform: translateZ(0);
          /* scroll-driven mask */
          mask-image:
            linear-gradient(90deg, #fff, #0000),
            linear-gradient(90deg, #fff 0 100%),
            linear-gradient(90deg, #0000, #fff);
          mask-size:
            0 100%,
            100% 100%,
            calc(var(--size) * 1ch) 100%;
          mask-repeat: no-repeat;
          mask-position: 0 0, 0 0, 100% 0;
          mask-composite: xor;
          animation-timing-function: linear;
          animation-timeline: scroll(self inline);
          animation-range:
            0 calc(var(--size) * 1ch),
            calc(100% - (var(--size) * 1ch)) 100%;
          animation-name: nav-size-up, nav-size-down;
          animation-fill-mode: both;
          /* pill background + clip */
          clip-path: inset(0);
          position: relative;
        }

        @keyframes nav-size-up {
          to {
            mask-size:
              calc(var(--size) * 1ch) 100%,
              100% 100%,
              calc(var(--size) * 1ch) 100%;
          }
        }
        @keyframes nav-size-down {
          to {
            mask-size:
              calc(var(--size) * 1ch) 100%,
              100% 100%,
              0 100%;
          }
        }

        /* ---------- pill indicator ---------- */
        .progest-nav-list::after {
          content: '';
          background: white;
          pointer-events: none;
          mix-blend-mode: difference;
          position: absolute;
          z-index: 10;
          border-radius: 100px;
          transition: all 0.26s cubic-bezier(0.34, 1.56, 0.64, 1);

          /* Anchor positioning: seguir al item activo */
          top: anchor(top);
          bottom: anchor(bottom);
          left: anchor(left);
          right: anchor(right);
          position-anchor: --nav-active;
        }

        /* ---------- nav link spans ---------- */
        .progest-nav-link span {
          transition: background 0.12s ease-out;
          border-radius: 100px;
          padding: 0.25rem 0.75rem;
          pointer-events: none;
          display: inline-block;
          white-space: nowrap;
          font-size: 0.875rem;
          font-weight: 500;
        }

        .progest-nav-link {
          text-decoration: none;
          color: inherit;
          display: inline-block;
          padding: 0.25rem;
        }

        .progest-nav-link:is(:hover, :focus-visible):not([data-active="true"]) span {
          background: hsl(0 0% 80% / 0.25);
        }

        .progest-nav-link[data-active="true"] span {
          anchor-name: --nav-active;
        }

        /* ---------- focus ring ---------- */
        .progest-nav-link:focus-visible {
          outline: 2px solid currentColor;
          outline-offset: 2px;
          border-radius: 100px;
        }
      `}</style>

      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 gap-4">

          {/* Logo animado aurora ── ProGestLogoHeader */}
          <Link href="/" className="flex shrink-0 items-center gap-2">
            <Logo size={40} />
          </Link>

          {/* Navegación central con pill animada */}
          <nav className="hidden md:flex flex-1 items-center justify-center overflow-hidden">
            <ul className="progest-nav-list">
              {links.map((l, i) => {
                const isActive = pathname === l.href
                return (
                  <li key={l.href}>
                    <Link
                      href={l.href}
                      className="progest-nav-link"
                      data-active={isActive ? "true" : undefined}
                      aria-current={isActive ? "page" : undefined}
                    >
                      <span>{l.label}</span>
                    </Link>
                  </li>
                )
              })}
            </ul>
          </nav>

          {/* Acciones: tema + auth con botones iridiscentes */}
          <div className="hidden shrink-0 items-center gap-2 md:flex">
            <ThemeSwitcher />
            <Link href="/auth/login">
              <IridescentButton variant="ghost" size="sm">Iniciar Sesion</IridescentButton>
            </Link>
            <Link href="/auth/register">
              <IridescentButton variant="default" size="sm">Comenzar Gratis</IridescentButton>
            </Link>
          </div>

          {/* Menú móvil */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>

        {/* Panel móvil */}
        {mobileOpen && (
          <div className="border-t bg-background px-4 py-3 md:hidden">
            <nav className="flex flex-col gap-1">
              {links.map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  onClick={() => setMobileOpen(false)}
                  className={cn(
                    "rounded-full px-4 py-2 text-sm font-medium transition-colors",
                    pathname === l.href
                      ? "bg-foreground text-background"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                >
                  {l.label}
                </Link>
              ))}
            </nav>
            <div className="mt-3 flex flex-col gap-2">
              <div className="flex w-full items-center justify-between px-3 py-1.5 rounded-md border border-border">
                <span className="text-sm font-medium">Tema Visual</span>
                <ThemeSwitcher />
              </div>
              <Link href="/auth/login"><Button variant="outline" className="w-full" size="sm">Iniciar Sesion</Button></Link>
              <Link href="/auth/register"><Button className="w-full" size="sm">Comenzar Gratis</Button></Link>
            </div>
          </div>
        )}
      </header>
    </>
  )
}
