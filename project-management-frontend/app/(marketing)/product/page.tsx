import { Card, CardContent } from "@/components/ui/card"
import { LayoutDashboard, ListTodo, Columns3, GanttChart, CalendarDays, BarChart3, Users, Bell, Settings, Shield } from "lucide-react"

const modules = [
  { icon: LayoutDashboard, name: "Dashboard", desc: "Panel central con metricas clave, tareas recientes y actividad del equipo. Vista unificada de todo tu proyecto." },
  { icon: ListTodo, name: "Tareas", desc: "CRUD completo de tareas con prioridades, etiquetas, checklist, comentarios y asignacion a miembros del equipo." },
  { icon: Columns3, name: "Board Kanban", desc: "Visualiza tareas en columnas (Pendiente, En Progreso, Bloqueada, Hecha) con drag & drop intuitivo." },
  { icon: GanttChart, name: "Timeline", desc: "Vista tipo Gantt simplificada con fechas de inicio/fin, milestones y dependencias visuales." },
  { icon: CalendarDays, name: "Calendario", desc: "Calendario mensual con tareas posicionadas por fecha limite para planificacion temporal." },
  { icon: BarChart3, name: "Reportes", desc: "Graficos de estado, prioridad, progreso y productividad del equipo. Exportacion CSV incluida." },
  { icon: Users, name: "Equipo", desc: "Gestion de miembros con invitaciones por email, roles diferenciados y limite de hasta 10 empleados." },
  { icon: Bell, name: "Notificaciones", desc: "Alertas en tiempo real de asignaciones, comentarios y cambios de estado de tareas." },
  { icon: Settings, name: "Configuracion", desc: "Personaliza tu proyecto: nombre, categoria, zona horaria y preferencias de notificacion." },
  { icon: Shield, name: "Panel Admin", desc: "Vista de superadministrador con auditoria, salud del sistema y gestion global de tenants." },
]

export default function ProductPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-16">
      <div className="mb-12 text-center">
        <h1 className="mb-3 text-4xl font-bold text-balance">El Producto</h1>
        <p className="mx-auto max-w-2xl text-muted-foreground">
          ProGest incluye todos los modulos necesarios para gestionar proyectos de cualquier industria: marketing, operaciones, academia, finanzas y mas.
        </p>
      </div>
      <div className="grid gap-6 md:grid-cols-2">
        {modules.map((m) => (
          <Card key={m.name} className="group transition-shadow hover:shadow-md">
            <CardContent className="flex gap-4 p-6">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                <m.icon className="h-6 w-6" />
              </div>
              <div>
                <h3 className="mb-1 font-semibold">{m.name}</h3>
                <p className="text-sm text-muted-foreground">{m.desc}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
