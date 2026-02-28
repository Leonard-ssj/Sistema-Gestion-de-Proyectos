"use client"

import { use, useState, useEffect } from "react"
import { useDataStore } from "@/stores/dataStore"
import { useAuthStore } from "@/stores/authStore"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { ArrowLeft, Send, Plus, Trash2, Loader2 } from "lucide-react"
import Link from "next/link"
import { TASK_STATUS_LABELS, TASK_STATUS_COLORS, TASK_PRIORITY_LABELS, TASK_PRIORITY_COLORS } from "@/lib/constants"
import type { TaskStatus, TaskPriority, ChecklistItem, Comment, Task } from "@/mock/types"
import { getTask, updateTask as updateTaskService } from "@/services/taskService"
import { listComments, createComment, updateComment, deleteComment } from "@/services/commentService"
import { toast } from "sonner"

export default function TaskDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const users = useDataStore((s) => s.users)
  const session = useAuthStore((s) => s.session)

  // Estado local para la tarea y comentarios
  const [task, setTask] = useState<Task | null>(null)
  const [comments, setComments] = useState<Comment[]>([])
  const [isLoadingTask, setIsLoadingTask] = useState(true)
  const [isLoadingComments, setIsLoadingComments] = useState(true)
  const [taskNotFound, setTaskNotFound] = useState(false)
  
  const [commentText, setCommentText] = useState("")
  const [newCheckItem, setNewCheckItem] = useState("")
  const [isEditingChecklist, setIsEditingChecklist] = useState(false)
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null)
  const [editingCommentText, setEditingCommentText] = useState("")

  // Determinar si el usuario actual es Owner
  const isOwner = session?.user?.role === 'owner'

  // Cargar datos al montar el componente (Tarea 15.1 y 15.2)
  useEffect(() => {
    async function loadData() {
      try {
        // Cargar tarea (15.1)
        setIsLoadingTask(true)
        const taskData = await getTask(id)
        
        if (!taskData) {
          setTaskNotFound(true)
          setIsLoadingTask(false)
          return
        }
        
        setTask(taskData)
        setIsLoadingTask(false)

        // Cargar comentarios (15.2)
        setIsLoadingComments(true)
        const commentsData = await listComments(id)
        setComments(commentsData)
        setIsLoadingComments(false)
      } catch (error: any) {
        setIsLoadingTask(false)
        setIsLoadingComments(false)
        
        // Manejar error 404 (15.3)
        if (error?.response?.status === 404) {
          setTaskNotFound(true)
          toast.error("Tarea no encontrada")
        } else {
          toast.error("Error al cargar los datos de la tarea")
        }
        
        console.error('Error loading task data:', error)
      }
    }

    loadData()
  }, [id])

  // Mostrar mensaje de tarea no encontrada (15.3)
  if (taskNotFound) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-20">
        <p className="text-muted-foreground">Tarea no encontrada</p>
        <Link href="/app/board">
          <Button variant="outline">
            <ArrowLeft className="mr-2 h-4 w-4" /> Volver al tablero
          </Button>
        </Link>
      </div>
    )
  }

  // Mostrar loading skeleton mientras carga (15.1)
  if (isLoadingTask) {
    return (
      <div className="flex flex-col gap-6">
        <div className="flex items-center gap-3">
          <Link href="/app/tasks">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div className="flex-1">
            <div className="h-6 w-64 bg-gray-200 animate-pulse rounded" />
            <div className="mt-2 flex gap-2">
              <div className="h-5 w-20 bg-gray-200 animate-pulse rounded" />
              <div className="h-5 w-20 bg-gray-200 animate-pulse rounded" />
            </div>
          </div>
        </div>
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="flex flex-col gap-6 lg:col-span-2">
            <Card>
              <CardHeader className="pb-2">
                <div className="h-4 w-24 bg-gray-200 animate-pulse rounded" />
              </CardHeader>
              <CardContent>
                <div className="h-20 bg-gray-200 animate-pulse rounded" />
              </CardContent>
            </Card>
          </div>
          <div>
            <Card>
              <CardHeader className="pb-2">
                <div className="h-4 w-24 bg-gray-200 animate-pulse rounded" />
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="h-10 bg-gray-200 animate-pulse rounded" />
                  <div className="h-10 bg-gray-200 animate-pulse rounded" />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    )
  }

  if (!task) {
    return null
  }

  const assignee = users.find((u) => u.id === task.assigned_to)
  const creator = users.find((u) => u.id === task.created_by)
  const checklistDone = task.checklist?.filter((c) => c.completed).length || 0

  // Actualizar status con optimistic update (16.1)
  async function handleStatusChange(newStatus: TaskStatus) {
    if (!task) return
    
    // Guardar estado anterior para rollback
    const previousStatus = task.status
    
    // Optimistic update: actualizar UI inmediatamente
    setTask({ ...task, status: newStatus })
    
    try {
      // Llamar al backend para persistir el cambio
      await updateTaskService(task.id, { status: newStatus })
      
      // Mostrar notificación de éxito
      toast.success("Estado actualizado correctamente")
    } catch (error: any) {
      // Rollback: restaurar estado anterior
      setTask({ ...task, status: previousStatus })
      
      // Manejar errores (16.3)
      const errorMessage = error?.response?.data?.error?.message || "Error al actualizar estado"
      toast.error(errorMessage)
      
      console.error('Error updating status:', error)
    }
  }

  // Actualizar priority con optimistic update (16.2)
  async function handlePriorityChange(newPriority: TaskPriority) {
    if (!task) return
    
    // Guardar estado anterior para rollback
    const previousPriority = task.priority
    
    // Optimistic update: actualizar UI inmediatamente
    setTask({ ...task, priority: newPriority })
    
    try {
      // Llamar al backend para persistir el cambio
      await updateTaskService(task.id, { priority: newPriority })
      
      // Mostrar notificación de éxito
      toast.success("Prioridad actualizada correctamente")
    } catch (error: any) {
      // Rollback: restaurar estado anterior
      setTask({ ...task, priority: previousPriority })
      
      // Manejar errores (16.3)
      const errorMessage = error?.response?.data?.error?.message || "Error al actualizar prioridad"
      toast.error(errorMessage)
      
      console.error('Error updating priority:', error)
    }
  }

  async function toggleChecklist(itemId: string) {
    if (!task) return
    
    // Guardar estado anterior para rollback
    const previousChecklist = [...(task.checklist || [])]
    
    // Optimistic update: actualizar UI inmediatamente
    const updatedChecklist = (task.checklist || []).map((c) => 
      c.id === itemId ? { ...c, completed: !c.completed } : c
    )
    setTask({ ...task, checklist: updatedChecklist })
    
    try {
      // Llamar al backend para persistir el cambio
      await updateTaskService(task.id, { checklist: updatedChecklist })
      
      // Mostrar notificación de éxito
      toast.success("Checklist actualizado correctamente")
    } catch (error: any) {
      // Rollback: restaurar estado anterior
      setTask({ ...task, checklist: previousChecklist })
      
      // Mostrar notificación de error
      const errorMessage = error?.response?.data?.error?.message || "Error al actualizar checklist"
      toast.error(errorMessage)
      
      console.error('Error toggling checklist item:', error)
    }
  }

  async function addChecklistItem() {
    if (!newCheckItem.trim() || !task) return
    
    // Generar UUID para el nuevo item
    const newItem: ChecklistItem = { 
      id: crypto.randomUUID(), 
      text: newCheckItem.trim(), 
      completed: false 
    }
    
    const updatedChecklist = [...(task.checklist || []), newItem]
    
    try {
      // Llamar al backend para persistir el cambio
      await updateTaskService(task.id, { checklist: updatedChecklist })
      
      // Actualizar el estado local
      setTask({ ...task, checklist: updatedChecklist })
      
      // Limpiar el campo de input
      setNewCheckItem("")
      
      // Mostrar notificación de éxito
      toast.success("Item agregado correctamente")
    } catch (error: any) {
      // Mostrar notificación de error
      const errorMessage = error?.response?.data?.error?.message || "Error al agregar item"
      toast.error(errorMessage)
      
      console.error('Error adding checklist item:', error)
    }
  }

  async function removeChecklistItem(itemId: string) {
    if (!task) return
    
    const updatedChecklist = (task.checklist || []).filter((c) => c.id !== itemId)
    
    try {
      // Llamar al backend para persistir el cambio
      await updateTaskService(task.id, { checklist: updatedChecklist })
      
      // Actualizar el estado local
      setTask({ ...task, checklist: updatedChecklist })
      
      // Mostrar notificación de éxito
      toast.success("Item eliminado correctamente")
    } catch (error: any) {
      // Manejar errores 403 con mensaje apropiado (18.3)
      if (error?.response?.status === 403) {
        toast.error("No tienes permisos suficientes para modificar el checklist")
      } else {
        const errorMessage = error?.response?.data?.error?.message || "Error al eliminar item"
        toast.error(errorMessage)
      }
      
      console.error('Error removing checklist item:', error)
    }
  }

  // Crear comentario con optimistic update (17.1)
  async function addComment() {
    if (!commentText.trim() || !session?.user || !task) return
    
    // Crear comentario optimista
    const optimisticComment: Comment = {
      id: `temp-${Date.now()}`,
      task_id: task.id,
      user_id: session.user.id,
      user_name: session.user.name,
      text: commentText.trim(),
      created_at: new Date().toISOString(),
    }
    
    // Optimistic update: agregar comentario a la UI inmediatamente
    setComments([...comments, optimisticComment])
    setCommentText("")
    
    try {
      // Llamar al backend para crear el comentario (17.1)
      const newComment = await createComment(task.id, commentText.trim())
      
      if (newComment) {
        // Reemplazar comentario optimista con respuesta del backend
        setComments(comments.map(c => 
          c.id === optimisticComment.id ? newComment : c
        ).concat(newComment).filter((c, i, arr) => 
          arr.findIndex(x => x.id === c.id) === i
        ))
        
        // Mostrar notificación de éxito (17.3)
        toast.success("Comentario agregado correctamente")
      } else {
        throw new Error("No se recibió respuesta del servidor")
      }
    } catch (error: any) {
      // Rollback: eliminar comentario optimista (17.2)
      setComments(comments.filter(c => c.id !== optimisticComment.id))
      
      // Restaurar texto del comentario
      setCommentText(optimisticComment.text)
      
      // Mostrar notificación de error (17.2)
      const errorMessage = error?.response?.data?.error?.message || "Error al crear comentario"
      toast.error(errorMessage)
      
      console.error('Error creating comment:', error)
    }
  }

  // Iniciar edición de comentario (18.1)
  function startEditComment(comment: Comment) {
    setEditingCommentId(comment.id)
    setEditingCommentText(comment.text)
  }

  // Cancelar edición de comentario
  function cancelEditComment() {
    setEditingCommentId(null)
    setEditingCommentText("")
  }

  // Guardar edición de comentario (18.1)
  async function saveEditComment(commentId: string) {
    if (!editingCommentText.trim() || !task) return
    
    try {
      // Llamar al backend para actualizar el comentario
      const updatedComment = await updateComment(task.id, commentId, editingCommentText.trim())
      
      if (updatedComment) {
        // Actualizar comentario en la lista
        setComments(comments.map(c => 
          c.id === commentId ? updatedComment : c
        ))
        
        // Limpiar estado de edición
        setEditingCommentId(null)
        setEditingCommentText("")
        
        // Mostrar notificación de éxito
        toast.success("Comentario actualizado correctamente")
      } else {
        throw new Error("No se recibió respuesta del servidor")
      }
    } catch (error: any) {
      // Manejar errores 403 con mensaje apropiado (18.3)
      if (error?.response?.status === 403) {
        toast.error("No tienes permisos suficientes para editar este comentario")
      } else {
        const errorMessage = error?.response?.data?.error?.message || "Error al actualizar comentario"
        toast.error(errorMessage)
      }
      
      console.error('Error updating comment:', error)
    }
  }

  // Eliminar comentario con optimistic update (18.2)
  async function deleteCommentHandler(commentId: string) {
    if (!task) return
    
    // Guardar comentario para rollback
    const commentToDelete = comments.find(c => c.id === commentId)
    if (!commentToDelete) return
    
    // Optimistic update: eliminar comentario de la UI inmediatamente
    setComments(comments.filter(c => c.id !== commentId))
    
    try {
      // Llamar al backend para eliminar el comentario
      const success = await deleteComment(task.id, commentId)
      
      if (success) {
        // Mostrar notificación de éxito
        toast.success("Comentario eliminado correctamente")
      } else {
        throw new Error("No se pudo eliminar el comentario")
      }
    } catch (error: any) {
      // Rollback: restaurar comentario (18.2)
      setComments([...comments, commentToDelete].sort((a, b) => 
        new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      ))
      
      // Manejar errores 403 con mensaje apropiado (18.3)
      if (error?.response?.status === 403) {
        toast.error("No tienes permisos suficientes para eliminar este comentario")
      } else {
        const errorMessage = error?.response?.data?.error?.message || "Error al eliminar comentario"
        toast.error(errorMessage)
      }
      
      console.error('Error deleting comment:', error)
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-3">
        <Link href="/app/tasks"><Button variant="ghost" size="icon"><ArrowLeft className="h-4 w-4" /></Button></Link>
        <div className="flex-1">
          <h1 className="text-xl font-bold tracking-tight">{task.title}</h1>
          <div className="mt-1 flex flex-wrap items-center gap-2">
            <Badge variant="outline" className={TASK_STATUS_COLORS[task.status]}>{TASK_STATUS_LABELS[task.status]}</Badge>
            <Badge variant="outline" className={TASK_PRIORITY_COLORS[task.priority]}>{TASK_PRIORITY_LABELS[task.priority]}</Badge>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="flex flex-col gap-6 lg:col-span-2">
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm">Descripcion</CardTitle></CardHeader>
            <CardContent><p className="text-sm leading-relaxed text-muted-foreground">{task.description || "Sin descripcion"}</p></CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm">Checklist ({checklistDone}/{task.checklist?.length || 0})</CardTitle>
                {isOwner && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsEditingChecklist(!isEditingChecklist)}
                  >
                    {isEditingChecklist ? 'Cancelar' : 'Editar'}
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent className="flex flex-col gap-2">
              {task.checklist && task.checklist.length > 0 ? (
                <>
                  {task.checklist.map((item) => (
                    <div key={item.id} className="flex items-center gap-3 rounded-lg border p-2">
                      <Checkbox checked={item.completed} onCheckedChange={() => toggleChecklist(item.id)} />
                      <span className={`flex-1 text-sm ${item.completed ? "line-through text-muted-foreground" : ""}`}>{item.text}</span>
                      {isOwner && isEditingChecklist && (
                        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => removeChecklistItem(item.id)}>
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      )}
                    </div>
                  ))}
                </>
              ) : (
                <p className="text-sm text-muted-foreground py-2">No hay items en el checklist</p>
              )}
              {isOwner && isEditingChecklist && (
                <div className="flex items-center gap-2">
                  <Input placeholder="Nuevo item..." value={newCheckItem} onChange={(e) => setNewCheckItem(e.target.value)} onKeyDown={(e) => e.key === "Enter" && addChecklistItem()} className="flex-1" />
                  <Button size="icon" variant="outline" onClick={addChecklistItem}><Plus className="h-4 w-4" /></Button>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm">Comentarios ({comments.length})</CardTitle></CardHeader>
            <CardContent className="flex flex-col gap-3">
              {isLoadingComments ? (
                // Loading skeleton para comentarios (15.2)
                <div className="space-y-3">
                  <div className="rounded-lg border p-3">
                    <div className="flex items-center gap-2">
                      <div className="h-6 w-6 bg-gray-200 animate-pulse rounded-full" />
                      <div className="h-4 w-24 bg-gray-200 animate-pulse rounded" />
                      <div className="h-3 w-32 bg-gray-200 animate-pulse rounded" />
                    </div>
                    <div className="mt-2 h-4 bg-gray-200 animate-pulse rounded" />
                  </div>
                  <div className="rounded-lg border p-3">
                    <div className="flex items-center gap-2">
                      <div className="h-6 w-6 bg-gray-200 animate-pulse rounded-full" />
                      <div className="h-4 w-24 bg-gray-200 animate-pulse rounded" />
                      <div className="h-3 w-32 bg-gray-200 animate-pulse rounded" />
                    </div>
                    <div className="mt-2 h-4 bg-gray-200 animate-pulse rounded" />
                  </div>
                </div>
              ) : (
                <>
                  {comments.map((c) => (
                    <div key={c.id} className="rounded-lg border p-3">
                      <div className="flex items-center gap-2">
                        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">{c.user_name?.charAt(0) || '?'}</div>
                        <span className="text-sm font-medium">{c.user_name || 'Usuario desconocido'}</span>
                        <span className="text-xs text-muted-foreground">{new Date(c.created_at).toLocaleString("es-ES")}</span>
                        {session?.user?.id === c.user_id && (
                          <div className="ml-auto flex gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => startEditComment(c)}
                              className="h-6 px-2 text-xs"
                            >
                              Editar
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => deleteCommentHandler(c.id)}
                              className="h-6 px-2 text-xs text-red-600 hover:text-red-700"
                            >
                              Eliminar
                            </Button>
                          </div>
                        )}
                      </div>
                      {editingCommentId === c.id ? (
                        // Modo de edición inline (18.1)
                        <div className="mt-2 flex gap-2">
                          <Input
                            value={editingCommentText}
                            onChange={(e) => setEditingCommentText(e.target.value)}
                            className="flex-1"
                            autoFocus
                          />
                          <Button
                            size="sm"
                            onClick={() => saveEditComment(c.id)}
                            disabled={!editingCommentText.trim()}
                          >
                            Guardar
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={cancelEditComment}
                          >
                            Cancelar
                          </Button>
                        </div>
                      ) : (
                        <p className="mt-1 text-sm text-muted-foreground">{c.text}</p>
                      )}
                    </div>
                  ))}
                </>
              )}
              <Separator />
              <div className="flex items-center gap-2">
                <Input placeholder="Escribe un comentario..." value={commentText} onChange={(e) => setCommentText(e.target.value)} onKeyDown={(e) => e.key === "Enter" && addComment()} className="flex-1" />
                <Button size="icon" onClick={addComment} disabled={!commentText.trim()}><Send className="h-4 w-4" /></Button>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="flex flex-col gap-4">
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm">Detalles</CardTitle></CardHeader>
            <CardContent className="flex flex-col gap-3 text-sm">
              <div>
                <span className="text-muted-foreground">Estado</span>
                <Select value={task.status} onValueChange={(v) => handleStatusChange(v as TaskStatus)}>
                  <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>{Object.entries(TASK_STATUS_LABELS).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div>
                <span className="text-muted-foreground">Prioridad</span>
                <Select value={task.priority} onValueChange={(v) => handlePriorityChange(v as TaskPriority)}>
                  <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>{Object.entries(TASK_PRIORITY_LABELS).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <Separator />
              <div className="flex justify-between"><span className="text-muted-foreground">Asignado a</span><span className="font-medium">{assignee?.name || "Sin asignar"}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Creado por</span><span className="font-medium">{creator?.name || "-"}</span></div>
              {task.due_date && <div className="flex justify-between"><span className="text-muted-foreground">Vence</span><span className="font-medium">{new Date(task.due_date).toLocaleDateString("es-ES")}</span></div>}
              {task.start_date && <div className="flex justify-between"><span className="text-muted-foreground">Inicio</span><span className="font-medium">{new Date(task.start_date).toLocaleDateString("es-ES")}</span></div>}
              <Separator />
              <div className="flex flex-wrap gap-1">
                {task.tags.map((tag) => <Badge key={tag} variant="secondary" className="text-[10px]">{tag}</Badge>)}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
