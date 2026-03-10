"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"
import { FolderKanban, Menu, Moon, Sun, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { useState } from "react"

const links = [
  { label: "Producto", href: "/product" },
  { label: "Planes", href: "/plans" },
  { label: "Seguridad", href: "/security" },
  { label: "FAQ", href: "/faq" },
  { label: "Contacto", href: "/contact" },
  { label: "Acerca de", href: "/about" },
]

export function MarketingHeader() {
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)
  const { theme, setTheme } = useTheme()

  return (
    <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <FolderKanban className="h-4 w-4" />
          </div>
          <span className="text-lg font-bold">ProGest</span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={cn(
                "rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
                pathname === l.href ? "bg-accent text-accent-foreground" : "text-muted-foreground hover:text-foreground"
              )}
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-2 md:flex">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            title="Cambiar tema"
          >
            <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            <span className="sr-only">Cambiar tema</span>
          </Button>
          <Link href="/auth/login">
            <Button variant="ghost" size="sm">Iniciar Sesion</Button>
          </Link>
          <Link href="/auth/register">
            <Button size="sm">Comenzar Gratis</Button>
          </Link>
        </div>

        <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setMobileOpen(!mobileOpen)}>
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
      </div>

      {mobileOpen && (
        <div className="border-t bg-background px-4 py-3 md:hidden">
          <nav className="flex flex-col gap-1">
            {links.map((l) => (
              <Link key={l.href} href={l.href} onClick={() => setMobileOpen(false)}
                className={cn("rounded-md px-3 py-2 text-sm font-medium", pathname === l.href ? "bg-accent" : "text-muted-foreground")}
              >
                {l.label}
              </Link>
            ))}
          </nav>
          <div className="mt-3 flex flex-col gap-2">
            <Button
              variant="outline"
              className="w-full"
              size="sm"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            >
              Cambiar tema
            </Button>
            <Link href="/auth/login"><Button variant="outline" className="w-full" size="sm">Iniciar Sesion</Button></Link>
            <Link href="/auth/register"><Button className="w-full" size="sm">Comenzar Gratis</Button></Link>
          </div>
        </div>
      )}
    </header>
  )
}
