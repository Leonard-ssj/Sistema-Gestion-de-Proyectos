"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { useUIStore } from "@/stores/uiStore"
import {
  LayoutDashboard,
  Columns3,
  CalendarDays,
  GanttChart,
  BarChart3,
  Users,
  MessageSquare,
  Building2,
  CheckCircle2,
  Smile,
  ChevronLeft,
  ChevronRight
} from "lucide-react"

const ownerNav = [
  { label: "Dashboard", href: "/app/dashboard", icon: LayoutDashboard },
  { label: "Tareas", href: "/app/tasks", icon: CheckCircle2 },
  { label: "Board", href: "/app/board", icon: Columns3 },
  { label: "Timeline", href: "/app/timeline", icon: GanttChart },
  { label: "Calendario", href: "/app/calendar", icon: CalendarDays },
  { label: "Chat de Equipo", href: "/app/chat", icon: MessageSquare },
  { label: "Reportes", href: "/app/reports", icon: BarChart3 },
  { label: "Equipo", href: "/app/team", icon: Users },
]


const employeeNav = [
  { label: "Mis Tareas", href: "/work/my-tasks", icon: CheckCircle2 },
  { label: "Board", href: "/work/board", icon: Columns3 },
  { label: "Timeline", href: "/work/timeline", icon: GanttChart },
  { label: "Chat de Equipo", href: "/work/chat", icon: MessageSquare },
]

const adminNav = [
  { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { label: "Tenants", href: "/admin/tenants", icon: Building2 },
  { label: "Usuarios", href: "/admin/users", icon: Users },
  { label: "Auditoria", href: "/admin/audit", icon: BarChart3 },
]

interface AppSidebarProps {
  role: "owner" | "employee" | "superadmin"
}

export function AppSidebar({ role }: AppSidebarProps) {
  const pathname = usePathname()
  const sidebarOpen = useUIStore((s) => s.sidebarOpen)
  const toggleSidebar = useUIStore((s) => s.toggleSidebar)
  const desktopCollapsed = useUIStore((s) => s.desktopCollapsed)
  const toggleDesktopSidebar = useUIStore((s) => s.toggleDesktopSidebar)

  const topNav = role === "owner" ? ownerNav : role === "employee" ? employeeNav : adminNav

  const activeClassCSS = "before:content-[''] before:absolute before:w-[40px] before:h-[40px] before:rounded-full before:-top-[40px] before:right-0 before:shadow-[20px_20px_0_var(--color-admin-grey)] before:-z-10 after:content-[''] after:absolute after:w-[40px] after:h-[40px] after:rounded-full after:-bottom-[40px] after:right-0 after:shadow-[20px_-20px_0_var(--color-admin-grey)] after:-z-10"

  return (
    <>
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 bg-black/50 lg:hidden" onClick={toggleSidebar} />
      )}
      
      {/* Floating Sidebar Toggle Button for Desktop */}
      <button 
        onClick={toggleDesktopSidebar}
        className={cn(
          "hidden lg:flex fixed top-[24px] h-[32px] w-[32px] z-[2001] items-center justify-center rounded-full bg-admin-blue border-[3px] border-[#0A0D14] text-white hover:bg-admin-blue/90 shadow-[0_0_10px_rgba(0,0,0,0.5)] transition-all duration-300 outline-none",
          desktopCollapsed ? "left-[60px] -translate-x-1/2" : "left-[220px] -translate-x-1/2"
        )}
        title={desktopCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
      >
        {desktopCollapsed ? (
          <ChevronRight className="h-5 w-5 ml-[2px]" />
        ) : (
          <ChevronLeft className="h-5 w-5 mr-[2px]" />
        )}
      </button>

      <section
        id="sidebar"
        className={cn(
          "fixed top-0 left-0 h-full bg-admin-light z-[2000] font-lato transition-all duration-300 ease-in-out overflow-x-hidden no-scrollbar lg:sticky flex flex-col border-r border-border md:border-r-0 relative pb-[20px]",
          desktopCollapsed ? "w-[60px]" : "w-[220px]",
          sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        <Link 
          href={role === "owner" ? "/app/dashboard" : role === "employee" ? "/work/my-tasks" : "/admin"} 
          className="text-[24px] font-bold h-[56px] flex items-center text-admin-blue sticky top-0 left-0 bg-admin-light z-[500] pb-[20px] box-content"
        >
          <div className="min-w-[60px] flex justify-center">
            <Smile className="h-8 w-8 transition-transform duration-150 group-hover:scale-110" />
          </div>
          {!desktopCollapsed && <span className="whitespace-nowrap transition-all duration-300 ease-in-out">AdminHub</span>}
        </Link>

        {/* Top Menu */}
        <ul className="w-full mt-[48px] flex-1">
          {topNav.map((item) => {
            const active = pathname === item.href || (item.href !== "/admin" && pathname.startsWith(item.href + "/"))
            return (
              <li
                key={item.href}
                className={cn(
                  "h-[48px] bg-transparent ml-[6px] rounded-l-[48px] p-[4px] relative",
                  active ? `bg-admin-grey ${activeClassCSS}` : ""
                )}
              >
                <Link
                  href={item.href}
                  onClick={() => { if (window.innerWidth < 1024) toggleSidebar() }}
                  className={cn(
                    "w-full h-full bg-admin-light flex items-center rounded-[48px] text-[16px] whitespace-nowrap overflow-x-hidden group",
                    active ? "text-admin-blue" : "text-admin-dark hover:text-admin-blue"
                  )}
                  title={desktopCollapsed ? item.label : undefined}
                >
                  <div className="min-w-[48px] flex justify-center">
                    <item.icon className="h-5 w-5 transition-transform duration-150 group-hover:scale-110" />
                  </div>
                  {!desktopCollapsed && (
                    <span className="transition-all duration-300 ease-in-out">{item.label}</span>
                  )}
                </Link>
              </li>
            )
          })}
        </ul>


      </section>
    </>
  )
}
