import { Request, Response } from 'express'
import { BookingService } from '../services/booking.service'
import { ValidationError } from '../errors'
import { Booking } from '../types'
import { BookingController } from './booking.controller'

// Use module mocking to avoid importing transitive dependencies
// (from node_modules) that cause syntax errors in Jest
jest.mock('../services/booking.service', () => ({
  BookingService: jest.fn(() => ({
    createBooking: jest.fn(),
    listBookings: jest.fn(),
    deleteBooking: jest.fn(),
  })),
}))

const createMockResponse = (): Partial<Response> => {
  const res: Partial<Response> = {}
  res.status = jest.fn().mockReturnValue(res)
  res.json = jest.fn().mockReturnValue(res)
  res.send = jest.fn().mockReturnValue(res)
  return res
}

describe('BookingController', () => {
  let controller: BookingController
  let mockBookingService: jest.Mocked<BookingService>
  let mockRequest: Partial<Request>
  let mockResponse: Partial<Response>

  beforeEach(() => {
    mockBookingService = new BookingService() as jest.Mocked<BookingService>
    controller = new BookingController(mockBookingService)
    mockResponse = createMockResponse()
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('createBooking', () => {
    it('should create a booking successfully', async () => {
      const mockBooking: Booking = {
        id: 1,
        roomId: 1,
        startTime: new Date('2026-01-01T10:00:00Z'),
        endTime: new Date('2026-01-01T11:00:00Z'),
        createdAt: new Date(),
      }
      mockBookingService.createBooking.mockResolvedValue(mockBooking)
      mockRequest = {
        params: { roomId: '1' },
        body: {
          startTime: '2026-01-01T10:00:00Z',
          endTime: '2026-01-01T11:00:00Z',
        },
      }

      await controller.createBooking(
        mockRequest as Request,
        mockResponse as Response,
      )

      expect(mockBookingService.createBooking).toHaveBeenCalledWith(
        1,
        new Date('2026-01-01T10:00:00Z'),
        new Date('2026-01-01T11:00:00Z'),
      )
      expect(mockResponse.status).toHaveBeenCalledWith(201)
      expect(mockResponse.json).toHaveBeenCalledWith({
        ...mockBooking,
        startTime: mockBooking.startTime.toISOString(),
        endTime: mockBooking.endTime.toISOString(),
        createdAt: mockBooking.createdAt.toISOString(),
      })
    })

    it('should throw ValidationError for invalid roomId', async () => {
      mockRequest = {
        params: { roomId: 'invalid' },
        body: {
          startTime: '2026-01-01T10:00:00Z',
          endTime: '2026-01-01T11:00:00Z',
        },
      }

      await expect(
        controller.createBooking(
          mockRequest as Request,
          mockResponse as Response,
        ),
      ).rejects.toThrow(ValidationError)
      expect(mockBookingService.createBooking).not.toHaveBeenCalled()
    })

    it('should throw ValidationError for missing booking time fields', async () => {
      mockRequest = {
        params: { roomId: '1' },
        body: { startTime: '2026-01-01T10:00:00Z' },
      }

      await expect(
        controller.createBooking(
          mockRequest as Request,
          mockResponse as Response,
        ),
      ).rejects.toThrow(ValidationError)
      expect(mockBookingService.createBooking).not.toHaveBeenCalled()
    })

    it('should throw ValidationError for invalid dates', async () => {
      mockRequest = {
        params: { roomId: '1' },
        body: { startTime: 'invalid', endTime: '2026-01-01T11:00:00Z' },
      }

      await expect(
        controller.createBooking(
          mockRequest as Request,
          mockResponse as Response,
        ),
      ).rejects.toThrow(ValidationError)
      expect(mockBookingService.createBooking).not.toHaveBeenCalled()
    })

    it('should add context to service errors and rethrow', async () => {
      const error = new ValidationError('Service error')
      mockBookingService.createBooking.mockRejectedValue(error)
      mockRequest = {
        params: { roomId: '1' },
        body: {
          startTime: '2026-01-01T10:00:00Z',
          endTime: '2026-01-01T11:00:00Z',
        },
      }

      await expect(
        controller.createBooking(
          mockRequest as Request,
          mockResponse as Response,
        ),
      ).rejects.toMatchObject({
        error: 'Failed to create booking',
      })
    })
  })

  describe('listBookings', () => {
    it('should list bookings successfully', async () => {
      const mockBookings: Booking[] = [
        {
          id: 1,
          roomId: 1,
          startTime: new Date('2026-01-01T10:00:00Z'),
          endTime: new Date('2026-01-01T11:00:00Z'),
          createdAt: new Date(),
        },
        {
          id: 2,
          roomId: 1,
          startTime: new Date('2026-01-01T12:00:00Z'),
          endTime: new Date('2026-01-01T13:00:00Z'),
          createdAt: new Date(),
        },
      ]
      mockBookingService.listBookings.mockResolvedValue(mockBookings)
      mockRequest = { params: { roomId: '1' } }

      await controller.listBookings(
        mockRequest as Request,
        mockResponse as Response,
      )

      expect(mockBookingService.listBookings).toHaveBeenCalledWith(1)
      expect(mockResponse.json).toHaveBeenCalledWith(
        mockBookings.map((b) => ({
          ...b,
          startTime: b.startTime.toISOString(),
          endTime: b.endTime.toISOString(),
          createdAt: b.createdAt.toISOString(),
        })),
      )
    })

    it('should throw ValidationError for invalid roomId', async () => {
      mockRequest = { params: { roomId: 'invalid' } }

      await expect(
        controller.listBookings(
          mockRequest as Request,
          mockResponse as Response,
        ),
      ).rejects.toThrow(ValidationError)
      expect(mockBookingService.listBookings).not.toHaveBeenCalled()
    })

    it('should add context to service errors and rethrow', async () => {
      const error = new ValidationError('Service error')
      mockBookingService.listBookings.mockRejectedValue(error)
      mockRequest = { params: { roomId: '1' } }

      await expect(
        controller.listBookings(
          mockRequest as Request,
          mockResponse as Response,
        ),
      ).rejects.toMatchObject({
        error: 'Failed to fetch bookings',
      })
    })
  })

  describe('deleteBooking', () => {
    it('should delete a booking successfully', async () => {
      mockBookingService.deleteBooking.mockResolvedValue(undefined)
      mockRequest = { params: { id: '1' } }

      await controller.deleteBooking(
        mockRequest as Request,
        mockResponse as Response,
      )

      expect(mockBookingService.deleteBooking).toHaveBeenCalledWith(1)
      expect(mockResponse.status).toHaveBeenCalledWith(204)
      expect(mockResponse.send).toHaveBeenCalled()
    })

    it('should throw ValidationError for invalid id', async () => {
      mockRequest = { params: { id: 'invalid' } }

      await expect(
        controller.deleteBooking(
          mockRequest as Request,
          mockResponse as Response,
        ),
      ).rejects.toThrow(ValidationError)
      expect(mockBookingService.deleteBooking).not.toHaveBeenCalled()
    })

    it('should add context to service errors and rethrow', async () => {
      const error = new ValidationError('Service error')
      mockBookingService.deleteBooking.mockRejectedValue(error)
      mockRequest = { params: { id: '1' } }

      await expect(
        controller.deleteBooking(
          mockRequest as Request,
          mockResponse as Response,
        ),
      ).rejects.toMatchObject({
        error: 'Failed to delete booking',
      })
    })
  })
})
