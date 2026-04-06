"use client"

import * as React from "react"
import { Moon, Sun, Sunset, Sunrise } from "lucide-react"
import { useTheme } from "next-themes"
import { animate } from "animejs"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export function ThemeSwitcher() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <Button variant="ghost" size="icon" className="w-9 h-9 opacity-50 cursor-default">
        <Sun className="h-4 w-4" />
        <span className="sr-only">Seleccionar tema</span>
      </Button>
    )
  }

  const activeIcon = () => {
    switch(theme) {
      case 'dark': return <Moon className="h-4 w-4" />;
      case 'sunset': return <Sunset className="h-4 w-4" />;
      case 'sunrise': return <Sunrise className="h-4 w-4" />;
      default: return <Sun className="h-4 w-4" />;
    }
  }

  const handleHover = (e: React.MouseEvent<HTMLDivElement>) => {
    animate(e.currentTarget.querySelectorAll('svg'), {
      rotate: '1turn',
      scale: [1, .5, 1],
      duration: 1200,
      ease: 'outElastic(1, .8)'
    });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="focus-visible:ring-0">
          {activeIcon()}
          <span className="sr-only">Seleccionar tema</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-[150px]">
        <DropdownMenuItem onClick={() => setTheme("light")} onMouseEnter={handleHover} className="flex items-center gap-2 cursor-pointer">
          <Sun className="h-4 w-4 text-muted-foreground mr-1" />
          <div className="flex flex-col gap-0.5 w-full">
            <span className="text-sm font-medium">Clásico</span>
            <div className="flex gap-1.5 opacity-90">
              <span className="h-3 w-3 rounded-full shadow-sm bg-[#FFFFFF] border" />
              <span className="h-3 w-3 rounded-full shadow-sm bg-[#1D7AFC]" />
            </div>
          </div>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("dark")} onMouseEnter={handleHover} className="flex items-center gap-2 cursor-pointer">
          <Moon className="h-4 w-4 text-muted-foreground mr-1" />
          <div className="flex flex-col gap-0.5 w-full">
            <span className="text-sm font-medium">Dark Mode</span>
            <div className="flex gap-1.5 opacity-90">
              <span className="h-3 w-3 rounded-full shadow-sm bg-[#161A1D] border border-muted" />
              <span className="h-3 w-3 rounded-full shadow-sm bg-[#1D7AFC]" />
            </div>
          </div>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("sunset")} onMouseEnter={handleHover} className="flex items-center gap-2 cursor-pointer">
          <Sunset className="h-4 w-4 text-muted-foreground mr-1" />
          <div className="flex flex-col gap-0.5 w-full">
            <span className="text-sm font-medium">Sunset</span>
            <div className="flex gap-1.5 opacity-90">
              <span className="h-3 w-3 rounded-full shadow-sm bg-[#2f3834] border border-muted" />
              <span className="h-3 w-3 rounded-full shadow-sm bg-[#C0AB92]" />
            </div>
          </div>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("sunrise")} onMouseEnter={handleHover} className="flex items-center gap-2 cursor-pointer">
          <Sunrise className="h-4 w-4 text-muted-foreground mr-1" />
          <div className="flex flex-col gap-0.5 w-full">
            <span className="text-sm font-medium">Sunrise</span>
            <div className="flex gap-1.5 opacity-90">
              <span className="h-3 w-3 rounded-full shadow-sm bg-[#f3e8e5] border border-muted" />
              <span className="h-3 w-3 rounded-full shadow-sm bg-[#a04d66]" />
            </div>
          </div>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
