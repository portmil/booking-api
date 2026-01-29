import { BookingRepository } from '../repositories/booking.repository'
import { RoomRepository } from '../repositories/room.repository'
import { getPool } from '../database'
import {
  BookingNotFoundError,
  RoomNotFoundError,
  ValidationError,
} from '../errors'
import { Booking } from '../types'

export class BookingService {
  constructor(
    private bookingRepo = new BookingRepository(),
    private roomRepo = new RoomRepository(),
  ) {}

  async createBooking(
    roomId: number,
    startDate: Date,
    endDate: Date,
  ): Promise<Booking> {
    validateBookingTimes(startDate, endDate)

    const roomExists = await this.roomRepo.exists(roomId)
    if (!roomExists) {
      throw new RoomNotFoundError(roomId)
    }

    return this.bookingRepo.create(roomId, startDate, endDate)
  }

  async listBookings(roomId: number): Promise<readonly Booking[]> {
    const roomExists = await this.roomRepo.exists(roomId)
    if (!roomExists) {
      throw new RoomNotFoundError(roomId)
    }

    const result = await this.bookingRepo.findByRoom(roomId)
    return result
  }

  async deleteBooking(bookingId: number): Promise<void> {
    const pool = getPool()
    await pool.transaction(async (trx) => {
      const booking = await this.bookingRepo.findById(bookingId, trx)
      if (!booking) {
        throw new BookingNotFoundError(bookingId)
      }
      await this.bookingRepo.delete(bookingId, trx)
    })
  }
}

const validateBookingTimes = (start: Date, end: Date): void => {
  const now = new Date()
  if (start >= end) {
    throw new ValidationError('Start time must be before end time')
  }
  if (start <= now) {
    throw new ValidationError('Start time must be in the future')
  }
  if (!hasMinutePrecision(start, end)) {
    throw new ValidationError('Booking times must be aligned to full minutes')
  }
}

const hasMinutePrecision = (start: Date, end: Date): boolean => {
  return (
    start.getSeconds() === 0 &&
    start.getMilliseconds() === 0 &&
    end.getSeconds() === 0 &&
    end.getMilliseconds() === 0
  )
}
