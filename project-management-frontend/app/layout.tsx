import type { Metadata } from "next"
import { Inter } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import { Providers } from "@/components/providers"
import { ParticleBackground } from "@/components/ui/particle-background"
import "./globals.css"

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" })

export const metadata: Metadata = {
  title: "ProGest - Planifica, Gestiona, Vence.",
  description: "Plataforma SaaS para gestionar proyectos, tareas, equipos y reportes de forma simple y profesional.",
  icons: {
    icon: "/icon.svg",
    apple: "/apple-icon.png",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased`}>
        <Providers>
          {/* Fondo global de partículas animadas — detrás de toda la UI */}
          <ParticleBackground />
          {children}
        </Providers>
        <Analytics />
      </body>
    </html>
  )
}

