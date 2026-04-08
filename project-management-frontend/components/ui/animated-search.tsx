"use client"

import React, { useState, useRef, FormEvent, useEffect } from "react"
import { useRouter, usePathname, useSearchParams } from "next/navigation"
import { LayoutList, Clock, MessageSquare, Calendar, PieChart, Users, Settings, Briefcase, FileText } from "lucide-react"
import { cn } from "@/lib/utils"

const GLOBAL_SHORTCUTS = [
  { id: 1, title: 'Dashboard', icon: PieChart, url: '/app/dashboard' },
  { id: 2, title: 'Tareas (Board)', icon: LayoutList, url: '/app/board' },
  { id: 3, title: 'Timeline', icon: Clock, url: '/app/timeline' },
  { id: 4, title: 'Calendario', icon: Calendar, url: '/app/calendar' },
  { id: 5, title: 'Chat de Equipo', icon: MessageSquare, url: '/app/chat' },
  { id: 6, title: 'Reportes', icon: FileText, url: '/app/reports' },
  { id: 7, title: 'Equipo', icon: Users, url: '/app/team' },
  { id: 8, title: 'Configuración', icon: Settings, url: '/admin/settings' },
  { id: 9, title: 'Profile', icon: Briefcase, url: '/app/profile' },
]

export function AnimatedSearch() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [state, setState] = useState<"idle" | "active" | "processing">("idle")
  const [query, setQuery] = useState(searchParams.get("q") || "")
  const [showDropdown, setShowDropdown] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const wrapperRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setShowDropdown(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const handleFocus = () => {
    if (state !== "processing") setState("active")
    if (query.trim().length > 0) setShowDropdown(true)
  }

  const handleBlur = () => {
    if (state !== "processing" && query.length === 0) {
      setState("idle")
    }
  }

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value)
    if (e.target.value.trim().length > 0) {
      setShowDropdown(true)
    } else {
      setShowDropdown(false)
    }
  }

  const filteredShortcuts = GLOBAL_SHORTCUTS.filter(s => 
    s.title.toLowerCase().includes(query.toLowerCase())
  )

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    if (!query.trim()) return

    setState("processing")
    
    // Simulate search processing and route to first result or URL param
    setTimeout(() => {
      setState("active")
      setShowDropdown(false)
      
      // If there's an exact shortcut match (or just first match), navigate to it natively
      if (filteredShortcuts.length > 0 && query.trim() !== '') {
         router.push(filteredShortcuts[0].url)
         return
      }

      // Fallback: update query param
      const params = new URLSearchParams(searchParams.toString())
      if (query.trim()) {
        params.set("q", query.trim())
      } else {
        params.delete("q")
      }
      
      router.push(`${pathname}?${params.toString()}`)
    }, 600)
  }

  return (
    <div ref={wrapperRef} className="relative w-full max-w-[400px]">
      <form 
        onSubmit={handleSubmit}
        className={cn(
          "finder flex transition-all duration-500 w-full",
          state
        )}
      >
        <div className="flex bg-admin-grey rounded-[15px] border border-admin-light/50 p-[4px] shadow-[inset_2px_2px_5px_rgba(0,0,0,0.1),inset_-2px_-2px_5px_rgba(255,255,255,0.5)] dark:shadow-[inset_2px_2px_5px_rgba(0,0,0,0.5),inset_-2px_-2px_5px_rgba(255,255,255,0.02)] w-full">
          <div className="flex bg-admin-light w-full rounded-[10px] px-3 py-1 flex items-center shadow-[2px_2px_5px_rgba(0,0,0,0.1),-2px_-2px_5px_rgba(255,255,255,0.5)] dark:shadow-[2px_2px_5px_rgba(0,0,0,0.5),-2px_-2px_5px_rgba(255,255,255,0.02)] transition-colors duration-300">
            <div className="flex-1 flex items-center relative">
              <div className="finder-icon shrink-0 scale-[0.6] mr-1" />
              <input 
                ref={inputRef}
                type="text" 
                name="q" 
                value={query}
                onChange={handleInput}
                placeholder="Busca tareas, chat, timeline..."
                className="w-full bg-transparent border-none outline-none text-admin-dark text-[14px] tracking-wide h-[28px] placeholder:text-admin-dark-grey focus:ring-0"
                onFocus={handleFocus}
                onBlur={handleBlur}
                disabled={state === "processing"}
                autoComplete="off"
              />
            </div>
          </div>
        </div>
      </form>

      {/* Global Command Palette Dropdown */}
      {showDropdown && query.trim() !== '' && (
        <div className="absolute top-[calc(100%+8px)] left-0 w-full bg-admin-light border border-admin-grey rounded-[15px] shadow-[0_8px_30px_rgb(0,0,0,0.12)] z-[9999] overflow-hidden p-2 font-lato animate-in fade-in zoom-in-95 duration-200">
          <div className="px-2 pb-2 text-[11px] font-bold text-admin-dark-grey uppercase tracking-wider">Resultados rápidos</div>
          
          {filteredShortcuts.length > 0 ? (
            <div className="flex flex-col gap-1">
              {filteredShortcuts.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                     setShowDropdown(false)
                     router.push(item.url)
                  }}
                  className="w-full flex items-center gap-3 px-3 py-2 text-admin-dark hover:bg-admin-light-blue/40 rounded-[10px] transition-colors group outline-none"
                >
                  <div className="bg-admin-grey group-hover:bg-admin-blue group-hover:text-white p-1.5 rounded-lg transition-colors">
                    <item.icon className="w-4 h-4" />
                  </div>
                  <span className="text-[14px] font-medium">{item.title}</span>
                </button>
              ))}
            </div>
          ) : (
            <div className="px-3 py-4 text-center text-[13px] text-admin-dark-grey">
              No hay accesos directos para "{query}".<br/>
              <span className="text-[11px]">Pulsa Enter para buscar globalmente.</span>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
