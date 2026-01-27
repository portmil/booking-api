import { Router, Request, Response } from 'express'
import { BookingRepository } from '../repositories/booking.repository'
import { RoomRepository } from '../repositories/room.repository'
import {
  CreateBookingRequest,
  Booking,
  BookingResponse,
  ErrorResponse,
} from '../types'

const router = Router()
const bookingRepo = new BookingRepository()
const roomRepo = new RoomRepository()

/**
 * Helper function to convert database timestamp to ISO 8601 string
 */
const formatTimestamp = (date: Date | string): string => {
  if (typeof date === 'string') {
    return new Date(date).toISOString()
  }
  return date.toISOString()
}

/**
 * Helper function to convert Booking DB row to API response format
 */
const formatBookingResponse = (booking: Booking): BookingResponse => ({
  ...booking,
  start_time: formatTimestamp(booking.start_time),
  end_time: formatTimestamp(booking.end_time),
  created_at: formatTimestamp(booking.created_at),
})

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
    const { room_id, start_time, end_time } = req.body as CreateBookingRequest

    // Input validation
    if (!room_id || !start_time || !end_time) {
      res.status(400).json({
        error: 'Missing required fields: room_id, start_time, end_time',
      } as ErrorResponse)
      return
    }

    const startDate = new Date(start_time)
    const endDate = new Date(end_time)
    const now = new Date()

    // Validate time constraints
    if (startDate >= endDate) {
      res.status(400).json({
        error: 'Start time must be before end time',
      } as ErrorResponse)
      return
    }

    if (startDate <= now) {
      res.status(400).json({
        error: 'Start time must be in the future',
      } as ErrorResponse)
      return
    }

    // Check if room exists
    const roomExistsCheck = await roomRepo.roomExists(room_id)
    if (!roomExistsCheck) {
      res.status(404).json({
        error: `Room with id ${room_id} not found`,
      } as ErrorResponse)
      return
    }

    // Check for overlapping bookings
    const hasOverlappingBooking = await bookingRepo.checkOverlappingBookings(
      room_id,
      startDate,
      endDate,
    )
    if (hasOverlappingBooking) {
      res.status(409).json({
        error: 'Booking overlaps with an existing booking for this room',
        details: `Room ${room_id} is already booked during the requested time period`,
      } as ErrorResponse)
      return
    }

    // Create the booking
    const booking = await bookingRepo.createBooking(room_id, startDate, endDate)
    res.status(201).json(formatBookingResponse(booking))
  } catch (error) {
    console.error('Error creating booking:', error)
    res.status(500).json({
      error: 'Failed to create booking',
      details: error instanceof Error ? error.message : 'Unknown error',
    } as ErrorResponse)
  }
})

/**
 * GET /rooms/:room_id/bookings - List all bookings for a specific room
 * Returns bookings sorted by start time in ascending order
 */
router.get('/rooms/:room_id/bookings', async (req: Request, res: Response) => {
  try {
    const { room_id } = req.params
    const roomIdNum = parseInt(room_id, 10)

    if (isNaN(roomIdNum)) {
      res.status(400).json({
        error: 'Invalid room_id parameter',
      } as ErrorResponse)
      return
    }

    // Check if room exists
    const roomExistsCheck = await roomRepo.roomExists(roomIdNum)
    if (!roomExistsCheck) {
      res.status(404).json({
        error: `Room with id ${roomIdNum} not found`,
      } as ErrorResponse)
      return
    }

    // Fetch all bookings for the room
    const bookings = await bookingRepo.getBookingsByRoomId(roomIdNum)
    res.json(bookings.map(formatBookingResponse))
  } catch (error) {
    console.error('Error fetching bookings:', error)
    res.status(500).json({
      error: 'Failed to fetch bookings',
      details: error instanceof Error ? error.message : 'Unknown error',
    } as ErrorResponse)
  }
})

/**
 * DELETE /bookings/:id - Delete an existing booking
 */
router.delete('/bookings/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const bookingId = parseInt(id, 10)

    if (isNaN(bookingId)) {
      res.status(400).json({
        error: 'Invalid booking id parameter',
      } as ErrorResponse)
      return
    }

    // Fetch the booking before deleting to confirm it exists
    const booking = await bookingRepo.getBookingById(bookingId)
    if (!booking) {
      res.status(404).json({
        error: `Booking with id ${bookingId} not found`,
      } as ErrorResponse)
      return
    }

    // Delete the booking
    await bookingRepo.deleteBooking(bookingId)
    res.status(204).send()
  } catch (error) {
    console.error('Error deleting booking:', error)
    res.status(500).json({
      error: 'Failed to delete booking',
      details: error instanceof Error ? error.message : 'Unknown error',
    } as ErrorResponse)
  }
})

export default router
