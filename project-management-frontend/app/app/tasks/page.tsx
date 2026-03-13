"use client"

import { useState, useEffect, useMemo, useRef } from "react"
import { useAuthStore } from "@/stores/authStore"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog"
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
import { listSprints } from "@/services/sprintService"
import { getProjectSettingsService } from "@/services/projectService"
import type { Task, TaskStatus, TaskPriority, Membership, ChecklistItem, Sprint } from "@/mock/types"
import { TASK_STATUS_LABELS, TASK_PRIORITY_LABELS, TASK_STATUS_COLORS, TASK_PRIORITY_COLORS } from "@/lib/constants"
import { cn } from "@/lib/utils"
import { SPRINT_COLOR_CLASS } from "@/lib/sprintColors"

export default function TasksPage() {
  const session = useAuthStore((s) => s.session)
  const setProject = useAuthStore((s) => s.setProject)
  const projectId = session?.project?.id
  const [sprintEnabled, setSprintEnabled] = useState<boolean>(!!session?.project?.sprint_enabled)
  const TITLE_MAX = 255
  const DESC_MAX = 5000
  const CHECKLIST_TEXT_MAX = 500
  const CHECKLIST_MAX_ITEMS = 50

  // Estados para datos
  const [tasks, setTasks] = useState<Task[]>([])
  const [members, setMembers] = useState<Membership[]>([])
  const [sprints, setSprints] = useState<Sprint[]>([])
  
  // Estados de carga
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)
  const [deleteCandidate, setDeleteCandidate] = useState<Task | null>(null)
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
  const [newStartDate, setNewStartDate] = useState<Date | undefined>(undefined)
  const [newDueDate, setNewDueDate] = useState<Date | undefined>(undefined)
  const [newTags, setNewTags] = useState<string>("")
  const [newSprintId, setNewSprintId] = useState<string>("backlog")
  const [checklistItems, setChecklistItems] = useState<ChecklistItem[]>([])
  const [checklistInput, setChecklistInput] = useState("")
  const checklistInputRef = useRef<HTMLInputElement>(null)

  // Estados del formulario de editar
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const [editTitle, setEditTitle] = useState("")
  const [editDesc, setEditDesc] = useState("")
  const [editPriority, setEditPriority] = useState<TaskPriority>("medium")
  const [editStatus, setEditStatus] = useState<TaskStatus>("pending")
  const [editAssignee, setEditAssignee] = useState<string>("unassigned")
  const [editStartDate, setEditStartDate] = useState<Date | undefined>(undefined)
  const [editDueDate, setEditDueDate] = useState<Date | undefined>(undefined)
  const [editTags, setEditTags] = useState<string>("")
  const [editSprintId, setEditSprintId] = useState<string>("backlog")
  const [editChecklistItems, setEditChecklistItems] = useState<ChecklistItem[]>([])
  const [editChecklistInput, setEditChecklistInput] = useState("")
  const editChecklistInputRef = useRef<HTMLInputElement>(null)

  const [createDueConfirmOpen, setCreateDueConfirmOpen] = useState(false)
  const [createDueConfirmContext, setCreateDueConfirmContext] = useState<null | {
    sprint: Sprint
    suggestedDate: Date
    message: string
  }>(null)
  const [editDueConfirmOpen, setEditDueConfirmOpen] = useState(false)
  const [editDueConfirmContext, setEditDueConfirmContext] = useState<null | {
    sprint: Sprint
    suggestedDate: Date
    message: string
  }>(null)

  // Cargar datos al montar
  useEffect(() => {
    if (projectId) {
      loadData()
    }
  }, [projectId])

  useEffect(() => {
    if (!dialogOpen || !projectId) return
    let cancelled = false
    async function ensureSprints() {
      const settingsResult = await getProjectSettingsService()
      const enabled = settingsResult.success && settingsResult.project ? !!settingsResult.project.sprint_enabled : !!session?.project?.sprint_enabled
      if (cancelled) return
      setSprintEnabled(enabled)
      if (settingsResult.success && settingsResult.project) setProject(settingsResult.project as any)
      if (enabled && sprints.length === 0) {
        const sprintsResult = await listSprints()
        if (cancelled) return
        if (sprintsResult.success && sprintsResult.sprints) setSprints(sprintsResult.sprints)
      }
    }
    ensureSprints()
    return () => {
      cancelled = true
    }
  }, [dialogOpen, projectId])

  async function loadData() {
    setLoading(true)
    try {
      const settingsResult = await getProjectSettingsService()
      const enabled = settingsResult.success && settingsResult.project ? !!settingsResult.project.sprint_enabled : !!session?.project?.sprint_enabled
      if (settingsResult.success && settingsResult.project) {
        setProject(settingsResult.project as any)
      }
      setSprintEnabled(enabled)

      const tasksData = await fetchTasks()
      setTasks(tasksData)
      
      const membersResult = await listMembers()
      if (membersResult.success && membersResult.members) {
        setMembers(membersResult.members)
      }

      if (enabled) {
        const sprintsResult = await listSprints()
        if (sprintsResult.success && sprintsResult.sprints) {
          setSprints(sprintsResult.sprints)
        } else {
          setSprints([])
        }
      } else {
        setSprints([])
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

  const sprintNameById = useMemo(() => {
    const map = new Map<string, string>()
    for (const s of sprints) map.set(s.id, s.name)
    return map
  }, [sprints])

  const assignableSprints = useMemo(() => sprints.filter((s) => s.status !== "closed"), [sprints])
  const sprintById = useMemo(() => {
    const map = new Map<string, Sprint>()
    for (const s of sprints) map.set(s.id, s)
    return map
  }, [sprints])

  function normalizeDateOnly(d: Date) {
    return new Date(d.getFullYear(), d.getMonth(), d.getDate())
  }

  function getSprintDueDateContext(sprintId: string, dueDate: Date | undefined) {
    if (!sprintEnabled) return null
    if (!dueDate) return null
    if (sprintId === "backlog") return null
    const sprint = sprintById.get(sprintId)
    if (!sprint) return null

    const due = normalizeDateOnly(dueDate).getTime()
    const start = normalizeDateOnly(new Date(sprint.start_date)).getTime()
    const end = normalizeDateOnly(new Date(sprint.end_date)).getTime()
    if (due >= start && due <= end) return null

    const suggested = due < start ? new Date(start) : new Date(end)
    const fmt = (ts: number) => new Date(ts).toLocaleDateString("es-ES")
    const message = `El sprint "${sprint.name}" va del ${fmt(start)} al ${fmt(end)}. La fecha de vencimiento seleccionada (${fmt(due)}) queda fuera del sprint.`
    return { sprint, suggestedDate: suggested, message }
  }

  const newDueSprintContext = useMemo(
    () => getSprintDueDateContext(newSprintId, newDueDate),
    [newSprintId, newDueDate, sprintEnabled, sprintById]
  )

  const editDueSprintContext = useMemo(
    () => getSprintDueDateContext(editSprintId, editDueDate ?? (editingTask?.due_date ? new Date(editingTask.due_date) : undefined)),
    [editSprintId, editDueDate, editingTask?.due_date, sprintEnabled, sprintById]
  )

  const newDueMinDate = useMemo(() => {
    const tomorrow = new Date()
    tomorrow.setHours(0, 0, 0, 0)
    tomorrow.setDate(tomorrow.getDate() + 1)
    if (!sprintEnabled || newSprintId === "backlog") return tomorrow
    const sprint = sprintById.get(newSprintId)
    if (!sprint) return tomorrow
    const start = new Date(sprint.start_date)
    start.setHours(0, 0, 0, 0)
    return start > tomorrow ? start : tomorrow
  }, [newSprintId, sprintEnabled, sprintById])

  const editDueMinDate = useMemo(() => {
    const tomorrow = new Date()
    tomorrow.setHours(0, 0, 0, 0)
    tomorrow.setDate(tomorrow.getDate() + 1)
    if (!sprintEnabled || editSprintId === "backlog") return tomorrow
    const sprint = sprintById.get(editSprintId)
    if (!sprint) return tomorrow
    const start = new Date(sprint.start_date)
    start.setHours(0, 0, 0, 0)
    return start > tomorrow ? start : tomorrow
  }, [editSprintId, sprintEnabled, sprintById])

  const newStartMinDate = useMemo(() => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    if (!sprintEnabled || newSprintId === "backlog") return today
    const sprint = sprintById.get(newSprintId)
    if (!sprint) return today
    const start = new Date(sprint.start_date)
    start.setHours(0, 0, 0, 0)
    return start > today ? start : today
  }, [newSprintId, sprintEnabled, sprintById])

  const editStartMinDate = useMemo(() => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    if (!sprintEnabled || editSprintId === "backlog") return today
    const sprint = sprintById.get(editSprintId)
    if (!sprint) return today
    const start = new Date(sprint.start_date)
    start.setHours(0, 0, 0, 0)
    return start > today ? start : today
  }, [editSprintId, sprintEnabled, sprintById])

  const newStartMaxDate = useMemo(() => {
    if (!newDueDate) return undefined
    const max = new Date(newDueDate)
    max.setHours(0, 0, 0, 0)
    max.setDate(max.getDate() - 1)
    return max
  }, [newDueDate])

  const editStartMaxDate = useMemo(() => {
    const due = editDueDate ?? (editingTask?.due_date ? new Date(editingTask.due_date) : undefined)
    if (!due) return undefined
    const max = new Date(due)
    max.setHours(0, 0, 0, 0)
    max.setDate(max.getDate() - 1)
    return max
  }, [editDueDate, editingTask?.due_date])

  useEffect(() => {
    if (!newDueDate) return
    if (newDueDate.getTime() < newDueMinDate.getTime()) {
      setNewDueDate(newDueMinDate)
    }
  }, [newDueMinDate])

  useEffect(() => {
    if (!editDueDate) return
    if (editDueDate.getTime() < editDueMinDate.getTime()) {
      setEditDueDate(editDueMinDate)
    }
  }, [editDueMinDate])

  useEffect(() => {
    if (!newStartDate) return
    if (newStartDate.getTime() < newStartMinDate.getTime()) {
      setNewStartDate(newStartMinDate)
      return
    }
    if (newStartMaxDate && newStartDate.getTime() > newStartMaxDate.getTime()) {
      setNewStartDate(newStartMaxDate)
    }
  }, [newStartMinDate, newStartMaxDate])

  useEffect(() => {
    if (!editStartDate) return
    if (editStartDate.getTime() < editStartMinDate.getTime()) {
      setEditStartDate(editStartMinDate)
      return
    }
    if (editStartMaxDate && editStartDate.getTime() > editStartMaxDate.getTime()) {
      setEditStartDate(editStartMaxDate)
    }
  }, [editStartMinDate, editStartMaxDate])

  // Funciones para manejar checklist
  const addChecklistItem = () => {
    const raw = checklistInputRef.current?.value ?? checklistInput
    const text = raw.trim()
    if (!text) return
    if (text.length > CHECKLIST_TEXT_MAX) {
      toast.error(`El checklist permite máximo ${CHECKLIST_TEXT_MAX} caracteres por item`)
      return
    }
    if (checklistItems.length >= CHECKLIST_MAX_ITEMS) {
      toast.error(`El checklist permite máximo ${CHECKLIST_MAX_ITEMS} items`)
      return
    }
    const newItem: ChecklistItem = {
      id: crypto.randomUUID(),
      text,
      completed: false
    }
    setChecklistItems((prev) => [...prev, newItem])
    if (checklistInputRef.current) checklistInputRef.current.value = ""
    setChecklistInput("")
  }

  const removeChecklistItem = (id: string) => {
    setChecklistItems(checklistItems.filter(item => item.id !== id))
  }

  async function createTaskNow(overrides?: { sprintId?: string; dueDate?: Date }) {
    const title = newTitle.trim()
    const description = newDesc.trim()
    if (!title) {
      toast.error("El título es requerido")
      return
    }
    if (title.length > TITLE_MAX) {
      toast.error(`El título permite máximo ${TITLE_MAX} caracteres`)
      return
    }
    if (description.length > DESC_MAX) {
      toast.error(`La descripción permite máximo ${DESC_MAX} caracteres`)
      return
    }

    const effectiveDueDate = overrides?.dueDate ?? newDueDate
    const effectiveSprintId = overrides?.sprintId ?? newSprintId

    if (!effectiveDueDate) {
      toast.error("La fecha de vencimiento es requerida")
      return
    }

    // Validar que la fecha sea futura
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const selectedDate = new Date(effectiveDueDate)
    selectedDate.setHours(0, 0, 0, 0)

    if (newStartDate) {
      const start = new Date(newStartDate)
      start.setHours(0, 0, 0, 0)
      if (start < today) {
        toast.error("La fecha de inicio no puede ser anterior a hoy")
        return
      }
      if (start >= selectedDate) {
        toast.error("La fecha de inicio debe ser anterior a la fecha de vencimiento")
        return
      }
    }

    if (selectedDate <= today) {
      toast.error("La fecha de vencimiento debe ser posterior a hoy")
      return
    }
    
    setCreating(true)
    
    try {
      const newTask = await createTask({
        title,
        description,
        priority: newPriority,
        assigned_to: newAssignee && newAssignee !== "unassigned" ? newAssignee : undefined,
        sprint_id: sprintEnabled ? (effectiveSprintId === "backlog" ? null : effectiveSprintId) : undefined,
        start_date: newStartDate ? newStartDate.toISOString() : undefined,
        due_date: effectiveDueDate.toISOString(),
        tags: newTags.trim() ? newTags.split(",").map(t => t.trim()).filter(Boolean) : undefined,
        checklist: checklistItems.length > 0 ? checklistItems : undefined
      })
      
      setTasks([newTask, ...tasks])
      toast.success("Tarea creada exitosamente")
      if (typeof window !== "undefined") window.dispatchEvent(new CustomEvent("tasks:changed"))
      
      // Limpiar formulario
      setNewTitle("")
      setNewDesc("")
      setNewPriority("medium")
      setNewAssignee("unassigned")
      setNewStartDate(undefined)
      setNewDueDate(undefined)
      setNewTags("")
      setNewSprintId("backlog")
      setChecklistItems([])
      setChecklistInput("")
      if (checklistInputRef.current) checklistInputRef.current.value = ""
      setDialogOpen(false)
    } catch (error: any) {
      console.error("Error creating task:", error)
      const errorMessage = error?.response?.data?.error?.message || error.message || "Error al crear la tarea"
      toast.error(errorMessage)
    } finally {
      setCreating(false)
    }
  }

  async function handleCreate() {
    const ctx = newDueSprintContext
    if (ctx) {
      setCreateDueConfirmContext(ctx)
      setCreateDueConfirmOpen(true)
      return
    }
    await createTaskNow()
  }

  async function handleDelete(taskId: string) {
    const task = tasks.find((t) => t.id === taskId) || null
    setDeleteCandidate(task)
    setDeleteConfirmOpen(true)
  }

  async function confirmDelete() {
    if (!deleteCandidate) return
    const taskId = deleteCandidate.id
    setDeletingId(taskId)
    try {
      const success = await deleteTaskService(taskId)
      if (success) {
        setTasks(tasks.filter(t => t.id !== taskId))
        toast.success("Tarea eliminada exitosamente")
        if (typeof window !== "undefined") window.dispatchEvent(new CustomEvent("tasks:changed"))
        setDeleteConfirmOpen(false)
        setDeleteCandidate(null)
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
    setEditStartDate(task.start_date ? new Date(task.start_date) : undefined)
    setEditDueDate(task.due_date ? new Date(task.due_date) : undefined)
    setEditTags(task.tags?.join(", ") || "")
    setEditSprintId(task.sprint_id ? task.sprint_id : "backlog")
    setEditChecklistItems(task.checklist || [])
    setEditChecklistInput("")
    if (editChecklistInputRef.current) editChecklistInputRef.current.value = ""
    setEditDialogOpen(true)
  }

  // Funciones para manejar checklist en edición
  const addEditChecklistItem = () => {
    const raw = editChecklistInputRef.current?.value ?? editChecklistInput
    const text = raw.trim()
    if (!text) return
    if (text.length > CHECKLIST_TEXT_MAX) {
      toast.error(`El checklist permite máximo ${CHECKLIST_TEXT_MAX} caracteres por item`)
      return
    }
    if (editChecklistItems.length >= CHECKLIST_MAX_ITEMS) {
      toast.error(`El checklist permite máximo ${CHECKLIST_MAX_ITEMS} items`)
      return
    }
    const newItem: ChecklistItem = {
      id: crypto.randomUUID(),
      text,
      completed: false
    }
    setEditChecklistItems((prev) => [...prev, newItem])
    if (editChecklistInputRef.current) editChecklistInputRef.current.value = ""
    setEditChecklistInput("")
  }

  const removeEditChecklistItem = (id: string) => {
    setEditChecklistItems(editChecklistItems.filter(item => item.id !== id))
  }

  async function updateTaskNow(overrides?: { sprintId?: string; dueDate?: Date | null }) {
    if (!editingTask) return

    const title = editTitle.trim()
    const description = editDesc.trim()
    const effectiveDueDate = typeof overrides?.dueDate !== "undefined" ? overrides.dueDate : editDueDate
    const effectiveSprintId = typeof overrides?.sprintId !== "undefined" ? overrides.sprintId : editSprintId

    const originalDueDate = editingTask.due_date ? new Date(editingTask.due_date) : undefined
    const normalizedOriginal = originalDueDate
      ? new Date(originalDueDate.getFullYear(), originalDueDate.getMonth(), originalDueDate.getDate()).getTime()
      : null
    const normalizedSelected = effectiveDueDate
      ? new Date(effectiveDueDate.getFullYear(), effectiveDueDate.getMonth(), effectiveDueDate.getDate()).getTime()
      : null
    const dueDateChanged = normalizedOriginal !== normalizedSelected

    const originalStartDate = editingTask.start_date ? new Date(editingTask.start_date) : undefined
    const normalizedOriginalStart = originalStartDate
      ? new Date(originalStartDate.getFullYear(), originalStartDate.getMonth(), originalStartDate.getDate()).getTime()
      : null
    const normalizedSelectedStart = editStartDate
      ? new Date(editStartDate.getFullYear(), editStartDate.getMonth(), editStartDate.getDate()).getTime()
      : null
    const startDateChanged = normalizedOriginalStart !== normalizedSelectedStart
    const checklistChanged = JSON.stringify(editingTask.checklist || []) !== JSON.stringify(editChecklistItems || [])

    if (!title) {
      toast.error("El título es requerido")
      return
    }
    if (title.length > TITLE_MAX) {
      toast.error(`El título permite máximo ${TITLE_MAX} caracteres`)
      return
    }
    if (description.length > DESC_MAX) {
      toast.error(`La descripción permite máximo ${DESC_MAX} caracteres`)
      return
    }

    if (!editingTask.due_date && !effectiveDueDate) {
      toast.error("La fecha de vencimiento es requerida")
      return
    }

    if (editStartDate) {
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      const start = new Date(editStartDate)
      start.setHours(0, 0, 0, 0)
      const dueRef = effectiveDueDate ? new Date(effectiveDueDate) : (editingTask.due_date ? new Date(editingTask.due_date) : null)
      if (start < today) {
        toast.error("La fecha de inicio no puede ser anterior a hoy")
        return
      }
      if (dueRef) {
        dueRef.setHours(0, 0, 0, 0)
        if (start >= dueRef) {
          toast.error("La fecha de inicio debe ser anterior a la fecha de vencimiento")
          return
        }
      }
    }

    if (effectiveDueDate && dueDateChanged) {
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      const selectedDate = new Date(effectiveDueDate)
      selectedDate.setHours(0, 0, 0, 0)

      if (selectedDate <= today) {
        toast.error("La fecha de vencimiento debe ser posterior a hoy")
        return
      }
    }
    
    setUpdatingId(editingTask.id)
    
    try {
      const payload: Partial<Task> = {
        title,
        description,
        priority: editPriority,
        status: editStatus,
        assigned_to: editAssignee && editAssignee !== "unassigned" ? editAssignee : null,
        sprint_id: sprintEnabled ? (effectiveSprintId === "backlog" ? null : effectiveSprintId) : undefined,
        tags: editTags ? editTags.split(",").map(t => t.trim()).filter(Boolean) : [],
      }

      if (effectiveDueDate && (dueDateChanged || !editingTask.due_date)) {
        payload.due_date = effectiveDueDate.toISOString()
      }
      if (startDateChanged) {
        payload.start_date = editStartDate ? editStartDate.toISOString() : null
      }
      if (checklistChanged) {
        payload.checklist = editChecklistItems
      }

      const updatedTask = await updateTask(editingTask.id, payload)
      
      setTasks(tasks.map(t => t.id === updatedTask.id ? updatedTask : t))
      toast.success("Tarea actualizada exitosamente")
      if (typeof window !== "undefined") window.dispatchEvent(new CustomEvent("tasks:changed"))
      setEditDialogOpen(false)
      setEditingTask(null)
    } catch (error: any) {
      console.error("Error updating task:", error)
      const errorMessage = error?.response?.data?.error?.message || error.message || "Error al actualizar la tarea"
      toast.error(errorMessage)
    } finally {
      setUpdatingId(null)
    }
  }

  async function handleUpdate() {
    if (!editingTask) return
    const originalSprintId = editingTask.sprint_id ? editingTask.sprint_id : "backlog"
    const sprintChanged = originalSprintId !== editSprintId
    const due = editDueDate ?? (editingTask.due_date ? new Date(editingTask.due_date) : undefined)
    const ctx = sprintChanged ? getSprintDueDateContext(editSprintId, due) : (editDueDate ? editDueSprintContext : null)
    if (ctx) {
      setEditDueConfirmContext(ctx)
      setEditDueConfirmOpen(true)
      return
    }
    await updateTaskNow()
  }

  async function handleQuickStatusChange(taskId: string, newStatus: TaskStatus) {
    try {
      const result = await updateTaskStatus(taskId, newStatus)
      setTasks(tasks.map(t => t.id === taskId ? { ...t, status: result.status } : t))
      toast.success("Estado actualizado")
      if (typeof window !== "undefined") window.dispatchEvent(new CustomEvent("tasks:changed"))
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
                <p className="text-xs text-muted-foreground">
                  {newTitle.length}/{TITLE_MAX}
                </p>
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
                <p className="text-xs text-muted-foreground">
                  {newDesc.length}/{DESC_MAX}
                </p>
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
              {sprintEnabled ? (
                <div className="grid gap-2">
                  <Label htmlFor="new-sprint">Sprint</Label>
                  <Select value={newSprintId} onValueChange={setNewSprintId} disabled={creating}>
                    <SelectTrigger id="new-sprint"><SelectValue placeholder="Backlog" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="backlog">Backlog (sin sprint)</SelectItem>
                      {assignableSprints.map((s) => (
                        <SelectItem key={s.id} value={s.id}>
                        <div className="flex items-center gap-2">
                          <span className={cn("h-2 w-2 rounded-full", SPRINT_COLOR_CLASS[s.color].dot)} />
                          <span className="truncate">{s.name}</span>
                          <span className="text-muted-foreground">({s.status})</span>
                        </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">No se permite asignar tareas a sprints cerrados.</p>
                </div>
              ) : null}
              <div className="flex flex-col gap-2">
                <Label htmlFor="new-start-date">Fecha de inicio (opcional)</Label>
                {(() => {
                  if (!sprintEnabled || newSprintId === "backlog") return null
                  const sp = sprintById.get(newSprintId)
                  if (!sp) return null
                  const cls = SPRINT_COLOR_CLASS[sp.color]
                  const start = new Date(sp.start_date).toLocaleDateString("es-ES")
                  const end = new Date(sp.end_date).toLocaleDateString("es-ES")
                  return (
                    <div className="flex items-center justify-center">
                      <span className={cn("inline-flex items-center gap-1.5 rounded-md border px-2 py-1 text-xs font-medium", cls.pill)} title={`${sp.name} · ${start} → ${end}`}>
                        <span className={cn("h-2 w-2 rounded-full", cls.dot)} />
                        <span className="truncate">{sp.name}</span>
                        <span className="text-[10px] opacity-80">{start} → {end}</span>
                      </span>
                    </div>
                  )
                })()}
                <div className="flex justify-center">
                  <CalendarWithPresets
                    date={newStartDate}
                    onDateChange={setNewStartDate}
                    minDate={newStartMinDate}
                    maxDate={newStartMaxDate}
                    disabled={creating}
                  />
                </div>
                <p className="text-xs text-muted-foreground text-center">
                  Sirve para Timeline. Si no la defines ahora, puedes asignarla después en Timeline.
                </p>
                {newStartDate ? (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="w-fit self-center"
                    onClick={() => setNewStartDate(undefined)}
                    disabled={creating}
                  >
                    Quitar fecha de inicio
                  </Button>
                ) : null}
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="new-due-date">
                  Fecha de vencimiento <span className="text-destructive">*</span>
                </Label>
                {(() => {
                  if (!sprintEnabled || newSprintId === "backlog") return null
                  const sp = sprintById.get(newSprintId)
                  if (!sp) return null
                  const cls = SPRINT_COLOR_CLASS[sp.color]
                  const start = new Date(sp.start_date).toLocaleDateString("es-ES")
                  const end = new Date(sp.end_date).toLocaleDateString("es-ES")
                  return (
                    <div className="flex items-center justify-center">
                      <span className={cn("inline-flex items-center gap-1.5 rounded-md border px-2 py-1 text-xs font-medium", cls.pill)} title={`${sp.name} · ${start} → ${end}`}>
                        <span className={cn("h-2 w-2 rounded-full", cls.dot)} />
                        <span className="truncate">{sp.name}</span>
                        <span className="text-[10px] opacity-80">{start} → {end}</span>
                      </span>
                    </div>
                  )
                })()}
                <div className="flex justify-center">
                  <CalendarWithPresets 
                    date={newDueDate} 
                    onDateChange={setNewDueDate}
                    minDate={newDueMinDate}
                    disabled={creating}
                  />
                </div>
                <p className="text-xs text-muted-foreground text-center">
                  Selecciona una fecha o usa los botones de acceso rapido
                </p>
                {newDueSprintContext ? (
                  <p className="text-xs text-amber-600 dark:text-amber-400 text-center">
                    {newDueSprintContext.message} Sugerencia: ajustar a {newDueSprintContext.suggestedDate.toLocaleDateString("es-ES")}.
                  </p>
                ) : null}
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
                    ref={checklistInputRef}
                    defaultValue=""
                    onChange={(e) => setChecklistInput(e.target.value)}
                    placeholder="Agregar item al checklist..." 
                    disabled={creating}
                    className="text-base"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault()
                        addChecklistItem()
                      }
                    }}
                  />
                  <Button 
                    type="button" 
                    onClick={addChecklistItem}
                    disabled={creating || checklistItems.length >= CHECKLIST_MAX_ITEMS}
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
                <p className="text-xs text-muted-foreground">
                  {checklistItems.length}/{CHECKLIST_MAX_ITEMS} items
                </p>
              </div>
            </div>
            <DialogFooter className="gap-2">
              <Button variant="outline" onClick={() => setDialogOpen(false)} disabled={creating}>
                Cancelar
              </Button>
              <Button
                onClick={handleCreate}
                disabled={
                  !newTitle.trim() ||
                  newTitle.trim().length > TITLE_MAX ||
                  newDesc.trim().length > DESC_MAX ||
                  !newDueDate ||
                  creating
                }
              >
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

                      {sprintEnabled ? (
                        t.sprint_id ? (
                          (() => {
                            const sp = sprintById.get(t.sprint_id!)
                            const cls = sp ? SPRINT_COLOR_CLASS[sp.color] : null
                            return (
                              <span
                                className={cn(
                                  "inline-flex items-center gap-1.5 rounded-md border px-2 py-0.5 text-xs font-medium",
                                  cls?.pill ?? "border-border bg-muted/40 text-foreground"
                                )}
                                title={sp?.name || "Sprint"}
                              >
                                <span className={cn("h-2 w-2 rounded-full", cls?.dot ?? "bg-muted-foreground")} />
                                <span className="truncate">{sp?.name || sprintNameById.get(t.sprint_id) || "Sprint"}</span>
                              </span>
                            )
                          })()
                        ) : (
                          <Badge variant="secondary" className="text-xs">
                            Backlog
                          </Badge>
                        )
                      ) : null}
                      
                      {assignee && (
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                          {assignee.avatar ? (
                            <img
                              alt=""
                              className="h-5 w-5 rounded-full border border-border bg-card object-cover"
                              src={assignee.avatar}
                            />
                          ) : (
                            <div className="h-5 w-5 rounded-full bg-primary/10 flex items-center justify-center text-[10px] font-medium">
                              {assignee.name.charAt(0).toUpperCase()}
                            </div>
                          )}
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
              <p className="text-xs text-muted-foreground">
                {editTitle.length}/{TITLE_MAX}
              </p>
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
              <p className="text-xs text-muted-foreground">
                {editDesc.length}/{DESC_MAX}
              </p>
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
            {sprintEnabled ? (
              <div className="grid gap-2">
                <Label htmlFor="edit-sprint">Sprint</Label>
                <Select value={editSprintId} onValueChange={setEditSprintId} disabled={!!updatingId}>
                  <SelectTrigger id="edit-sprint"><SelectValue placeholder="Backlog" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="backlog">Backlog (sin sprint)</SelectItem>
                    {assignableSprints.map((s) => (
                      <SelectItem key={s.id} value={s.id}>
                        <div className="flex items-center gap-2">
                          <span className={cn("h-2 w-2 rounded-full", SPRINT_COLOR_CLASS[s.color].dot)} />
                          <span className="truncate">{s.name}</span>
                          <span className="text-muted-foreground">({s.status})</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            ) : null}
            <div className="flex flex-col gap-2">
              <Label htmlFor="edit-start-date">Fecha de inicio (opcional)</Label>
              {(() => {
                if (!sprintEnabled || editSprintId === "backlog") return null
                const sp = sprintById.get(editSprintId)
                if (!sp) return null
                const cls = SPRINT_COLOR_CLASS[sp.color]
                const start = new Date(sp.start_date).toLocaleDateString("es-ES")
                const end = new Date(sp.end_date).toLocaleDateString("es-ES")
                return (
                  <div className="flex items-center justify-center">
                    <span className={cn("inline-flex items-center gap-1.5 rounded-md border px-2 py-1 text-xs font-medium", cls.pill)} title={`${sp.name} · ${start} → ${end}`}>
                      <span className={cn("h-2 w-2 rounded-full", cls.dot)} />
                      <span className="truncate">{sp.name}</span>
                      <span className="text-[10px] opacity-80">{start} → {end}</span>
                    </span>
                  </div>
                )
              })()}
              <div className="flex justify-center">
                <CalendarWithPresets
                  date={editStartDate}
                  onDateChange={setEditStartDate}
                  minDate={editStartMinDate}
                  maxDate={editStartMaxDate}
                  disabled={!!updatingId}
                />
              </div>
              <p className="text-xs text-muted-foreground text-center">Sirve para Timeline.</p>
              {editStartDate ? (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="w-fit self-center"
                  onClick={() => setEditStartDate(undefined)}
                  disabled={!!updatingId}
                >
                  Quitar fecha de inicio
                </Button>
              ) : null}
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="edit-due-date">
                Fecha de vencimiento <span className="text-destructive">*</span>
              </Label>
              {(() => {
                if (!sprintEnabled || editSprintId === "backlog") return null
                const sp = sprintById.get(editSprintId)
                if (!sp) return null
                const cls = SPRINT_COLOR_CLASS[sp.color]
                const start = new Date(sp.start_date).toLocaleDateString("es-ES")
                const end = new Date(sp.end_date).toLocaleDateString("es-ES")
                return (
                  <div className="flex items-center justify-center">
                    <span className={cn("inline-flex items-center gap-1.5 rounded-md border px-2 py-1 text-xs font-medium", cls.pill)} title={`${sp.name} · ${start} → ${end}`}>
                      <span className={cn("h-2 w-2 rounded-full", cls.dot)} />
                      <span className="truncate">{sp.name}</span>
                      <span className="text-[10px] opacity-80">{start} → {end}</span>
                    </span>
                  </div>
                )
              })()}
              <div className="flex justify-center">
                <CalendarWithPresets 
                  date={editDueDate} 
                  onDateChange={setEditDueDate}
                  minDate={editDueMinDate}
                  disabled={!!updatingId}
                />
              </div>
              <p className="text-xs text-muted-foreground text-center">
                Selecciona una fecha o usa los botones de acceso rapido
              </p>
              {editDueSprintContext ? (
                <p className="text-xs text-amber-600 dark:text-amber-400 text-center">
                  {editDueSprintContext.message} Sugerencia: ajustar a {editDueSprintContext.suggestedDate.toLocaleDateString("es-ES")}.
                </p>
              ) : null}
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
                  ref={editChecklistInputRef}
                  defaultValue=""
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
                  disabled={!!updatingId || editChecklistItems.length >= CHECKLIST_MAX_ITEMS}
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
                {editChecklistItems.length}/{CHECKLIST_MAX_ITEMS} items
              </p>
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setEditDialogOpen(false)} disabled={!!updatingId}>
              Cancelar
            </Button>
            <Button
              onClick={handleUpdate}
              disabled={
                !editTitle.trim() ||
                editTitle.trim().length > TITLE_MAX ||
                editDesc.trim().length > DESC_MAX ||
                (!editingTask?.due_date && !editDueDate) ||
                !!updatingId
              }
            >
              {updatingId && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Guardar Cambios
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={createDueConfirmOpen} onOpenChange={setCreateDueConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Vencimiento fuera del sprint</AlertDialogTitle>
            <AlertDialogDescription>
              {createDueConfirmContext?.message}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2">
            <AlertDialogCancel
              onClick={() => setCreateDueConfirmContext(null)}
              disabled={creating}
            >
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              disabled={creating || !createDueConfirmContext}
              onClick={() => {
                const ctx = createDueConfirmContext
                setCreateDueConfirmOpen(false)
                setCreateDueConfirmContext(null)
                if (!ctx) return
                setNewDueDate(ctx.suggestedDate)
                void createTaskNow({ dueDate: ctx.suggestedDate })
              }}
            >
              Ajustar fecha
            </AlertDialogAction>
            <AlertDialogAction
              disabled={creating}
              onClick={() => {
                setCreateDueConfirmOpen(false)
                setCreateDueConfirmContext(null)
                setNewSprintId("backlog")
                void createTaskNow({ sprintId: "backlog" })
              }}
            >
              Mover a Backlog
            </AlertDialogAction>
            <AlertDialogAction
              disabled={creating}
              onClick={() => {
                setCreateDueConfirmOpen(false)
                setCreateDueConfirmContext(null)
                void createTaskNow()
              }}
            >
              Continuar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={editDueConfirmOpen} onOpenChange={setEditDueConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Vencimiento fuera del sprint</AlertDialogTitle>
            <AlertDialogDescription>
              {editDueConfirmContext?.message}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2">
            <AlertDialogCancel
              onClick={() => setEditDueConfirmContext(null)}
              disabled={!!updatingId}
            >
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              disabled={!!updatingId || !editDueConfirmContext}
              onClick={() => {
                const ctx = editDueConfirmContext
                setEditDueConfirmOpen(false)
                setEditDueConfirmContext(null)
                if (!ctx) return
                setEditDueDate(ctx.suggestedDate)
                void updateTaskNow({ dueDate: ctx.suggestedDate })
              }}
            >
              Ajustar fecha
            </AlertDialogAction>
            <AlertDialogAction
              disabled={!!updatingId}
              onClick={() => {
                setEditDueConfirmOpen(false)
                setEditDueConfirmContext(null)
                setEditSprintId("backlog")
                void updateTaskNow({ sprintId: "backlog" })
              }}
            >
              Mover a Backlog
            </AlertDialogAction>
            <AlertDialogAction
              disabled={!!updatingId}
              onClick={() => {
                setEditDueConfirmOpen(false)
                setEditDueConfirmContext(null)
                void updateTaskNow()
              }}
            >
              Continuar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Eliminar tarea</AlertDialogTitle>
            <AlertDialogDescription>
              {deleteCandidate ? `Esta acción eliminará la tarea "${deleteCandidate.title}" y no se puede deshacer.` : "Esta acción no se puede deshacer."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2">
            <AlertDialogCancel
              disabled={!!deletingId}
              onClick={() => {
                setDeleteConfirmOpen(false)
                setDeleteCandidate(null)
              }}
            >
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              disabled={!!deletingId || !deleteCandidate}
              onClick={confirmDelete}
            >
              {deletingId ? "Eliminando..." : "Eliminar"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
