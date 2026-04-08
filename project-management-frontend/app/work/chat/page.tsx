"use client"

import { useEffect, useState } from "react"
import { ChatRoom } from "@/components/chat/ChatRoom"
import { useAuthStore } from "@/stores/authStore"
import { Loader2, FolderKanban } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { api } from "@/lib/api"

export default function EmployeeChatPage() {
  const user = useAuthStore((s) => s.session?.user)
  const [projectId, setProjectId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Empleados necesitan obtener el project_id, similar a como lo hacen otras vistas de /work
  // Consultaremos /projects/my-projects para obtener el primer proyecto donde está trabajando.
  useEffect(() => {
    const fetchMyProject = async () => {
      try {
        const res = await api.get<any>('/projects/settings')
        
        // The backend returns {'project': {...}} in data
        if (res && res.project) {
          setProjectId(res.project.id)
        }
      } catch (error) {
        console.error("Error al obtener el proyecto del empleado:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchMyProject()
  }, [])

  if (isLoading) {
    return <div className="flex h-full items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>
  }

  if (!projectId) {
    return (
      <div className="flex h-full flex-col items-center justify-center p-8 text-center bg-card rounded-xl border shadow-sm">
        <div className="mb-4 rounded-full bg-primary/10 p-4">
          <FolderKanban className="h-10 w-10 text-primary" />
        </div>
        <h2 className="text-2xl font-bold">Sin proyecto asignado</h2>
        <p className="mt-2 text-muted-foreground max-w-md">
          Al parecer no estás asignado a ningún proyecto en este momento.
        </p>
        <Button asChild className="mt-6">
          <Link href="/work/my-tasks">Ir a Mis Tareas</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="flex h-full w-full flex-col space-y-4 overflow-hidden">
      <div className="flex shrink-0 items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Chat de Equipo</h1>
          <p className="text-muted-foreground">Conversa con tu equipo de proyecto</p>
        </div>
      </div>
      <div className="flex-1 min-h-0">
        <ChatRoom projectId={projectId} />
      </div>
    </div>
  )
}
