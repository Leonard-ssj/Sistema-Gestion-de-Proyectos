"use client"

import { use, useState, useEffect } from "react"
import { useAuthStore } from "@/stores/authStore"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { ArrowLeft, Send, Trash2, Edit2, AlertTriangle } from "lucide-react"
import Link from "next/link"
import { TASK_STATUS_LABELS, TASK_STATUS_COLORS, TASK_PRIORITY_LABELS, TASK_PRIORITY_COLORS } from "@/lib/constants"
import type { TaskStatus, Comment, Task } from "@/mock/types"
import { normalizeAvatarUrl } from "@/lib/avatars"
import { getTask, updateTaskStatus } from "@/services/taskService"
import { listComments, createComment, deleteComment, updateComment } from "@/services/commentService"
import { listMembers } from "@/services/memberService"
import { toast } from "@/hooks/use-toast"
import { Skeleton } from "@/components/ui/skeleton"

export default function WorkTaskDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const session = useAuthStore((s) => s.session)
  const currentUser = session?.user

  const [task, setTask] = useState<Task | null>(null)
  const [comments, setComments] = useState<Comment[]>([])
  const [users, setUsers] = useState<any[]>([])

  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)
  const [errorMessage, setErrorMessage] = useState("")
  
  const [commentText, setCommentText] = useState("")
  const [isSubmittingComment, setIsSubmittingComment] = useState(false)
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null)
  const [editCommentText, setEditCommentText] = useState("")

  const loadData = async () => {
    setIsLoading(true)
    setHasError(false)
    setErrorMessage("")
    
    try {
      // 1. Fetch Task Details (Will throw 403/404 if no permissions)
      const taskData = await getTask(id)
      if (!taskData) {
        throw new Error("Tarea no encontrada o no tienes permisos para verla.")
      }
      setTask(taskData)

      // 2. Fetch Users to display Assignee avatars correctly
      // (Using member service to get project members)
      const membersRes = await listMembers()
      if (membersRes.success && membersRes.members) {
         const mappedUsers = membersRes.members.map(m => m.user).filter(Boolean)
         setUsers(mappedUsers)
      }

      // 3. Fetch Comments
      const commentsData = await listComments(id)
      setComments(commentsData)

    } catch (error: any) {
      console.error("Error loading task detail:", error)
      const status = error.response?.status
      if (status === 403) setErrorMessage("No tienes permisos para ver esta tarea.")
      else if (status === 404) setErrorMessage("La tarea no existe.")
      else setErrorMessage(error.message || "Error al cargar la tarea.")
      setHasError(true)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (id) {
      loadData()
    }
  }, [id])

  // Status changing logic tailored for employee (Optimistic Update)
  async function handleStatusChange(newStatus: TaskStatus) {
    if (!task || task.status === newStatus) return
    
    const previousStatus = task.status
    setTask({ ...task, status: newStatus, updated_at: new Date().toISOString() })

    try {
      await updateTaskStatus(task.id, newStatus)
      toast({ title: "Estado actualizado", description: `Estado cambiado a ${TASK_STATUS_LABELS[newStatus]}` })
    } catch (error: any) {
      // Rollback
      setTask({ ...task, status: previousStatus })
      const errorMsg = error.response?.data?.error?.message || error.message || "Error al cambiar estado"
      toast({ title: "Error", description: errorMsg, variant: "destructive" })
    }
  }

  // --- Comments Logic ---
  async function handleAddComment() {
    if (!commentText.trim() || !task) return
    setIsSubmittingComment(true)
    try {
      const newComment = await createComment(task.id, commentText.trim())
      if (newComment) {
         setComments([...comments, newComment])
         
         // Fix: If the current user is not in the users array, add them so their avatar shows up immediately
         if (currentUser && !users.some(u => u.id === currentUser.id)) {
           setUsers([...users, currentUser])
         }
         
         setCommentText("")
         toast({ title: "Comentario publicado" })
      }
    } catch (error) {
      toast({ title: "Error", description: "No se pudo publicar el comentario", variant: "destructive" })
    } finally {
      setIsSubmittingComment(false)
    }
  }

  async function handleDeleteComment(commentId: string) {
    if (!task) return
    try {
      const success = await deleteComment(task.id, commentId)
      if (success) {
        setComments(comments.filter(c => c.id !== commentId))
        toast({ title: "Comentario eliminado" })
      }
    } catch (error) {
       toast({ title: "Error", description: "No se pudo eliminar el comentario", variant: "destructive" })
    }
  }

  async function handleSaveEditComment(commentId: string) {
    if (!editCommentText.trim() || !task) return
    try {
      const updated = await updateComment(task.id, commentId, editCommentText.trim())
      if (updated) {
         setComments(comments.map(c => c.id === commentId ? updated : c))
         setEditingCommentId(null)
         setEditCommentText("")
         toast({ title: "Comentario actualizado" })
      }
    } catch (error) {
       toast({ title: "Error", description: "No se pudo editar el comentario", variant: "destructive" })
    }
  }

  function startEditingComment(comment: Comment) {
    setEditingCommentId(comment.id)
    setEditCommentText(comment.text)
  }

  function cancelEditingComment() {
    setEditingCommentId(null)
    setEditCommentText("")
  }

  // --- Renders ---
  if (isLoading) {
     return (
       <div className="flex flex-col gap-6 p-4">
         <div className="flex items-center gap-3">
           <Skeleton className="h-10 w-10 rounded-md" />
           <div className="flex-1">
             <Skeleton className="h-6 w-1/3 mb-2" />
             <Skeleton className="h-4 w-1/4" />
           </div>
           <Skeleton className="h-10 w-40" />
         </div>
         <Skeleton className="h-32 w-full" />
         <Skeleton className="h-40 w-full" />
         <Skeleton className="h-64 w-full" />
       </div>
     )
  }

  if (hasError || !task) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-20">
        <AlertTriangle className="h-10 w-10 text-muted-foreground" />
        <p className="text-lg font-medium">Búsqueda fallida</p>
        <p className="text-muted-foreground">{errorMessage}</p>
        <div className="flex gap-3">
           <Link href="/work/my-tasks"><Button variant="outline"><ArrowLeft className="mr-2 h-4 w-4" /> Volver</Button></Link>
           {errorMessage !== "No tienes permisos para ver esta tarea." && errorMessage !== "La tarea no existe." && (
              <Button onClick={loadData}>Reintentar</Button>
           )}
        </div>
      </div>
    )
  }

  const assignee = users.find((u) => u.id === task.assigned_to)
  const checklist = task.checklist ?? []
  const checklistDone = checklist.filter((c) => c.completed).length

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-3">
        <Link href="/work/my-tasks"><Button variant="ghost" size="icon"><ArrowLeft className="h-4 w-4" /></Button></Link>
        <div className="flex-1">
          <h1 className="text-xl font-bold tracking-tight">{task.title}</h1>
          <div className="mt-1 flex flex-wrap items-center gap-2">
            <Badge variant="outline" className={TASK_STATUS_COLORS[task.status]}>{TASK_STATUS_LABELS[task.status]}</Badge>
            <Badge variant="outline" className={TASK_PRIORITY_COLORS[task.priority]}>{TASK_PRIORITY_LABELS[task.priority]}</Badge>
            {assignee && (
               <span className="text-sm text-muted-foreground flex items-center ml-2">
                 <img src={normalizeAvatarUrl(assignee.avatar)} alt="" className="w-5 h-5 rounded-full mr-1" />
                 Asignado a mi
               </span>
            )}
          </div>
        </div>
        <Select value={task.status} onValueChange={(v) => handleStatusChange(v as TaskStatus)}>
          <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
          <SelectContent>{Object.entries(TASK_STATUS_LABELS).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}</SelectContent>
        </Select>
      </div>

      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-sm">Descripcion</CardTitle></CardHeader>
        <CardContent><p className="text-sm leading-relaxed text-muted-foreground whitespace-pre-wrap">{task.description || "Sin descripcion"}</p></CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Checklist del Proyecto ({checklistDone}/{checklist.length})</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-2">
          {checklist.length === 0 ? (
            <p className="text-sm text-muted-foreground">Esta tarea no tiene checklist.</p>
          ) : (
             checklist.map((item) => (
              <div key={item.id} className="flex items-center gap-3 rounded-lg border p-2 bg-muted/20">
                <Checkbox checked={item.completed} disabled={true} />
                <span className={`flex-1 text-sm ${item.completed ? "line-through text-muted-foreground" : ""}`}>{item.text}</span>
              </div>
            ))
          )}
          <p className="text-xs text-muted-foreground mt-2 italic">Solo el Owner del proyecto puede modificar items del checklist.</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-sm">Comentarios ({comments.length})</CardTitle></CardHeader>
        <CardContent className="flex flex-col gap-3">
          {comments.map((c) => {
             const isOwnComment = c.user_id === currentUser?.id;
             // Try to find from users pool, fallback to current session if it's the current user
             const commentUserAvatar = users.find((u) => u.id === c.user_id)?.avatar || (isOwnComment ? currentUser?.avatar : undefined);

             return (
              <div key={c.id} className="rounded-lg border p-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <img
                      alt=""
                      src={normalizeAvatarUrl(commentUserAvatar)}
                      className="h-6 w-6 rounded-full border border-border bg-muted/20"
                    />
                    <span className="text-sm font-medium">{c.user_name}</span>
                    <span className="text-xs text-muted-foreground">{new Date(c.created_at).toLocaleString("es-ES")}</span>
                  </div>
                  {isOwnComment && editingCommentId !== c.id && (
                     <div className="flex items-center gap-1">
                        <Button variant="ghost" size="icon" onClick={() => startEditingComment(c)} className="h-6 w-6"><Edit2 className="h-3 w-3" /></Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDeleteComment(c.id)} className="h-6 w-6 text-destructive"><Trash2 className="h-3 w-3" /></Button>
                     </div>
                  )}
                </div>
                
                {editingCommentId === c.id ? (
                  <div className="mt-2 flex flex-col gap-2">
                    <Input value={editCommentText} onChange={(e) => setEditCommentText(e.target.value)} autoFocus />
                    <div className="flex gap-2 justify-end">
                       <Button variant="outline" size="sm" onClick={cancelEditingComment}>Cancelar</Button>
                       <Button size="sm" onClick={() => handleSaveEditComment(c.id)} disabled={!editCommentText.trim() || editCommentText.trim() === c.text}>Guardar</Button>
                    </div>
                  </div>
                ) : (
                  <p className="mt-1 text-sm text-foreground whitespace-pre-wrap">{c.text}</p>
                )}
              </div>
            );
          })}
          
          {comments.length === 0 && (
             <p className="text-sm text-center text-muted-foreground py-4">No hay comentarios aún.</p>
          )}

          <Separator className="my-2" />
          
          <div className="flex items-start gap-2">
            <Input 
              placeholder="Escribe un comentario..." 
              value={commentText} 
              onChange={(e) => setCommentText(e.target.value)} 
              onKeyDown={(e) => e.key === "Enter" && handleAddComment()} 
              className="flex-1" 
              disabled={isSubmittingComment}
            />
            <Button size="icon" onClick={handleAddComment} disabled={!commentText.trim() || isSubmittingComment}>
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
