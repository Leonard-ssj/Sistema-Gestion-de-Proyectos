"use client"

import * as React from "react"
import Link from "next/link"
import { useTheme } from "next-themes"
import { motion } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ElectricBorder } from "@/components/ui/electric-border"
import { ThreeDShape } from "@/components/marketing/three-d-shape"
import { Sparkles, CheckCircle2, ArrowRight } from "lucide-react"

const progestPlans = [
  {
    name: "Gratis (MVP)",
    price: "$0",
    period: "",
    desc: "Ideal para equipos pequeños que están empezando.",
    shape: "Tetrahedron" as const,
    color: "from-blue-500/20 to-indigo-500/10",
    accent: "#fbbf24",
    features: ["1 proyecto activo", "Hasta 10 miembros", "Board Kanban esencial", "Timeline & Calendario", "Reportes básicos"],
  },
  {
    name: "Pro",
    price: "$19",
    period: "/mes",
    desc: "Para empresas que necesitan control total y potencia.",
    shape: "Octahedron" as const,
    color: "from-violet-500/20 to-purple-500/10",
    accent: "#f472b6",
    features: ["Proyectos ilimitados", "Hasta 50 miembros", "Timeline avanzado", "Integraciones externas", "Soporte prioritario"],
  },
  {
    name: "Enterprise",
    price: "Contacto",
    period: "",
    desc: "Solución a medida para grandes organizaciones.",
    shape: "Icosahedron" as const,
    color: "from-cyan-500/20 to-teal-500/10",
    accent: "#60a5fa",
    features: ["Miembros ilimitados", "SSO / SAML", "API personalizada", "Manager dedicado", "Soporte 24/7"],
  },
]

export default function PlansPage() {
  const { resolvedTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => setMounted(true), [])

  if (!mounted) return null

  const isDark = resolvedTheme === "dark" || resolvedTheme === "sunset"

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="relative min-h-[calc(100vh-3.5rem)] bg-transparent overflow-hidden"
    >
      <div className="container relative z-10 mx-auto px-4 py-20 max-w-6xl">
        <header className="mb-16 text-center">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }} 
            animate={{ opacity: 1, scale: 1 }}
            className="mb-6 flex justify-center"
          >
            <ElectricBorder>
              <span className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-primary">
                <Sparkles className="h-3.5 w-3.5" />
                Sin tarjeta de crédito requerida
              </span>
            </ElectricBorder>
          </motion.div>
          <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
            Nuestros Planes
          </h1>
          <p className="mt-4 text-muted-foreground sm:text-lg max-w-2xl mx-auto">
            Elige la potencia que tu equipo necesita. Desde el MVP gratuito hasta soluciones corporativas a medida.
          </p>
        </header>

        {/* ── Grid de Planes Harmonizado ────────────────────────────────────── */}
        <div className="grid gap-6 md:grid-cols-3">
          {progestPlans.map((plan, i) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.12 }}
              whileHover={{ y: -6 }}
              className="relative group h-full"
            >
              <Card className="dashed-border h-full relative overflow-hidden shadow-sm rounded-sm bg-card/10 backdrop-blur-sm border-white/5">
                {/* Glow de color al hover (Mismo estilo que Producto) */}
                <div className={`absolute inset-0 bg-gradient-to-br ${plan.color} opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none`} />

                <CardContent className="relative flex flex-col p-8 h-full">
                  {/* Header de la Tarjeta */}
                  <div className="flex justify-between items-start mb-6">
                    <div className="flex flex-col gap-1">
                      <h3 className="text-xl font-bold text-foreground/90 uppercase tracking-tight">{plan.name}</h3>
                      <div className="flex items-baseline gap-1 mt-1">
                        <span className="text-3xl font-black text-foreground">{plan.price}</span>
                        <span className="text-xs text-muted-foreground">{plan.period}</span>
                      </div>
                    </div>
                  </div>

                  {/* Visual 3D (Refinado y más pequeño, integrado como icono) */}
                  <div className="relative h-[180px] w-full flex items-center justify-center mb-6">
                    <ThreeDShape shape={plan.shape} color={plan.accent} />
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(var(--primary),0.02),transparent_70%)] pointer-events-none" />
                  </div>

                  {/* Descripción */}
                  <p className="text-sm text-muted-foreground leading-relaxed mb-8 min-h-[40px]">
                    {plan.desc}
                  </p>

                  {/* Features List */}
                  <div className="flex-1 space-y-4 mb-10">
                    {plan.features.map((feature, idx) => (
                      <div key={idx} className="flex items-center gap-3 text-sm">
                        <CheckCircle2 className="h-4 w-4 text-primary opacity-60 shrink-0" />
                        <span className="text-foreground/80">{feature}</span>
                      </div>
                    ))}
                  </div>

                  {/* CTA Harmonizado */}
                  <div className="mt-auto pt-4 flex flex-col gap-3">
                    <Link href="/auth/register" className="w-full">
                      <Button className="w-full rounded-xl h-11 font-semibold shadow-sm transition-all hover:scale-[1.02] active:scale-100">
                        Comenzar Ahora
                      </Button>
                    </Link>
                    <div className="flex items-center justify-center gap-2 text-[10px] text-muted-foreground/60 uppercase tracking-widest font-bold">
                      <span>Pruébalo sin compromiso</span>
                      <ArrowRight className="h-2.5 w-2.5" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* ── Trust Footer ─────────────────────────────────────────────────── */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="mt-20 flex flex-wrap justify-center gap-8 text-[11px] text-muted-foreground/50 uppercase tracking-[0.2em] font-bold"
        >
          {["Cancela en cualquier momento", "Soporte LATAM", "Seguridad por diseño", "Actualizaciones de por vida"].map(item => (
            <span key={item}>{item}</span>
          ))}
        </motion.div>
      </div>
    </motion.div>
  )
}
