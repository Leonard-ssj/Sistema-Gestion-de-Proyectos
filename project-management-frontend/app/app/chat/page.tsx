"use client"

import { useEffect, useState } from "react"
import { ChatRoom } from "@/components/chat/ChatRoom"
import { useAuthStore } from "@/stores/authStore"
import { Loader2, FolderKanban } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function OwnerChatPage() {
  const user = useAuthStore((s) => s.session?.user)
  const project = useAuthStore((s) => s.session?.project)
  const projectId = project?.id


  if (!user) {
    return <div className="flex h-full items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>
  }

  if (!projectId) {
    return (
      <div className="flex h-full flex-col items-center justify-center p-8 text-center bg-card rounded-xl border shadow-sm">
        <div className="mb-4 rounded-full bg-primary/10 p-4">
          <FolderKanban className="h-10 w-10 text-primary" />
        </div>
        <h2 className="text-2xl font-bold">No se encontró proyecto</h2>
        <p className="mt-2 text-muted-foreground max-w-md">
          Aún no tienes un proyecto activo. Crea uno para poder acceder al chat de equipo.
        </p>
        <Button asChild className="mt-6">
          <Link href="/app/dashboard">Ir al Dashboard</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="flex h-full w-full flex-col gap-[24px] overflow-hidden relative z-[1]">
      <div className="flex flex-wrap items-center justify-between gap-[16px] shrink-0">
        <div>
          <h1 className="text-[36px] font-[600] mb-[10px] text-admin-dark">Comité / Chat</h1>
          <ul className="flex items-center gap-[16px]">
            <li><Link href="/app/dashboard" className="text-admin-dark-grey hover:opacity-80 transition-opacity">Dashboard</Link></li>
            <li><span className="text-admin-dark-grey">{'>'}</span></li>
            <li><span className="text-admin-blue font-medium">Chat de Equipo</span></li>
          </ul>
        </div>
      </div>
      
      <p className="text-admin-dark-grey font-medium shrink-0">Comunícate con todos los miembros de tu proyecto.</p>
      <div className="flex-1 min-h-0">
        <ChatRoom projectId={projectId} />
      </div>
    </div>
  )
}
