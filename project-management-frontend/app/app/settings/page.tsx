"use client"

import { useState } from "react"
import { useAuthStore } from "@/stores/authStore"
import { useDataStore } from "@/stores/dataStore"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"
import { toast } from "sonner"

export default function SettingsPage() {
  const session = useAuthStore((s) => s.session)
  const updateProject = useDataStore((s) => s.updateProject)

  const project = session?.project
  const [name, setName] = useState(project?.name || "")
  const [desc, setDesc] = useState(project?.description || "")
  const [category, setCategory] = useState(project?.category || "")

  function handleSave() {
    if (!project?.id) return
    updateProject(project.id, { name, description: desc, category, updated_at: new Date().toISOString() })
    toast.success("Proyecto actualizado")
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Configuracion del Proyecto</h1>
        <p className="text-muted-foreground">Administra los ajustes generales del proyecto</p>
      </div>

      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-sm">Informacion General</CardTitle></CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div>
            <Label>Nombre del Proyecto</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div>
            <Label>Descripcion</Label>
            <Textarea value={desc} onChange={(e) => setDesc(e.target.value)} rows={3} />
          </div>
          <div>
            <Label>Categoria</Label>
            <Input value={category} onChange={(e) => setCategory(e.target.value)} />
          </div>
          <Button onClick={handleSave} className="self-start">Guardar Cambios</Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-sm text-destructive">Zona de Peligro</CardTitle></CardHeader>
        <CardContent className="flex flex-col gap-4">
          <p className="text-sm text-muted-foreground">Estas acciones son irreversibles. Ten cuidado.</p>
          <Separator />
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Archivar Proyecto</p>
              <p className="text-xs text-muted-foreground">El proyecto se marcara como inactivo</p>
            </div>
            <Button variant="outline" onClick={() => toast.info("Funcionalidad demo - proyecto archivado (simulado)")}>Archivar</Button>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Eliminar Proyecto</p>
              <p className="text-xs text-muted-foreground">Se eliminara permanentemente</p>
            </div>
            <Button variant="destructive" onClick={() => toast.info("Funcionalidad demo - no se puede eliminar en modo mock")}>Eliminar</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
