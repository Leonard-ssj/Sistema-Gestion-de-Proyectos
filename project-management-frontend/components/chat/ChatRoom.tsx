"use client"

import { useState, useEffect, useRef } from "react"
import { chatService, ChatMessage } from "@/services/chatService"
import { useAuthStore } from "@/stores/authStore"
import { Send, Loader2, AlertCircle, MessageSquare, FolderKanban } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { fetchMyTasks, fetchTasks } from "@/services/taskService"
import { Task } from "@/mock/types"
import { Badge } from "@/components/ui/badge"
import { UserPlus } from "lucide-react"
import { api } from "@/lib/api"

// Interfaces locales para miembros (simplificadas respecto a la BD)
interface Member {
  id: string;
  name: string;
  email: string;
  avatar: string | null;
}

interface ChatRoomProps {
  projectId: string
}

export function ChatRoom({ projectId }: ChatRoomProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [isSending, setIsSending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  // Task selection state
  const [userTasks, setUserTasks] = useState<Task[]>([])
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)
  const [isTaskPopoverOpen, setIsTaskPopoverOpen] = useState(false)
  
  // Member mention state
  const [projectMembers, setProjectMembers] = useState<Member[]>([])
  const [mentionedUser, setMentionedUser] = useState<Member | null>(null)
  const [isMentionPopoverOpen, setIsMentionPopoverOpen] = useState(false)
  
  const scrollRef = useRef<HTMLDivElement>(null)
  const user = useAuthStore((s) => s.session?.user)

  // Fetch user tasks and members initially
  useEffect(() => {
    const loadTasksAndMembers = async () => {
      try {
        let tasksData: Task[] = []
        if (user?.role?.toUpperCase() === 'OWNER') {
          tasksData = await fetchTasks(projectId)
        } else {
          tasksData = await fetchMyTasks()
        }
        setUserTasks(tasksData)
        
        // Fetch project members
        const membersRes = await api.get<any>('/members')
        if (membersRes.members) {
           // Exclude self from members list for mentioning
           const others = membersRes.members.filter((m: any) => m.id !== user?.id)
           setProjectMembers(others)
        }
      } catch (err) {
        console.error("Error fetching tasks or members for chat", err)
      }
    }
    
    if (user && projectId) {
      loadTasksAndMembers()
    }
  }, [user, projectId])

  // Polling for messages
  useEffect(() => {
    let interval: NodeJS.Timeout

    const fetchMessages = async (showLoading = false) => {
      try {
        if (showLoading) setIsLoading(true)
        setError(null)
        const data = await chatService.getMessages(projectId)
        
        // Only update state if messages changed (prevent re-renders)
        setMessages((prev) => {
          if (prev.length === 0 || prev[prev.length - 1]?.id !== data[data.length - 1]?.id) {
            return data
          }
          return prev
        })
      } catch (err: any) {
        setError(err.message || "Error al cargar mensajes")
      } finally {
        if (showLoading) setIsLoading(false)
      }
    }

    fetchMessages(true)
    interval = setInterval(() => fetchMessages(false), 3000)

    return () => clearInterval(interval)
  }, [projectId])

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (scrollRef.current) {
      // Find the Radix viewport to scroll it specifically, avoiding full-page scroll jumps
      const viewport = scrollRef.current.closest('[data-slot="scroll-area-viewport"]') as HTMLElement;
      if (viewport) {
        viewport.scrollTo({ top: viewport.scrollHeight, behavior: "smooth" });
      } else {
        scrollRef.current.scrollIntoView({ behavior: "smooth", block: "end" });
      }
    }
  }, [messages])

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMessage.trim() || isSending) return

    try {
      setIsSending(true)
      const taskId = selectedTask ? selectedTask.id : undefined
      const mentionedUserId = mentionedUser ? mentionedUser.id : undefined
      const sentMsg = await chatService.sendMessage(projectId, newMessage, taskId, mentionedUserId)
      setMessages((prev) => [...prev, sentMsg])
      setNewMessage("")
      setSelectedTask(null)
      setMentionedUser(null)
    } catch (err: any) {
      setError(err.message || "Error al enviar mensaje")
    } finally {
      setIsSending(false)
    }
  }

  const formatTime = (isoString: string) => {
    const date = new Date(isoString)
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  if (isLoading && messages.length === 0) {
    return (
      <div className="flex h-[500px] w-full items-center justify-center rounded-xl border bg-card">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="flex h-full w-full flex-col overflow-hidden rounded-xl border bg-card shadow-sm">
      {/* Header */}
      <div className="border-b px-6 py-4">
        <h2 className="text-lg font-semibold tracking-tight">Chat del Proyecto</h2>
        <p className="text-sm text-muted-foreground">Conversa con tu equipo en tiempo real</p>
      </div>

      {/* Error / Disabled banner */}
      {error && (
        <div className={`flex items-center gap-2 px-6 py-3 text-sm ${error.includes("deshabilitado") ? "bg-amber-500/10 text-amber-600 dark:text-amber-400" : "bg-destructive/10 text-destructive"}`}>
          <AlertCircle className="h-4 w-4" />
          <p>{error}</p>
        </div>
      )}
      
      {/* If chat is disabled, hide ChatRoom content completely */}
      {error && error.includes("deshabilitado") ? (
        <div className="flex flex-1 flex-col items-center justify-center p-8 text-center text-muted-foreground">
          <MessageSquare className="mb-4 h-16 w-16 opacity-20 text-amber-500" />
          <h3 className="text-xl font-medium mb-2">Chat Deshabilitado</h3>
          <p className="max-w-md">El propietario del proyecto ha deshabilitado tu acceso al chat de equipo. Si crees que esto es un error, por favor contacta al administrador.</p>
        </div>
      ) : (
      <>
      {/* Messages Area */}
      <ScrollArea className="flex-1 min-h-0 p-6">
        <div className="flex flex-col gap-4 pb-4">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-center text-muted-foreground">
              <MessageSquare className="mb-2 h-10 w-10 opacity-20" />
              <p>No hay mensajes aún.</p>
              <p className="text-xs">¡Sé el primero en saludar al equipo!</p>
            </div>
          ) : (
            messages.map((msg, i) => {
              const isMe = msg.user_id === user?.id
              const showAvatar = !isMe && (i === 0 || messages[i - 1]?.user_id !== msg.user_id)
              const addMarginTop = i > 0 && messages[i - 1]?.user_id !== msg.user_id

              return (
                <div
                  key={msg.id}
                  className={`flex w-full ${isMe ? "justify-end" : "justify-start"} ${addMarginTop ? "mt-4" : "mt-1"}`}
                >
                  {!isMe && (
                    <div className="mr-2 w-8 shrink-0">
                      {showAvatar ? (
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={msg.user_avatar || ""} />
                          <AvatarFallback className="text-[10px]">{msg.user_name.substring(0, 2).toUpperCase()}</AvatarFallback>
                        </Avatar>
                      ) : (
                        <div className="h-8 w-8" />
                      )}
                    </div>
                  )}

                  <div
                    className={`group relative flex max-w-[70%] flex-col rounded-2xl px-4 py-2 text-sm ${
                      isMe
                        ? "bg-primary text-primary-foreground rounded-br-none"
                        : "bg-muted rounded-bl-none"
                    }`}
                  >
                    {!isMe && showAvatar && (
                      <span className="mb-1 text-xs font-medium text-muted-foreground">
                        {msg.user_name}
                      </span>
                    )}
                    {(msg.task_id || msg.mentioned_user_id) && (
                      <div className="mb-2 flex flex-wrap gap-1">
                        {msg.task_id && msg.task_title && (
                          <Badge variant={isMe ? "secondary" : "outline"} className="cursor-pointer text-[10px] hover:bg-black/10 dark:hover:bg-white/10 transition-colors">
                            {isMe ? 'Mencionaste la tarea' : 'Mencionó la tarea'}: {msg.task_title.slice(0, 30)}{msg.task_title.length > 30 ? '...' : ''}
                          </Badge>
                        )}
                        {msg.mentioned_user_id && msg.mentioned_user_name && (
                          <Badge variant={isMe ? "secondary" : "outline"} className="cursor-pointer text-[10px] bg-blue-500/10 text-blue-700 dark:text-blue-300 hover:bg-blue-500/20 transition-colors border-blue-200/50">
                            @{msg.mentioned_user_name}
                          </Badge>
                        )}
                      </div>
                    )}
                    <span className="whitespace-pre-wrap break-words">{msg.content}</span>
                    <span 
                      className={`mt-1 text-[10px] opacity-70 flex items-center justify-end ${isMe ? "text-primary-foreground/70" : "text-muted-foreground"}`}
                    >
                      {formatTime(msg.created_at)}
                    </span>
                  </div>
                </div>
              )
            })
          )}
          <div ref={scrollRef} />
        </div>
      </ScrollArea>

      {/* Input Area */}
      <div className="border-t bg-background/50">
        {(selectedTask || mentionedUser) && (
          <div className="px-4 py-2 border-b flex items-center justify-start gap-4 text-xs bg-muted/30">
            {selectedTask && (
              <div className="flex items-center gap-2">
                <span className="font-medium text-muted-foreground">Tarea:</span>
                <Badge variant="secondary" className="flex items-center gap-2">
                  <span className="max-w-[150px] truncate">{selectedTask.title}</span>
                  <button type="button" onClick={() => setSelectedTask(null)} className="opacity-50 hover:opacity-100">&times;</button>
                </Badge>
              </div>
            )}
            {mentionedUser && (
              <div className="flex items-center gap-2">
                <span className="font-medium text-muted-foreground">Mencionando a:</span>
                <Badge variant="outline" className="flex items-center gap-2 bg-blue-500/10 text-blue-700 dark:text-blue-300 border-blue-200/50">
                  <span className="max-w-[150px] truncate">@{mentionedUser.name}</span>
                  <button type="button" onClick={() => setMentionedUser(null)} className="opacity-50 hover:opacity-100">&times;</button>
                </Badge>
              </div>
            )}
          </div>
        )}
        <div className="p-4">
          <form onSubmit={handleSendMessage} className="flex gap-2 items-end">
            <Popover open={isTaskPopoverOpen} onOpenChange={setIsTaskPopoverOpen}>
              <PopoverTrigger asChild>
                <Button variant="outline" size="icon" type="button" className={`shrink-0 ${selectedTask ? 'bg-primary/10 text-primary border-primary/20' : ''}`} title="Etiquetar Tarea">
                  <FolderKanban className="h-4 w-4" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[300px] p-0" align="start" side="top">
                <div className="p-2 border-b bg-muted/30">
                  <span className="text-xs font-semibold text-muted-foreground ml-2">Mis Tareas</span>
                </div>
                <ScrollArea className="max-h-[200px] overflow-y-auto">
                  <div className="flex flex-col p-1">
                    {userTasks.length === 0 ? (
                      <div className="p-4 text-center text-sm text-muted-foreground">No se encontraron tareas.</div>
                    ) : (
                      userTasks.map((t) => (
                        <button
                          key={t.id}
                          type="button"
                          className="flex w-full items-center rounded-sm px-2 py-2 text-sm outline-none hover:bg-accent hover:text-accent-foreground text-left transition-colors"
                          onClick={(e) => {
                            e.preventDefault()
                            setSelectedTask(t)
                            setIsTaskPopoverOpen(false)
                          }}
                        >
                          <span className="truncate">{t.title}</span>
                        </button>
                      ))
                    )}
                  </div>
                </ScrollArea>
              </PopoverContent>
            </Popover>

            <Popover open={isMentionPopoverOpen} onOpenChange={setIsMentionPopoverOpen}>
              <PopoverTrigger asChild>
                <Button variant="outline" size="icon" type="button" className={`shrink-0 ${mentionedUser ? 'bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-200/50' : ''}`} title="Mencionar Miembro">
                  <UserPlus className="h-4 w-4" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[200px] p-0" align="start" side="top">
                <div className="p-2 border-b bg-muted/30">
                  <span className="text-xs font-semibold text-muted-foreground ml-2">Equipo</span>
                </div>
                <ScrollArea className="max-h-[200px] overflow-y-auto">
                  <div className="flex flex-col p-1">
                    {projectMembers.length === 0 ? (
                      <div className="p-4 text-center text-sm text-muted-foreground">No hay miembros.</div>
                    ) : (
                      projectMembers.map((m) => (
                        <button
                          key={m.id}
                          type="button"
                          className="flex w-full items-center rounded-sm px-2 py-2 text-sm outline-none hover:bg-accent hover:text-accent-foreground text-left transition-colors"
                          onClick={(e) => {
                            e.preventDefault()
                            setMentionedUser(m)
                            setIsMentionPopoverOpen(false)
                          }}
                        >
                          {m.avatar ? (
                             <Avatar className="h-5 w-5 mr-2 shrink-0">
                               <AvatarImage src={m.avatar} />
                             </Avatar>
                          ) : (
                             <div className="h-5 w-5 mr-2 shrink-0 rounded-full bg-muted flex items-center justify-center text-[10px] font-bold">
                               {m.name.substring(0, 1).toUpperCase()}
                             </div>
                          )}
                          <span className="truncate">{m.name}</span>
                        </button>
                      ))
                    )}
                  </div>
                </ScrollArea>
              </PopoverContent>
            </Popover>

            <Input
              placeholder="Escribe un mensaje..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              disabled={isSending}
              className="flex-1"
              autoComplete="off"
            />
            <Button type="submit" size="icon" disabled={!newMessage.trim() || isSending}>
              {isSending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              <span className="sr-only">Enviar mensaje</span>
            </Button>
          </form>
        </div>
      </div>
      </>
      )}
    </div>
  )
}
