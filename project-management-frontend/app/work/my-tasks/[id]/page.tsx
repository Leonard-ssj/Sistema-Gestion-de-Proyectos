"use client"

import { use, useState } from "react"
import { useDataStore } from "@/stores/dataStore"
import { useAuthStore } from "@/stores/authStore"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { ArrowLeft, Send, Plus, Trash2 } from "lucide-react"
import Link from "next/link"
import { TASK_STATUS_LABELS, TASK_STATUS_COLORS, TASK_PRIORITY_LABELS, TASK_PRIORITY_COLORS } from "@/lib/constants"
import type { TaskStatus, ChecklistItem, Comment } from "@/mock/types"

export default function WorkTaskDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const tasks = useDataStore((s) => s.tasks)
  const users = useDataStore((s) => s.users)
  const updateTask = useDataStore((s) => s.updateTask)
  const session = useAuthStore((s) => s.session)

  const task = tasks.find((t) => t.id === id)
  const [commentText, setCommentText] = useState("")
  const [newCheckItem, setNewCheckItem] = useState("")

  if (!task) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-20">
        <p className="text-muted-foreground">Tarea no encontrada</p>
        <Link href="/work/my-tasks"><Button variant="outline"><ArrowLeft className="mr-2 h-4 w-4" /> Volver</Button></Link>
      </div>
    )
  }

  const assignee = users.find((u) => u.id === task.assigned_to)
  const checklistDone = task.checklist.filter((c) => c.completed).length

  function toggleChecklist(itemId: string) {
    const updated = task.checklist.map((c) => c.id === itemId ? { ...c, completed: !c.completed } : c)
    updateTask(task.id, { checklist: updated })
  }

  function addChecklistItem() {
    if (!newCheckItem.trim()) return
    const item: ChecklistItem = { id: `cl-${Date.now()}`, text: newCheckItem.trim(), completed: false }
    updateTask(task.id, { checklist: [...task.checklist, item] })
    setNewCheckItem("")
  }

  function addComment() {
    if (!commentText.trim() || !session?.user) return
    const comment: Comment = {
      id: `com-${Date.now()}`,
      task_id: task.id,
      user_id: session.user.id,
      user_name: session.user.name,
      text: commentText.trim(),
      created_at: new Date().toISOString(),
    }
    updateTask(task.id, { comments: [...task.comments, comment] })
    setCommentText("")
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-3">
        <Link href="/work/my-tasks"><Button variant="ghost" size="icon"><ArrowLeft className="h-4 w-4" /></Button></Link>
        <div className="flex-1">
          <h1 className="text-xl font-bold tracking-tight">{task.title}</h1>
          <div className="mt-1 flex flex-wrap items-center gap-2">
            <Badge variant="outline" className={TASK_STATUS_COLORS[task.status]}>{TASK_STATUS_LABELS[task.status]}</Badge>
            <Badge variant="outline" className={TASK_PRIORITY_COLORS[task.priority]}>{TASK_PRIORITY_LABELS[task.priority]}</Badge>
          </div>
        </div>
        <Select value={task.status} onValueChange={(v) => updateTask(task.id, { status: v as TaskStatus })}>
          <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
          <SelectContent>{Object.entries(TASK_STATUS_LABELS).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}</SelectContent>
        </Select>
      </div>

      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-sm">Descripcion</CardTitle></CardHeader>
        <CardContent><p className="text-sm leading-relaxed text-muted-foreground">{task.description || "Sin descripcion"}</p></CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-sm">Checklist ({checklistDone}/{task.checklist.length})</CardTitle></CardHeader>
        <CardContent className="flex flex-col gap-2">
          {task.checklist.map((item) => (
            <div key={item.id} className="flex items-center gap-3 rounded-lg border p-2">
              <Checkbox checked={item.completed} onCheckedChange={() => toggleChecklist(item.id)} />
              <span className={`flex-1 text-sm ${item.completed ? "line-through text-muted-foreground" : ""}`}>{item.text}</span>
            </div>
          ))}
          <div className="flex items-center gap-2">
            <Input placeholder="Nuevo item..." value={newCheckItem} onChange={(e) => setNewCheckItem(e.target.value)} onKeyDown={(e) => e.key === "Enter" && addChecklistItem()} className="flex-1" />
            <Button size="icon" variant="outline" onClick={addChecklistItem}><Plus className="h-4 w-4" /></Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-sm">Comentarios ({task.comments.length})</CardTitle></CardHeader>
        <CardContent className="flex flex-col gap-3">
          {task.comments.map((c) => (
            <div key={c.id} className="rounded-lg border p-3">
              <div className="flex items-center gap-2">
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">{c.user_name.charAt(0)}</div>
                <span className="text-sm font-medium">{c.user_name}</span>
                <span className="text-xs text-muted-foreground">{new Date(c.created_at).toLocaleString("es-ES")}</span>
              </div>
              <p className="mt-1 text-sm text-muted-foreground">{c.text}</p>
            </div>
          ))}
          <Separator />
          <div className="flex items-center gap-2">
            <Input placeholder="Escribe un comentario..." value={commentText} onChange={(e) => setCommentText(e.target.value)} onKeyDown={(e) => e.key === "Enter" && addComment()} className="flex-1" />
            <Button size="icon" onClick={addComment} disabled={!commentText.trim()}><Send className="h-4 w-4" /></Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
