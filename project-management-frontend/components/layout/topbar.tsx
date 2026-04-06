"use client"

import { useTheme } from "next-themes"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { useAuthStore } from "@/stores/authStore"
import { useDataStore } from "@/stores/dataStore"
import { useUIStore } from "@/stores/uiStore"
import { Bell, Menu, Moon, Sun, Search, LogOut } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { listSprints } from "@/services/sprintService"
import { useEffect, useState, memo } from "react"
import type { Sprint } from "@/mock/types"
import { fetchNotifications } from "@/services/notificationService"
import { AnimatedSearch } from "@/components/ui/animated-search"
import { cn } from "@/lib/utils"
import { SPRINT_COLOR_CLASS } from "@/lib/sprintColors"
import { normalizeAvatarUrl } from "@/lib/avatars"

export const Topbar = memo(function Topbar() {
  const { theme, setTheme } = useTheme()
  const router = useRouter()
  const session = useAuthStore((s) => s.session)
  const logout = useAuthStore((s) => s.logout)
  const notifications = useDataStore((s) => s.notifications)
  const setNotifications = useDataStore((s) => s.setNotifications)
  const toggleSidebar = useUIStore((s) => s.toggleSidebar)
  const [activeSprint, setActiveSprint] = useState<Sprint | null>(null)

  const [searchFormShow, setSearchFormShow] = useState(false)

  const unreadCount = notifications.filter((n) => n.user_id === session?.user?.id && !n.read).length
  const role = session?.user?.role
  const sprintEnabled = !!session?.project?.sprint_enabled

  const notifRoute = role === "owner" ? "/app/notifications" : role === "employee" ? "/work/notifications" : "/admin"

  useEffect(() => {
    async function initNotifs() {
      if (session?.user?.id) {
        const notifs = await fetchNotifications()
        if (notifs) {
          setNotifications(notifs)
        }
      }
    }
    initNotifs()
  }, [session?.user?.id, setNotifications])

  useEffect(() => {
    if (!sprintEnabled) return
    let cancelled = false
    async function load() {
      const result = await listSprints("active")
      if (cancelled) return
      if (result.success && result.sprints && result.sprints.length > 0) {
        setActiveSprint(result.sprints[0])
      } else {
        setActiveSprint(null)
      }
    }
    function onSprintChanged(e: Event) {
      const ce = e as CustomEvent<{ activeSprint?: Sprint | null }>
      if (ce.detail && "activeSprint" in ce.detail) {
        setActiveSprint(ce.detail.activeSprint ?? null)
        return
      }
      load()
    }

    const interval = window.setInterval(load, 15000)
    window.addEventListener("sprint:changed", onSprintChanged as any)
    load()
    return () => {
      cancelled = true
      window.clearInterval(interval)
      window.removeEventListener("sprint:changed", onSprintChanged as any)
    }
  }, [sprintEnabled, session?.project?.id])

  function handleLogout() {
    logout()
    router.push("/auth/login")
  }

  const effectiveActiveSprint = sprintEnabled ? activeSprint : null
  const sprintLabel = effectiveActiveSprint ? `${effectiveActiveSprint.name}` : "Sin sprint activo"
  const sprintColor = effectiveActiveSprint?.color ? SPRINT_COLOR_CLASS[effectiveActiveSprint.color] : null

  return (
    <nav className="h-[56px] bg-admin-light px-[24px] flex items-center gap-[24px] font-lato sticky top-0 left-0 z-[1000] transition-all before:content-[''] before:absolute before:w-[40px] before:h-[40px] before:-bottom-[40px] before:left-0 before:rounded-full before:shadow-[-20px_-20px_0_var(--color-admin-light)]">
      
      {/* Categories / Sprint */}
      <span className="text-[16px] transition-all duration-300 hover:text-admin-blue text-admin-dark hidden md:inline-flex shrink-0">
      </span>

      {/* Spacer para empujar los iconos a la derecha en desktop */}
      <div className="mr-auto hidden md:block w-[1px]"></div>

      {/* Search Form (Centrado en Desktop) */}
      <div 
        className={cn(
          "max-w-[400px] w-full transition-all md:absolute md:left-1/2 md:-translate-x-1/2",
          searchFormShow ? "block absolute inset-x-4 z-50 bg-admin-light p-2 shadow-md rounded-[15px] top-1/2 -translate-y-1/2 md:top-auto md:-translate-y-0" : "hidden md:block"
        )}
      >
        <AnimatedSearch />
      </div>

      {/* Mobile search toggle */}
      <button 
        className="md:hidden flex justify-center items-center text-admin-dark mr-auto transition-transform duration-150 hover:scale-110 active:scale-95"
        onClick={() => setSearchFormShow(!searchFormShow)}
      >
        <Search className="h-6 w-6" />
      </button>

      {/* Dark mode switch */}
      <input type="checkbox" id="switch-mode" hidden checked={theme === "dark"} readOnly />
      <label 
        htmlFor="switch-mode" 
        onClick={(e) => {
          e.preventDefault();
          const isDark = theme !== "dark";
          const x = e.clientX;
          const y = e.clientY;
          
          if (!document.startViewTransition) {
             setTheme(isDark ? "dark" : "light");
             return;
          }

          const transition = document.startViewTransition(() => {
            setTheme(isDark ? "dark" : "light");
          });

          transition.ready.then(() => {
            const endRadius = Math.hypot(
              Math.max(x, window.innerWidth - x),
              Math.max(y, window.innerHeight - y)
            );
            document.documentElement.animate(
              {
                clipPath: [
                  `circle(0px at ${x}px ${y}px)`,
                  `circle(${endRadius}px at ${x}px ${y}px)`
                ]
              },
              {
                duration: 600,
                easing: "cubic-bezier(0.4, 0, 0.2, 1)",
                pseudoElement: "::view-transition-new(root)",
              }
            );
          });
        }}
        className="bg-admin-grey rounded-[50px] cursor-pointer flex items-center justify-between p-[3px] relative h-[25px] w-[50px] scale-[1.1] shrink-0 transition-transform duration-150 active:scale-95"
      >
        <Moon className="h-4 w-4 text-admin-yellow ml-[2px]" />
        <Sun className="h-4 w-4 text-admin-orange mr-[2px]" />
        <div className={cn("bg-admin-blue text-admin-light rounded-full absolute top-[2px] left-[2px] h-[21px] w-[21px] flex items-center justify-center transition-transform duration-300 ease-spring", theme === "dark" ? "translate-x-[25px]" : "translate-x-0")}>
        </div>
      </label>

      {/* Notification Dropdown */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="relative text-admin-dark hover:bg-admin-grey/50 rounded-full shrink-0 transition-transform duration-150 hover:scale-110 active:scale-95">
            <Bell className="h-[20px] w-[20px]" />
            {unreadCount > 0 && (
              <span className="absolute -top-[2px] -right-[2px] w-[18px] h-[18px] rounded-full border-2 border-admin-light bg-admin-red text-white font-bold text-[10px] flex justify-center items-center">
                {unreadCount}
              </span>
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent 
          align="end" 
          className="w-[300px] bg-admin-light border-admin-grey text-admin-dark rounded-[15px] shadow-[0_4px_14px_rgba(0,0,0,0.15)] font-lato z-[9999] overflow-hidden p-0 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 duration-200"
        >
          <div className="px-4 py-3 border-b border-admin-grey flex justify-between items-center bg-admin-light-blue/20">
             <p className="text-sm font-bold">Notificaciones</p>
             <span className="text-[10px] bg-admin-blue text-white px-2 py-0.5 rounded-full">{unreadCount} nuevas</span>
          </div>
          <div className="max-h-[300px] overflow-y-auto">
             {notifications.length === 0 ? (
               <div className="p-4 text-center text-sm text-admin-dark-grey">No hay notificaciones</div>
             ) : (
               notifications.slice(0, 5).map(n => (
                 <DropdownMenuItem key={n.id} className="px-4 py-3 border-b border-admin-grey flex flex-col items-start cursor-pointer hover:bg-admin-light-blue focus:bg-admin-light-blue transition-colors outline-none">
                    <p className="text-[13px] font-medium leading-tight mb-1">{n.title}</p>
                    <p className="text-[11px] text-admin-dark-grey leading-tight">{n.message}</p>
                 </DropdownMenuItem>
               ))
             )}
          </div>
          <div 
             className="px-4 py-3 text-center text-[13px] text-admin-blue font-bold cursor-pointer hover:bg-admin-grey transition-colors"
             onClick={() => router.push(notifRoute)}
          >
             Ver todas
          </div>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Profile Menu */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className="flex items-center outline-none shrink-0 cursor-pointer overflow-hidden rounded-full h-[36px] w-[36px] transition-transform duration-150 hover:scale-110 active:scale-95">
            {session?.user ? (
              <img
                src={normalizeAvatarUrl(session.user.avatar)}
                alt="Profile"
                className="h-full w-full object-cover rounded-full"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center rounded-full bg-admin-blue text-xs font-bold text-white">
                {session?.user?.name?.charAt(0) || "U"}
              </div>
            )}
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent 
          align="end" 
          className="w-48 bg-admin-light border-admin-grey text-admin-dark rounded-[15px] shadow-[0_4px_14px_rgba(0,0,0,0.15)] font-lato z-[9999] overflow-hidden p-0 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 duration-200"
        >
          <div className="px-3 py-3 border-b border-admin-grey">
            <p className="text-sm font-medium">{session?.user?.name}</p>
            <p className="text-xs text-muted-foreground truncate">{session?.user?.email}</p>
          </div>
          <DropdownMenuItem 
            className="px-4 py-3 cursor-pointer hover:bg-admin-light-blue focus:bg-admin-light-blue focus:text-admin-dark text-admin-dark transition-colors outline-none"
            onClick={() => router.push(role === "owner" ? "/app/profile" : role === "employee" ? "/work/profile" : "/admin/settings")}
          >
            Settings
          </DropdownMenuItem>
          <DropdownMenuItem 
            className="px-4 py-3 cursor-pointer text-admin-red hover:bg-admin-light-blue focus:bg-admin-light-blue transition-colors outline-none"
            onClick={handleLogout}
          >
            <LogOut className="mr-2 h-4 w-4" /> Log Out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </nav>
  )
})
