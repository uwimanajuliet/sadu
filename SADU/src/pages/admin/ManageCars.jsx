import { useEffect, useState } from 'react';
import API from '../../config.js';

const EMPTY = {
  name: '', brand: '', model: '', year: '',
  price_per_day: '', seats: '', transmission: 'automatic',
  fuel_type: 'petrol', description: '', status: 'available',
};

const ManageCars = () => {
  const [cars, setCars]       = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null); // car object being edited
  const [form, setForm]       = useState(EMPTY);
  const [image, setImage]     = useState(null);
  const [preview, setPreview] = useState(null);
  const [saving, setSaving]   = useState(false);
  const [error, setError]     = useState('');
  const [success, setSuccess] = useState('');

  const fetchCars = () => {
    setLoading(true);
    API.get('/cars')
      .then(r => setCars(r.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchCars(); }, []);

  const openAdd = () => {
    setEditing(null);
    setForm(EMPTY);
    setImage(null);
    setPreview(null);
    setError('');
    setShowForm(true);
  };

  const openEdit = (car) => {
    setEditing(car);
    setForm({
      name:          car.name          || '',
      brand:         car.brand         || '',
      model:         car.model         || '',
      year:          car.year          || '',
      price_per_day: car.price_per_day || '',
      seats:         car.seats         || '',
      transmission:  car.transmission  || 'automatic',
      fuel_type:     car.fuel_type     || 'petrol',
      description:   car.description   || '',
      status:        car.status        || 'available',
    });
    setImage(null);
    setPreview(car.image ? `http://localhost:5000/uploads/${car.image}` : null);
    setError('');
    setShowForm(true);
  };

  const handleChange = e => setForm(p => ({ ...p, [e.target.name]: e.target.value }));

  const handleImage = e => {
    const file = e.target.files[0];
    setImage(file);
    if (file) setPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async () => {
    setError('');
    if (!form.name || !form.brand || !form.model || !form.price_per_day) {
      return setError('Please fill Name, Brand, Model and Price.');
    }

    setSaving(true);
    try {
      const data = new FormData();
      Object.entries(form).forEach(([k, v]) => data.append(k, v));
      if (image) data.append('image', image);

      if (editing) {
        await API.put(`/cars/${editing.id}`, data, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        setSuccess('Car updated successfully!');
      } else {
        await API.post('/cars', data, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        setSuccess('Car added successfully!');
      }

      setShowForm(false);
      fetchCars();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save car.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this car? This cannot be undone.')) return;
    try {
      await API.delete(`/cars/${id}`);
      setCars(p => p.filter(c => c.id !== id));
      setSuccess('Car deleted.');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      alert('Failed to delete car.');
    }
  };

  const handleStatusChange = async (car, newStatus) => {
    try {
      const data = new FormData();
      Object.entries({
        name: car.name, brand: car.brand, model: car.model,
        year: car.year, price_per_day: car.price_per_day,
        seats: car.seats, transmission: car.transmission,
        fuel_type: car.fuel_type, description: car.description,
        status: newStatus,
      }).forEach(([k, v]) => data.append(k, v));
      await API.put(`/cars/${car.id}`, data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setCars(p => p.map(c => c.id === car.id ? { ...c, status: newStatus } : c));
    } catch (err) {
      alert('Failed to update status.');
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-6 py-10">

      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">🚗 Manage Cars</h1>
          <p className="text-gray-400 text-sm mt-1">{cars.length} car{cars.length !== 1 ? 's' : ''} in fleet</p>
        </div>
        <button onClick={openAdd}
          className="inline-flex items-center gap-2 rounded-xl bg-blue-700 px-5 py-2.5 text-sm font-bold text-white hover:bg-blue-800 transition">
          + Add Car
        </button>
      </div>

      {/* Success */}
      {success && (
        <div className="mb-6 rounded-xl bg-emerald-50 border border-emerald-200 px-4 py-3 text-sm font-semibold text-emerald-700">
          ✅ {success}
        </div>
      )}

      {/* ── ADD / EDIT FORM ── */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4 backdrop-blur-sm"
          onClick={() => setShowForm(false)}>
          <div className="w-full max-w-xl rounded-2xl bg-white shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto"
            onClick={e => e.stopPropagation()}>

            {/* Modal header */}
            <div className="flex items-center justify-between bg-blue-700 px-6 py-4 text-white">
              <h2 className="text-lg font-extrabold">{editing ? 'Edit Car' : 'Add New Car'}</h2>
              <button onClick={() => setShowForm(false)}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-white/20 hover:bg-white/30 transition">✕</button>
            </div>

            <div className="p-6 space-y-4">
              {error && (
                <div className="rounded-xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-600">{error}</div>
              )}

              {/* Name */}
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Car Name *</label>
                <input name="name" value={form.name} onChange={handleChange}
                  placeholder="e.g. Toyota Corolla"
                  className="mt-1 w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-blue-400 transition"/>
              </div>

              {/* Brand + Model */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Brand *</label>
                  <input name="brand" value={form.brand} onChange={handleChange}
                    placeholder="e.g. Toyota"
                    className="mt-1 w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-blue-400 transition"/>
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Model *</label>
                  <input name="model" value={form.model} onChange={handleChange}
                    placeholder="e.g. Corolla"
                    className="mt-1 w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-blue-400 transition"/>
                </div>
              </div>

              {/* Year + Seats */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Year</label>
                  <input name="year" type="number" value={form.year} onChange={handleChange}
                    placeholder="e.g. 2022"
                    className="mt-1 w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-blue-400 transition"/>
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Seats</label>
                  <input name="seats" type="number" value={form.seats} onChange={handleChange}
                    placeholder="e.g. 5"
                    className="mt-1 w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-blue-400 transition"/>
                </div>
              </div>

              {/* Price */}
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Price per Day (RWF) *</label>
                <input name="price_per_day" type="number" value={form.price_per_day} onChange={handleChange}
                  placeholder="e.g. 50000"
                  className="mt-1 w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-blue-400 transition"/>
              </div>

              {/* Transmission + Fuel */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Transmission</label>
                  <select name="transmission" value={form.transmission} onChange={handleChange}
                    className="mt-1 w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-blue-400 transition bg-white">
                    <option value="automatic">Automatic</option>
                    <option value="manual">Manual</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Fuel Type</label>
                  <select name="fuel_type" value={form.fuel_type} onChange={handleChange}
                    className="mt-1 w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-blue-400 transition bg-white">
                    <option value="petrol">Petrol</option>
                    <option value="diesel">Diesel</option>
                    <option value="electric">Electric</option>
                    <option value="hybrid">Hybrid</option>
                  </select>
                </div>
              </div>

              {/* Status */}
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Status</label>
                <select name="status" value={form.status} onChange={handleChange}
                  className="mt-1 w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-blue-400 transition bg-white">
                  <option value="available">Available</option>
                  <option value="rented">Rented</option>
                  <option value="maintenance">Maintenance</option>
                </select>
              </div>

              {/* Description */}
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Description</label>
                <textarea name="description" value={form.description} onChange={handleChange}
                  rows={3} placeholder="Optional description…"
                  className="mt-1 w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-blue-400 transition resize-none"/>
              </div>

              {/* Image */}
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Car Image</label>
                <div className="mt-1 flex items-center gap-4">
                  <label className="cursor-pointer rounded-xl border-2 border-dashed border-gray-200 px-5 py-3 text-sm text-gray-400 hover:border-blue-400 hover:text-blue-500 transition">
                    📷 {preview ? 'Change Image' : 'Upload Image'}
                    <input type="file" accept="image/*" onChange={handleImage} className="hidden"/>
                  </label>
                  {preview && (
                    <img src={preview} alt="preview" className="h-16 w-24 rounded-xl object-cover border border-gray-100"/>
                  )}
                </div>
              </div>

              {/* Buttons */}
              <div className="flex gap-3 pt-2">
                <button onClick={() => setShowForm(false)}
                  className="flex-1 rounded-xl border border-gray-200 py-3 text-sm font-bold text-gray-600 hover:bg-gray-50 transition">
                  Cancel
                </button>
                <button onClick={handleSubmit} disabled={saving}
                  className="flex-1 rounded-xl bg-blue-700 py-3 text-sm font-bold text-white hover:bg-blue-800 transition disabled:opacity-50">
                  {saving ? 'Saving…' : editing ? '💾 Save Changes' : '🚗 Add Car'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── CARS TABLE ── */}
      {loading ? (
        <div className="flex flex-col items-center py-24 gap-3">
          <div className="h-10 w-10 rounded-full border-[3px] border-gray-200 border-t-blue-600 animate-spin"/>
          <p className="text-gray-400 text-sm">Loading cars…</p>
        </div>
      ) : cars.length === 0 ? (
        <div className="flex flex-col items-center py-24 text-center gap-3">
          <div className="text-5xl">🚗</div>
          <h3 className="font-bold text-gray-700">No cars yet</h3>
          <p className="text-gray-400 text-sm">Click "Add Car" to get started.</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-400 text-xs uppercase tracking-wide">
                <tr>
                  <th className="px-5 py-3 text-left">Car</th>
                  <th className="px-5 py-3 text-left">Details</th>
                  <th className="px-5 py-3 text-left">Price/Day</th>
                  <th className="px-5 py-3 text-left">Status</th>
                  <th className="px-5 py-3 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {cars.map(car => (
                  <tr key={car.id} className="border-t border-gray-50 hover:bg-gray-50 transition">
                    {/* Car image + name */}
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        {car.image
                          ? <img src={`http://localhost:5000/uploads/${car.image}`} alt={car.name}
                              className="h-12 w-16 rounded-lg object-cover border border-gray-100"/>
                          : <div className="flex h-12 w-16 items-center justify-center rounded-lg bg-blue-50 text-2xl">🚗</div>
                        }
                        <div>
                          <p className="font-bold text-gray-800">{car.name}</p>
                          <p className="text-xs text-gray-400">{car.brand} {car.model}</p>
                        </div>
                      </div>
                    </td>

                    {/* Details */}
                    <td className="px-5 py-4 text-gray-500">
                      <p>{car.year} · {car.seats} seats</p>
                      <p className="capitalize">{car.transmission} · {car.fuel_type}</p>
                    </td>

                    {/* Price */}
                    <td className="px-5 py-4 font-bold text-gray-800">
                      {Number(car.price_per_day).toLocaleString()} RWF
                    </td>

                    {/* Status dropdown */}
                    <td className="px-5 py-4">
                      <select
                        value={car.status}
                        onChange={e => handleStatusChange(car, e.target.value)}
                        className={`rounded-full px-3 py-1 text-xs font-bold border-0 outline-none cursor-pointer
                          ${car.status === 'available'   ? 'bg-emerald-100 text-emerald-700' :
                            car.status === 'rented'      ? 'bg-red-100 text-red-600'         :
                            'bg-yellow-100 text-yellow-700'}`}>
                        <option value="available">Available</option>
                        <option value="rented">Rented</option>
                        <option value="maintenance">Maintenance</option>
                      </select>
                    </td>

                    {/* Actions */}
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <button onClick={() => openEdit(car)}
                          className="rounded-lg bg-blue-50 px-3 py-1.5 text-xs font-bold text-blue-600 hover:bg-blue-100 transition">
                          ✏️ Edit
                        </button>
                        <button onClick={() => handleDelete(car.id)}
                          className="rounded-lg bg-red-50 px-3 py-1.5 text-xs font-bold text-red-500 hover:bg-red-100 transition">
                          🗑 Delete
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
    </div>
  );
};

export default ManageCars;