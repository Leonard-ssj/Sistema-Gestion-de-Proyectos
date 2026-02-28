import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  LayoutDashboard, ListTodo, Columns3, GanttChart, CalendarDays,
  BarChart3, Users, Shield, ArrowRight, CheckCircle2, Zap,
  Globe, Bell, Lock, Palette, Smartphone, ChevronRight,
  Target, TrendingUp, Clock, Layers
} from "lucide-react"

const features = [
  { icon: LayoutDashboard, title: "Dashboard Inteligente", desc: "Metricas en tiempo real, actividad reciente, tareas vencidas y progreso general de tu proyecto en una sola vista." },
  { icon: ListTodo, title: "Gestion de Tareas", desc: "Crea, asigna, prioriza con niveles de urgencia, agrega checklists, comentarios y da seguimiento completo a cada tarea." },
  { icon: Columns3, title: "Board Kanban", desc: "Arrastra y suelta tarjetas entre columnas para visualizar el flujo de trabajo. De Pendiente a En Progreso a Completado." },
  { icon: GanttChart, title: "Timeline / Gantt", desc: "Visualiza fechas de inicio y vencimiento de cada tarea en una linea de tiempo clara con barras de progreso." },
  { icon: CalendarDays, title: "Calendario Mensual", desc: "Ve todas las tareas y eventos de tu proyecto organizados en un calendario navegable mes a mes." },
  { icon: BarChart3, title: "Reportes y Analitica", desc: "Graficos de distribucion por estado, prioridad, carga por miembro del equipo y exportacion a CSV." },
  { icon: Users, title: "Equipo e Invitaciones", desc: "Invita miembros por email, gestiona roles (Owner/Empleado) y controla quien accede a que informacion." },
  { icon: Shield, title: "Seguridad por Roles", desc: "Control de acceso granular: cada usuario ve solo lo que le corresponde. Auditoria completa de acciones." },
]

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
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden border-b bg-background">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,hsl(var(--primary)/0.08),transparent_70%)]" />
        <div className="relative mx-auto flex max-w-6xl flex-col items-center gap-8 px-4 py-24 text-center md:py-32 lg:py-40">
          <Badge variant="secondary" className="gap-2 px-4 py-1.5 text-sm font-medium">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            Plataforma disponible - Comienza gratis hoy
          </Badge>
          <h1 className="max-w-4xl text-balance text-4xl font-bold tracking-tight text-foreground md:text-5xl lg:text-6xl xl:text-7xl">
            La plataforma completa para{" "}
            <span className="text-primary">gestionar proyectos</span>
          </h1>
          <p className="max-w-2xl text-pretty text-lg leading-relaxed text-muted-foreground md:text-xl">
            Organiza tareas, coordina equipos y mide resultados desde un solo lugar. ProGest es la herramienta
            todo-en-uno disenada para equipos de cualquier industria que buscan simplicidad y control total.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link href="/auth/register">
              <Button size="lg" className="gap-2 px-8 text-base">
                Comenzar Gratis <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="/product">
              <Button variant="outline" size="lg" className="gap-2 px-8 text-base">
                Explorar Producto <ChevronRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
          <p className="text-sm text-muted-foreground">Sin tarjeta de credito. Configuracion en menos de 2 minutos.</p>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="border-b bg-muted/40">
        <div className="mx-auto grid max-w-6xl grid-cols-2 gap-px md:grid-cols-4">
          {stats.map((s) => (
            <div key={s.label} className="flex flex-col items-center gap-1 bg-background px-6 py-8">
              <span className="text-3xl font-bold text-primary md:text-4xl">{s.value}</span>
              <span className="text-sm text-muted-foreground">{s.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Features Grid */}
      <section className="mx-auto max-w-6xl px-4 py-20 md:py-28">
        <div className="mb-16 text-center">
          <Badge variant="outline" className="mb-4">Funcionalidades</Badge>
          <h2 className="mb-4 text-3xl font-bold text-balance text-foreground md:text-4xl">
            Todo lo que necesitas, nada que sobre
          </h2>
          <p className="mx-auto max-w-2xl text-pretty text-muted-foreground">
            Ocho herramientas integradas que cubren cada etapa de la gestion de un proyecto, desde la planificacion hasta el analisis de resultados.
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((f) => (
            <Card key={f.title} className="group border bg-card transition-all hover:border-primary/30 hover:shadow-md">
              <CardContent className="flex flex-col gap-4 p-6">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                  <f.icon className="h-5 w-5" />
                </div>
                <h3 className="font-semibold text-foreground">{f.title}</h3>
                <p className="text-sm leading-relaxed text-muted-foreground">{f.desc}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* How It Works */}
      <section className="border-y bg-muted/30">
        <div className="mx-auto max-w-6xl px-4 py-20 md:py-28">
          <div className="mb-16 text-center">
            <Badge variant="outline" className="mb-4">Como funciona</Badge>
            <h2 className="mb-4 text-3xl font-bold text-balance text-foreground md:text-4xl">
              De cero a productivo en 4 pasos
            </h2>
            <p className="mx-auto max-w-2xl text-muted-foreground">
              No necesitas ser experto en tecnologia. El flujo guiado te lleva desde el registro hasta tener tu equipo trabajando coordinadamente.
            </p>
          </div>
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            {workflows.map((w, i) => (
              <div key={w.step} className="relative flex flex-col gap-4">
                {i < workflows.length - 1 && (
                  <div className="absolute right-0 top-8 hidden h-px w-8 bg-border lg:block" style={{ right: "-2rem" }} />
                )}
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary text-lg font-bold text-primary-foreground">
                  {w.step}
                </div>
                <h3 className="text-lg font-semibold text-foreground">{w.title}</h3>
                <p className="text-sm leading-relaxed text-muted-foreground">{w.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Capabilities Deep Dive */}
      <section className="mx-auto max-w-6xl px-4 py-20 md:py-28">
        <div className="mb-16 text-center">
          <Badge variant="outline" className="mb-4">Capacidades</Badge>
          <h2 className="mb-4 text-3xl font-bold text-balance text-foreground md:text-4xl">
            Disenado para equipos reales
          </h2>
          <p className="mx-auto max-w-2xl text-muted-foreground">
            No importa si manejas un equipo de marketing, un departamento academico o una consultoria.
            ProGest se adapta a tu flujo de trabajo.
          </p>
        </div>
        <div className="grid gap-6 md:grid-cols-2">
          {capabilities.map((c) => (
            <Card key={c.title} className="border bg-card">
              <CardContent className="flex gap-5 p-8">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <c.icon className="h-6 w-6" />
                </div>
                <div className="flex flex-col gap-2">
                  <h3 className="text-lg font-semibold text-foreground">{c.title}</h3>
                  <p className="leading-relaxed text-muted-foreground">{c.desc}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* App Preview Mockup */}
      <section className="border-y bg-muted/30">
        <div className="mx-auto max-w-6xl px-4 py-20 md:py-28">
          <div className="mb-12 text-center">
            <Badge variant="outline" className="mb-4">Vista previa</Badge>
            <h2 className="mb-4 text-3xl font-bold text-balance text-foreground md:text-4xl">
              Una interfaz que tu equipo va a querer usar
            </h2>
          </div>
          <div className="overflow-hidden rounded-xl border bg-card shadow-xl">
            {/* Mock window chrome */}
            <div className="flex items-center gap-3 border-b bg-muted/50 px-4 py-3">
              <div className="flex gap-1.5">
                <div className="h-3 w-3 rounded-full bg-red-400/80" />
                <div className="h-3 w-3 rounded-full bg-yellow-400/80" />
                <div className="h-3 w-3 rounded-full bg-emerald-400/80" />
              </div>
              <div className="flex-1">
                <div className="mx-auto h-6 w-64 rounded-md bg-muted" />
              </div>
            </div>
            {/* Mock app layout */}
            <div className="flex min-h-[400px]">
              {/* Mock sidebar */}
              <div className="hidden w-56 shrink-0 border-r bg-muted/30 p-4 md:block">
                <div className="mb-6 flex items-center gap-2">
                  <div className="h-7 w-7 rounded-lg bg-primary" />
                  <div className="h-4 w-20 rounded bg-muted" />
                </div>
                <div className="flex flex-col gap-2">
                  {["Dashboard", "Tareas", "Board", "Timeline", "Calendario", "Reportes", "Equipo"].map((item, i) => (
                    <div key={item} className={`flex items-center gap-2 rounded-md px-3 py-2 text-xs ${i === 0 ? "bg-primary/10 font-medium text-primary" : "text-muted-foreground"}`}>
                      <div className={`h-3.5 w-3.5 rounded ${i === 0 ? "bg-primary/30" : "bg-muted"}`} />
                      {item}
                    </div>
                  ))}
                </div>
              </div>
              {/* Mock main content */}
              <div className="flex-1 p-6">
                <div className="mb-6 flex items-center justify-between">
                  <div>
                    <div className="mb-1 h-5 w-32 rounded bg-muted" />
                    <div className="h-3 w-48 rounded bg-muted/60" />
                  </div>
                  <div className="h-8 w-24 rounded-md bg-primary/20" />
                </div>
                {/* Mock stats cards */}
                <div className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
                  {[
                    { label: "Total", value: "10", color: "bg-primary/10" },
                    { label: "En Progreso", value: "3", color: "bg-blue-100 dark:bg-blue-900/30" },
                    { label: "Completadas", value: "2", color: "bg-emerald-100 dark:bg-emerald-900/30" },
                    { label: "Urgentes", value: "2", color: "bg-red-100 dark:bg-red-900/30" },
                  ].map((stat) => (
                    <div key={stat.label} className={`rounded-lg ${stat.color} p-4`}>
                      <div className="text-xs text-muted-foreground">{stat.label}</div>
                      <div className="mt-1 text-2xl font-bold text-foreground">{stat.value}</div>
                    </div>
                  ))}
                </div>
                {/* Mock task list */}
                <div className="flex flex-col gap-2">
                  {["Disenar identidad visual", "Configurar Google Ads", "Producir video institucional"].map((task, i) => (
                    <div key={task} className="flex items-center gap-3 rounded-lg border bg-background p-3">
                      <div className={`h-2.5 w-2.5 rounded-full ${i === 0 ? "bg-emerald-500" : i === 1 ? "bg-blue-500" : "bg-yellow-500"}`} />
                      <span className="flex-1 text-sm text-foreground">{task}</span>
                      <div className="h-6 w-16 rounded-full bg-muted" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Industries */}
      <section className="mx-auto max-w-6xl px-4 py-20 md:py-28">
        <div className="flex flex-col items-center gap-12 md:flex-row md:gap-16">
          <div className="flex-1">
            <Badge variant="outline" className="mb-4">Versatil</Badge>
            <h2 className="mb-4 text-3xl font-bold text-balance text-foreground md:text-4xl">
              Una herramienta para cualquier industria
            </h2>
            <p className="mb-8 leading-relaxed text-muted-foreground">
              ProGest fue creado como una herramienta generalista pensada para equipos reales, no solo para desarrolladores.
              Ya sea que gestiones campanas de marketing, auditorias financieras o proyectos academicos, la plataforma se adapta a ti.
            </p>
            <Link href="/auth/register">
              <Button className="gap-2">
                Crear cuenta gratuita <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
          <div className="flex-1">
            <div className="grid grid-cols-2 gap-3">
              {industries.map((ind) => (
                <div key={ind} className="flex items-center gap-3 rounded-xl border bg-card px-4 py-3.5 text-sm font-medium text-foreground transition-colors hover:border-primary/30">
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-primary" />
                  {ind}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Feature Highlights */}
      <section className="border-y bg-muted/30">
        <div className="mx-auto max-w-6xl px-4 py-20 md:py-28">
          <div className="mb-16 text-center">
            <Badge variant="outline" className="mb-4">Mas que tareas</Badge>
            <h2 className="mb-4 text-3xl font-bold text-balance text-foreground md:text-4xl">
              Funciones pensadas para el dia a dia
            </h2>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[
              { icon: Bell, title: "Notificaciones inteligentes", desc: "Recibe alertas de tareas asignadas, comentarios nuevos, cambios de estado y vencimientos proximos." },
              { icon: Lock, title: "Control de acceso por roles", desc: "Los propietarios gestionan todo. Los empleados ven solo sus tareas. El superadmin supervisa el sistema completo." },
              { icon: Palette, title: "Modo claro y oscuro", desc: "Interfaz adaptable con tema claro y oscuro. Tu equipo trabaja comodo a cualquier hora del dia." },
              { icon: Smartphone, title: "100% Responsive", desc: "Funciona en escritorio, tablet y movil. Gestiona tu proyecto desde cualquier dispositivo sin perder funcionalidad." },
              { icon: Globe, title: "Multitenant seguro", desc: "Cada proyecto es un espacio independiente. Los datos de un tenant nunca se mezclan con los de otro." },
              { icon: Zap, title: "Rapido y sin friccion", desc: "Interfaz optimizada para cargar al instante. Sin tiempos de espera, sin pasos innecesarios." },
            ].map((f) => (
              <div key={f.title} className="flex gap-4 rounded-xl border bg-card p-6">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <f.icon className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="mb-1 font-semibold text-foreground">{f.title}</h3>
                  <p className="text-sm leading-relaxed text-muted-foreground">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonial / Quote */}
      <section className="mx-auto max-w-6xl px-4 py-20 md:py-28">
        <div className="mx-auto max-w-3xl text-center">
          <div className="mb-6 text-4xl text-primary">{"\"}"}</div>
          <blockquote className="mb-6 text-xl font-medium leading-relaxed text-foreground md:text-2xl">
            Necesitabamos una herramienta simple que todo el equipo pudiera usar sin capacitacion. ProGest nos permitio
            organizar nuestra campana de lanzamiento con tareas claras, fechas reales y un board visual que todos entienden.
          </blockquote>
          <div className="flex items-center justify-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
              MG
            </div>
            <div className="text-left">
              <div className="text-sm font-semibold text-foreground">Maria Garcia</div>
              <div className="text-xs text-muted-foreground">Directora de Marketing - Clinica XY</div>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="border-t bg-primary">
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-6 px-4 py-20 text-center md:py-28">
          <h2 className="max-w-2xl text-3xl font-bold text-balance text-primary-foreground md:text-4xl">
            Listo para organizar tu proximo proyecto?
          </h2>
          <p className="max-w-xl text-primary-foreground/80">
            Crea tu cuenta gratuita, configura tu proyecto en minutos y empieza a gestionar tu equipo de forma profesional.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link href="/auth/register">
              <Button size="lg" variant="secondary" className="gap-2 px-8 text-base">
                Crear cuenta gratuita <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="/auth/login">
              <Button size="lg" variant="ghost" className="gap-2 border border-primary-foreground/20 px-8 text-base text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground">
                Ya tengo cuenta
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
