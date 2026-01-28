import { BookingRepository } from '../repositories/booking.repository'
import { RoomRepository } from '../repositories/room.repository'
import { getPool } from '../database'
import { BookingNotFoundError, RoomNotFoundError } from '../errors'
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
