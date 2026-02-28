"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { useUIStore } from "@/stores/uiStore"
import {
  LayoutDashboard, ListTodo, Columns3, CalendarDays, GanttChart,
  BarChart3, Users, Settings, UserCircle, FolderKanban, ChevronLeft
} from "lucide-react"
import { Button } from "@/components/ui/button"

const ownerNav = [
  { label: "Dashboard", href: "/app/dashboard", icon: LayoutDashboard },
  { label: "Tareas", href: "/app/tasks", icon: ListTodo },
  { label: "Board", href: "/app/board", icon: Columns3 },
  { label: "Timeline", href: "/app/timeline", icon: GanttChart },
  { label: "Calendario", href: "/app/calendar", icon: CalendarDays },
  { label: "Reportes", href: "/app/reports", icon: BarChart3 },
  { label: "Equipo", href: "/app/team", icon: Users },
  { label: "Configuracion", href: "/app/settings", icon: Settings },
  { label: "Perfil", href: "/app/profile", icon: UserCircle },
]

const employeeNav = [
  { label: "Mis Tareas", href: "/work/my-tasks", icon: ListTodo },
  { label: "Board", href: "/work/board", icon: Columns3 },
  { label: "Timeline", href: "/work/timeline", icon: GanttChart },
  { label: "Perfil", href: "/work/profile", icon: UserCircle },
]

const adminNav = [
  { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { label: "Tenants", href: "/admin/tenants", icon: FolderKanban },
  { label: "Usuarios", href: "/admin/users", icon: Users },
  { label: "Auditoria", href: "/admin/audit", icon: BarChart3 },
  { label: "Salud", href: "/admin/health", icon: Settings },
  { label: "Configuracion", href: "/admin/settings", icon: Settings },
]

interface AppSidebarProps {
  role: "owner" | "employee" | "superadmin"
}

export function AppSidebar({ role }: AppSidebarProps) {
  const pathname = usePathname()
  const sidebarOpen = useUIStore((s) => s.sidebarOpen)
  const toggleSidebar = useUIStore((s) => s.toggleSidebar)

  const nav = role === "owner" ? ownerNav : role === "employee" ? employeeNav : adminNav
  const projectLabel = role === "superadmin" ? "Super Admin" : role === "owner" ? "Owner Panel" : "Empleado"

  return (
    <>
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 bg-black/50 lg:hidden" onClick={toggleSidebar} />
      )}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-64 shrink-0 flex-col border-r bg-sidebar text-sidebar-foreground transition-transform duration-200 lg:sticky lg:top-0 lg:z-auto lg:h-screen lg:translate-x-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex h-14 items-center justify-between border-b px-4">
          <Link href={role === "owner" ? "/app/dashboard" : role === "employee" ? "/work/my-tasks" : "/admin"} className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <FolderKanban className="h-4 w-4" />
            </div>
            <div>
              <span className="text-sm font-bold">ProGest</span>
              <span className="ml-1 rounded bg-primary/10 px-1.5 py-0.5 text-[10px] font-medium text-primary">{projectLabel}</span>
            </div>
          </Link>
          <Button variant="ghost" size="icon" className="h-7 w-7 lg:hidden" onClick={toggleSidebar}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
        </div>

        <nav className="flex-1 overflow-y-auto p-3">
          <ul className="flex flex-col gap-1">
            {nav.map((item) => {
              const active = pathname === item.href || (item.href !== "/admin" && pathname.startsWith(item.href + "/"))
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={() => { if (window.innerWidth < 1024) toggleSidebar() }}
                    className={cn(
                      "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                      active
                        ? "bg-sidebar-accent text-sidebar-accent-foreground"
                        : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground"
                    )}
                  >
                    <item.icon className="h-4 w-4 shrink-0" />
                    {item.label}
                  </Link>
                </li>
              )
            })}
          </ul>
        </nav>

        <div className="border-t p-3">
          <p className="text-xs text-muted-foreground text-center">ProGest v1.0 MVP</p>
        </div>
      </aside>
    </>
  )
}
