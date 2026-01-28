import { Request, Response } from 'express'
import {
  BookingConflictError,
  BookingNotFoundError,
  RoomNotFoundError,
} from '../errors'
import { BookingService } from '../services/booking.service'
import { BookingResponse, ErrorResponse } from '../types'

const formatBookingResponse = (booking: any): BookingResponse => ({
  ...booking,
  startTime: booking.startTime.toISOString(),
  endTime: booking.endTime.toISOString(),
  createdAt: booking.createdAt.toISOString(),
})

export class BookingController {
  constructor(private bookingService = new BookingService()) {}

  createBooking = async (req: Request, res: Response) => {
    try {
      const { roomId } = req.params
      const { startTime, endTime } = req.body

      if (!roomId || !startTime || !endTime) {
        res.status(400).json({
          error: 'Missing required fields: roomId, startTime, endTime',
        } as ErrorResponse)
        return
      }

      const roomIdNum = parseInt(roomId, 10)
      if (isNaN(roomIdNum)) {
        res
          .status(400)
          .json({ error: 'Invalid roomId parameter' } as ErrorResponse)
        return
      }

      const startDate = new Date(startTime)
      const endDate = new Date(endTime)
      const now = new Date()

      if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
        res.status(400).json({
          error: 'Invalid date format for startTime or endTime',
        } as ErrorResponse)
        return
      }

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

      const booking = await this.bookingService.createBooking(
        roomIdNum,
        startDate,
        endDate,
      )
      res.status(201).json(formatBookingResponse(booking))
    } catch (error) {
      if (error instanceof BookingConflictError) {
        res.status(409).json({
          error: 'Failed to create booking',
          details: error.message,
        } as ErrorResponse)
        return
      }

      if (error instanceof RoomNotFoundError) {
        res.status(404).json({
          error: 'Failed to fetch bookings',
          details: error.message,
        } as ErrorResponse)
        return
      }

      res.status(500).json({
        error: 'Failed to create booking',
        details: error instanceof Error ? error.message : 'Unknown error',
      } as ErrorResponse)
    }
  }

  listBookings = async (req: Request, res: Response) => {
    try {
      const { roomId } = req.params
      const roomIdNum = parseInt(roomId, 10)

      if (isNaN(roomIdNum)) {
        res
          .status(400)
          .json({ error: 'Invalid roomId parameter' } as ErrorResponse)
        return
      }

      const bookings = await this.bookingService.listBookings(roomIdNum)
      res.json(bookings.map(formatBookingResponse))
    } catch (error) {
      if (error instanceof RoomNotFoundError) {
        res.status(404).json({
          error: 'Failed to fetch bookings',
          details: error.message,
        } as ErrorResponse)
        return
      }
      console.error('Error fetching bookings:', error)
      res.status(500).json({
        error: 'Failed to fetch bookings',
        details: error instanceof Error ? error.message : 'Unknown error',
      } as ErrorResponse)
    }
  }

  deleteBooking = async (req: Request, res: Response) => {
    try {
      const { id } = req.params
      const bookingId = parseInt(id)

      if (isNaN(bookingId)) {
        res
          .status(400)
          .json({ error: 'Invalid bookingId parameter' } as ErrorResponse)
        return
      }

      await this.bookingService.deleteBooking(bookingId)

      res.status(204).send()
    } catch (error) {
      console.error('Error deleting booking:', error)
      if (error instanceof BookingNotFoundError) {
        res.status(404).json({
          error: 'Failed to delete booking',
          details: error.message,
        } as ErrorResponse)
        return
      }
      res.status(500).json({
        error: 'Failed to delete booking',
        details: error instanceof Error ? error.message : 'Unknown error',
      } as ErrorResponse)
    }
  }
}
