"use client"

import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuthStore } from "@/stores/authStore"
import { useDataStore } from "@/stores/dataStore"
import { Search, Filter, MoreVertical, Plus, CloudDownload } from "lucide-react"
import Link from "next/link"
import { fetchTasks } from "@/services/taskService"
import { listMembers } from "@/services/memberService"
import { normalizeAvatarUrl } from "@/lib/avatars"
import { cn } from "@/lib/utils"
import { AnimatedFlashCard, AnimatedFlashCardVariant } from "@/components/ui/animated-flash-card"
import { AnimatedExportButton } from "@/components/ui/animated-export-button"
import "./animated-cards.css"

export default function DashboardPage() {
  const router = useRouter()
  const session = useAuthStore((s) => s.session)
  const tasks = useDataStore((s) => s.tasks)
  const memberships = useDataStore((s) => s.memberships)
  const setTasks = useDataStore((s) => s.setTasks)
  const setMemberships = useDataStore((s) => s.setMemberships)

  const [isLoading, setIsLoading] = useState(true)

  const projectId = session?.project?.id
  const projectTasks = useMemo(() => tasks.filter((t) => t.project_id === projectId), [tasks, projectId])
  const members = useMemo(() => memberships.filter((m) => m.project_id === projectId && m.status === "active"), [memberships, projectId])

  useEffect(() => {
    let isMounted = true

    async function load() {
      if (!projectId) {
        if (isMounted) setIsLoading(false)
        return
      }

      try {
        const [fetchedTasks, membersResult] = await Promise.all([
          fetchTasks(projectId),
          listMembers(),
        ])

        if (!isMounted) return

        setTasks(fetchedTasks)
        if (membersResult.success && membersResult.members) {
          setMemberships(membersResult.members.map((m) => ({ ...m, project_id: projectId })))
        }
      } finally {
        if (isMounted) setIsLoading(false)
      }
    }

    load()
    return () => {
      isMounted = false
    }
  }, [projectId, setTasks, setMemberships])

  useEffect(() => {
    if (!projectId) return
    let cancelled = false
    async function refresh() {
      try {
        const fetchedTasks = await fetchTasks(projectId)
        if (!cancelled) setTasks(fetchedTasks)
      } catch {
      }
    }
    function onTasksChanged() {
      refresh()
    }
    const interval = window.setInterval(refresh, 20000)
    window.addEventListener("tasks:changed", onTasksChanged as any)
    return () => {
      cancelled = true
      window.clearInterval(interval)
      window.removeEventListener("tasks:changed", onTasksChanged as any)
    }
  }, [projectId, setTasks])

  const done = projectTasks.filter((t) => t.status === "done").length
  const inProgress = projectTasks.filter((t) => t.status === "in_progress").length
  const inReview = projectTasks.filter((t) => t.status === "in_review").length
  const pending = projectTasks.filter((t) => t.status === "pending").length
  const blocked = projectTasks.filter((t) => t.status === "blocked").length
  const total = projectTasks.length
  const completionRate = total > 0 ? Math.round((done / total) * 100) : 0

  type StatItem = { label: string; value: string | number; variant: AnimatedFlashCardVariant; action: string; url: string }
  const stats: StatItem[] = [
    { label: "Total Tareas", value: total, variant: "info", action: "Detalles", url: "/app/board" },
    { label: "Completadas", value: done, variant: "success", action: "Ver Board", url: "/app/board" },
    { label: "En Progreso", value: inProgress, variant: "working", action: "", url: "" },
    { label: "En Revisión", value: inReview, variant: "working", action: "", url: "" },
    { label: "Bloqueadas", value: blocked, variant: "error", action: "Revisar", url: "/app/board" },
    { label: "Miembros", value: members.length, variant: "info", action: "Equipo", url: "/app/team" },
    { label: "Completado (%)", value: `${completionRate}%`, variant: "success", action: "Reportes", url: "/app/reports" },
  ]

  function exportToCSV() {
    const header = "Metrica,Valor\n"
    const data = stats.map(s => `"${s.label}","${s.value}"`).join("\n")
    const csvData = header + data
    const blob = new Blob(['\uFEFF' + csvData], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `dashboard_stats_${new Date().toISOString().split('T')[0]}.csv`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-[16px] relative z-[1] mb-6">
        <div>
          <h1 className="text-[36px] font-[600] mb-[10px] text-admin-dark">{session?.project?.name || "Dashboard"}</h1>
          <ul className="flex items-center gap-[16px]">
            <li>
              <Link href="#" className="text-admin-dark-grey pointer-events-none">Dashboard</Link>
            </li>
            <li><span className="text-admin-dark-grey">{'>'}</span></li>
            <li>
              <Link href="#" className="text-admin-blue font-medium">Home</Link>
            </li>
          </ul>
        </div>
        <AnimatedExportButton onExport={exportToCSV} />
      </div>

      <div className="flex flex-col items-center gap-0 w-full mb-[24px]">
        {/* Top 4 Cards */}
        <div className="flex flex-row flex-wrap items-center justify-center p-0 m-0 w-full">
          {stats.slice(0, 4).map((s, i) => (
            <div key={i} className="flex-shrink-0 flex-grow-0 w-full max-w-[288px] sm:-mx-6 transform scale-[0.80] hover:scale-[0.83] transition-transform origin-center">
              <AnimatedFlashCard 
                  variant={s.variant} 
                  value={isLoading ? "—" : s.value} 
                  label={s.label} 
                  actionLabel={s.action}
                  onAction={s.url ? () => router.push(s.url) : undefined}
              />
            </div>
          ))}
        </div>
        {/* Bottom 3 Cards */}
        <div className="flex flex-row flex-wrap items-center justify-center p-0 m-0 w-full -mt-[12px]">
          {stats.slice(4).map((s, i) => (
            <div key={i} className="flex-shrink-0 flex-grow-0 w-full max-w-[288px] sm:-mx-6 transform scale-[0.80] hover:scale-[0.83] transition-transform origin-center">
              <AnimatedFlashCard 
                  variant={s.variant} 
                  value={isLoading ? "—" : s.value} 
                  label={s.label} 
                  actionLabel={s.action}
                  onAction={s.url ? () => router.push(s.url) : undefined}
              />
            </div>
          ))}
        </div>
      </div>

      <div className="flex flex-wrap gap-[24px] mt-[12px] w-full text-white transform scale-[0.95] origin-top">
        {/* Recent Orders (Members) -> Info Theme */}
        <div className="flex-grow basis-[500px] border-[4px] border-[#4B5E6B] rounded-[6px] bg-[#3C91E6] p-[24px] overflow-x-auto shadow-sm relative z-[1]">
          <div className="flex items-center gap-[16px] mb-[24px]">
            <h3 className="mr-auto text-[24px] font-[600]">Miembros del Equipo</h3>
            <div className="bg-white/20 hover:bg-white/40 p-2 rounded-full cursor-pointer transition-colors" onClick={() => router.push('/app/team')}>
              <Search className="h-5 w-5 text-white" />
            </div>
            <div className="bg-white/20 hover:bg-white/40 p-2 rounded-full cursor-pointer transition-colors" onClick={() => router.push('/app/team?filter=active')}>
              <Filter className="h-5 w-5 text-white" />
            </div>
          </div>
          <table className="w-full border-collapse">
            <thead>
              <tr>
                <th className="pb-[12px] text-[13px] text-left border-b border-white/20">Usuario</th>
                <th className="pb-[12px] text-[13px] text-left border-b border-white/20">Rol</th>
                <th className="pb-[12px] text-[13px] text-left border-b border-white/20">Estado</th>
              </tr>
            </thead>
            <tbody>
              {members.length === 0 ? (
                <tr>
                  <td colSpan={3} className="py-[16px] text-center text-white/70 text-sm">No hay miembros activos</td>
                </tr>
              ) : (
                members.slice(0, 5).map((m: any, idx) => (
                  <tr key={idx} className="hover:bg-white/10 transition-colors">
                    <td className="py-[16px] flex items-center gap-[12px] pl-[6px]">
                      <img src={normalizeAvatarUrl(m.user?.avatar)} className="w-[36px] h-[36px] rounded-full object-cover border-2 border-white/30" alt="" />
                      <p className="text-sm font-medium">{m.user?.name || "Usuario Desconocido"}</p>
                    </td>
                    <td className="py-[16px] text-sm opacity-90">{m.role}</td>
                    <td className="py-[16px]">
                      <span className={cn("text-[10px] px-[16px] py-[6px] text-[#3C91E6] rounded-[20px] font-[800] bg-white")}>
                        {m.status === "active" ? "Active" : "Pending"}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Todos (Tasks) -> Success Theme */}
        <div className="flex-grow basis-[300px] border-[4px] border-[#4B5E6B] rounded-[6px] bg-[#5FB67D] p-[24px] shadow-sm relative z-[1]">
          <div className="flex items-center gap-[16px] mb-[24px]">
            <h3 className="mr-auto text-[24px] font-[600]">Tareas</h3>
            <div className="bg-white/20 hover:bg-white/40 p-2 rounded-full cursor-pointer transition-colors" onClick={() => router.push('/app/board?new=true')}>
              <Plus className="h-5 w-5 text-white font-bold" />
            </div>
            <div className="bg-white/20 hover:bg-white/40 p-2 rounded-full cursor-pointer transition-colors" onClick={() => router.push('/app/board')}>
              <Filter className="h-5 w-5 text-white" />
            </div>
          </div>
          <ul className="w-full m-0 p-0 flex flex-col gap-[16px]">
            {projectTasks.length === 0 ? (
              <li className="text-center text-white/70 text-sm py-4">No hay tareas creadas</li>
            ) : (
              projectTasks.slice(0, 5).map((t) => {
                const isCompleted = t.status === "done"
                return (
                  <li 
                    key={t.id} 
                    className={cn(
                      "w-full bg-white/20 rounded-[10px] py-[14px] px-[20px] flex justify-between items-center transition-transform hover:scale-[1.02]",
                      isCompleted ? "border-l-[6px] border-white" : "border-l-[6px] border-[#E1C55E]"
                    )}
                  >
                    <Link href={`/app/tasks/${t.id}`} className="text-sm font-semibold text-white hover:opacity-80 flex-grow">
                      {t.title}
                    </Link>
                    <div className="bg-white/10 hover:bg-white/30 p-1.5 rounded-full cursor-pointer transition-colors" onClick={() => router.push(`/app/tasks/${t.id}`)}>
                      <MoreVertical className="h-5 w-5 text-white shrink-0" />
                    </div>
                  </li>
                )
              })
            )}
          </ul>
        </div>
      </div>
    </>
  )
}
