"use client"

import { useState, useEffect } from "react"
import { useAuthStore } from "@/stores/authStore"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { CalendarWithPresets } from "@/components/ui/calendar-with-presets"
import { 
  Pagination, 
  PaginationContent, 
  PaginationItem, 
  PaginationLink, 
  PaginationNext, 
  PaginationPrevious 
} from "@/components/ui/pagination"
import { Plus, Search, Trash2, Loader2, Edit, X, User } from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"
import { fetchTasks, createTask, deleteTaskService, updateTask, updateTaskStatus } from "@/services/taskService"
import { listMembers } from "@/services/memberService"
import type { Task, TaskStatus, TaskPriority, Membership, ChecklistItem } from "@/mock/types"
import { TASK_STATUS_LABELS, TASK_PRIORITY_LABELS, TASK_STATUS_COLORS, TASK_PRIORITY_COLORS } from "@/lib/constants"

export default function TasksPage() {
  const session = useAuthStore((s) => s.session)
  const projectId = session?.project?.id

  // Estados para datos
  const [tasks, setTasks] = useState<Task[]>([])
  const [members, setMembers] = useState<Membership[]>([])
  
  // Estados de carga
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [updatingId, setUpdatingId] = useState<string | null>(null)

  // Estados de paginación
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  // Estados de filtros
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [priorityFilter, setPriorityFilter] = useState<string>("all")
  const [assignedFilter, setAssignedFilter] = useState<string>("all")
  
  // Estados del formulario de crear
  const [dialogOpen, setDialogOpen] = useState(false)
  const [newTitle, setNewTitle] = useState("")
  const [newDesc, setNewDesc] = useState("")
  const [newPriority, setNewPriority] = useState<TaskPriority>("medium")
  const [newAssignee, setNewAssignee] = useState<string>("unassigned")
  const [newDueDate, setNewDueDate] = useState<Date | undefined>(undefined)
  const [newTags, setNewTags] = useState<string>("")
  const [checklistItems, setChecklistItems] = useState<ChecklistItem[]>([])
  const [checklistInput, setChecklistInput] = useState("")

  // Estados del formulario de editar
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const [editTitle, setEditTitle] = useState("")
  const [editDesc, setEditDesc] = useState("")
  const [editPriority, setEditPriority] = useState<TaskPriority>("medium")
  const [editStatus, setEditStatus] = useState<TaskStatus>("pending")
  const [editAssignee, setEditAssignee] = useState<string>("unassigned")
  const [editDueDate, setEditDueDate] = useState<Date | undefined>(undefined)
  const [editTags, setEditTags] = useState<string>("")
  const [editChecklistItems, setEditChecklistItems] = useState<ChecklistItem[]>([])
  const [editChecklistInput, setEditChecklistInput] = useState("")

  // Cargar datos al montar
  useEffect(() => {
    if (projectId) {
      loadData()
    }
  }, [projectId])

  async function loadData() {
    setLoading(true)
    try {
      const tasksData = await fetchTasks()
      setTasks(tasksData)
      
      const membersResult = await listMembers()
      if (membersResult.success && membersResult.members) {
        setMembers(membersResult.members)
      }
    } catch (error) {
      console.error("Error loading data:", error)
      toast.error("Error al cargar las tareas")
    } finally {
      setLoading(false)
    }
  }

  // Filtrar tareas
  const filtered = tasks.filter((t) => {
    if (search && !t.title.toLowerCase().includes(search.toLowerCase())) return false
    if (statusFilter !== "all" && t.status !== statusFilter) return false
    if (priorityFilter !== "all" && t.priority !== priorityFilter) return false
    if (assignedFilter !== "all") {
      if (assignedFilter === "unassigned" && t.assigned_to) return false
      if (assignedFilter !== "unassigned" && t.assigned_to !== assignedFilter) return false
    }
    return true
  })

  // Calcular paginación
  const totalPages = Math.ceil(filtered.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const paginatedTasks = filtered.slice(startIndex, endIndex)

  // Resetear página cuando cambian los filtros
  useEffect(() => {
    setCurrentPage(1)
  }, [search, statusFilter, priorityFilter, assignedFilter])

  // Obtener miembros activos del equipo
  const teamMembers = members
    .filter((m) => m.status === "active")
    .map((m) => m.user)
    .filter(Boolean)

  // Funciones para manejar checklist
  const addChecklistItem = () => {
    if (checklistInput.trim()) {
      const newItem: ChecklistItem = {
        id: crypto.randomUUID(),
        text: checklistInput.trim(),
        completed: false
      }
      setChecklistItems([...checklistItems, newItem])
      setChecklistInput("")
    }
  }

  const removeChecklistItem = (id: string) => {
    setChecklistItems(checklistItems.filter(item => item.id !== id))
  }

  async function handleCreate() {
    if (!newTitle.trim()) {
      toast.error("El título es requerido")
      return
    }

    if (!newDueDate) {
      toast.error("La fecha de vencimiento es requerida")
      return
    }

    // Validar que la fecha sea futura
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const selectedDate = new Date(newDueDate)
    selectedDate.setHours(0, 0, 0, 0)

    if (selectedDate <= today) {
      toast.error("La fecha de vencimiento debe ser posterior a hoy")
      return
    }
    
    setCreating(true)
    
    try {
      const newTask = await createTask({
        title: newTitle.trim(),
        description: newDesc.trim(),
        priority: newPriority,
        assigned_to: newAssignee && newAssignee !== "unassigned" ? newAssignee : undefined,
        due_date: newDueDate.toISOString(),
        tags: newTags.trim() ? newTags.split(",").map(t => t.trim()).filter(Boolean) : undefined,
        checklist: checklistItems.length > 0 ? checklistItems : undefined
      })
      
      setTasks([newTask, ...tasks])
      toast.success("Tarea creada exitosamente")
      
      // Limpiar formulario
      setNewTitle("")
      setNewDesc("")
      setNewPriority("medium")
      setNewAssignee("unassigned")
      setNewDueDate(undefined)
      setNewTags("")
      setChecklistItems([])
      setChecklistInput("")
      setDialogOpen(false)
    } catch (error: any) {
      console.error("Error creating task:", error)
      toast.error(error.message || "Error al crear la tarea")
    } finally {
      setCreating(false)
    }
  }

  async function handleDelete(taskId: string) {
    setDeletingId(taskId)
    
    try {
      const success = await deleteTaskService(taskId)
      
      if (success) {
        setTasks(tasks.filter(t => t.id !== taskId))
        toast.success("Tarea eliminada exitosamente")
      } else {
        toast.error("Error al eliminar la tarea")
      }
    } catch (error: any) {
      console.error("Error deleting task:", error)
      toast.error(error.message || "Error al eliminar la tarea")
    } finally {
      setDeletingId(null)
    }
  }

  function openEditDialog(task: Task) {
    setEditingTask(task)
    setEditTitle(task.title)
    setEditDesc(task.description || "")
    setEditPriority(task.priority)
    setEditStatus(task.status)
    setEditAssignee(task.assigned_to || "unassigned")
    setEditDueDate(task.due_date ? new Date(task.due_date) : undefined)
    setEditTags(task.tags?.join(", ") || "")
    setEditChecklistItems(task.checklist || [])
    setEditChecklistInput("")
    setEditDialogOpen(true)
  }

  // Funciones para manejar checklist en edición
  const addEditChecklistItem = () => {
    if (editChecklistInput.trim()) {
      const newItem: ChecklistItem = {
        id: crypto.randomUUID(),
        text: editChecklistInput.trim(),
        completed: false
      }
      setEditChecklistItems([...editChecklistItems, newItem])
      setEditChecklistInput("")
    }
  }

  const removeEditChecklistItem = (id: string) => {
    setEditChecklistItems(editChecklistItems.filter(item => item.id !== id))
  }

  async function handleUpdate() {
    if (!editingTask) return
    
    if (!editTitle.trim()) {
      toast.error("El título es requerido")
      return
    }

    if (!editDueDate) {
      toast.error("La fecha de vencimiento es requerida")
      return
    }

    // Validar que la fecha sea futura
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const selectedDate = new Date(editDueDate)
    selectedDate.setHours(0, 0, 0, 0)

    if (selectedDate <= today) {
      toast.error("La fecha de vencimiento debe ser posterior a hoy")
      return
    }
    
    setUpdatingId(editingTask.id)
    
    try {
      const updatedTask = await updateTask(editingTask.id, {
        title: editTitle.trim(),
        description: editDesc.trim(),
        priority: editPriority,
        status: editStatus,
        assigned_to: editAssignee && editAssignee !== "unassigned" ? editAssignee : null,
        due_date: editDueDate.toISOString(),
        tags: editTags ? editTags.split(",").map(t => t.trim()).filter(Boolean) : [],
        checklist: editChecklistItems.length > 0 ? editChecklistItems : undefined
      })
      
      setTasks(tasks.map(t => t.id === updatedTask.id ? updatedTask : t))
      toast.success("Tarea actualizada exitosamente")
      setEditDialogOpen(false)
      setEditingTask(null)
    } catch (error: any) {
      console.error("Error updating task:", error)
      toast.error(error.message || "Error al actualizar la tarea")
    } finally {
      setUpdatingId(null)
    }
  }

  async function handleQuickStatusChange(taskId: string, newStatus: TaskStatus) {
    try {
      const result = await updateTaskStatus(taskId, newStatus)
      setTasks(tasks.map(t => t.id === taskId ? { ...t, status: result.status } : t))
      toast.success("Estado actualizado")
    } catch (error: any) {
      console.error("Error updating status:", error)
      toast.error(error.message || "Error al actualizar el estado")
    }
  }

  function clearFilters() {
    setSearch("")
    setStatusFilter("all")
    setPriorityFilter("all")
    setAssignedFilter("all")
  }

  const hasActiveFilters = search || statusFilter !== "all" || priorityFilter !== "all" || assignedFilter !== "all"

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Tareas</h1>
          <p className="text-muted-foreground">
            {filtered.length} {filtered.length === 1 ? "tarea encontrada" : "tareas encontradas"}
            {tasks.length !== filtered.length && ` de ${tasks.length} total`}
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2"><Plus className="h-4 w-4" /> Nueva Tarea</Button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Crear Nueva Tarea</DialogTitle>
            </DialogHeader>
            <div className="grid gap-6 py-4">
              <div className="grid gap-2">
                <Label htmlFor="new-title">Título <span className="text-destructive">*</span></Label>
                <Input 
                  id="new-title"
                  value={newTitle} 
                  onChange={(e) => setNewTitle(e.target.value)} 
                  placeholder="Título de la tarea" 
                  disabled={creating}
                  className="text-base"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="new-desc">Descripción</Label>
                <Textarea 
                  id="new-desc"
                  value={newDesc} 
                  onChange={(e) => setNewDesc(e.target.value)} 
                  placeholder="Descripción detallada de la tarea..." 
                  disabled={creating}
                  rows={4}
                  className="text-base resize-none"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="new-priority">Prioridad</Label>
                  <Select 
                    value={newPriority} 
                    onValueChange={(v) => setNewPriority(v as TaskPriority)}
                    disabled={creating}
                  >
                    <SelectTrigger id="new-priority"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {Object.entries(TASK_PRIORITY_LABELS).map(([k, v]) => (
                        <SelectItem key={k} value={k}>{v}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="new-assignee">Asignar a</Label>
                  <Select 
                    value={newAssignee} 
                    onValueChange={setNewAssignee}
                    disabled={creating}
                  >
                    <SelectTrigger id="new-assignee">
                      <SelectValue placeholder="Sin asignar" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="unassigned">
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-muted-foreground" />
                          <span>Sin asignar</span>
                        </div>
                      </SelectItem>
                      {teamMembers.map((u) => u && (
                        <SelectItem key={u.id} value={u.id}>
                          <div className="flex items-center gap-2">
                            <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center text-xs font-medium">
                              {u.name.charAt(0).toUpperCase()}
                            </div>
                            <span>{u.name}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="new-due-date">
                  Fecha de vencimiento <span className="text-destructive">*</span>
                </Label>
                <div className="flex justify-center">
                  <CalendarWithPresets 
                    date={newDueDate} 
                    onDateChange={setNewDueDate}
                    disabled={creating}
                  />
                </div>
                <p className="text-xs text-muted-foreground text-center">
                  Selecciona una fecha o usa los botones de acceso rapido
                </p>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="new-tags">Etiquetas</Label>
                <Input 
                  id="new-tags"
                  value={newTags} 
                  onChange={(e) => setNewTags(e.target.value)} 
                  placeholder="frontend, urgente, bug" 
                  disabled={creating}
                  className="text-base"
                />
                <p className="text-xs text-muted-foreground">
                  Separar con comas
                </p>
              </div>
              
              {/* Checklist Section */}
              <div className="grid gap-2">
                <Label htmlFor="new-checklist">Checklist (opcional)</Label>
                <div className="flex gap-2">
                  <Input 
                    id="new-checklist"
                    value={checklistInput} 
                    onChange={(e) => setChecklistInput(e.target.value)} 
                    placeholder="Agregar item al checklist..." 
                    disabled={creating}
                    className="text-base"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault()
                        addChecklistItem()
                      }
                    }}
                  />
                  <Button 
                    type="button" 
                    onClick={addChecklistItem}
                    disabled={creating || !checklistInput.trim()}
                    variant="outline"
                  >
                    Agregar
                  </Button>
                </div>
                {checklistItems.length > 0 && (
                  <ul className="space-y-2 mt-2">
                    {checklistItems.map(item => (
                      <li key={item.id} className="flex items-center justify-between p-2 bg-muted rounded-md">
                        <span className="text-sm">{item.text}</span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeChecklistItem(item.id)}
                          disabled={creating}
                          className="h-6 w-6 p-0"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
            <DialogFooter className="gap-2">
              <Button variant="outline" onClick={() => setDialogOpen(false)} disabled={creating}>
                Cancelar
              </Button>
              <Button onClick={handleCreate} disabled={!newTitle.trim() || !newDueDate || creating}>
                {creating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Crear Tarea
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex flex-col gap-3">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input 
              placeholder="Buscar tareas..." 
              value={search} 
              onChange={(e) => setSearch(e.target.value)} 
              className="pl-9" 
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-40"><SelectValue placeholder="Estado" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los estados</SelectItem>
              {Object.entries(TASK_STATUS_LABELS).map(([k, v]) => (
                <SelectItem key={k} value={k}>{v}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={priorityFilter} onValueChange={setPriorityFilter}>
            <SelectTrigger className="w-full sm:w-40"><SelectValue placeholder="Prioridad" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas las prioridades</SelectItem>
              {Object.entries(TASK_PRIORITY_LABELS).map(([k, v]) => (
                <SelectItem key={k} value={k}>{v}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={assignedFilter} onValueChange={setAssignedFilter}>
            <SelectTrigger className="w-full sm:w-40"><SelectValue placeholder="Asignado" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="unassigned">Sin asignar</SelectItem>
              {teamMembers.map((u) => u && (
                <SelectItem key={u.id} value={u.id}>{u.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        {hasActiveFilters && (
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Filtros activos:</span>
            <Button variant="ghost" size="sm" onClick={clearFilters} className="h-7 gap-1">
              <X className="h-3 w-3" />
              Limpiar filtros
            </Button>
          </div>
        )}
      </div>

      <div className="flex flex-col gap-3">
        {paginatedTasks.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">
              {tasks.length === 0 
                ? "No hay tareas. Crea una nueva tarea para empezar." 
                : "No se encontraron tareas con los filtros aplicados."}
            </CardContent>
          </Card>
        ) : (
          paginatedTasks.map((t) => {
            const assignee = teamMembers.find((u) => u && u.id === t.assigned_to)
            const isDeleting = deletingId === t.id
            const isOverdue = t.due_date && new Date(t.due_date) < new Date() && t.status !== "done"
            
            return (
              <Card key={t.id} className="transition-shadow hover:shadow-md">
                <CardContent className="flex items-start gap-4 p-4">
                  <div className="flex-1 min-w-0 space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <Link href={`/app/tasks/${t.id}`} className="text-base font-semibold hover:underline">
                        {t.title}
                      </Link>
                    </div>
                    
                    {t.description && (
                      <p className="text-sm text-muted-foreground line-clamp-2">{t.description}</p>
                    )}
                    
                    <div className="flex flex-wrap items-center gap-2">
                      <Select value={t.status} onValueChange={(v) => handleQuickStatusChange(t.id, v as TaskStatus)}>
                        <SelectTrigger className="h-7 w-auto gap-1 border-0 px-2">
                          <Badge variant="outline" className={TASK_STATUS_COLORS[t.status]}>
                            {TASK_STATUS_LABELS[t.status]}
                          </Badge>
                        </SelectTrigger>
                        <SelectContent>
                          {Object.entries(TASK_STATUS_LABELS).map(([k, v]) => (
                            <SelectItem key={k} value={k}>{v}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      
                      <Badge variant="outline" className={TASK_PRIORITY_COLORS[t.priority]}>
                        {TASK_PRIORITY_LABELS[t.priority]}
                      </Badge>
                      
                      {assignee && (
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                          <div className="h-5 w-5 rounded-full bg-primary/10 flex items-center justify-center text-[10px] font-medium">
                            {assignee.name.charAt(0).toUpperCase()}
                          </div>
                          <span>{assignee.name}</span>
                        </div>
                      )}
                      
                      {t.due_date && (
                        <span className={`text-xs ${isOverdue ? "text-destructive font-semibold" : "text-muted-foreground"}`}>
                          {isOverdue ? "⚠️ Vencida: " : "📅 Vence: "}
                          {new Date(t.due_date).toLocaleDateString("es-ES", { day: "numeric", month: "short", year: "numeric" })}
                        </span>
                      )}
                      
                      {t.tags && t.tags.length > 0 && (
                        <div className="flex gap-1">
                          {t.tags.map((tag, idx) => (
                            <Badge key={idx} variant="secondary" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex gap-1 shrink-0">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8 text-muted-foreground hover:text-foreground" 
                      onClick={() => openEditDialog(t)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8 text-muted-foreground hover:text-destructive" 
                      onClick={() => handleDelete(t.id)}
                      disabled={isDeleting}
                    >
                      {isDeleting ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Trash2 className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )
          })
        )}
      </div>

      {/* Paginación */}
      {totalPages > 1 && (
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious 
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
              />
            </PaginationItem>
            
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
              // Mostrar solo algunas páginas alrededor de la actual
              if (
                page === 1 || 
                page === totalPages || 
                (page >= currentPage - 1 && page <= currentPage + 1)
              ) {
                return (
                  <PaginationItem key={page}>
                    <PaginationLink
                      onClick={() => setCurrentPage(page)}
                      isActive={currentPage === page}
                      className="cursor-pointer"
                    >
                      {page}
                    </PaginationLink>
                  </PaginationItem>
                )
              } else if (page === currentPage - 2 || page === currentPage + 2) {
                return (
                  <PaginationItem key={page}>
                    <span className="px-2">...</span>
                  </PaginationItem>
                )
              }
              return null
            })}
            
            <PaginationItem>
              <PaginationNext 
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}

      {/* Diálogo de Editar */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Editar Tarea</DialogTitle>
          </DialogHeader>
          <div className="grid gap-6 py-4">
            <div className="grid gap-2">
              <Label htmlFor="edit-title">Título <span className="text-destructive">*</span></Label>
              <Input 
                id="edit-title"
                value={editTitle} 
                onChange={(e) => setEditTitle(e.target.value)} 
                placeholder="Título de la tarea" 
                disabled={!!updatingId}
                className="text-base"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-desc">Descripción</Label>
              <Textarea 
                id="edit-desc"
                value={editDesc} 
                onChange={(e) => setEditDesc(e.target.value)} 
                placeholder="Descripción detallada de la tarea..." 
                disabled={!!updatingId}
                rows={4}
                className="text-base resize-none"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-status">Estado</Label>
                <Select 
                  value={editStatus} 
                  onValueChange={(v) => setEditStatus(v as TaskStatus)}
                  disabled={!!updatingId}
                >
                  <SelectTrigger id="edit-status"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {Object.entries(TASK_STATUS_LABELS).map(([k, v]) => (
                      <SelectItem key={k} value={k}>{v}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-priority">Prioridad</Label>
                <Select 
                  value={editPriority} 
                  onValueChange={(v) => setEditPriority(v as TaskPriority)}
                  disabled={!!updatingId}
                >
                  <SelectTrigger id="edit-priority"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {Object.entries(TASK_PRIORITY_LABELS).map(([k, v]) => (
                      <SelectItem key={k} value={k}>{v}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-assignee">Asignar a</Label>
              <Select 
                value={editAssignee} 
                onValueChange={setEditAssignee}
                disabled={!!updatingId}
              >
                <SelectTrigger id="edit-assignee">
                  <SelectValue placeholder="Sin asignar" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="unassigned">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <span>Sin asignar</span>
                    </div>
                  </SelectItem>
                  {teamMembers.map((u) => u && (
                    <SelectItem key={u.id} value={u.id}>
                      <div className="flex items-center gap-2">
                        <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center text-xs font-medium">
                          {u.name.charAt(0).toUpperCase()}
                        </div>
                        <span>{u.name}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="edit-due-date">
                Fecha de vencimiento <span className="text-destructive">*</span>
              </Label>
              <div className="flex justify-center">
                <CalendarWithPresets 
                  date={editDueDate} 
                  onDateChange={setEditDueDate}
                  disabled={!!updatingId}
                />
              </div>
              <p className="text-xs text-muted-foreground text-center">
                Selecciona una fecha o usa los botones de acceso rapido
              </p>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-tags">Etiquetas</Label>
              <Input 
                id="edit-tags"
                value={editTags} 
                onChange={(e) => setEditTags(e.target.value)} 
                placeholder="frontend, urgente, bug" 
                disabled={!!updatingId}
                className="text-base"
              />
              <p className="text-xs text-muted-foreground">
                Separar con comas
              </p>
            </div>

            {/* Checklist Section */}
            <div className="grid gap-2">
              <Label>Checklist</Label>
              <div className="flex gap-2">
                <Input 
                  value={editChecklistInput} 
                  onChange={(e) => setEditChecklistInput(e.target.value)} 
                  placeholder="Agregar item al checklist" 
                  disabled={!!updatingId}
                  className="text-base"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      addEditChecklistItem()
                    }
                  }}
                />
                <Button 
                  type="button" 
                  onClick={addEditChecklistItem}
                  size="default"
                  disabled={!!updatingId || !editChecklistInput.trim()}
                  variant="outline"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Agregar
                </Button>
              </div>
              {editChecklistItems.length > 0 && (
                <div className="mt-2 space-y-2 border rounded-md p-3">
                  {editChecklistItems.map((item) => (
                    <div key={item.id} className="flex items-center justify-between gap-2 p-2 bg-muted/50 rounded">
                      <span className="text-sm flex-1">{item.text}</span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removeEditChecklistItem(item.id)}
                        disabled={!!updatingId}
                        className="h-7 w-7"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
              <p className="text-xs text-muted-foreground">
                Agrega items al checklist para dividir la tarea en pasos
              </p>
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setEditDialogOpen(false)} disabled={!!updatingId}>
              Cancelar
            </Button>
            <Button onClick={handleUpdate} disabled={!editTitle.trim() || !editDueDate || !!updatingId}>
              {updatingId && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Guardar Cambios
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
