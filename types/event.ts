export interface Event {
  id: string
  title: string
  startTime: string // ISO format
  durationMinutes: number
  description?: string
}
