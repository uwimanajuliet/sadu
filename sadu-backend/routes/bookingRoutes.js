import express from 'express';
import {
  createBooking,
  getAllBookings,
  getBooking,
  getBookingByInvoice,
  getBookingsByEmail,
  updateBookingStatus,
  deleteBooking,
} from '../controllers/bookingController.js';
import protect from '../middleware/authMiddleware.js';

const router = express.Router();

// ── Public routes ──
router.post('/',                          createBooking);
router.get('/invoice/:invoice_number',    getBookingByInvoice); // ✅ Irembo-style lookup
router.get('/email/:email',               getBookingsByEmail);
router.get('/:id',                        getBooking);

// ── Admin routes ──
router.get('/',                           protect, getAllBookings);
router.put('/:id/status',                 protect, updateBookingStatus);
router.delete('/:id',                     protect, deleteBooking);

export default router;
