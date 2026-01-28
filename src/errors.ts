export abstract class AppError extends Error {
  abstract statusCode: number
  error?: string

  constructor(message: string) {
    super(message)
    Error.captureStackTrace(this, this.constructor)
  }
}

export class BookingConflictError extends AppError {
  statusCode = 409

  constructor() {
    super('Booking overlaps with an existing booking for this room')
    this.name = 'BookingConflictError'
  }
}

export class BookingNotFoundError extends AppError {
  statusCode = 404

  constructor(bookingId: number) {
    super(`Booking with id ${bookingId} not found`)
    this.name = 'BookingNotFoundError'
  }
}

export class RoomNotFoundError extends AppError {
  statusCode = 404

  constructor(roomId: number) {
    super(`Room with id ${roomId} not found`)
    this.name = 'RoomNotFoundError'
  }
}

export class ValidationError extends AppError {
  statusCode = 400

  constructor(message: string) {
    super(message)
    this.name = 'AppValidationError'
  }
}
