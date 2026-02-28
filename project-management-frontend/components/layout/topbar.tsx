"use client"

import { useTheme } from "next-themes"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { useAuthStore } from "@/stores/authStore"
import { useDataStore } from "@/stores/dataStore"
import { useUIStore } from "@/stores/uiStore"
import { Bell, Menu, Moon, Sun, LogOut, Bug, Search } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { useState } from "react"

export function Topbar() {
  const { theme, setTheme } = useTheme()
  const router = useRouter()
  const session = useAuthStore((s) => s.session)
  const logout = useAuthStore((s) => s.logout)
  const notifications = useDataStore((s) => s.notifications)
  const toggleSidebar = useUIStore((s) => s.toggleSidebar)
  const toggleDevPanel = useUIStore((s) => s.toggleDevPanel)
  const [searchOpen, setSearchOpen] = useState(false)

  const unreadCount = notifications.filter((n) => n.user_id === session?.user?.id && !n.read).length
  const role = session?.user?.role

  const notifRoute = role === "owner" ? "/app/notifications" : role === "employee" ? "/work/notifications" : "/admin"

  function handleLogout() {
    logout()
    router.push("/auth/login")
  }

  return (
    <header className="z-30 flex h-14 shrink-0 items-center gap-3 border-b bg-background/95 px-4 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <Button variant="ghost" size="icon" className="shrink-0 lg:hidden" onClick={toggleSidebar}>
        <Menu className="h-5 w-5" />
        <span className="sr-only">Toggle menu</span>
      </Button>

      <div className="flex flex-1 items-center gap-3">
        {searchOpen ? (
          <div className="relative max-w-sm flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              autoFocus
              placeholder="Buscar..."
              className="pl-9"
              onBlur={() => setSearchOpen(false)}
              onKeyDown={(e) => e.key === "Escape" && setSearchOpen(false)}
            />
          </div>
        ) : (
          <Button variant="ghost" size="icon" onClick={() => setSearchOpen(true)} className="hidden sm:flex">
            <Search className="h-4 w-4" />
          </Button>
        )}
      </div>

      <div className="flex items-center gap-1">
        <Button variant="ghost" size="icon" onClick={toggleDevPanel} className="text-muted-foreground" title="Dev Panel">
          <Bug className="h-4 w-4" />
        </Button>

        <Button
          variant="ghost"
          size="icon"
          className="relative"
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          title="Cambiar tema"
        >
          <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          <span className="sr-only">Cambiar tema</span>
        </Button>

        <Button variant="ghost" size="icon" className="relative" onClick={() => router.push(notifRoute)}>
          <Bell className="h-4 w-4" />
          {unreadCount > 0 && (
            <Badge className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full p-0 text-[10px]">
              {unreadCount}
            </Badge>
          )}
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                {session?.user?.name?.charAt(0) || "U"}
              </div>
              <span className="hidden text-sm sm:inline">{session?.user?.name || "Usuario"}</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <div className="px-2 py-1.5">
              <p className="text-sm font-medium">{session?.user?.name}</p>
              <p className="text-xs text-muted-foreground">{session?.user?.email}</p>
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => router.push(role === "owner" ? "/app/profile" : role === "employee" ? "/work/profile" : "/admin/settings")}>
              Perfil
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout} className="text-destructive">
              <LogOut className="mr-2 h-4 w-4" /> Cerrar sesion
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
