import express from 'express';
import {
  confirmPayment,
  adminVerifyPayment,
  failPayment,
  getAllPayments,
  getPaymentByBooking,
} from '../controllers/paymentController.js';
import protect from '../middleware/authMiddleware.js';

const router = express.Router();

// Customer — submits transaction ID proof after paying
router.post('/confirm',              confirmPayment);

// Admin — verifies proof and approves booking
router.post('/admin-verify',         protect, adminVerifyPayment);

router.post('/fail',                 failPayment);
router.get('/booking/:bookingId',    getPaymentByBooking);
router.get('/',                      protect, getAllPayments);

export default router;
