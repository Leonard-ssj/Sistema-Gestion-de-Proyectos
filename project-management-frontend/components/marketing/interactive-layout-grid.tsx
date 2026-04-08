"use client"
import React, { useState, useEffect, useRef } from "react"
import { createLayout } from "animejs"
import { FadeInStagger, FadeInItem } from "@/components/ui/fade-in"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { 
  LayoutDashboard, ListTodo, Columns3, GanttChart, 
  CalendarDays, BarChart3, Users, Shield, 
  Grid, List 
} from "lucide-react"

const features = [
  { icon: LayoutDashboard, title: "Dashboard Inteligente", desc: "Metricas en tiempo real, actividad reciente, tareas vencidas y progreso general." },
  { icon: ListTodo, title: "Gestion de Tareas", desc: "Crea, asigna, prioriza con niveles de urgencia, agrega checklists y comentarios." },
  { icon: Columns3, title: "Board Kanban", desc: "Arrastra y suelta tarjetas entre columnas para visualizar el flujo de trabajo." },
  { icon: GanttChart, title: "Timeline / Gantt", desc: "Visualiza fechas de inicio y vencimiento en una linea de tiempo con progreso." },
  { icon: CalendarDays, title: "Calendario Mensual", desc: "Ve todas las tareas y eventos de tu proyecto organizados en tu mes." },
  { icon: BarChart3, title: "Reportes y Analitica", desc: "Graficos de distribucion por estado, prioridad y exportacion a CSV." },
  { icon: Users, title: "Equipo e Invitaciones", desc: "Invita miembros, gestiona roles y controla quien accede a que informacion." },
  { icon: Shield, title: "Seguridad por Roles", desc: "Control de acceso granular: cada usuario ve solo lo que le corresponde." },
]

export function InteractiveLayoutGrid() {
  const [isGrid, setIsGrid] = useState(true)
  const containerRef = useRef<HTMLDivElement>(null)
  const layoutInstance = useRef<any>(null)

  useEffect(() => {
    if (!containerRef.current) return
    
    // 1. Inicializar el poderoso sistema de Interpolación de Layout de Animejs v4
    layoutInstance.current = createLayout(containerRef.current, {
      duration: 800,
      ease: 'outElastic(1, .8)'
    })
  }, [])

  const toggleLayout = () => {
    // 2. Al cambiar el estado de React, el engine de animejs interceptará 
    // automáticamente la mutación del DOM y hará la interpolación espacial.
    setIsGrid(!isGrid)
  }

  return (
    <div className="flex flex-col gap-6 w-full max-w-[64rem] mx-auto">
      <div className="flex justify-end w-full px-2">
        <Button 
          variant="outline" 
          onClick={toggleLayout} 
          className="gap-2 shadow-sm rounded-full bg-background border-border/80 hover:bg-muted font-medium"
        >
          {isGrid ? (
            <><List className="h-4 w-4" /> Formato Lista</>
          ) : (
            <><Grid className="h-4 w-4" /> Restaurar Cuadrícula</>
          )}
        </Button>
      </div>

      <div 
        ref={containerRef} 
        className={
          isGrid 
            ? "grid gap-6 sm:grid-cols-2 lg:grid-cols-4" 
            : "flex flex-col gap-4 max-w-3xl mx-auto w-full"
        }
      >
        {features.map((f, i) => {
          const Icon = f.icon
          return (
            <div key={f.title} className={isGrid ? "h-[220px]" : "h-auto"}>
              {/* Quitamos transition-all para que animejs pueda controlar flex/posiciones libremente */}
              <Card className={`overflow-hidden border-border/60 bg-card shadow-none hover:bg-muted/30 transition-colors w-full ${isGrid ? 'h-full flex-col' : 'flex flex-row items-center justify-between border-l-4 border-l-primary'}`}>
                <CardContent className={`p-6 hover:shadow-none w-full flex ${isGrid ? 'flex-col gap-4' : 'flex-row gap-6 items-center'}`}>
                  <div className={`shrink-0 flex items-center justify-center ${isGrid ? '' : 'h-12 w-12 rounded-lg bg-muted border'}`}>
                    <Icon className="h-6 w-6 text-foreground" />
                  </div>
                  <div className="flex flex-col gap-1.5 flex-1">
                    <h3 className="font-semibold text-foreground leading-tight">{f.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          )
        })}
      </div>
    </div>
  )
}
