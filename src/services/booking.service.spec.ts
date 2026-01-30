import { BookingRepository } from '../repositories/booking.repository'
import { RoomRepository } from '../repositories/room.repository'
import {
  BookingNotFoundError,
  RoomNotFoundError,
  ValidationError,
} from '../errors'
import { BookingService } from './booking.service'

// Use module mocking to avoid importing transitive dependencies
// (from node_modules) that cause syntax errors in Jest
jest.mock('../repositories/booking.repository', () => ({
  BookingRepository: jest.fn(() => ({
    create: jest.fn(),
    findById: jest.fn(),
    findByRoom: jest.fn(),
    delete: jest.fn(),
  })),
}))
jest.mock('../repositories/room.repository', () => ({
  RoomRepository: jest.fn(() => ({
    exists: jest.fn(),
  })),
}))
jest.mock('../database', () => ({
  getPool: jest.fn(() => ({
    transaction: mockTransaction,
  })),
}))

type MockTrx = {}
type TransactionCallback = (trx: MockTrx) => Promise<void>
const mockTrx: MockTrx = {}
const mockTransaction = jest.fn((cb: TransactionCallback) => cb(mockTrx))

describe('BookingService', () => {
  let mockBookingRepo: jest.Mocked<BookingRepository>
  let mockRoomRepo: jest.Mocked<RoomRepository>
  let service: BookingService

  beforeEach(() => {
    mockBookingRepo = new BookingRepository() as jest.Mocked<BookingRepository>
    mockRoomRepo = new RoomRepository() as jest.Mocked<RoomRepository>
    service = new BookingService(mockBookingRepo, mockRoomRepo)
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('createBooking', () => {
    it('should create a booking when room exists and times are valid', async () => {
      const roomId = 1
      const startTime = new Date(Date.now() + 3600000)
      const endTime = new Date(Date.now() + 7200000)
      startTime.setSeconds(0, 0)
      endTime.setSeconds(0, 0)
      const mockBooking = {
        id: 1,
        roomId,
        startTime,
        endTime,
        createdAt: new Date(),
      }

      mockRoomRepo.exists.mockResolvedValue(true)
      mockBookingRepo.create.mockResolvedValue(mockBooking)

      const result = await service.createBooking(roomId, startTime, endTime)

      expect(result).toEqual(mockBooking)
      expect(mockRoomRepo.exists).toHaveBeenCalledWith(roomId)
      expect(mockBookingRepo.create).toHaveBeenCalledWith(
        roomId,
        startTime,
        endTime,
      )
    })

    it('should throw ValidationError when start time is after end time', async () => {
      const roomId = 1
      const endTime = new Date(Date.now() + 3600000)
      const startTime = new Date(Date.now() + 7200000)
      startTime.setSeconds(0, 0)
      endTime.setSeconds(0, 0)

      mockRoomRepo.exists.mockResolvedValue(true)

      await expect(
        service.createBooking(roomId, startTime, endTime),
      ).rejects.toThrow(ValidationError)
      expect(mockBookingRepo.create).not.toHaveBeenCalled()
    })

    it('should throw ValidationError when start time is equal to end time', async () => {
      const roomId = 1
      const startTime = new Date(Date.now() + 3600000)
      const endTime = new Date(Date.now() + 3600000)
      startTime.setSeconds(0, 0)
      endTime.setSeconds(0, 0)

      mockRoomRepo.exists.mockResolvedValue(true)

      await expect(
        service.createBooking(roomId, startTime, endTime),
      ).rejects.toThrow(ValidationError)
      expect(mockBookingRepo.create).not.toHaveBeenCalled()
    })

    it('should throw ValidationError when start time is in the past', async () => {
      const roomId = 1
      const startTime = new Date(Date.now() - 3600000)
      const endTime = new Date(Date.now() + 7200000)
      startTime.setSeconds(0, 0)
      endTime.setSeconds(0, 0)

      mockRoomRepo.exists.mockResolvedValue(true)

      await expect(
        service.createBooking(roomId, startTime, endTime),
      ).rejects.toThrow(ValidationError)
      expect(mockBookingRepo.create).not.toHaveBeenCalled()
    })

    it('should throw ValidationError when times have seconds', async () => {
      const roomId = 1
      const startTime = new Date(Date.now() + 3600000)
      const endTime = new Date(Date.now() + 7200000)
      startTime.setSeconds(30)

      mockRoomRepo.exists.mockResolvedValue(true)

      await expect(
        service.createBooking(roomId, startTime, endTime),
      ).rejects.toThrow(ValidationError)
      expect(mockBookingRepo.create).not.toHaveBeenCalled()
    })

    it('should throw ValidationError when times have milliseconds', async () => {
      const roomId = 1
      const startTime = new Date(Date.now() + 3600000)
      const endTime = new Date(Date.now() + 7200000)
      startTime.setMilliseconds(500)

      mockRoomRepo.exists.mockResolvedValue(true)

      await expect(
        service.createBooking(roomId, startTime, endTime),
      ).rejects.toThrow(ValidationError)
      expect(mockBookingRepo.create).not.toHaveBeenCalled()
    })

    it('should throw RoomNotFoundError when room does not exist', async () => {
      const roomId = 999
      const startTime = new Date(Date.now() + 3600000)
      const endTime = new Date(Date.now() + 7200000)
      startTime.setSeconds(0, 0)
      endTime.setSeconds(0, 0)

      mockRoomRepo.exists.mockResolvedValue(false)

      await expect(
        service.createBooking(roomId, startTime, endTime),
      ).rejects.toThrow(RoomNotFoundError)
      expect(mockBookingRepo.create).not.toHaveBeenCalled()
    })
  })

  describe('listBookings', () => {
    it('should return all bookings for a valid room', async () => {
      const roomId = 1
      const mockBookings = [
        {
          id: 1,
          roomId,
          startTime: new Date(),
          endTime: new Date(),
          createdAt: new Date(),
        },
        {
          id: 2,
          roomId,
          startTime: new Date(),
          endTime: new Date(),
          createdAt: new Date(),
        },
      ]

      mockRoomRepo.exists.mockResolvedValue(true)
      mockBookingRepo.findByRoom.mockResolvedValue(mockBookings)

      const result = await service.listBookings(roomId)

      expect(result).toEqual(mockBookings)
      expect(mockRoomRepo.exists).toHaveBeenCalledWith(roomId)
      expect(mockBookingRepo.findByRoom).toHaveBeenCalledWith(roomId)
    })

    it('should throw RoomNotFoundError when room does not exist', async () => {
      const roomId = 999

      mockRoomRepo.exists.mockResolvedValue(false)

      await expect(service.listBookings(roomId)).rejects.toThrow(
        RoomNotFoundError,
      )
      expect(mockBookingRepo.findByRoom).not.toHaveBeenCalled()
    })
  })

  describe('deleteBooking', () => {
    it('should delete a booking when it exists', async () => {
      const bookingId = 1
      const mockBooking = {
        id: bookingId,
        roomId: 1,
        startTime: new Date(),
        endTime: new Date(),
        createdAt: new Date(),
      }

      mockBookingRepo.findById.mockResolvedValue(mockBooking)
      mockBookingRepo.delete.mockResolvedValue(undefined)

      await service.deleteBooking(bookingId)

      expect(mockTransaction).toHaveBeenCalled()
      expect(mockBookingRepo.findById).toHaveBeenCalledWith(bookingId, mockTrx)
      expect(mockBookingRepo.delete).toHaveBeenCalledWith(bookingId, mockTrx)
    })

    it('should throw BookingNotFoundError when booking does not exist', async () => {
      const bookingId = 999

      mockBookingRepo.findById.mockResolvedValue(null)

      await expect(service.deleteBooking(bookingId)).rejects.toThrow(
        BookingNotFoundError,
      )
      expect(mockBookingRepo.delete).not.toHaveBeenCalled()
    })
  })
})
