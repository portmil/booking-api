import { Request, Response, NextFunction } from 'express'
import { AppError } from '../errors'

export const errorHandler = (
  error: unknown,
  req: Request,
  res: Response,
  _next: NextFunction,
) => {
  // Known, expected errors
  if (error instanceof AppError) {
    return res.status(error.statusCode).json({
      error: error.error ?? 'An error occurred',
      message: error.message,
    })
  }

  return res.status(500).json({
    error:
      error instanceof Error ? error.message : 'An unexpected error occurred',
  })
}
