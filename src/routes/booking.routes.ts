import { Router } from 'express'
import { BookingController } from '../controllers/booking.controller'

const router = Router()
const bookingController = new BookingController()

router.delete('/bookings/:id', bookingController.deleteBooking)
router.post('/rooms/:roomId/bookings', bookingController.createBooking)
router.get('/rooms/:roomId/bookings', bookingController.listBookings)

export default router
