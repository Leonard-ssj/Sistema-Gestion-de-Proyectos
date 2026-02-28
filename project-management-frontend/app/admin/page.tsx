"use client"

import { useDataStore } from "@/stores/dataStore"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { FolderKanban, Users, FileText, Activity } from "lucide-react"

export default function AdminDashboard() {
  const projects = useDataStore((s) => s.projects)
  const users = useDataStore((s) => s.users)
  const auditLogs = useDataStore((s) => s.auditLogs)
  const healthChecks = useDataStore((s) => s.healthChecks)

  const activeProjects = projects.filter((p) => p.status === "active").length
  const activeUsers = users.filter((u) => u.status === "active").length
  const healthyServices = healthChecks.filter((h) => h.status === "healthy").length

  const stats = [
    { label: "Proyectos Activos", value: activeProjects, total: projects.length, icon: FolderKanban },
    { label: "Usuarios Activos", value: activeUsers, total: users.length, icon: Users },
    { label: "Eventos de Auditoria", value: auditLogs.length, total: auditLogs.length, icon: FileText },
    { label: "Servicios OK", value: healthyServices, total: healthChecks.length, icon: Activity },
  ]

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Panel de Administracion</h1>
        <p className="text-muted-foreground">Vista global del sistema</p>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats.map((s) => (
          <Card key={s.label}>
            <CardContent className="flex flex-col items-center gap-2 p-5">
              <s.icon className="h-6 w-6 text-primary" />
              <span className="text-3xl font-bold">{s.value}</span>
              <span className="text-xs text-muted-foreground">{s.label}</span>
              {s.value !== s.total && <Badge variant="secondary" className="text-[10px]">de {s.total}</Badge>}
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm">Ultimos Eventos</CardTitle></CardHeader>
          <CardContent className="flex flex-col gap-2">
            {auditLogs.slice(0, 5).map((log) => (
              <div key={log.id} className="flex items-center justify-between rounded-lg border p-2">
                <div>
                  <p className="text-sm font-medium">{log.action.replace(/_/g, " ")}</p>
                  <p className="text-xs text-muted-foreground">{log.user_email} - {log.details}</p>
                </div>
                <span className="text-xs text-muted-foreground shrink-0">{new Date(log.created_at).toLocaleDateString("es-ES")}</span>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm">Estado de Servicios</CardTitle></CardHeader>
          <CardContent className="flex flex-col gap-2">
            {healthChecks.map((h) => (
              <div key={h.service} className="flex items-center justify-between rounded-lg border p-2">
                <div className="flex items-center gap-2">
                  <div className={`h-2 w-2 rounded-full ${h.status === "healthy" ? "bg-emerald-500" : h.status === "degraded" ? "bg-amber-500" : "bg-red-500"}`} />
                  <span className="text-sm">{h.service}</span>
                </div>
                <span className="text-xs text-muted-foreground">{h.latency}ms</span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
