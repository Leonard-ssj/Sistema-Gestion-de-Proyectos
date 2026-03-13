"use client"

import { useDataStore } from "@/stores/dataStore"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { toast } from "sonner"
import { normalizeAvatarUrl } from "@/lib/avatars"

export default function AdminUsersPage() {
  const users = useDataStore((s) => s.users)
  const updateUser = useDataStore((s) => s.updateUser)

  const roleLabel = (r: string) => r === "owner" ? "Propietario" : r === "employee" ? "Empleado" : "SuperAdmin"

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Usuarios</h1>
        <p className="text-muted-foreground">{users.length} usuarios registrados</p>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Usuario</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Rol</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Registrado</TableHead>
                <TableHead>Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((u) => (
                <TableRow key={u.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <img alt="" src={normalizeAvatarUrl(u.avatar)} className="h-7 w-7 rounded-full border border-border bg-muted/20" />
                      <span className="font-medium">{u.name}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{u.email}</TableCell>
                  <TableCell><Badge variant="outline">{roleLabel(u.role)}</Badge></TableCell>
                  <TableCell>
                    <Badge variant={u.status === "active" ? "default" : "secondary"}>
                      {u.status === "active" ? "Activo" : "Desactivado"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{new Date(u.created_at).toLocaleDateString("es-ES")}</TableCell>
                  <TableCell>
                    {u.role !== "superadmin" && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          const newStatus = u.status === "active" ? "disabled" : "active"
                          updateUser(u.id, { status: newStatus })
                          toast.success(`Usuario ${newStatus === "active" ? "activado" : "desactivado"}`)
                        }}
                      >
                        {u.status === "active" ? "Desactivar" : "Activar"}
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
