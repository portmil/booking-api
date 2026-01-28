export class BookingConflictError extends Error {
  constructor() {
    super('Booking overlaps with an existing booking for this room')
    this.name = 'BookingConflictError'
  }
}
