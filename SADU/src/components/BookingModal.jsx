import { useState } from 'react';
import API from '../config.js';

const BookingModal = ({ car, onClose, onSuccess }) => {
  const [step, setStep]               = useState(1); // 1=form, 2=invoice, 3=verify, 4=success
  const [loading, setLoading]         = useState(false);
  const [error, setError]             = useState('');
  const [bookingData, setBookingData] = useState(null);
  const [transactionId, setTransactionId] = useState('');

  const [form, setForm] = useState({
    customer_name:  '',
    customer_email: '',
    customer_phone: '',
    pickup_date:    '',
    return_date:    '',
    payment_method: 'mtn_momo',
    notes:          '',
  });

  const calcDays = () => {
    if (!form.pickup_date || !form.return_date) return 0;
    const diff = new Date(form.return_date) - new Date(form.pickup_date);
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  };
  const days       = calcDays();
  const totalPrice = days * parseFloat(car.price_per_day || 0);

  const handleChange = e => setForm(p => ({ ...p, [e.target.name]: e.target.value }));

  // Step 1 → submit booking → get invoice
  const handleBooking = async () => {
    setError('');
    if (!form.customer_name || !form.customer_email || !form.customer_phone || !form.pickup_date || !form.return_date) {
      return setError('Please fill all required fields.');
    }
    if (days <= 0) return setError('Return date must be after pickup date.');

    setLoading(true);
    try {
      const res = await API.post('/bookings', { ...form, car_id: car.id });
      setBookingData(res.data);
      setStep(2);
    } catch (err) {
      setError(err.response?.data?.message || 'Booking failed. Try again.');
    } finally {
      setLoading(false);
    }
  };

  // Step 3 → submit transaction ID proof of payment
  const handlePaymentProof = async () => {
    setError('');
    if (!transactionId.trim()) {
      return setError('Please enter your transaction ID from your MoMo SMS.');
    }

    setLoading(true);
    try {
      await API.post('/payments/confirm', {
        booking_id:     bookingData.booking_id,
        transaction_id: transactionId.trim(),
        payment_method: form.payment_method,
      });
      setStep(4);
      onSuccess?.();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit payment proof. Try again.');
    } finally {
      setLoading(false);
    }
  };

  const today = new Date().toISOString().split('T')[0];

  // Payment method config
  const methods = {
    mtn_momo: {
      icon: '📱', label: 'MTN MoMo',
      color: 'bg-yellow-50 border-yellow-200',
      ussdCode: '*182*3*1#',
      steps: [
        `Dial *182*3*1# on your MTN line`,
        `Choose option 1 → Pay Bill`,
        `Enter invoice number: ${bookingData?.invoice_number}`,
        `Amount: ${Number(bookingData?.total_price || 0).toLocaleString()} RWF`,
        'Enter your MoMo PIN → Confirm',
        'You will receive an SMS with a Transaction ID',
      ],
      txPlaceholder: 'e.g. 1234567890',
      txHint: 'Check your MTN MoMo SMS for the transaction ID',
    },
    airtel_money: {
      icon: '📲', label: 'Airtel Money',
      color: 'bg-red-50 border-red-200',
      ussdCode: '*185*3*1#',
      steps: [
        `Dial *185*3*1# on your Airtel line`,
        `Choose Pay Bill`,
        `Enter invoice number: ${bookingData?.invoice_number}`,
        `Amount: ${Number(bookingData?.total_price || 0).toLocaleString()} RWF`,
        'Enter your Airtel Money PIN → Confirm',
        'You will receive an SMS with a Transaction ID',
      ],
      txPlaceholder: 'e.g. AIR1234567890',
      txHint: 'Check your Airtel Money SMS for the transaction ID',
    },
    bank_transfer: {
      icon: '🏦', label: 'Bank Transfer',
      color: 'bg-blue-50 border-blue-200',
      ussdCode: null,
      steps: [
        'Transfer to: Bank of Kigali · AC: 00040-06180480-75',
        `Reference / Reason: ${bookingData?.invoice_number}`,
        `Amount: ${Number(bookingData?.total_price || 0).toLocaleString()} RWF`,
        'Take a screenshot or note your transfer reference number',
      ],
      txPlaceholder: 'e.g. BK20261234567',
      txHint: 'Enter the reference number from your bank transfer receipt',
    },
  };

  const currentMethod = methods[form.payment_method] || methods.mtn_momo;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4 backdrop-blur-sm"
      onClick={onClose}>
      <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div className="flex items-center justify-between bg-blue-700 px-6 py-4 text-white">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-blue-200">
              {step === 1 ? 'Step 1 of 3 — Booking Details'
               : step === 2 ? 'Step 2 of 3 — Pay Invoice'
               : step === 3 ? 'Step 3 of 3 — Confirm Payment'
               : 'Booking Submitted!'}
            </p>
            <h2 className="text-lg font-extrabold">{car.name} — {car.brand} {car.model}</h2>
          </div>
          <button onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-white/20 hover:bg-white/30 transition">✕</button>
        </div>

        {/* Progress bar */}
        <div className="h-1.5 bg-blue-100">
          <div className="h-1.5 bg-blue-600 transition-all duration-500"
            style={{ width: step === 1 ? '33%' : step === 2 ? '66%' : step === 3 ? '100%' : '100%' }}/>
        </div>

        <div className="p-6">

          {/* ── STEP 1: Booking Form ── */}
          {step === 1 && (
            <div className="space-y-4">

              {/* Car summary */}
              <div className="flex items-center gap-4 rounded-xl bg-blue-50 p-4">
                {car.image
                  ? <img src={`http://localhost:5000/uploads/${car.image}`} alt={car.name} className="h-16 w-24 rounded-lg object-cover"/>
                  : <div className="flex h-16 w-24 items-center justify-center rounded-lg bg-blue-100 text-3xl">🚗</div>
                }
                <div>
                  <p className="font-extrabold text-gray-800">{car.name}</p>
                  <p className="text-xs text-gray-500">{car.brand} {car.model} · {car.year} · {car.seats} seats</p>
                  <p className="text-sm font-bold text-blue-700 mt-1">
                    {Number(car.price_per_day).toLocaleString()} RWF / day
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Full Name *</label>
                  <input name="customer_name" value={form.customer_name} onChange={handleChange}
                    placeholder="John Doe"
                    className="mt-1 w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-blue-400 transition"/>
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Email *</label>
                  <input name="customer_email" type="email" value={form.customer_email} onChange={handleChange}
                    placeholder="john@email.com"
                    className="mt-1 w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-blue-400 transition"/>
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Phone *</label>
                  <input name="customer_phone" value={form.customer_phone} onChange={handleChange}
                    placeholder="07XXXXXXXX"
                    className="mt-1 w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-blue-400 transition"/>
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Pickup Date *</label>
                  <input name="pickup_date" type="date" min={today} value={form.pickup_date} onChange={handleChange}
                    className="mt-1 w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-blue-400 transition"/>
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Return Date *</label>
                  <input name="return_date" type="date" min={form.pickup_date || today} value={form.return_date} onChange={handleChange}
                    className="mt-1 w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-blue-400 transition"/>
                </div>
              </div>

              {/* Payment method */}
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2 block">Payment Method *</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    ['mtn_momo',      '📱', 'MTN MoMo',     'border-yellow-400 bg-yellow-50 text-yellow-800'],
                    ['airtel_money',  '📲', 'Airtel Money',  'border-red-400 bg-red-50 text-red-800'],
                    ['bank_transfer', '🏦', 'Bank Transfer', 'border-blue-400 bg-blue-50 text-blue-800'],
                  ].map(([val, icon, label, activeClass]) => (
                    <button key={val} type="button"
                      onClick={() => setForm(p => ({ ...p, payment_method: val }))}
                      className={`rounded-xl border-2 px-3 py-3 text-xs font-bold transition text-center
                        ${form.payment_method === val ? activeClass : 'border-gray-200 text-gray-400 hover:border-gray-300'}`}>
                      <div className="text-xl mb-1">{icon}</div>
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Notes (optional)</label>
                <textarea name="notes" value={form.notes} onChange={handleChange} rows={2}
                  placeholder="Any special requests…"
                  className="mt-1 w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-blue-400 transition resize-none"/>
              </div>

              {/* Price summary */}
              {days > 0 && (
                <div className="rounded-xl bg-emerald-50 border border-emerald-100 p-4">
                  <div className="flex justify-between text-sm text-gray-600 mb-1">
                    <span>{Number(car.price_per_day).toLocaleString()} RWF × {days} day{days > 1 ? 's' : ''}</span>
                    <span className="font-bold text-emerald-700">{totalPrice.toLocaleString()} RWF</span>
                  </div>
                  <div className="flex justify-between font-extrabold text-gray-800 border-t border-emerald-200 pt-2 mt-2">
                    <span>Total</span>
                    <span className="text-emerald-700">{totalPrice.toLocaleString()} RWF</span>
                  </div>
                </div>
              )}

              {error && <p className="rounded-xl bg-red-50 px-4 py-2 text-xs font-semibold text-red-600">{error}</p>}

              <div className="flex gap-3 pt-2">
                <button onClick={onClose}
                  className="flex-1 rounded-xl border border-gray-200 py-3 text-sm font-bold text-gray-600 hover:bg-gray-50 transition">
                  Cancel
                </button>
                <button onClick={handleBooking} disabled={loading}
                  className="flex-1 rounded-xl bg-blue-600 py-3 text-sm font-bold text-white hover:bg-blue-700 transition disabled:opacity-50">
                  {loading ? 'Processing…' : 'Get Invoice →'}
                </button>
              </div>
            </div>
          )}

          {/* ── STEP 2: Invoice + Payment Instructions ── */}
          {step === 2 && bookingData && (
            <div className="space-y-4">

              {/* Invoice card */}
              <div className="rounded-2xl border-2 border-dashed border-blue-300 bg-blue-50 p-5 text-center">
                <p className="text-xs font-bold uppercase tracking-widest text-blue-400 mb-2">Your Invoice Number</p>
                <p className="text-3xl font-extrabold text-blue-700 tracking-widest mb-1">
                  {bookingData.invoice_number}
                </p>
                <p className="text-xs text-blue-400">Use this number when paying via MoMo or Bank</p>
              </div>

              {/* Booking summary */}
              <div className="rounded-xl bg-gray-50 p-4 text-sm space-y-2">
                <p className="font-extrabold text-gray-700 mb-2">📋 Booking Summary</p>
                <div className="flex justify-between text-gray-600">
                  <span>Car</span><span className="font-bold">{car.name}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Duration</span><span className="font-bold">{bookingData.total_days} days</span>
                </div>
                <div className="flex justify-between font-extrabold text-emerald-700 border-t border-gray-200 pt-2 mt-2">
                  <span>Amount to Pay</span>
                  <span>{Number(bookingData.total_price).toLocaleString()} RWF</span>
                </div>
              </div>

              {/* Payment steps */}
              <div className={`rounded-xl border p-4 ${currentMethod.color}`}>
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-2xl">{currentMethod.icon}</span>
                  <p className="font-extrabold text-gray-800">Pay with {currentMethod.label}</p>
                  {currentMethod.ussdCode && (
                    <span className="ml-auto rounded-lg bg-white px-2 py-1 text-xs font-extrabold text-gray-700 shadow-sm">
                      {currentMethod.ussdCode}
                    </span>
                  )}
                </div>
                <ol className="space-y-2">
                  {currentMethod.steps.map((s, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-white text-xs font-extrabold text-blue-700 shadow-sm">
                        {i + 1}
                      </span>
                      <span>{s}</span>
                    </li>
                  ))}
                </ol>
              </div>

              {/* Warning */}
              <div className="rounded-xl bg-amber-50 border border-amber-200 p-3 text-xs text-amber-800 leading-5">
                ⚠️ After paying you will receive an <strong>SMS with a Transaction ID</strong>. You will need it in the next step.
              </div>

              <div className="flex gap-3 pt-2">
                <button onClick={() => setStep(1)}
                  className="flex-1 rounded-xl border border-gray-200 py-3 text-sm font-bold text-gray-600 hover:bg-gray-50 transition">
                  ← Back
                </button>
                <button onClick={() => { setError(''); setStep(3); }}
                  className="flex-1 rounded-xl bg-emerald-600 py-3 text-sm font-bold text-white hover:bg-emerald-700 transition">
                  I Have Paid →
                </button>
              </div>
            </div>
          )}

          {/* ── STEP 3: Enter Transaction ID ── */}
          {step === 3 && bookingData && (
            <div className="space-y-4">

              <div className="rounded-xl bg-emerald-50 border border-emerald-100 p-4 text-center">
                <p className="text-2xl mb-1">📩</p>
                <p className="font-extrabold text-gray-800">Enter Your Transaction ID</p>
                <p className="text-xs text-gray-500 mt-1">Check the SMS you received after paying</p>
              </div>

              {/* Invoice reminder */}
              <div className="flex items-center justify-between rounded-xl bg-blue-50 px-4 py-3">
                <span className="text-xs text-gray-500">Invoice</span>
                <span className="font-extrabold text-blue-700 tracking-widest">{bookingData.invoice_number}</span>
              </div>
              <div className="flex items-center justify-between rounded-xl bg-gray-50 px-4 py-3">
                <span className="text-xs text-gray-500">Amount Paid</span>
                <span className="font-extrabold text-emerald-700">{Number(bookingData.total_price).toLocaleString()} RWF</span>
              </div>

              {/* Transaction ID input */}
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">
                  {currentMethod.icon} {currentMethod.label} Transaction ID *
                </label>
                <input
                  value={transactionId}
                  onChange={e => setTransactionId(e.target.value)}
                  placeholder={currentMethod.txPlaceholder}
                  className="mt-1 w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-emerald-400 transition font-mono tracking-wider"/>
                <p className="text-xs text-gray-400 mt-1">{currentMethod.txHint}</p>
              </div>

              {error && <p className="rounded-xl bg-red-50 px-4 py-2 text-xs font-semibold text-red-600">{error}</p>}

              <div className="flex gap-3 pt-2">
                <button onClick={() => setStep(2)}
                  className="flex-1 rounded-xl border border-gray-200 py-3 text-sm font-bold text-gray-600 hover:bg-gray-50 transition">
                  ← Back
                </button>
                <button onClick={handlePaymentProof} disabled={loading}
                  className="flex-1 rounded-xl bg-emerald-600 py-3 text-sm font-bold text-white hover:bg-emerald-700 transition disabled:opacity-50">
                  {loading ? 'Verifying…' : '✅ Submit Payment'}
                </button>
              </div>
            </div>
          )}

          {/* ── STEP 4: Success ── */}
          {step === 4 && (
            <div className="flex flex-col items-center text-center py-6 gap-4">
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100 text-5xl">🎉</div>
              <h3 className="text-xl font-extrabold text-gray-800">Payment Submitted!</h3>
              <p className="text-gray-500 text-sm max-w-xs leading-6">
                Your payment proof has been submitted. Our team will verify and confirm your booking for
                <span className="font-bold text-gray-700"> {car.name}</span> shortly.
              </p>
              <div className="rounded-xl bg-blue-50 border border-blue-100 px-6 py-4 text-sm w-full space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-500">Invoice No.</span>
                  <span className="font-extrabold text-blue-700">{bookingData?.invoice_number}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Transaction ID</span>
                  <span className="font-bold font-mono text-xs">{transactionId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Duration</span>
                  <span className="font-bold">{bookingData?.total_days} days</span>
                </div>
                <div className="flex justify-between font-extrabold text-emerald-700 border-t border-blue-100 pt-2 mt-2">
                  <span>Amount</span>
                  <span>{Number(bookingData?.total_price).toLocaleString()} RWF</span>
                </div>
              </div>
              <p className="text-xs text-gray-400 leading-5">
                You will receive a confirmation call or SMS on <strong>{form.customer_phone}</strong> within 30 minutes.
              </p>
              <button onClick={onClose}
                className="w-full rounded-xl bg-blue-600 py-3 text-sm font-bold text-white hover:bg-blue-700 transition">
                Done
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default BookingModal;
