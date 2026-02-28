"use client"

import { MarketingHeader } from "@/components/marketing/marketing-header"
import Link from "next/link"
import { FolderKanban } from "lucide-react"

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <MarketingHeader />
      <main className="flex-1">{children}</main>
      <footer className="border-t bg-muted/40">
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-4 px-4 py-8 text-center md:flex-row md:justify-between md:text-left">
          <div className="flex items-center gap-2">
            <FolderKanban className="h-5 w-5 text-primary" />
            <span className="font-bold">ProGest</span>
          </div>
          <div className="flex flex-wrap justify-center gap-4 text-sm text-muted-foreground">
            <Link href="/product" className="hover:text-foreground">Producto</Link>
            <Link href="/plans" className="hover:text-foreground">Planes</Link>
            <Link href="/security" className="hover:text-foreground">Seguridad</Link>
            <Link href="/faq" className="hover:text-foreground">FAQ</Link>
            <Link href="/contact" className="hover:text-foreground">Contacto</Link>
            <Link href="/about" className="hover:text-foreground">Acerca de</Link>
          </div>
          <p className="text-xs text-muted-foreground">2026 ProGest. Todos los derechos reservados.</p>
        </div>
      </footer>
    </div>
  )
}
