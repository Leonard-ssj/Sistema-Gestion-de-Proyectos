"use client"

import { motion, Variants } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ElectricBorder } from "@/components/ui/electric-border"
import {
  LayoutDashboard, ListTodo, Columns3, GanttChart,
  CalendarDays, BarChart3, Users, Bell, Settings, Shield,
  Layers
} from "lucide-react"
import Link from "next/link"

// ── Datos ──────────────────────────────────────────────────────────────────
const modules = [
  {
    icon: LayoutDashboard,
    name: "Dashboard",
    desc: "Panel central con métricas clave, tareas recientes y actividad del equipo. Vista unificada de todo tu proyecto.",
    color: "from-blue-500/20 to-indigo-500/10",
    iconBg: "bg-blue-500/10 text-blue-500 dark:text-blue-400",
    iconHover: "group-hover:bg-blue-500 group-hover:text-white",
  },
  {
    icon: ListTodo,
    name: "Tareas",
    desc: "CRUD completo de tareas con prioridades, etiquetas, checklist, comentarios y asignación a miembros del equipo.",
    color: "from-violet-500/20 to-purple-500/10",
    iconBg: "bg-violet-500/10 text-violet-500 dark:text-violet-400",
    iconHover: "group-hover:bg-violet-500 group-hover:text-white",
  },
  {
    icon: Columns3,
    name: "Board Kanban",
    desc: "Visualiza tareas en columnas (Pendiente, En Progreso, Bloqueada, Hecha) con drag & drop intuitivo.",
    color: "from-cyan-500/20 to-teal-500/10",
    iconBg: "bg-cyan-500/10 text-cyan-600 dark:text-cyan-400",
    iconHover: "group-hover:bg-cyan-500 group-hover:text-white",
  },
  {
    icon: GanttChart,
    name: "Timeline",
    desc: "Vista tipo Gantt simplificada con fechas de inicio/fin, milestones y dependencias visuales.",
    color: "from-emerald-500/20 to-green-500/10",
    iconBg: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
    iconHover: "group-hover:bg-emerald-500 group-hover:text-white",
  },
  {
    icon: CalendarDays,
    name: "Calendario",
    desc: "Calendario mensual con tareas posicionadas por fecha límite para planificación temporal.",
    color: "from-orange-500/20 to-amber-500/10",
    iconBg: "bg-orange-500/10 text-orange-600 dark:text-orange-400",
    iconHover: "group-hover:bg-orange-500 group-hover:text-white",
  },
  {
    icon: BarChart3,
    name: "Reportes",
    desc: "Gráficos de estado, prioridad, progreso y productividad del equipo. Exportación CSV incluida.",
    color: "from-pink-500/20 to-rose-500/10",
    iconBg: "bg-pink-500/10 text-pink-600 dark:text-pink-400",
    iconHover: "group-hover:bg-pink-500 group-hover:text-white",
  },
  {
    icon: Users,
    name: "Equipo",
    desc: "Gestión de miembros con invitaciones por email, roles diferenciados y límite de hasta 10 empleados.",
    color: "from-sky-500/20 to-blue-500/10",
    iconBg: "bg-sky-500/10 text-sky-600 dark:text-sky-400",
    iconHover: "group-hover:bg-sky-500 group-hover:text-white",
  },
  {
    icon: Bell,
    name: "Notificaciones",
    desc: "Alertas en tiempo real de asignaciones, comentarios y cambios de estado de tareas.",
    color: "from-yellow-500/20 to-amber-500/10",
    iconBg: "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400",
    iconHover: "group-hover:bg-yellow-500 group-hover:text-white",
  },
  {
    icon: Settings,
    name: "Configuración",
    desc: "Personaliza tu proyecto: nombre, categoría, zona horaria y preferencias de notificación.",
    color: "from-slate-500/20 to-gray-500/10",
    iconBg: "bg-slate-500/10 text-slate-600 dark:text-slate-400",
    iconHover: "group-hover:bg-slate-500 group-hover:text-white",
  },
  {
    icon: Shield,
    name: "Panel Admin",
    desc: "Vista de superadministrador con auditoría, salud del sistema y gestión global de tenants.",
    color: "from-red-500/20 to-rose-500/10",
    iconBg: "bg-red-500/10 text-red-600 dark:text-red-400",
    iconHover: "group-hover:bg-red-500 group-hover:text-white",
  },
]

// ── Variantes de animación ───────────────────────────────────────────────────
const pageVariants: Variants = {
  hidden:  { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
}

const containerVariants: Variants = {
  hidden:  {},
  visible: { transition: { staggerChildren: 0.08, delayChildren: 0.2 } },
}

const cardVariants: Variants = {
  hidden:  { opacity: 0, y: 24, scale: 0.97 },
  visible: {
    opacity: 1, y: 0, scale: 1,
    transition: { duration: 0.4, ease: "easeOut" },
  },
}

// ── Componente ───────────────────────────────────────────────────────────────
export default function ProductPage() {
  return (
    <motion.div
      className="mx-auto max-w-6xl px-4 py-20 md:py-28"
      variants={pageVariants}
      initial="hidden"
      animate="visible"
    >
      {/* ── Encabezado ─────────────────────────────────────────────────────── */}
      <div className="mb-16 text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.85 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
          className="mb-4"
        >
          <ElectricBorder>
            <span className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-primary">
              <Layers className="h-3.5 w-3.5" />
              10 módulos listos para producción
            </span>
          </ElectricBorder>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mb-4 text-4xl font-bold tracking-tight text-balance sm:text-5xl"
        >
          El Producto
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.18 }}
          className="mx-auto max-w-2xl text-muted-foreground sm:text-lg"
        >
          ProGest incluye todos los módulos necesarios para gestionar proyectos de cualquier
          industria: marketing, operaciones, academia, finanzas y más.
        </motion.p>
      </div>

      {/* ── Grid de módulos ─────────────────────────────────────────────────── */}
      <motion.div
        className="grid gap-5 md:grid-cols-2"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {modules.map((m) => (
          <motion.div
            key={m.name}
            variants={cardVariants}
            whileHover={{ y: -4, transition: { duration: 0.2, ease: "easeOut" } }}
            whileTap={{ scale: 0.985 }}
          >
            <Card className="dashed-border group relative overflow-hidden shadow-sm rounded-sm cursor-default">
              {/* Fondo de degradado sutil al hover */}
              <div
                className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${m.color} opacity-0 group-hover:opacity-100 transition-opacity duration-500`}
              />

              <CardContent className="relative flex gap-5 p-6">
                {/* Ícono */}
                <motion.div
                  whileHover={{ rotate: [0, -10, 10, 0], transition: { duration: 0.35 } }}
                  className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl transition-all duration-300 ${m.iconBg} ${m.iconHover}`}
                >
                  <m.icon className="h-5 w-5" />
                </motion.div>

                {/* Texto */}
                <div className="flex flex-col gap-1 pt-0.5">
                  <h3 className="font-semibold tracking-tight text-foreground/90">
                    {m.name}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {m.desc}
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      {/* ── CTA final ═══════════════════════════════════════════════════════ */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.6 }}
        className="mt-16 flex flex-col items-center gap-4 text-center"
      >
        <p className="text-sm text-muted-foreground">
          ¿Listo para empezar? El plan gratuito incluye Dashboard, Tareas, Kanban y más.
        </p>
        <div className="flex gap-3">
          <Link href="/auth/register">
            <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
              <Button size="lg" className="rounded-xl h-11 px-8 shadow-md shadow-primary/20">
                Comenzar Gratis
              </Button>
            </motion.div>
          </Link>
          <Link href="/plans">
            <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
              <Button variant="outline" size="lg" className="rounded-xl h-11 px-8">
                Ver Planes
              </Button>
            </motion.div>
          </Link>
        </div>
      </motion.div>
    </motion.div>
  )
}
