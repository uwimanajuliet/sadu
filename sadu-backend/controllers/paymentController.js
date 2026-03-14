import db from '../config/db.js';

// POST /payments/confirm
// Called by CUSTOMER after paying — saves their transaction ID as proof
// Payment stays 'pending' until admin verifies
export const confirmPayment = async (req, res) => {
  try {
    const { booking_id, transaction_id, payment_method } = req.body;

    if (!transaction_id || !transaction_id.trim()) {
      return res.status(400).json({ message: 'Transaction ID is required' });
    }

    // Save transaction ID as proof — status stays pending until admin verifies
    await db.query(
      `UPDATE payments SET transaction_id = ?, payment_method = ? WHERE booking_id = ?`,
      [transaction_id.trim(), payment_method, booking_id]
    );

    // Update booking to show payment proof submitted
    await db.query(
      `UPDATE bookings SET payment_status = 'proof_submitted' WHERE id = ?`,
      [booking_id]
    );

    res.json({ message: 'Payment proof submitted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// POST /payments/admin-verify (admin only)
// Admin verifies the transaction ID and approves the booking
export const adminVerifyPayment = async (req, res) => {
  try {
    const { booking_id } = req.body;

    // Mark payment as completed
    await db.query(
      `UPDATE payments SET status = 'completed' WHERE booking_id = ?`,
      [booking_id]
    );

    // Mark booking as paid and approved
    await db.query(
      `UPDATE bookings SET payment_status = 'paid', status = 'approved' WHERE id = ?`,
      [booking_id]
    );

    res.json({ message: 'Payment verified and booking approved' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// POST /payments/fail
export const failPayment = async (req, res) => {
  try {
    const { booking_id } = req.body;
    await db.query(`UPDATE payments SET status = 'failed' WHERE booking_id = ?`, [booking_id]);
    await db.query(`UPDATE bookings SET payment_status = 'failed' WHERE id = ?`, [booking_id]);
    const [rows] = await db.query('SELECT car_id FROM bookings WHERE id = ?', [booking_id]);
    if (rows.length) {
      await db.query("UPDATE cars SET status = 'available' WHERE id = ?", [rows[0].car_id]);
    }
    res.json({ message: 'Payment marked as failed' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /payments — all (admin)
export const getAllPayments = async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT p.*, b.invoice_number, b.customer_name, b.customer_phone, c.name AS car_name
      FROM payments p
      LEFT JOIN bookings b ON p.booking_id = b.id
      LEFT JOIN cars c ON b.car_id = c.id
      ORDER BY p.created_at DESC
    `);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /payments/booking/:bookingId
export const getPaymentByBooking = async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT * FROM payments WHERE booking_id = ?', [req.params.bookingId]
    );
    if (!rows.length) return res.status(404).json({ message: 'Payment not found' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
