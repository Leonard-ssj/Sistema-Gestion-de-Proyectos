"use client"

import * as React from "react"
import { addDays } from "date-fns"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

interface CalendarWithPresetsProps {
  date: Date | undefined
  onDateChange: (date: Date | undefined) => void
  disabled?: boolean
  minDate?: Date
  maxDate?: Date
}

function normalizeDateOnly(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate())
}

function clampDate(d: Date, minDate?: Date, maxDate?: Date) {
  const x = normalizeDateOnly(d).getTime()
  const min = minDate ? normalizeDateOnly(minDate).getTime() : null
  const max = maxDate ? normalizeDateOnly(maxDate).getTime() : null
  if (min !== null && x < min) return new Date(min)
  if (max !== null && x > max) return new Date(max)
  return d
}

export function CalendarWithPresets({ date, onDateChange, disabled, minDate, maxDate }: CalendarWithPresetsProps) {
  const isDateDisabled = (d: Date) => {
    if (disabled) return true
    const x = normalizeDateOnly(d).getTime()
    const min = minDate ? normalizeDateOnly(minDate).getTime() : null
    const max = maxDate ? normalizeDateOnly(maxDate).getTime() : null
    if (min !== null && x < min) return true
    if (max !== null && x > max) return true
    return false
  }

  const setClamped = (d: Date | undefined) => {
    if (!d) return onDateChange(undefined)
    onDateChange(clampDate(d, minDate, maxDate))
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant={"outline"}
          className={cn(
            "w-full justify-start text-left font-normal",
            !date && "text-muted-foreground"
          )}
          disabled={disabled}
        >
          {date ? date.toLocaleDateString("es-ES", { 
            day: "numeric", 
            month: "long", 
            year: "numeric" 
          }) : <span>Seleccionar fecha</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="flex w-auto flex-col space-y-2 p-2">
        <div className="rounded-md border">
          <Calendar
            mode="single"
            selected={date}
            onSelect={setClamped}
            disabled={isDateDisabled}
          />
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            className="flex-1"
            size="sm"
            disabled={disabled}
            onClick={() => setClamped(new Date())}
          >
            Today
          </Button>
          <Button
            variant="outline"
            className="flex-1"
            size="sm"
            disabled={disabled}
            onClick={() => setClamped(addDays(new Date(), 1))}
          >
            Tomorrow
          </Button>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            className="flex-1"
            size="sm"
            disabled={disabled}
            onClick={() => setClamped(addDays(new Date(), 3))}
          >
            In 3 days
          </Button>
          <Button
            variant="outline"
            className="flex-1"
            size="sm"
            disabled={disabled}
            onClick={() => setClamped(addDays(new Date(), 7))}
          >
            In a week
          </Button>
        </div>
        <Button
          variant="outline"
          className="w-full"
          size="sm"
          disabled={disabled}
          onClick={() => setClamped(addDays(new Date(), 14))}
        >
          In 2 weeks
        </Button>
      </PopoverContent>
    </Popover>
  )
}
