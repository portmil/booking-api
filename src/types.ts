import { z } from 'zod'
import { bookingSchema } from './repositories/booking.repository'

export type Booking = z.infer<typeof bookingSchema>

export interface BookingResponse {
  id: number
  roomId: number
  startTime: string // ISO format
  endTime: string // ISO format
  createdAt: string // ISO format
}

export interface ErrorResponse {
  error: string
  details?: string
}
