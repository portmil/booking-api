import { Request, Response } from 'express'
import { AppError, ValidationError } from '../errors'
import { BookingService } from '../services/booking.service'
import { BookingResponse } from '../types'

const formatBookingResponse = (booking: any): BookingResponse => ({
  ...booking,
  startTime: booking.startTime.toISOString(),
  endTime: booking.endTime.toISOString(),
  createdAt: booking.createdAt.toISOString(),
})

const parseId = (param: string, errorMessage: string): number => {
  const id = Number(param)
  if (!Number.isInteger(id)) {
    throw new ValidationError(errorMessage)
  }
  return id
}

export class BookingController {
  constructor(private bookingService = new BookingService()) {}

  createBooking = async (req: Request, res: Response) => {
    try {
      const roomId = parseId(req.params.roomId, 'Invalid roomId parameter')
      const { startTime, endTime } = req.body
      if (!startTime || !endTime) {
        throw new ValidationError('Missing required fields: startTime, endTime')
      }

      const startDate = new Date(startTime)
      const endDate = new Date(endTime)

      if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
        throw new ValidationError(
          'Invalid date format for startTime or endTime',
        )
      }

      const booking = await this.bookingService.createBooking(
        roomId,
        startDate,
        endDate,
      )
      res.status(201).json(formatBookingResponse(booking))
    } catch (error) {
      if (error instanceof AppError) {
        error.error = 'Failed to create booking'
      }
      throw error
    }
  }

  listBookings = async (req: Request, res: Response) => {
    try {
      const roomId = parseId(req.params.roomId, 'Invalid roomId parameter')

      const bookings = await this.bookingService.listBookings(roomId)
      res.json(bookings.map(formatBookingResponse))
    } catch (error) {
      if (error instanceof AppError) {
        error.error = 'Failed to fetch bookings'
      }
      throw error
    }
  }

  deleteBooking = async (req: Request, res: Response) => {
    try {
      const bookingId = parseId(req.params.id, 'Invalid bookingId parameter')

      await this.bookingService.deleteBooking(bookingId)
      res.status(204).send()
    } catch (error) {
      if (error instanceof AppError) {
        error.error = 'Failed to delete booking'
      }
      throw error
    }
  }
}
