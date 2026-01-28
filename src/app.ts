import express from 'express'
import bookingsRouter from './routes/booking.routes'

export const createApp = () => {
  const app = express()

  // Middleware
  app.use(express.json())

  // Routes
  app.use('/', bookingsRouter)

  // Health check endpoint
  app.get('/health', (_req, res) => {
    res.json({ status: 'ok' })
  })

  // 404 handler
  app.use((_req, res) => {
    res.status(404).json({ error: 'Endpoint not found' })
  })

  return app
}
