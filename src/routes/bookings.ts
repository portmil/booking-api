import { Router, Request, Response } from 'express';
import { sql } from 'slonik';
import { getPool } from '../database';
import {
  Booking,
  CreateBookingRequest,
  BookingResponse,
  ErrorResponse,
} from '../types';

const router = Router();

/**
 * Helper function to convert database timestamp to ISO 8601 string
 */
function formatTimestamp(date: Date | string): string {
  if (typeof date === 'string') {
    return new Date(date).toISOString();
  }
  return date.toISOString();
}

/**
 * Helper function to convert Booking DB row to API response format
 */
function formatBookingResponse(booking: Booking): BookingResponse {
  return {
    ...booking,
    start_time: formatTimestamp(booking.start_time),
    end_time: formatTimestamp(booking.end_time),
    created_at: formatTimestamp(booking.created_at),
  };
}

/**
 * POST /bookings - Create a new booking
 * Validates that:
 * - Room exists
 * - Start time is before end time
 * - Start time is in the future
 * - No overlapping bookings exist for the same room
 */
router.post('/bookings', async (req: Request, res: Response) => {
  try {
    const { room_id, start_time, end_time, title, attendees } =
      req.body as CreateBookingRequest;

    // Input validation
    if (!room_id || !start_time || !end_time || !title) {
      res.status(400).json({
        error: 'Missing required fields: room_id, start_time, end_time, title',
      } as ErrorResponse);
      return;
    }

    const startDate = new Date(start_time);
    const endDate = new Date(end_time);
    const now = new Date();

    // Validate time constraints
    if (startDate >= endDate) {
      res.status(400).json({
        error: 'Start time must be before end time',
      } as ErrorResponse);
      return;
    }

    if (startDate <= now) {
      res.status(400).json({
        error: 'Start time must be in the future',
      } as ErrorResponse);
      return;
    }

    const pool = getPool();

    // Check if room exists
    const roomCheck = await pool.query(
      (sql as any)`SELECT id FROM rooms WHERE id = ${room_id}`
    ) as unknown as { rows: Array<{ id: number }> };

    if (roomCheck.rows.length === 0) {
      res.status(404).json({
        error: `Room with id ${room_id} not found`,
      } as ErrorResponse);
      return;
    }

    // Check for overlapping bookings using database constraint
    // A booking overlaps if: new_start < existing_end AND new_end > existing_start
    const overlapCheck = await pool.query(
      (sql as any)`
        SELECT id FROM bookings
        WHERE room_id = ${room_id}
        AND start_time < ${endDate.toISOString()}
        AND end_time > ${startDate.toISOString()}
        LIMIT 1
      `
    ) as unknown as { rows: Array<{ id: number }> };

    if (overlapCheck.rows.length > 0) {
      res.status(409).json({
        error: 'Booking overlaps with an existing booking for this room',
        details: `Room ${room_id} is already booked during the requested time period`,
      } as ErrorResponse);
      return;
    }

    // Create the booking
    const result = await pool.query(
      (sql as any)`
        INSERT INTO bookings (room_id, start_time, end_time, title, attendees)
        VALUES (${room_id}, ${startDate.toISOString()}, ${endDate.toISOString()}, ${title}, ${attendees || null})
        RETURNING *
      `
    ) as unknown as { rows: Booking[] };

    const booking = result.rows[0];
    res.status(201).json(formatBookingResponse(booking));
  } catch (error) {
    console.error('Error creating booking:', error);
    res.status(500).json({
      error: 'Failed to create booking',
      details: error instanceof Error ? error.message : 'Unknown error',
    } as ErrorResponse);
  }
});

/**
 * GET /rooms/:room_id/bookings - List all bookings for a specific room
 * Returns bookings sorted by start time in ascending order
 */
router.get('/rooms/:room_id/bookings', async (req: Request, res: Response) => {
  try {
    const { room_id } = req.params;
    const roomIdNum = parseInt(room_id, 10);

    if (isNaN(roomIdNum)) {
      res.status(400).json({
        error: 'Invalid room_id parameter',
      } as ErrorResponse);
      return;
    }

    const pool = getPool();

    // Check if room exists
    const roomCheck = await pool.query(
      (sql as any)`SELECT id FROM rooms WHERE id = ${roomIdNum}`
    ) as unknown as { rows: Array<{ id: number }> };

    if (roomCheck.rows.length === 0) {
      res.status(404).json({
        error: `Room with id ${roomIdNum} not found`,
      } as ErrorResponse);
      return;
    }

    // Fetch all bookings for the room
    const result = await pool.query(
      (sql as any)`
        SELECT * FROM bookings
        WHERE room_id = ${roomIdNum}
        ORDER BY start_time ASC
      `
    ) as unknown as { rows: Booking[] };

    const bookings = result.rows.map(formatBookingResponse);
    res.json(bookings);
  } catch (error) {
    console.error('Error fetching bookings:', error);
    res.status(500).json({
      error: 'Failed to fetch bookings',
      details: error instanceof Error ? error.message : 'Unknown error',
    } as ErrorResponse);
  }
});

/**
 * DELETE /bookings/:id - Delete an existing booking
 */
router.delete('/bookings/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const bookingId = parseInt(id, 10);

    if (isNaN(bookingId)) {
      res.status(400).json({
        error: 'Invalid booking id parameter',
      } as ErrorResponse);
      return;
    }

    const pool = getPool();

    // Fetch the booking before deleting to confirm it exists
    const bookingCheck = await pool.query(
      (sql as any)`SELECT * FROM bookings WHERE id = ${bookingId}`
    ) as unknown as { rows: Booking[] };

    if (bookingCheck.rows.length === 0) {
      res.status(404).json({
        error: `Booking with id ${bookingId} not found`,
      } as ErrorResponse);
      return;
    }

    // Delete the booking
    await pool.query((sql as any)`DELETE FROM bookings WHERE id = ${bookingId}`);

    res.status(204).send();
  } catch (error) {
    console.error('Error deleting booking:', error);
    res.status(500).json({
      error: 'Failed to delete booking',
      details: error instanceof Error ? error.message : 'Unknown error',
    } as ErrorResponse);
  }
});

export default router;
