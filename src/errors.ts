export class BookingConflictError extends Error {
  constructor() {
    super('Booking overlaps with an existing booking for this room')
    this.name = 'BookingConflictError'
  }
}

export class BookingNotFoundError extends Error {
  constructor(bookingId: number) {
    super(`Booking with id ${bookingId} not found`)
    this.name = 'BookingNotFoundError'
  }
}

export class RoomNotFoundError extends Error {
  constructor(roomId: number) {
    super(`Room with id ${roomId} not found`)
    this.name = 'RoomNotFoundError'
  }
}
