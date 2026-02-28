"use client"

import { useState } from "react"
import { useAuthStore } from "@/stores/authStore"
import { useDataStore } from "@/stores/dataStore"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"

export default function ProfilePage() {
  const session = useAuthStore((s) => s.session)
  const login = useAuthStore((s) => s.login)
  const updateUser = useDataStore((s) => s.updateUser)

  const user = session?.user
  const [name, setName] = useState(user?.name || "")
  const [email, setEmail] = useState(user?.email || "")

  function handleSave() {
    if (!user?.id || !session) return
    updateUser(user.id, { name, email })
    login({ ...session, user: { ...user, name, email } })
    toast.success("Perfil actualizado")
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Mi Perfil</h1>
        <p className="text-muted-foreground">Administra tu informacion personal</p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="md:col-span-2">
          <CardHeader className="pb-2"><CardTitle className="text-sm">Informacion Personal</CardTitle></CardHeader>
          <CardContent className="flex flex-col gap-4">
            <div>
              <Label>Nombre</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div>
              <Label>Email</Label>
              <Input value={email} onChange={(e) => setEmail(e.target.value)} type="email" />
            </div>
            <Button onClick={handleSave} className="self-start">Guardar</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm">Resumen</CardTitle></CardHeader>
          <CardContent className="flex flex-col items-center gap-3">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary text-2xl font-bold text-primary-foreground">
              {user?.name?.charAt(0) || "U"}
            </div>
            <p className="text-sm font-medium">{user?.name}</p>
            <p className="text-xs text-muted-foreground">{user?.email}</p>
            <Badge>{user?.role === "owner" ? "Propietario" : user?.role === "employee" ? "Empleado" : "SuperAdmin"}</Badge>
            <p className="text-xs text-muted-foreground">Miembro desde {user?.created_at ? new Date(user.created_at).toLocaleDateString("es-ES") : "-"}</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
