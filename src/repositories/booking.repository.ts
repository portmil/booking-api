import { z } from 'zod'
import { getPool, sql } from '../database'
import { Booking } from '../types'

export const bookingSchema = z.object({
  id: z.number(),
  roomId: z.number(),
  startTime: z.date(),
  endTime: z.date(),
  createdAt: z.date(),
})

const bookingColumns = sql.fragment`
  id,
  room_id AS "roomId",
  start_time AS "startTime",
  end_time AS "endTime",
  created_at AS "createdAt"
` // Quotes are needed to preserve casing

export class BookingRepository {
  async checkOverlappingBookings(
    roomId: number,
    startTime: Date,
    endTime: Date,
  ): Promise<boolean> {
    const pool = getPool()
    const result = await pool.exists(
      sql.typeAlias('void')`
        SELECT 1 FROM bookings
        WHERE room_id = ${roomId}
        AND start_time < ${startTime.toISOString()}
        AND end_time > ${endTime.toISOString()}
        LIMIT 1
      `,
    )
    return result
  }

  async create(
    roomId: number,
    startTime: Date,
    endTime: Date,
  ): Promise<Booking> {
    const pool = getPool()
    const result = await pool.one(
      sql.type(bookingSchema)`
        INSERT INTO bookings (room_id, start_time, end_time)
        VALUES (${roomId}, ${startTime.toISOString()}, ${endTime.toISOString()})
        RETURNING ${bookingColumns}
      `,
    )
    console.log(result)
    return result
  }

  /**
   * Returns all bookings for a specific room sorted by start time in ascending order
   */
  async findByRoom(roomId: number): Promise<readonly Booking[]> {
    const pool = getPool()
    const { rows } = await pool.query(
      sql.type(bookingSchema)`
        SELECT ${bookingColumns}
        FROM bookings
        WHERE room_id = ${roomId}
        ORDER BY start_time ASC
      `,
    )
    return rows
  }

  async findById(bookingId: number): Promise<Booking | null> {
    const pool = getPool()
    const result = await pool.maybeOne(
      sql.type(bookingSchema)`
        SELECT ${bookingColumns}
        FROM bookings
        WHERE id = ${bookingId}
      `,
    )
    return result
  }

  async delete(bookingId: number): Promise<void> {
    const pool = getPool()
    await pool.query(
      sql.typeAlias('void')`
        DELETE FROM bookings
        WHERE id = ${bookingId}
      `,
    )
  }
}
