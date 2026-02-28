"use client"

import { useDataStore } from "@/stores/dataStore"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { toast } from "sonner"

export default function TenantsPage() {
  const projects = useDataStore((s) => s.projects)
  const users = useDataStore((s) => s.users)
  const memberships = useDataStore((s) => s.memberships)
  const tasks = useDataStore((s) => s.tasks)
  const updateProject = useDataStore((s) => s.updateProject)

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Tenants (Proyectos)</h1>
        <p className="text-muted-foreground">{projects.length} proyectos registrados</p>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead>Propietario</TableHead>
                <TableHead>Miembros</TableHead>
                <TableHead>Tareas</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Creado</TableHead>
                <TableHead>Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {projects.map((p) => {
                const owner = users.find((u) => u.id === p.owner_id)
                const memberCount = memberships.filter((m) => m.project_id === p.id && m.status === "active").length
                const taskCount = tasks.filter((t) => t.project_id === p.id).length
                return (
                  <TableRow key={p.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{p.name}</p>
                        <p className="text-xs text-muted-foreground">{p.category}</p>
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{owner?.name || "-"}</TableCell>
                    <TableCell>{memberCount}</TableCell>
                    <TableCell>{taskCount}</TableCell>
                    <TableCell>
                      <Badge variant={p.status === "active" ? "default" : "secondary"}>
                        {p.status === "active" ? "Activo" : "Desactivado"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{new Date(p.created_at).toLocaleDateString("es-ES")}</TableCell>
                    <TableCell>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          const newStatus = p.status === "active" ? "disabled" : "active"
                          updateProject(p.id, { status: newStatus })
                          toast.success(`Proyecto ${newStatus === "active" ? "activado" : "desactivado"}`)
                        }}
                      >
                        {p.status === "active" ? "Desactivar" : "Activar"}
                      </Button>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
