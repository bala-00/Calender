import { parseISO, format } from "date-fns"
import { cn } from "@/lib/utils"
import type { Event } from "@/types/event"

interface EventItemProps {
  event: Event
  overlapCount: number
}

// Color palette for events
const eventColors = [
  "bg-blue-100 border-blue-300 text-blue-800",
  "bg-green-100 border-green-300 text-green-800",
  "bg-purple-100 border-purple-300 text-purple-800",
  "bg-yellow-100 border-yellow-300 text-yellow-800",
  "bg-red-100 border-red-300 text-red-800",
  "bg-indigo-100 border-indigo-300 text-indigo-800",
]

export default function EventItem({ event, overlapCount }: EventItemProps) {
  const startTime = parseISO(event.startTime)
  const colorIndex = Number.parseInt(event.id) % eventColors.length
  const eventColor = eventColors[colorIndex]

  // Adjust width based on overlap count
  const getWidthClass = () => {
    if (overlapCount > 0) {
      return overlapCount === 1 ? "w-[calc(100%-4px)]" : "w-[calc(100%-8px)]"
    }
    return "w-full"
  }

  return (
    <div
      className={cn("px-2 py-1 text-xs rounded border truncate", eventColor, getWidthClass())}
      title={`${event.title} - ${format(startTime, "h:mm a")} (${event.durationMinutes} min)`}
    >
      <div className="font-medium truncate">{event.title}</div>
      <div>{format(startTime, "h:mm a")}</div>
    </div>
  )
}
