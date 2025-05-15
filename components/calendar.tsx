"use client"

import { useState } from "react"
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  addMonths,
  subMonths,
  parseISO,
  addMinutes,
  isBefore,
  isAfter,
} from "date-fns"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { events } from "@/data/events"
import EventItem from "./event-item"
import type { Event } from "@/types/event"

export default function Calendar() {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)

  // Get days for the current month view
  const monthStart = startOfMonth(currentDate)
  const monthEnd = endOfMonth(currentDate)
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd })

  // Get day names for header
  const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

  // Navigation functions
  const prevMonth = () => setCurrentDate(subMonths(currentDate, 1))
  const nextMonth = () => setCurrentDate(addMonths(currentDate, 1))
  const today = () => setCurrentDate(new Date())

  // Get events for a specific day
  const getEventsForDay = (day: Date): Event[] => {
    return events.filter((event) => {
      const eventStart = parseISO(event.startTime)
      const eventEnd = addMinutes(eventStart, event.durationMinutes)

      return isSameDay(day, eventStart)
    })
  }

  // Check if events overlap
  const checkOverlap = (events: Event[]): Record<string, number> => {
    const overlaps: Record<string, number> = {}

    events.forEach((event, index) => {
      const eventStart = parseISO(event.startTime)
      const eventEnd = addMinutes(eventStart, event.durationMinutes)

      let overlapCount = 0

      events.forEach((otherEvent, otherIndex) => {
        if (index !== otherIndex) {
          const otherStart = parseISO(otherEvent.startTime)
          const otherEnd = addMinutes(otherStart, otherEvent.durationMinutes)

          // Check if events overlap
          if (
            (isAfter(eventStart, otherStart) && isBefore(eventStart, otherEnd)) ||
            (isAfter(eventEnd, otherStart) && isBefore(eventEnd, otherEnd)) ||
            (isBefore(eventStart, otherStart) && isAfter(eventEnd, otherEnd)) ||
            (isSameDay(eventStart, otherStart) &&
              eventStart.getHours() === otherStart.getHours() &&
              eventStart.getMinutes() === otherStart.getMinutes())
          ) {
            overlapCount++
          }
        }
      })

      overlaps[event.id] = overlapCount
    })

    return overlaps
  }

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      {/* Calendar header with navigation */}
      <div className="p-4 flex items-center justify-between bg-white border-b">
        <h2 className="text-xl font-semibold text-gray-800">{format(currentDate, "MMMM yyyy")}</h2>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" onClick={today} className="text-sm">
            Today
          </Button>
          <Button variant="outline" size="icon" onClick={prevMonth} aria-label="Previous month">
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" onClick={nextMonth} aria-label="Next month">
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 bg-gray-100">
        {weekDays.map((day) => (
          <div key={day} className="py-2 text-center text-sm font-medium text-gray-700 border-b">
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 auto-rows-fr bg-white">
        {daysInMonth.map((day, i) => {
          const dayEvents = getEventsForDay(day)
          const overlaps = checkOverlap(dayEvents)
          const isToday = isSameDay(day, new Date())
          const isSelected = selectedDate ? isSameDay(day, selectedDate) : false

          return (
            <div
              key={i}
              className={cn(
                "min-h-[100px] p-1 border border-gray-200 relative",
                !isSameMonth(day, currentDate) && "bg-gray-50 text-gray-400",
              )}
              onClick={() => setSelectedDate(day)}
            >
              <div
                className={cn(
                  "h-7 w-7 flex items-center justify-center text-sm rounded-full mb-1",
                  isToday && "bg-blue-600 text-white",
                  isSelected && !isToday && "bg-gray-200",
                )}
              >
                {format(day, "d")}
              </div>

              <div className="space-y-1 overflow-y-auto max-h-[80px]">
                {dayEvents.length > 0 &&
                  dayEvents.map((event) => (
                    <EventItem key={event.id} event={event} overlapCount={overlaps[event.id]} />
                  ))}
              </div>

              {dayEvents.length > 3 && <div className="text-xs text-gray-500 mt-1">+{dayEvents.length - 3} more</div>}
            </div>
          )
        })}
      </div>
    </div>
  )
}
