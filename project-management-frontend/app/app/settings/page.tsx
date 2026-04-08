"use client"

import { format } from "date-fns"
import { es } from "date-fns/locale"
import { Calendar as CalendarIcon } from "lucide-react"
import { useEffect, useMemo, useState } from "react"
import { useAuthStore } from "@/stores/authStore"
import { useNotificationStore } from "@/stores/notificationStore"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { getProjectSettingsService, updateProjectSettingsService } from "@/services/projectService"
import { createSprint, listSprints, updateSprint } from "@/services/sprintService"
import type { Sprint, SprintColor } from "@/mock/types"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import { SPRINT_COLOR_CLASS } from "@/lib/sprintColors"

const SPRINT_COLORS: Array<{ id: SprintColor; label: string; className: string; dotClassName: string }> = [
  { id: "blue", label: "Azul", className: SPRINT_COLOR_CLASS.blue.pill, dotClassName: SPRINT_COLOR_CLASS.blue.dot },
  { id: "teal", label: "Turquesa", className: SPRINT_COLOR_CLASS.teal.pill, dotClassName: SPRINT_COLOR_CLASS.teal.dot },
  { id: "emerald", label: "Esmeralda", className: SPRINT_COLOR_CLASS.emerald.pill, dotClassName: SPRINT_COLOR_CLASS.emerald.dot },
  { id: "green", label: "Verde", className: SPRINT_COLOR_CLASS.green.pill, dotClassName: SPRINT_COLOR_CLASS.green.dot },
  { id: "lime", label: "Lima", className: SPRINT_COLOR_CLASS.lime.pill, dotClassName: SPRINT_COLOR_CLASS.lime.dot },
  { id: "amber", label: "Ámbar", className: SPRINT_COLOR_CLASS.amber.pill, dotClassName: SPRINT_COLOR_CLASS.amber.dot },
  { id: "orange", label: "Naranja", className: SPRINT_COLOR_CLASS.orange.pill, dotClassName: SPRINT_COLOR_CLASS.orange.dot },
  { id: "red", label: "Rojo", className: SPRINT_COLOR_CLASS.red.pill, dotClassName: SPRINT_COLOR_CLASS.red.dot },
  { id: "stone", label: "Stone", className: SPRINT_COLOR_CLASS.stone.pill, dotClassName: SPRINT_COLOR_CLASS.stone.dot },
  { id: "zinc", label: "Zinc", className: SPRINT_COLOR_CLASS.zinc.pill, dotClassName: SPRINT_COLOR_CLASS.zinc.dot },
  { id: "gray", label: "Gray", className: SPRINT_COLOR_CLASS.gray.pill, dotClassName: SPRINT_COLOR_CLASS.gray.dot },
  { id: "slate", label: "Slate", className: SPRINT_COLOR_CLASS.slate.pill, dotClassName: SPRINT_COLOR_CLASS.slate.dot },
]

export default function SettingsPage() {
  const session = useAuthStore((s) => s.session)
  const setProject = useAuthStore((s) => s.setProject)
  const soundEnabled = useNotificationStore((s) => s.soundEnabled)
  const setSoundEnabled = useNotificationStore((s) => s.setSoundEnabled)

  const project = session?.project
  const [name, setName] = useState(project?.name || "")
  const [desc, setDesc] = useState(project?.description || "")
  const [category, setCategory] = useState(project?.category || "")
  const [tasksRetentionDays, setTasksRetentionDays] = useState<number>(project?.tasks_retention_days ?? 30)
  const [sprintEnabled, setSprintEnabled] = useState<boolean>(project?.sprint_enabled ?? false)
  const [sprintLengthDays, setSprintLengthDays] = useState<number>(project?.sprint_length_days ?? 14)
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [sprints, setSprints] = useState<Sprint[]>([])
  const [createSprintOpen, setCreateSprintOpen] = useState(false)
  const [newSprintName, setNewSprintName] = useState("")
  const [newSprintColor, setNewSprintColor] = useState<SprintColor>("blue")
  const [newSprintStartDate, setNewSprintStartDate] = useState<Date | undefined>(undefined)
  const [isCreatingSprint, setIsCreatingSprint] = useState(false)
  const [disableSprintsConfirmOpen, setDisableSprintsConfirmOpen] = useState(false)
  const [editSprintOpen, setEditSprintOpen] = useState(false)
  const [editingSprint, setEditingSprint] = useState<Sprint | null>(null)
  const [editSprintColor, setEditSprintColor] = useState<SprintColor>("blue")
  const [isUpdatingSprintColor, setIsUpdatingSprintColor] = useState(false)

  const selectedSprintColor = useMemo(
    () => SPRINT_COLORS.find((c) => c.id === newSprintColor) ?? SPRINT_COLORS[0],
    [newSprintColor]
  )

  const sprintColorById = useMemo(() => {
    const map = new Map<SprintColor, typeof SPRINT_COLORS[number]>()
    for (const c of SPRINT_COLORS) map.set(c.id, c)
    return map
  }, [])

  const effectiveSprintLengthDays = useMemo(() => {
    const v = Number.isFinite(sprintLengthDays) ? sprintLengthDays : 14
    return Math.min(30, Math.max(7, v || 14))
  }, [sprintLengthDays])

  const computedSprintEndDate = useMemo(() => {
    if (!newSprintStartDate) return undefined
    const start = new Date(newSprintStartDate)
    start.setHours(0, 0, 0, 0)
    const end = new Date(start)
    end.setDate(end.getDate() + effectiveSprintLengthDays)
    return end
  }, [newSprintStartDate, effectiveSprintLengthDays])

  function dispatchSprintChanged(nextActiveSprint?: Sprint | null) {
    if (typeof window === "undefined") return
    const detail =
      typeof nextActiveSprint === "undefined"
        ? {}
        : { activeSprint: nextActiveSprint }

    window.dispatchEvent(new CustomEvent("sprint:changed", { detail }))
  }

  async function saveProjectFields(fields: Record<string, any>) {
    const result = await updateProjectSettingsService(fields)
    if (!result.success || !result.project) {
      toast.error(result.error || "No se pudo guardar la configuración")
      return null
    }
    setProject(result.project as any)
    dispatchSprintChanged()
    return result.project
  }

  useEffect(() => {
    if (!project?.id) return
    let cancelled = false

    async function load() {
      setIsLoading(true)
      const [result, sprintsResult] = await Promise.all([
        getProjectSettingsService(),
        listSprints(),
      ])
      setIsLoading(false)

      if (cancelled) return
      if (!result.success || !result.project) return

      setProject(result.project as any)
      setName(result.project.name || "")
      setDesc(result.project.description || "")
      setCategory(result.project.category || "")
      setTasksRetentionDays(result.project.tasks_retention_days ?? 30)
      setSprintEnabled(!!result.project.sprint_enabled)
      setSprintLengthDays(result.project.sprint_length_days ?? 14)

      if (sprintsResult.success && sprintsResult.sprints) {
        setSprints(sprintsResult.sprints)
      } else {
        setSprints([])
      }
    }

    load()
    return () => {
      cancelled = true
    }
  }, [project?.id, setProject])

  async function handleSave() {
    if (!project?.id) return

    if (!Number.isFinite(tasksRetentionDays) || tasksRetentionDays < 0 || tasksRetentionDays > 365) {
      toast.error("La retención debe estar entre 0 y 365 días")
      return
    }

    if (sprintEnabled && (!Number.isFinite(sprintLengthDays) || sprintLengthDays < 7 || sprintLengthDays > 30)) {
      toast.error("La duración del sprint debe estar entre 7 y 30 días")
      return
    }

    setIsSaving(true)
    const result = await updateProjectSettingsService({
      name,
      description: desc,
      category,
      tasks_retention_days: tasksRetentionDays,
      sprint_enabled: sprintEnabled,
      sprint_length_days: sprintLengthDays,
    })
    setIsSaving(false)

    if (!result.success || !result.project) {
      toast.error(result.error || "No se pudo guardar la configuración")
      return
    }

    setProject(result.project as any)
    toast.success("Proyecto actualizado")
  }

  async function handleRetentionBlur() {
    if (!Number.isFinite(tasksRetentionDays) || tasksRetentionDays < 0 || tasksRetentionDays > 365) {
      toast.error("La retención debe estar entre 0 y 365 días")
      return
    }
    setIsSaving(true)
    await saveProjectFields({ tasks_retention_days: tasksRetentionDays })
    setIsSaving(false)
  }

  async function handleSprintToggle(v: boolean) {
    if (!v) {
      setDisableSprintsConfirmOpen(true)
      return
    }

    const nextLength = Number.isFinite(sprintLengthDays) ? sprintLengthDays : 14
    const clamped = Math.min(30, Math.max(7, nextLength))
    setSprintEnabled(true)
    setSprintLengthDays(clamped)

    setIsSaving(true)
    const saved = await saveProjectFields({ sprint_enabled: true, sprint_length_days: clamped })
    setIsSaving(false)
    if (saved?.sprint_enabled) {
      const sprintsResult = await listSprints()
      if (sprintsResult.success && sprintsResult.sprints) setSprints(sprintsResult.sprints)
    }
    dispatchSprintChanged()
  }

  async function handleSprintLengthBlur() {
    const next = Number.isFinite(sprintLengthDays) ? sprintLengthDays : 14
    const clamped = Math.min(30, Math.max(7, next))
    if (clamped !== sprintLengthDays) setSprintLengthDays(clamped)
    setIsSaving(true)
    await saveProjectFields({ sprint_length_days: clamped })
    setIsSaving(false)
  }

  async function confirmDisableSprints() {
    setDisableSprintsConfirmOpen(false)
    setIsSaving(true)
    const saved = await saveProjectFields({ sprint_enabled: false })
    setIsSaving(false)
    if (saved?.sprint_enabled) return
    setSprintEnabled(false)
    setSprints([])
    dispatchSprintChanged(null)
    toast.success("Sprints deshabilitados. Las tareas regresaron a Backlog.")
  }

  async function handleCreateSprint() {
    if (!sprintEnabled) {
      toast.error("Primero habilita los sprints")
      return
    }
    const nameTrimmed = newSprintName.trim()
    if (!nameTrimmed) {
      toast.error("El nombre del sprint es requerido")
      return
    }
    if (nameTrimmed.length > 120) {
      toast.error("El nombre del sprint no puede superar 120 caracteres")
      return
    }
    if (!newSprintStartDate) {
      toast.error("Selecciona una fecha de inicio")
      return
    }

    const start = new Date(newSprintStartDate)
    start.setHours(0, 0, 0, 0)

    const end = new Date(start)
    end.setDate(end.getDate() + effectiveSprintLengthDays)

    const settingsResult = await getProjectSettingsService()
    if (!settingsResult.success || !settingsResult.project) {
      toast.error(settingsResult.error || "No se pudo verificar la configuración del proyecto")
      return
    }
    if (!settingsResult.project.sprint_enabled) {
      setIsSaving(true)
      const saved = await saveProjectFields({ sprint_enabled: true, sprint_length_days: sprintLengthDays || 14 })
      setIsSaving(false)
      if (!saved?.sprint_enabled) return
    }

    setIsCreatingSprint(true)
    const result = await createSprint({
      name: nameTrimmed,
      color: newSprintColor,
      start_date: start.toISOString(),
      end_date: end.toISOString(),
      status: "planned",
    })
    setIsCreatingSprint(false)

    if (!result.success || !result.sprint) {
      const msg = result.error || "No se pudo crear el sprint"
      toast.error(msg)
      return
    }

    setSprints((prev) => [result.sprint!, ...prev])
    setNewSprintName("")
    setNewSprintColor("blue")
    setNewSprintStartDate(undefined)
    setCreateSprintOpen(false)
    toast.success("Sprint creado")
    dispatchSprintChanged()
  }

  async function handleSprintStatusChange(sprint: Sprint, status: "active" | "closed") {
    const result = await updateSprint(sprint.id, { status })
    if (!result.success || !result.sprint) {
      const msg = result.error || "No se pudo actualizar el sprint"
      if (msg.toLowerCase().includes("ya existe un sprint activo")) {
        toast.error("Ya existe un sprint activo. Cierra el sprint activo antes de activar otro.")
      } else {
        toast.error(msg)
      }
      return
    }
    let nextActive: Sprint | null | undefined = undefined
    setSprints((prev) => {
      const next = prev.map((s) => (s.id === sprint.id ? result.sprint! : s))
      const active = next.find((x) => x.status === "active") ?? null
      nextActive = active
      return next
    })
    toast.success("Sprint actualizado")
    dispatchSprintChanged(nextActive)
  }

  function openEditSprintColorDialog(sprint: Sprint) {
    setEditingSprint(sprint)
    setEditSprintColor(sprint.color || "blue")
    setEditSprintOpen(true)
  }

  async function handleUpdateSprintColor() {
    if (!editingSprint) return
    setIsUpdatingSprintColor(true)
    const result = await updateSprint(editingSprint.id, { color: editSprintColor })
    setIsUpdatingSprintColor(false)
    if (!result.success || !result.sprint) {
      toast.error(result.error || "No se pudo actualizar el color")
      return
    }
    const currentActive = sprints.find((s) => s.status === "active") ?? null
    const nextActive =
      currentActive && currentActive.id === editingSprint.id ? result.sprint! : currentActive

    setSprints((prev) => prev.map((s) => (s.id === editingSprint.id ? result.sprint! : s)))
    setEditingSprint(null)
    setEditSprintOpen(false)
    toast.success("Color actualizado")
    dispatchSprintChanged(nextActive)
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
            <Input value={name} onChange={(e) => setName(e.target.value)} disabled={isLoading || isSaving} />
          </div>
          <div>
            <Label>Descripcion</Label>
            <Textarea value={desc} onChange={(e) => setDesc(e.target.value)} rows={3} disabled={isLoading || isSaving} />
          </div>
          <div>
            <Label>Categoria</Label>
            <Input value={category} onChange={(e) => setCategory(e.target.value)} disabled={isLoading || isSaving} />
          </div>
          <Button onClick={handleSave} className="self-start" disabled={isSaving || isLoading}>
            {isSaving ? "Guardando..." : "Guardar Cambios"}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-sm">Notificaciones</CardTitle></CardHeader>
        <CardContent className="flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-sm font-medium">Sonido</p>
            <p className="text-xs text-muted-foreground">Reproduce un sonido cuando llegue una notificación</p>
          </div>
          <Switch checked={soundEnabled} onCheckedChange={setSoundEnabled} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-sm">Ciclo de Vida de Tareas</CardTitle></CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="grid gap-2">
            <Label>Retencion de tareas completadas (dias)</Label>
            <Input
              type="number"
              min={0}
              max={365}
              value={tasksRetentionDays}
              onChange={(e) => setTasksRetentionDays(Number(e.target.value))}
              onBlur={handleRetentionBlur}
              disabled={isLoading || isSaving}
            />
            <p className="text-xs text-muted-foreground">
              Oculta tareas en Done con mas de X dias desde su completado. Usa 0 para no ocultar.
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-sm">Sprints</CardTitle></CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="rounded-md border bg-muted/30 p-3 text-xs text-muted-foreground">
            <p className="font-medium text-foreground">¿Qué son los sprints?</p>
            <p>Organizan el trabajo por periodos. Las tareas pueden estar en Backlog o asignadas a un sprint.</p>
            <p className="mt-2">Las fechas y duración de un sprint creado no se pueden modificar.</p>
          </div>
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-sm font-medium">Habilitar sprints</p>
              <p className="text-xs text-muted-foreground">Activa sprints y asignacion de tareas a sprint</p>
            </div>
            <Switch checked={sprintEnabled} onCheckedChange={handleSprintToggle} disabled={isLoading || isSaving} />
          </div>
          <AlertDialog open={disableSprintsConfirmOpen} onOpenChange={setDisableSprintsConfirmOpen}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Deshabilitar sprints</AlertDialogTitle>
                <AlertDialogDescription>
                  Al deshabilitar sprints:
                  <br />- El sprint activo se cerrará
                  <br />- Todas las tareas asignadas a sprints regresarán a Backlog
                  <br />- Si vuelves a habilitar, no se reasignan automáticamente
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel disabled={isSaving}>Cancelar</AlertDialogCancel>
                <AlertDialogAction onClick={confirmDisableSprints} disabled={isSaving}>
                  Deshabilitar
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
          <div className="grid gap-2">
            <Label>Duracion del sprint (dias)</Label>
            <Input
              type="number"
              min={7}
              max={30}
              value={sprintLengthDays}
              onChange={(e) => setSprintLengthDays(Number(e.target.value))}
              onBlur={handleSprintLengthBlur}
              disabled={isLoading || isSaving || !sprintEnabled}
            />
            <p className="text-xs text-muted-foreground">Rango permitido: 7 a 30 días.</p>
          </div>

          {sprintEnabled ? (
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-medium">Gestion de sprints</p>
                <Dialog open={createSprintOpen} onOpenChange={setCreateSprintOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline" disabled={isLoading || isSaving}>Crear sprint</Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Crear sprint</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4">
                      <div className="grid gap-2">
                        <Label>Nombre</Label>
                        <Input value={newSprintName} onChange={(e) => setNewSprintName(e.target.value)} disabled={isCreatingSprint} />
                      </div>
                      <div className="grid gap-2">
                        <Label>Color</Label>
                        <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
                          {SPRINT_COLORS.map((c) => (
                            <button
                              key={c.id}
                              type="button"
                              onClick={() => setNewSprintColor(c.id)}
                              className={cn(
                                "flex items-center justify-between gap-2 rounded-md border px-2 py-1 text-xs font-medium transition-all",
                                c.className,
                                newSprintColor === c.id ? "ring-2 ring-primary ring-offset-2 ring-offset-background" : "opacity-80 hover:opacity-100",
                                isCreatingSprint && "pointer-events-none opacity-50"
                              )}
                            >
                              <span className={cn("h-2.5 w-2.5 rounded-full", c.dotClassName)} />
                              <span className="truncate">{c.label}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                      <div className="grid gap-2">
                        <Label>Fecha de inicio</Label>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              type="button"
                              variant="outline"
                              disabled={isCreatingSprint}
                              className={cn(
                                "w-full justify-start text-left font-normal",
                                !newSprintStartDate && "text-muted-foreground"
                              )}
                            >
                              <CalendarIcon className="mr-2 h-4 w-4" />
                              {newSprintStartDate ? format(newSprintStartDate, "PPP", { locale: es }) : <span>Seleccionar fecha</span>}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={newSprintStartDate}
                              onSelect={setNewSprintStartDate}
                              disabled={(d) => {
                                const today = new Date()
                                today.setHours(0, 0, 0, 0)
                                return d < today
                              }}
                            />
                          </PopoverContent>
                        </Popover>
                      </div>
                      <div className="rounded-md border p-3">
                        <p className="text-xs text-muted-foreground">
                          La fecha fin se calcula automaticamente con {effectiveSprintLengthDays} dias.
                        </p>
                        <p className={cn("mt-1 text-xs font-medium", selectedSprintColor.className, "inline-flex rounded-md border px-2 py-1")}>
                          {newSprintStartDate ? format(newSprintStartDate, "PP", { locale: es }) : "—"} →{" "}
                          {computedSprintEndDate ? format(computedSprintEndDate, "PP", { locale: es }) : "—"}
                        </p>
                      </div>
                    </div>
                    <DialogFooter className="gap-2">
                      <Button variant="outline" onClick={() => setCreateSprintOpen(false)} disabled={isCreatingSprint}>Cancelar</Button>
                      <Button onClick={handleCreateSprint} disabled={isCreatingSprint}>
                        {isCreatingSprint ? "Creando..." : "Crear"}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>

                <Dialog open={editSprintOpen} onOpenChange={(v) => { setEditSprintOpen(v); if (!v) setEditingSprint(null) }}>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Editar color del sprint</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4">
                      <div className="grid gap-1">
                        <Label>Sprint</Label>
                        <p className="text-sm font-medium">{editingSprint?.name || ""}</p>
                      </div>
                      <div className="grid gap-2">
                        <Label>Color</Label>
                        <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
                          {SPRINT_COLORS.map((c) => (
                            <button
                              key={c.id}
                              type="button"
                              onClick={() => setEditSprintColor(c.id)}
                              className={cn(
                                "flex items-center justify-between gap-2 rounded-md border px-2 py-1 text-xs font-medium transition-all",
                                c.className,
                                editSprintColor === c.id ? "ring-2 ring-primary ring-offset-2 ring-offset-background" : "opacity-80 hover:opacity-100",
                                isUpdatingSprintColor && "pointer-events-none opacity-50"
                              )}
                            >
                              <span className={cn("h-2.5 w-2.5 rounded-full", c.dotClassName)} />
                              <span className="truncate">{c.label}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                    <DialogFooter className="gap-2">
                      <Button variant="outline" onClick={() => setEditSprintOpen(false)} disabled={isUpdatingSprintColor}>Cancelar</Button>
                      <Button onClick={handleUpdateSprintColor} disabled={isUpdatingSprintColor || !editingSprint}>
                        {isUpdatingSprintColor ? "Guardando..." : "Guardar"}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>

              {sprints.length === 0 ? (
                <p className="text-sm text-muted-foreground">Aun no hay sprints creados.</p>
              ) : (
                <div className="space-y-2">
                  {sprints.map((s) => (
                    <div key={s.id} className="flex items-center justify-between rounded-lg border px-3 py-2">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className={cn("h-2 w-2 rounded-full", sprintColorById.get(s.color)?.dotClassName ?? "bg-muted-foreground")} />
                          <p
                            className={cn(
                              "text-sm font-medium truncate rounded-md border px-2 py-0.5",
                              sprintColorById.get(s.color)?.className ?? "border-border bg-muted/40"
                            )}
                            title={s.name}
                          >
                            {s.name}
                          </p>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {new Date(s.start_date).toLocaleDateString("es-ES")} - {new Date(s.end_date).toLocaleDateString("es-ES")} · {s.status}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" onClick={() => openEditSprintColorDialog(s)}>
                          Color
                        </Button>
                        {s.status === "planned" ? (
                          <Button variant="outline" size="sm" onClick={() => handleSprintStatusChange(s, "active")}>
                            Activar
                          </Button>
                        ) : null}
                        {s.status === "active" ? (
                          <Button variant="outline" size="sm" onClick={() => handleSprintStatusChange(s, "closed")}>
                            Cerrar
                          </Button>
                        ) : null}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : null}
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
