"use client"

import * as React from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { DayPicker, getDefaultClassNames, type DayButton } from "react-day-picker"

import { cn } from "@/lib/utils"
import { Button, buttonVariants } from "@/components/ui/button"

export type CalendarProps = React.ComponentProps<typeof DayPicker> & {
  buttonVariant?: React.ComponentProps<typeof Button>["variant"]
}

function CalendarDayButton({
  className,
  day,
  modifiers,
  ...props
}: React.ComponentProps<typeof DayButton>) {
  return (
    <Button
      variant="ghost"
      size="icon"
      data-day={day.date.toLocaleDateString()}
      data-month={day.date.getMonth()}
      data-year={day.date.getFullYear()}
      data-selected={modifiers.selected}
      data-today={modifiers.today}
      data-outside={modifiers.outside}
      data-disabled={modifiers.disabled}
      data-hidden={modifiers.hidden}
      data-range-start={modifiers.range_start}
      data-range-end={modifiers.range_end}
      data-range-middle={modifiers.range_middle}
      className={cn(
        "size-9 p-0 font-normal",
        "data-[selected=true]:bg-primary data-[selected=true]:text-primary-foreground data-[selected=true]:opacity-100",
        "data-[today=true]:bg-accent data-[today=true]:text-accent-foreground",
        "data-[outside=true]:text-muted-foreground data-[outside=true]:opacity-50",
        "data-[disabled=true]:text-muted-foreground data-[disabled=true]:opacity-50",
        "data-[hidden=true]:invisible",
        "data-[range-start=true]:rounded-s-md data-[range-start=true]:bg-primary data-[range-start=true]:text-primary-foreground",
        "data-[range-end=true]:rounded-e-md data-[range-end=true]:bg-primary data-[range-end=true]:text-primary-foreground",
        "data-[range-middle=true]:rounded-none data-[range-middle=true]:bg-accent data-[range-middle=true]:text-accent-foreground",
        className
      )}
      {...props}
    />
  )
}

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  captionLayout = "label",
  buttonVariant = "ghost",
  ...props
}: CalendarProps) {
  const defaultClassNames = getDefaultClassNames()

  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn("p-3", className)}
      captionLayout={captionLayout}
      classNames={{
        months: cn(
          defaultClassNames.months,
          "flex flex-col sm:flex-row gap-y-4 sm:gap-x-4 sm:gap-y-0"
        ),
        month: cn(defaultClassNames.month, "gap-y-4 overflow-x-hidden w-full"),
        month_caption: cn(defaultClassNames.month_caption, "flex justify-center h-7 mx-10 relative items-center"),
        caption_label: cn(defaultClassNames.caption_label, "text-sm font-medium truncate"),
        nav: cn(defaultClassNames.nav, "gap-x-1 flex items-center"),
        button_previous: cn(
          defaultClassNames.button_previous,
          buttonVariants({ variant: buttonVariant }),
          "absolute start-0 size-7 bg-transparent p-0 opacity-50 hover:opacity-100"
        ),
        button_next: cn(
          defaultClassNames.button_next,
          buttonVariants({ variant: buttonVariant }),
          "absolute end-0 size-7 bg-transparent p-0 opacity-50 hover:opacity-100"
        ),
        month_grid: cn(defaultClassNames.month_grid, "mt-4"),
        weekdays: cn(defaultClassNames.weekdays, "flex flex-row"),
        weekday: cn(
          defaultClassNames.weekday,
          "text-muted-foreground w-9 font-normal text-[0.8rem]"
        ),
        week: cn(defaultClassNames.week, "flex w-full mt-2"),
        day: cn(
          defaultClassNames.day,
          "relative p-0 text-center focus-within:relative"
        ),
        day_button: cn(defaultClassNames.day_button, "w-9 h-9"),
        range_start: "day-range-start rounded-s-md",
        range_end: "day-range-end rounded-e-md",
        selected: "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
        today: "bg-accent text-accent-foreground",
        outside: "day-outside text-muted-foreground opacity-50",
        disabled: "text-muted-foreground opacity-50",
        range_middle: "aria-selected:bg-accent aria-selected:text-accent-foreground rounded-none",
        hidden: "invisible",
        ...classNames,
      }}
      components={{
        Chevron: ({ orientation }) => {
          const Icon = orientation === "left" ? ChevronLeft : ChevronRight
          return <Icon className="h-4 w-4" />
        },
        DayButton: CalendarDayButton,
      }}
      {...props}
    />
  )
}
Calendar.displayName = "Calendar"

export { Calendar }
