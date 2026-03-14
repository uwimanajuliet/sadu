import db from '../config/db.js';

// Generate unique invoice number: INV-YYYY-XXXXX
const generateInvoice = async () => {
  const year = new Date().getFullYear();
  const [rows] = await db.query(
    'SELECT COUNT(*) as count FROM bookings WHERE YEAR(created_at) = ?', [year]
  );
  const seq = String(rows[0].count + 1).padStart(5, '0');
  return `INV-${year}-${seq}`;
};

// POST /bookings — create booking (public)
export const createBooking = async (req, res) => {
  try {
    const {
      car_id, customer_name, customer_email, customer_phone,
      pickup_date, return_date, payment_method, notes,
    } = req.body;

    const [cars] = await db.query('SELECT * FROM cars WHERE id = ?', [car_id]);
    if (!cars.length) return res.status(404).json({ message: 'Car not found' });
    const car = cars[0];
    if (car.status !== 'available') {
      return res.status(400).json({ message: 'Car is not available' });
    }

    const pickup      = new Date(pickup_date);
    const ret         = new Date(return_date);
    const total_days  = Math.max(1, Math.ceil((ret - pickup) / (1000 * 60 * 60 * 24)));
    const total_price = total_days * parseFloat(car.price_per_day);

    // ✅ Irembo-style invoice number
    const invoice_number = await generateInvoice();

    const [result] = await db.query(
      `INSERT INTO bookings
        (invoice_number, car_id, customer_name, customer_email, customer_phone,
         pickup_date, return_date, total_days, total_price, payment_method, notes, status, payment_status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', 'pending')`,
      [invoice_number, car_id, customer_name, customer_email, customer_phone,
       pickup_date, return_date, total_days, total_price, payment_method, notes || null]
    );

    await db.query(
      `INSERT INTO payments (booking_id, amount, payment_method, status) VALUES (?, ?, ?, 'pending')`,
      [result.insertId, total_price, payment_method]
    );

    await db.query('UPDATE cars SET status = ? WHERE id = ?', ['rented', car_id]);

    res.status(201).json({
      booking_id: result.insertId,
      invoice_number,
      total_days,
      total_price,
      message: 'Booking created successfully',
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /bookings — all (admin)
export const getAllBookings = async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT b.*, c.name AS car_name,
             p.status AS payment_status, p.transaction_id
      FROM bookings b
      LEFT JOIN cars c ON b.car_id = c.id
      LEFT JOIN payments p ON b.id = p.booking_id
      ORDER BY b.created_at DESC
    `);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /bookings/:id
export const getBooking = async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT b.*, c.name AS car_name, p.status AS payment_status, p.transaction_id
      FROM bookings b
      LEFT JOIN cars c ON b.car_id = c.id
      LEFT JOIN payments p ON b.id = p.booking_id
      WHERE b.id = ?
    `, [req.params.id]);
    if (!rows.length) return res.status(404).json({ message: 'Booking not found' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /bookings/invoice/:invoice_number — Irembo-style lookup (public)
export const getBookingByInvoice = async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT b.*, c.name AS car_name, p.status AS payment_status
      FROM bookings b
      LEFT JOIN cars c ON b.car_id = c.id
      LEFT JOIN payments p ON b.id = p.booking_id
      WHERE b.invoice_number = ?
    `, [req.params.invoice_number]);
    if (!rows.length) return res.status(404).json({ message: 'Invoice not found' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /bookings/email/:email
export const getBookingsByEmail = async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT b.*, c.name AS car_name, p.status AS payment_status
      FROM bookings b
      LEFT JOIN cars c ON b.car_id = c.id
      LEFT JOIN payments p ON b.id = p.booking_id
      WHERE b.customer_email = ?
      ORDER BY b.created_at DESC
    `, [req.params.email]);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// PUT /bookings/:id/status (admin)
export const updateBookingStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const [rows] = await db.query('SELECT * FROM bookings WHERE id = ?', [req.params.id]);
    if (!rows.length) return res.status(404).json({ message: 'Booking not found' });
    await db.query('UPDATE bookings SET status = ? WHERE id = ?', [status, req.params.id]);
    if (status === 'rejected' || status === 'completed') {
      await db.query('UPDATE cars SET status = ? WHERE id = ?', ['available', rows[0].car_id]);
    }
    res.json({ message: `Booking ${status}` });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// DELETE /bookings/:id (admin)
export const deleteBooking = async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM bookings WHERE id = ?', [req.params.id]);
    if (rows.length) {
      await db.query('UPDATE cars SET status = ? WHERE id = ?', ['available', rows[0].car_id]);
    }
    await db.query('DELETE FROM payments WHERE booking_id = ?', [req.params.id]);
    await db.query('DELETE FROM bookings WHERE id = ?', [req.params.id]);
    res.json({ message: 'Booking deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
