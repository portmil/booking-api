import express from 'express'
import { errorHandler } from './middlewares/errorHandler'
import bookingsRouter from './routes/booking.routes'

export const createApp = () => {
  const app = express()
  app.use(express.json())

  app.use('/', bookingsRouter)

  app.get('/health', (_req, res) => {
    res.json({ status: 'ok' })
  })

  app.use((_req, res) => {
    res.status(404).json({ error: 'Endpoint not found' })
  })

  app.use(errorHandler)

  return app
}
