export interface Booking {
  id: number
  room_id: number
  start_time: Date
  end_time: Date
  created_at: Date
}

export interface Room {
  id: number
  name: string
}

export interface CreateBookingRequest {
  room_id: number
  start_time: string // ISO 8601 format
  end_time: string // ISO 8601 format
}

export interface BookingResponse {
  id: number
  room_id: number
  start_time: string
  end_time: string
  created_at: string
}

export interface ErrorResponse {
  error: string
  details?: string
}
