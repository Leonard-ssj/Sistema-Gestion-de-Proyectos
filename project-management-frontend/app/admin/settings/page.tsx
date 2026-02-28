"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { toast } from "sonner"
import { useState } from "react"

export default function AdminSettingsPage() {
  const [maintenance, setMaintenance] = useState(false)
  const [registrations, setRegistrations] = useState(true)
  const [maxProjects, setMaxProjects] = useState("50")

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Configuracion Global</h1>
        <p className="text-muted-foreground">Ajustes del sistema a nivel de plataforma</p>
      </div>

      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-sm">Configuracion General</CardTitle></CardHeader>
        <CardContent className="flex flex-col gap-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Modo Mantenimiento</p>
              <p className="text-xs text-muted-foreground">Bloquea el acceso de usuarios no-admin</p>
            </div>
            <Switch checked={maintenance} onCheckedChange={setMaintenance} />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Permitir Registros</p>
              <p className="text-xs text-muted-foreground">Permite que nuevos usuarios se registren</p>
            </div>
            <Switch checked={registrations} onCheckedChange={setRegistrations} />
          </div>
          <Separator />
          <div>
            <Label>Max Proyectos por Usuario</Label>
            <Input value={maxProjects} onChange={(e) => setMaxProjects(e.target.value)} type="number" className="mt-1 max-w-[120px]" />
          </div>
          <Button className="self-start" onClick={() => toast.success("Configuracion guardada (simulado)")}>Guardar Cambios</Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-sm">Informacion del Sistema</CardTitle></CardHeader>
        <CardContent className="flex flex-col gap-2 text-sm">
          <div className="flex justify-between"><span className="text-muted-foreground">Version</span><span className="font-medium">1.0.0-MVP</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">Entorno</span><span className="font-medium">Demo / Mock</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">Base de Datos</span><span className="font-medium">In-Memory (Zustand)</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">Autenticacion</span><span className="font-medium">Mock Service</span></div>
        </CardContent>
      </Card>
    </div>
  )
}
