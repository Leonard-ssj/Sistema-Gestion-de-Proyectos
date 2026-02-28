"use client"

import { useState } from "react"
import { useAuthStore } from "@/stores/authStore"
import { useDataStore } from "@/stores/dataStore"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { TASK_PRIORITY_COLORS, TASK_PRIORITY_LABELS } from "@/lib/constants"
import Link from "next/link"

export default function CalendarPage() {
  const session = useAuthStore((s) => s.session)
  const tasks = useDataStore((s) => s.tasks)
  const [currentDate, setCurrentDate] = useState(new Date())

  const projectId = session?.project?.id
  const projectTasks = tasks.filter((t) => t.project_id === projectId && t.due_date)

  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()
  const firstDay = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const monthLabel = currentDate.toLocaleString("es-ES", { month: "long", year: "numeric" })

  const days = Array.from({ length: 42 }, (_, i) => {
    const dayNum = i - firstDay + 1
    if (dayNum < 1 || dayNum > daysInMonth) return null
    return dayNum
  })

  function prevMonth() {
    setCurrentDate(new Date(year, month - 1, 1))
  }
  function nextMonth() {
    setCurrentDate(new Date(year, month + 1, 1))
  }

  function getTasksForDay(day: number) {
    return projectTasks.filter((t) => {
      const d = new Date(t.due_date!)
      return d.getFullYear() === year && d.getMonth() === month && d.getDate() === day
    })
  }

  const today = new Date()
  const isToday = (day: number) => today.getFullYear() === year && today.getMonth() === month && today.getDate() === day

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Calendario</h1>
        <p className="text-muted-foreground">Tareas organizadas por fecha de vencimiento</p>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <Button variant="ghost" size="icon" onClick={prevMonth}><ChevronLeft className="h-4 w-4" /></Button>
          <CardTitle className="capitalize text-base">{monthLabel}</CardTitle>
          <Button variant="ghost" size="icon" onClick={nextMonth}><ChevronRight className="h-4 w-4" /></Button>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-7 gap-px">
            {["Dom", "Lun", "Mar", "Mie", "Jue", "Vie", "Sab"].map((d) => (
              <div key={d} className="p-2 text-center text-xs font-medium text-muted-foreground">{d}</div>
            ))}
            {days.map((day, i) => {
              const dayTasks = day ? getTasksForDay(day) : []
              return (
                <div
                  key={i}
                  className={`min-h-[80px] rounded-lg border p-1 ${day ? "bg-background" : "bg-muted/20"} ${day && isToday(day) ? "ring-2 ring-primary" : ""}`}
                >
                  {day && (
                    <>
                      <span className={`text-xs font-medium ${isToday(day) ? "text-primary font-bold" : "text-muted-foreground"}`}>{day}</span>
                      <div className="mt-0.5 flex flex-col gap-0.5">
                        {dayTasks.slice(0, 2).map((t) => (
                          <Link key={t.id} href={`/app/tasks/${t.id}`}>
                            <Badge variant="outline" className={`w-full justify-start truncate text-[9px] px-1 py-0 ${TASK_PRIORITY_COLORS[t.priority]}`}>
                              {t.title}
                            </Badge>
                          </Link>
                        ))}
                        {dayTasks.length > 2 && (
                          <span className="text-[9px] text-muted-foreground">+{dayTasks.length - 2} mas</span>
                        )}
                      </div>
                    </>
                  )}
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
