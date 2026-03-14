import { useEffect, useState } from 'react';
import API from '../../config.js';

const STATUS_COLORS = {
  pending:   'bg-yellow-100 text-yellow-700',
  approved:  'bg-emerald-100 text-emerald-700',
  rejected:  'bg-red-100 text-red-600',
  completed: 'bg-blue-100 text-blue-700',
};

const PAY_COLORS = {
  pending:   'bg-yellow-100 text-yellow-700',
  paid:      'bg-emerald-100 text-emerald-700',
  failed:    'bg-red-100 text-red-600',
};

const ManageBookings = () => {
  const [bookings, setBookings]       = useState([]);
  const [loading, setLoading]         = useState(true);
  const [filter, setFilter]           = useState('all');
  const [selected, setSelected]       = useState(null); // booking detail modal
  const [actionLoading, setActionLoading] = useState(null);
  const [success, setSuccess]         = useState('');

  const fetchBookings = () => {
    setLoading(true);
    API.get('/bookings')
      .then(r => setBookings(r.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchBookings(); }, []);

  const filtered = filter === 'all'
    ? bookings
    : bookings.filter(b => b.status === filter);

  const showSuccess = (msg) => {
    setSuccess(msg);
    setTimeout(() => setSuccess(''), 3000);
  };

  // Approve or Reject booking
  const handleStatus = async (bookingId, newStatus) => {
    setActionLoading(bookingId + newStatus);
    try {
      await API.put(`/bookings/${bookingId}/status`, { status: newStatus });
      setBookings(p => p.map(b =>
        b.id === bookingId ? { ...b, status: newStatus } : b
      ));
      if (selected?.id === bookingId) setSelected(p => ({ ...p, status: newStatus }));
      showSuccess(`Booking #${bookingId} ${newStatus}!`);
    } catch (err) {
      alert('Failed to update booking status.');
    } finally {
      setActionLoading(null);
    }
  };

  // Confirm payment (mark as paid)
  const handleConfirmPayment = async (booking) => {
    setActionLoading('pay' + booking.id);
    try {
      await API.post('/payments/admin-verify', {
        booking_id:     booking.id,
        transaction_id: `ADMIN-CONFIRM-${Date.now()}`,
        payment_method: booking.payment_method || 'mobile_money',
      });
      setBookings(p => p.map(b =>
        b.id === booking.id ? { ...b, payment_status: 'paid', status: 'approved' } : b
      ));
      if (selected?.id === booking.id) {
        setSelected(p => ({ ...p, payment_status: 'paid', status: 'approved' }));
      }
      showSuccess(`Payment confirmed for Booking #${booking.id}!`);
    } catch (err) {
      alert('Failed to confirm payment.');
    } finally {
      setActionLoading(null);
    }
  };

  // Mark booking completed
  const handleComplete = async (bookingId) => {
    setActionLoading('complete' + bookingId);
    try {
      await API.put(`/bookings/${bookingId}/status`, { status: 'completed' });
      setBookings(p => p.map(b =>
        b.id === bookingId ? { ...b, status: 'completed' } : b
      ));
      if (selected?.id === bookingId) setSelected(p => ({ ...p, status: 'completed' }));
      showSuccess(`Booking #${bookingId} marked as completed!`);
    } catch (err) {
      alert('Failed to complete booking.');
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async (bookingId) => {
    if (!window.confirm(`Are you sure you want to delete booking #${bookingId}? This cannot be undone.`)) return;
    setActionLoading('delete' + bookingId);
    try {
      await API.delete(`/bookings/${bookingId}`);
      setBookings(p => p.filter(b => b.id !== bookingId));
      if (selected?.id === bookingId) setSelected(null);
      showSuccess(`Booking #${bookingId} deleted.`);
    } catch (err) {
      alert('Failed to delete booking.');
    } finally {
      setActionLoading(null);
    }
  };

  const counts = {
    all:       bookings.length,
    pending:   bookings.filter(b => b.status === 'pending').length,
    approved:  bookings.filter(b => b.status === 'approved').length,
    completed: bookings.filter(b => b.status === 'completed').length,
    rejected:  bookings.filter(b => b.status === 'rejected').length,
  };

  return (
    <div className="max-w-6xl mx-auto px-6 py-10">

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800">📋 Manage Bookings</h1>
        <p className="text-gray-400 text-sm mt-1">{bookings.length} total booking{bookings.length !== 1 ? 's' : ''}</p>
      </div>

      {/* Success toast */}
      {success && (
        <div className="mb-6 rounded-xl bg-emerald-50 border border-emerald-200 px-4 py-3 text-sm font-semibold text-emerald-700">
          ✅ {success}
        </div>
      )}

      {/* Filter tabs */}
      <div className="flex gap-2 flex-wrap mb-6">
        {[
          { key: 'all',       label: 'All',       count: counts.all       },
          { key: 'pending',   label: '⏳ Pending',  count: counts.pending   },
          { key: 'approved',  label: '✅ Approved', count: counts.approved  },
          { key: 'completed', label: '🏁 Completed',count: counts.completed },
          { key: 'rejected',  label: '❌ Rejected', count: counts.rejected  },
        ].map(t => (
          <button key={t.key} onClick={() => setFilter(t.key)}
            className={`rounded-xl px-4 py-2 text-xs font-bold border transition
              ${filter === t.key
                ? 'bg-blue-700 text-white border-blue-700'
                : 'bg-white text-gray-500 border-gray-200 hover:border-blue-400'}`}>
            {t.label} ({t.count})
          </button>
        ))}
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex flex-col items-center py-24 gap-3">
          <div className="h-10 w-10 rounded-full border-[3px] border-gray-200 border-t-blue-600 animate-spin"/>
          <p className="text-gray-400 text-sm">Loading bookings…</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center py-24 gap-3 text-center">
          <div className="text-5xl">📋</div>
          <h3 className="font-bold text-gray-700">No {filter !== 'all' ? filter : ''} bookings</h3>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-400 text-xs uppercase tracking-wide">
                <tr>
                  <th className="px-5 py-3 text-left">ID</th>
                  <th className="px-5 py-3 text-left">Customer</th>
                  <th className="px-5 py-3 text-left">Car</th>
                  <th className="px-5 py-3 text-left">Dates</th>
                  <th className="px-5 py-3 text-left">Amount</th>
                  <th className="px-5 py-3 text-left">Payment</th>
                  <th className="px-5 py-3 text-left">Status</th>
                  <th className="px-5 py-3 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(b => (
                  <tr key={b.id} className="border-t border-gray-50 hover:bg-gray-50 transition">
                    <td className="px-5 py-4 font-bold text-gray-500">#{b.id}</td>

                    {/* Customer */}
                    <td className="px-5 py-4">
                      <p className="font-semibold text-gray-800">{b.customer_name}</p>
                      <p className="text-xs text-gray-400">{b.customer_phone}</p>
                      <p className="text-xs text-gray-400">{b.customer_email}</p>
                    </td>

                    {/* Car */}
                    <td className="px-5 py-4 text-gray-600 font-medium">{b.car_name}</td>

                    {/* Dates */}
                    <td className="px-5 py-4 text-gray-500 text-xs">
                      <p>📅 {new Date(b.pickup_date).toLocaleDateString()}</p>
                      <p>🏁 {new Date(b.return_date).toLocaleDateString()}</p>
                      <p className="font-semibold text-gray-700">{b.total_days} days</p>
                    </td>

                    {/* Amount */}
                    <td className="px-5 py-4 font-bold text-gray-800">
                      {Number(b.total_price).toLocaleString()} RWF
                    </td>

                    {/* Payment status */}
                    <td className="px-5 py-4">
                      <span className={`rounded-full px-2.5 py-1 text-[10px] font-bold ${PAY_COLORS[b.payment_status] || PAY_COLORS.pending}`}>
                        {b.payment_status || 'pending'}
                      </span>
                      <p className="text-[10px] text-gray-400 mt-1 capitalize">{b.payment_method?.replace('_', ' ')}</p>
                    </td>

                    {/* Booking status */}
                    <td className="px-5 py-4">
                      <span className={`rounded-full px-2.5 py-1 text-[10px] font-bold ${STATUS_COLORS[b.status] || STATUS_COLORS.pending}`}>
                        {b.status}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="px-5 py-4">
                      <div className="flex flex-col gap-1.5">
                        {/* View details */}
                        <button onClick={() => setSelected(b)}
                          className="rounded-lg bg-gray-100 px-3 py-1.5 text-[11px] font-bold text-gray-600 hover:bg-gray-200 transition">
                          👁 View
                        </button>

                        {/* Confirm payment if pending */}
                        {b.payment_status !== 'paid' && b.status !== 'rejected' && (
                          <button
                            onClick={() => handleConfirmPayment(b)}
                            disabled={actionLoading === 'pay' + b.id}
                            className="rounded-lg bg-emerald-50 px-3 py-1.5 text-[11px] font-bold text-emerald-700 hover:bg-emerald-100 transition disabled:opacity-50">
                            {actionLoading === 'pay' + b.id ? '…' : '💰 Confirm Pay'}
                          </button>
                        )}

                        {/* Approve if pending */}
                        {b.status === 'pending' && (
                          <button
                            onClick={() => handleStatus(b.id, 'approved')}
                            disabled={!!actionLoading}
                            className="rounded-lg bg-blue-50 px-3 py-1.5 text-[11px] font-bold text-blue-700 hover:bg-blue-100 transition disabled:opacity-50">
                            ✅ Approve
                          </button>
                        )}

                        {/* Reject if pending */}
                        {b.status === 'pending' && (
                          <button
                            onClick={() => handleStatus(b.id, 'rejected')}
                            disabled={!!actionLoading}
                            className="rounded-lg bg-red-50 px-3 py-1.5 text-[11px] font-bold text-red-500 hover:bg-red-100 transition disabled:opacity-50">
                            ❌ Reject
                          </button>
                        )}

                        {/* Complete if approved */}
                        {b.status === 'approved' && (
                          <button
                            onClick={() => handleComplete(b.id)}
                            disabled={!!actionLoading}
                            className="rounded-lg bg-purple-50 px-3 py-1.5 text-[11px] font-bold text-purple-700 hover:bg-purple-100 transition disabled:opacity-50">
                            🏁 Complete
                          </button>
                        )}

                        {/* Delete */}
                        <button
                          onClick={() => handleDelete(b.id)}
                          disabled={actionLoading === 'delete' + b.id}
                          className="rounded-lg bg-red-50 px-3 py-1.5 text-[11px] font-bold text-red-600 hover:bg-red-100 transition disabled:opacity-50">
                          {actionLoading === 'delete' + b.id ? '…' : '🗑 Delete'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── BOOKING DETAIL MODAL ── */}
      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4 backdrop-blur-sm"
          onClick={() => setSelected(null)}>
          <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto"
            onClick={e => e.stopPropagation()}>

            {/* Modal header */}
            <div className="flex items-center justify-between bg-blue-700 px-6 py-4 text-white">
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-blue-200">Booking Details</p>
                <h2 className="text-lg font-extrabold">#{selected.id} — {selected.customer_name}</h2>
              </div>
              <button onClick={() => setSelected(null)}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-white/20 hover:bg-white/30 transition">✕</button>
            </div>

            <div className="p-6 space-y-5">

              {/* Customer info */}
              <div className="rounded-xl bg-gray-50 p-4 space-y-2">
                <p className="text-xs font-bold uppercase tracking-wide text-gray-400 mb-3">👤 Customer Info</p>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Name</span>
                  <span className="font-bold text-gray-800">{selected.customer_name}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Email</span>
                  <span className="font-bold text-gray-800">{selected.customer_email}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Phone</span>
                  <span className="font-bold text-gray-800">{selected.customer_phone}</span>
                </div>
              </div>

              {/* Booking info */}
              <div className="rounded-xl bg-blue-50 p-4 space-y-2">
                <p className="text-xs font-bold uppercase tracking-wide text-gray-400 mb-3">🚗 Booking Info</p>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Car</span>
                  <span className="font-bold text-gray-800">{selected.car_name}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Pickup Date</span>
                  <span className="font-bold">{new Date(selected.pickup_date).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Return Date</span>
                  <span className="font-bold">{new Date(selected.return_date).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Duration</span>
                  <span className="font-bold">{selected.total_days} days</span>
                </div>
                {selected.notes && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Notes</span>
                    <span className="font-bold text-gray-700 text-right max-w-[60%]">{selected.notes}</span>
                  </div>
                )}
              </div>

              {/* Payment info */}
              <div className="rounded-xl bg-emerald-50 p-4 space-y-2">
                <p className="text-xs font-bold uppercase tracking-wide text-gray-400 mb-3">💰 Payment Info</p>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Method</span>
                  <span className="font-bold capitalize">{selected.payment_method?.replace('_', ' ')}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Customer MoMo</span>
                  <span className="font-bold text-gray-800">{selected.customer_phone}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Payment Status</span>
                  <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold ${PAY_COLORS[selected.payment_status] || PAY_COLORS.pending}`}>
                    {selected.payment_status || 'pending'}
                  </span>
                </div>
                <div className="flex justify-between font-extrabold text-gray-800 border-t border-emerald-100 pt-3 mt-2">
                  <span>Total Amount</span>
                  <span className="text-emerald-700">{Number(selected.total_price).toLocaleString()} RWF</span>
                </div>
              </div>

              {/* Action buttons */}
              <div className="space-y-2 pt-2">

                {/* Confirm payment */}
                {selected.payment_status !== 'paid' && selected.status !== 'rejected' && (
                  <button
                    onClick={() => handleConfirmPayment(selected)}
                    disabled={actionLoading === 'pay' + selected.id}
                    className="w-full rounded-xl bg-emerald-600 py-3 text-sm font-bold text-white hover:bg-emerald-700 transition disabled:opacity-50">
                    {actionLoading === 'pay' + selected.id ? 'Processing…' : '💰 Confirm Payment Received'}
                  </button>
                )}

                {selected.status === 'pending' && (
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => handleStatus(selected.id, 'approved')}
                      disabled={!!actionLoading}
                      className="rounded-xl bg-blue-600 py-3 text-sm font-bold text-white hover:bg-blue-700 transition disabled:opacity-50">
                      ✅ Approve
                    </button>
                    <button
                      onClick={() => handleStatus(selected.id, 'rejected')}
                      disabled={!!actionLoading}
                      className="rounded-xl bg-red-500 py-3 text-sm font-bold text-white hover:bg-red-600 transition disabled:opacity-50">
                      ❌ Reject
                    </button>
                  </div>
                )}

                {selected.status === 'approved' && (
                  <button
                    onClick={() => handleComplete(selected.id)}
                    disabled={!!actionLoading}
                    className="w-full rounded-xl bg-purple-600 py-3 text-sm font-bold text-white hover:bg-purple-700 transition disabled:opacity-50">
                    🏁 Mark as Completed
                  </button>
                )}

                {(selected.payment_status === 'paid' && selected.status === 'approved') && (
                  <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-4 text-center">
                    <p className="text-emerald-700 font-bold text-sm">✅ Payment confirmed & Booking approved</p>
                    <p className="text-emerald-600 text-xs mt-1">
                      Send {Number(selected.total_price).toLocaleString()} RWF MoMo request to {selected.customer_phone}
                    </p>
                  </div>
                )}

                {/* Delete booking */}
                <button
                  onClick={() => handleDelete(selected.id)}
                  disabled={actionLoading === 'delete' + selected.id}
                  className="w-full rounded-xl border-2 border-red-200 py-3 text-sm font-bold text-red-600 hover:bg-red-50 transition disabled:opacity-50">
                  {actionLoading === 'delete' + selected.id ? 'Deleting…' : '🗑 Delete This Booking'}
                </button>

              </div>

            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageBookings;
