import { sql } from 'slonik'
import { getPool } from '../database'
import { Booking } from '../types'

export class BookingRepository {
  async checkOverlappingBookings(
    roomId: number,
    startTime: Date,
    endTime: Date,
  ): Promise<boolean> {
    const pool = getPool()
    const result = (await pool.query(
      (sql as any)`
        SELECT id FROM bookings
        WHERE room_id = ${roomId}
        AND start_time < ${startTime.toISOString()}
        AND end_time > ${endTime.toISOString()}
        LIMIT 1
      `,
    )) as unknown as { rows: Array<{ id: number }> }
    return result.rows.length > 0
  }

  async createBooking(
    roomId: number,
    startTime: Date,
    endTime: Date,
  ): Promise<Booking> {
    const pool = getPool()
    const result = (await pool.query(
      (sql as any)`
        INSERT INTO bookings (room_id, start_time, end_time)
        VALUES (${roomId}, ${startTime.toISOString()}, ${endTime.toISOString()})
        RETURNING *
      `,
    )) as unknown as { rows: Booking[] }
    return result.rows[0]
  }

  async getBookingsByRoomId(roomId: number): Promise<Booking[]> {
    const pool = getPool()
    const result = (await pool.query(
      (sql as any)`
        SELECT * FROM bookings
        WHERE room_id = ${roomId}
        ORDER BY start_time ASC
      `,
    )) as unknown as { rows: Booking[] }
    return result.rows
  }

  async getBookingById(bookingId: number): Promise<Booking | null> {
    const pool = getPool()
    const result = (await pool.query(
      (sql as any)`SELECT * FROM bookings WHERE id = ${bookingId}`,
    )) as unknown as { rows: Booking[] }
    return result.rows.length > 0 ? result.rows[0] : null
  }

  async deleteBooking(bookingId: number): Promise<void> {
    const pool = getPool()
    await pool.query((sql as any)`DELETE FROM bookings WHERE id = ${bookingId}`)
  }
}
