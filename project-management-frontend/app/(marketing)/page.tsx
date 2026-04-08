import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { AnimatedBadge } from "@/components/ui/animated-badge"
import { FadeIn, FadeInStagger, FadeInItem } from "@/components/ui/fade-in"
import { AnimeText } from "@/components/ui/anime-text"
import { AnimeSvg } from "@/components/ui/anime-svg"
import { AnimeMorphSvg } from "@/components/ui/anime-morph-svg"
import { AnimeTextDraw } from "@/components/ui/anime-text-draw"
import { InteractiveLayoutGrid } from "@/components/marketing/interactive-layout-grid"
import { CyberModal } from "@/components/marketing/cyber-modal"
import { ElectricBorder } from "@/components/ui/electric-border"

import {
  LayoutDashboard, ListTodo, Columns3, GanttChart, CalendarDays,
  BarChart3, Users, Shield, ArrowRight, Target, TrendingUp, Clock, Layers
} from "lucide-react"

  // features list moved to InteractiveLayoutGrid

const capabilities = [
  {
    icon: Target,
    title: "Crea un proyecto en segundos",
    desc: "Registrate, nombra tu proyecto, invita a tu equipo y empieza a trabajar. Sin configuraciones complejas ni curva de aprendizaje.",
  },
  {
    icon: Layers,
    title: "Multiples vistas para cada necesidad",
    desc: "Lista, Kanban, Timeline y Calendario. Cada miembro del equipo trabaja con la vista que mejor se adapte a su flujo.",
  },
  {
    icon: TrendingUp,
    title: "Mide el progreso real",
    desc: "Dashboards con metricas clave, reportes detallados por miembro, y exportacion de datos para compartir con stakeholders.",
  },
  {
    icon: Clock,
    title: "Nunca pierdas una fecha limite",
    desc: "Notificaciones de tareas asignadas, cambios de estado y vencimientos proximos. Todo el equipo siempre alineado.",
  },
]

const workflows = [
  { step: "01", title: "Registra tu cuenta", desc: "Crea tu cuenta como propietario en menos de 30 segundos. Sin tarjeta de credito." },
  { step: "02", title: "Crea tu proyecto", desc: "Dale nombre, descripcion y categoria a tu proyecto. El onboarding guiado te lleva paso a paso." },
  { step: "03", title: "Invita a tu equipo", desc: "Envia invitaciones por email. Cada miembro acepta y accede directamente a sus tareas asignadas." },
  { step: "04", title: "Organiza y ejecuta", desc: "Crea tareas, asigna responsables, define prioridades y visualiza el avance en tiempo real." },
]

const industries = [
  "Marketing y Publicidad",
  "Operaciones y Logistica",
  "Recursos Humanos",
  "Educacion y Academia",
  "Consultoria",
  "Salud y Clinicas",
  "Tecnologia y Startups",
  "Finanzas y Contabilidad",
]

const stats = [
  { value: "8", label: "Vistas integradas" },
  { value: "3", label: "Roles de acceso" },
  { value: "100%", label: "Responsive" },
  { value: "0", label: "Configuracion requerida" },
]

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen relative">
      {/* Fondo de Físicas */}

      {/* ── Orbes de gradiente — mismos colores que Login ── */}
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        {/* Azul — arriba izquierda */}
        <div className="absolute -top-40 -left-40 h-[550px] w-[550px] rounded-full animate-blob"
          style={{ background: "radial-gradient(circle at center, #3b82f6 0%, #1d4ed8 40%, transparent 75%)", opacity: 0.30, filter: "blur(70px)" }} />
        {/* Violeta — abajo derecha */}
        <div className="absolute -bottom-40 -right-40 h-[600px] w-[600px] rounded-full animate-blob animation-delay-2000"
          style={{ background: "radial-gradient(circle at center, #8b5cf6 0%, #6d28d9 40%, transparent 75%)", opacity: 0.25, filter: "blur(70px)" }} />
        {/* Cyan — arriba derecha */}
        <div className="absolute -top-20 -right-20 h-[400px] w-[400px] rounded-full animate-blob animation-delay-4000"
          style={{ background: "radial-gradient(circle at center, #06b6d4 0%, #0284c7 40%, transparent 75%)", opacity: 0.22, filter: "blur(60px)" }} />
        {/* Rosa — centro izquierda */}
        <div className="absolute top-1/3 -left-20 h-[350px] w-[350px] rounded-full animate-blob animation-delay-2000"
          style={{ background: "radial-gradient(circle at center, #ec4899 0%, #be185d 40%, transparent 75%)", opacity: 0.18, filter: "blur(65px)" }} />
        {/* Verde esmeralda — abajo centro */}
        <div className="absolute bottom-0 left-1/3 h-[400px] w-[400px] rounded-full animate-blob animation-delay-4000"
          style={{ background: "radial-gradient(circle at center, #10b981 0%, #059669 40%, transparent 75%)", opacity: 0.16, filter: "blur(65px)" }} />
        {/* Ámbar — centro derecha */}
        <div className="absolute top-1/2 -right-10 h-[300px] w-[300px] rounded-full animate-blob"
          style={{ background: "radial-gradient(circle at center, #f59e0b 0%, #d97706 40%, transparent 75%)", opacity: 0.15, filter: "blur(60px)" }} />
      </div>

      {/* Hero */}
      <section className="border-b bg-transparent relative overflow-hidden min-h-[90vh] flex items-center">
        <div className="mx-auto w-full max-w-[64rem] px-4 py-24 md:py-32 relative z-10 flex justify-center">
          {/* Panel glassmorphism: fondo semitransparente detrás del contenido */}
          <div className="
            w-full flex flex-col items-center gap-6 text-center
            rounded-2xl border border-border/30
            bg-background/60 backdrop-blur-md
            px-6 py-12 md:px-12 md:py-16
            shadow-2xl
          ">
            <FadeInItem>
              <ElectricBorder>
                <span className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-primary">
                  <span className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                  Plataforma 100% Disponible
                </span>
              </ElectricBorder>
            </FadeInItem>
            {/* Título principal con animación de trazado SVG */}
            <div className="w-full max-w-5xl text-primary">
              <AnimeTextDraw
                className="w-full"
                text="La plataforma completa para gestionar proyectos"
                fontSize={68}
                strokeWidth={1.5}
                viewBoxHeight={220}
                delay={0.3}
                filterId="glow-hero"
              />
            </div>
            <FadeInItem>
              <p className="max-w-[42rem] text-pretty text-lg leading-normal text-muted-foreground sm:text-xl sm:leading-8">
                Organiza tareas, coordina equipos y mide resultados desde un solo lugar. 
                ProGest es la herramienta todo-en-uno diseñada para equipos empresariales que exigen control total y trazabilidad.
              </p>
            </FadeInItem>
            <FadeInItem className="flex flex-col sm:flex-row gap-4 mt-4 w-full justify-center" hoverScale>
              <Link href="/auth/register" className="w-full sm:w-auto hover:opacity-90 transition-opacity">
                <Button size="lg" className="w-full text-base font-medium h-12 px-8">
                  Comenzar Gratis <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link href="/product" className="w-full sm:w-auto hover:opacity-90 transition-opacity">
                <Button variant="outline" size="lg" className="w-full text-base font-medium h-12 px-8">
                  Explorar Producto
                </Button>
              </Link>
            </FadeInItem>
            <FadeInItem>
              <p className="text-xs text-muted-foreground mt-4">Sin tarjeta de crédito. Aprovisionamiento al instante.</p>
            </FadeInItem>
          </div>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="border-b bg-background">
        <FadeInStagger className="mx-auto flex max-w-[64rem] flex-wrap justify-between gap-y-8 px-4 py-10 md:py-16">
          {stats.map((s) => (
            <FadeInItem key={s.label} className="flex flex-col gap-1 w-1/2 md:w-1/4 items-center md:items-start">
              <span className="text-4xl font-bold tracking-tighter text-foreground">{s.value}</span>
              <span className="text-sm font-medium text-muted-foreground">{s.label}</span>
            </FadeInItem>
          ))}
        </FadeInStagger>
      </section>

      {/* App Preview Mockup */}
      <section className="border-b bg-muted/20">
        <div className="mx-auto max-w-[64rem] px-4 py-16 md:py-24">
          <FadeIn className="flex flex-col gap-4 text-center mb-12">
            <AnimeText 
              as="h2" 
              className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl"
              text="Diseño enfocado en la productividad" 
            />
            <p className="mx-auto max-w-[42rem] text-muted-foreground sm:text-lg">
              Una interfaz minimalista y robusta donde la información que importa siempre está al frente.
            </p>
          </FadeIn>
          <FadeIn className="overflow-hidden rounded-[0.5rem] border bg-background shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center gap-2 border-b bg-muted/40 px-4 py-3">
              <div className="h-3 w-3 rounded-full bg-border" />
              <div className="h-3 w-3 rounded-full bg-border" />
              <div className="h-3 w-3 rounded-full bg-border" />
            </div>
            <div className="flex min-h-[400px]">
              <div className="hidden w-56 border-r bg-muted/10 p-4 md:flex md:flex-col gap-4">
                <div className="h-6 w-24 rounded bg-border/50 animate-pulse" />
                <div className="flex flex-col gap-2 mt-4">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="h-8 w-full rounded bg-muted/50" />
                  ))}
                </div>
              </div>
              <div className="flex-1 p-6 md:p-8">
                <div className="flex items-center justify-between mb-8">
                  <div className="h-8 w-48 rounded bg-border/50" />
                  <div className="h-8 w-24 rounded bg-primary/20" />
                </div>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="h-24 w-full rounded border bg-card p-4 flex flex-col justify-between hover:bg-muted/30 transition-colors">
                      <div className="h-4 w-16 rounded bg-muted" />
                      <div className="h-6 w-8 rounded bg-border" />
                    </div>
                  ))}
                </div>
                <div className="flex flex-col gap-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-14 w-full rounded border bg-card hover:bg-muted/10 transition-colors" />
                  ))}
                </div>
              </div>
            </div>
          </FadeIn>
        </div>
      </section>

      <CyberModal />

      {/* How It Works */}
      <section className="border-t bg-muted/10">
        <div className="mx-auto max-w-[64rem] px-4 py-16 md:py-24">
          <FadeIn className="flex flex-col items-center gap-4 text-center mb-16">
            <AnimeText 
              as="h2" 
              className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl"
              text="Flujo de integración" 
            />
          </FadeIn>
          <FadeInStagger className="grid gap-8 md:grid-cols-4">
            {workflows.map((w, i) => (
              <FadeInItem key={w.step} className="flex flex-col gap-3 items-center text-center md:items-start md:text-left">
                <div className="text-3xl font-bold tracking-tighter text-muted-foreground/40 mb-2">
                  {w.step}
                </div>
                <h3 className="font-semibold text-foreground">{w.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{w.desc}</p>
              </FadeInItem>
            ))}
          </FadeInStagger>
        </div>
      </section>

      {/* Capabilities Deep Dive */}
      <section className="border-t bg-background">
        <div className="mx-auto max-w-[64rem] px-4 py-16 md:py-24">
          <FadeIn className="mb-12 text-center md:text-left">
            <AnimeText 
              as="h2" 
              className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl mb-4"
              text="Despliegue escalable" 
            />
            <p className="mx-auto max-w-[42rem] md:mx-0 text-muted-foreground sm:text-lg">
              Soporte para jerarquías de equipo, vistas analíticas transversales e inicio inmediato. No limits.
            </p>
          </FadeIn>
          <FadeInStagger className="grid gap-6 md:grid-cols-2">
            {capabilities.map((c) => (
              <FadeInItem key={c.title} hoverScale className="flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left gap-5 p-6 border rounded-xl bg-card shadow-none">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-muted border text-foreground">
                  <c.icon className="h-6 w-6 text-foreground shrink-0" />
                </div>
                <div className="flex flex-col gap-1.5 mt-1">
                  <h3 className="font-semibold text-foreground">{c.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{c.desc}</p>
                </div>
              </FadeInItem>
            ))}
          </FadeInStagger>
        </div>
      </section>

      {/* Testimonial */}
      <section className="border-y bg-foreground text-background">
        <FadeIn className="mx-auto max-w-[64rem] px-4 py-20 md:py-24 text-center">
          <blockquote className="mx-auto max-w-3xl text-xl font-medium leading-relaxed sm:text-2xl sm:leading-10">
            "ProGest simplifica la gestión operativa al instante, dotando a nuestra estructura base de visibilidad y gobernanza sobre el estado de cada iteración del proyecto sin curva de aprendizaje."
          </blockquote>
          <div className="mt-8 flex flex-col justify-center gap-1 text-sm font-medium">
            <span>Directorio de Operaciones</span>
            <span className="text-muted/60">División IT / Startup</span>
          </div>
        </FadeIn>
      </section>

      {/* Final CTA */}
      <section className="bg-background relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] opacity-15 pointer-events-none z-0">
          <AnimeMorphSvg className="w-full h-full text-primary" />
        </div>
        <FadeInStagger className="mx-auto flex max-w-[64rem] flex-col items-center gap-6 px-4 py-20 text-center md:py-28 relative z-10">
          {/* Segunda aparición del trazo láser, ahora con el slogan corto */}
          <div className="w-full max-w-3xl text-primary">
            <AnimeTextDraw
              className="w-full"
              text="Acelere su gestión hoy mismo"
              fontSize={58}
              strokeWidth={1.5}
              viewBoxHeight={180}
              delay={0}
              filterId="glow-cta"
            />
          </div>
          <FadeInItem>
            <p className="max-w-[42rem] text-muted-foreground sm:text-lg text-balance">
              Acceso inmediato al Dashboard de propietario. Registre su cuenta y comience en menos de dos minutos.
            </p>
          </FadeInItem>
          <FadeInItem className="flex flex-col sm:flex-row gap-4 mt-6" hoverScale>
            <Link href="/auth/register" className="w-full sm:w-auto hover:opacity-90 transition-opacity">
              <Button size="lg" className="h-12 w-full px-8 text-base">
                Generar Instancia
              </Button>
            </Link>
            <Link href="/auth/login" className="w-full sm:w-auto hover:opacity-90 transition-opacity">
              <Button variant="outline" size="lg" className="h-12 w-full px-8 text-base bg-background shadow-xs hover:bg-muted">
                Iniciar Sesión
              </Button>
            </Link>
          </FadeInItem>
        </FadeInStagger>
      </section>

    </div>
  )
}
