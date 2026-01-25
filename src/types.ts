export interface Booking {
  id: number
  room_id: number
  start_time: Date
  end_time: Date
  title: string
  attendees: number | null
  created_at: Date
}

export interface Room {
  id: number
  name: string
  capacity: number
  created_at: Date
}

export interface CreateBookingRequest {
  room_id: number
  start_time: string // ISO 8601 format
  end_time: string // ISO 8601 format
  title: string
  attendees?: number
}

export interface BookingResponse {
  id: number
  room_id: number
  start_time: string
  end_time: string
  title: string
  attendees: number | null
  created_at: string
}

export interface ErrorResponse {
  error: string
  details?: string
}
