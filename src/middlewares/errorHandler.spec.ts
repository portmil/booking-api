import { Request, Response, NextFunction } from 'express'
import { ValidationError, BookingConflictError } from '../errors'
import { errorHandler } from './errorHandler'

const createMockResponse = (): Partial<Response> => {
  const res: Partial<Response> = {}
  res.status = jest.fn().mockReturnValue(res)
  res.json = jest.fn().mockReturnValue(res)
  res.send = jest.fn().mockReturnValue(res)
  return res
}

describe('errorHandler', () => {
  let mockResponse: Partial<Response>
  let mockNext: NextFunction

  beforeEach(() => {
    mockNext = jest.fn()
    mockResponse = createMockResponse()
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('should handle AppError with custom error message', () => {
    const error = new ValidationError('Invalid input')
    error.error = 'Custom error'

    errorHandler(error, {} as Request, mockResponse as Response, mockNext)

    expect(mockResponse.status).toHaveBeenCalledWith(400)
    expect(mockResponse.json).toHaveBeenCalledWith({
      error: 'Custom error',
      message: 'Invalid input',
    })
  })

  it('should handle AppError without custom error message', () => {
    const error = new BookingConflictError()

    errorHandler(error, {} as Request, mockResponse as Response, mockNext)

    expect(mockResponse.status).toHaveBeenCalledWith(409)
    expect(mockResponse.json).toHaveBeenCalledWith({
      error: 'An error occurred',
      message: 'Booking overlaps with an existing booking for this room',
    })
  })

  it('should handle generic Error', () => {
    const error = new Error('Something went wrong')

    errorHandler(error, {} as Request, mockResponse as Response, mockNext)

    expect(mockResponse.status).toHaveBeenCalledWith(500)
    expect(mockResponse.json).toHaveBeenCalledWith({
      error: 'Something went wrong',
    })
  })

  it('should handle unknown error', () => {
    const error = 'Unknown error'

    errorHandler(error, {} as Request, mockResponse as Response, mockNext)

    expect(mockResponse.status).toHaveBeenCalledWith(500)
    expect(mockResponse.json).toHaveBeenCalledWith({
      error: 'An unexpected error occurred',
    })
  })
})
