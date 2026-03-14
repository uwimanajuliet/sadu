import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import API from '../../config.js';
import { useAuth } from '../../context/AuthContext.jsx';

const Dashboard = () => {
  const { admin } = useAuth();

  const [adsStats, setAdsStats] = useState({
    totalAds: 0, services: 0, internships: 0, categories: 0,
  });
  const [carStats, setCarStats] = useState({
    totalCars: 0, availableCars: 0, totalBookings: 0, pendingBookings: 0, totalRevenue: 0,
  });
  const [recentAds, setRecentAds]           = useState([]);
  const [recentBookings, setRecentBookings] = useState([]);
  const [loading, setLoading]               = useState(true);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [adsRes, catRes, carsRes, bookingsRes, paymentsRes] = await Promise.all([
          API.get('/ads'),
          API.get('/categories'),
          API.get('/cars'),
          API.get('/bookings'),
          API.get('/payments'),
        ]);

        const ads = adsRes.data;
        setAdsStats({
          totalAds:    ads.length,
          services:    ads.filter(a => a.type === 'service').length,
          internships: ads.filter(a => a.type === 'internship').length,
          categories:  catRes.data.length,
        });
        setRecentAds(ads.slice(0, 5));

        const cars     = carsRes.data;
        const bookings = bookingsRes.data;
        const payments = paymentsRes.data;
        const totalRevenue = payments
          .filter(p => p.status === 'completed')
          .reduce((sum, p) => sum + parseFloat(p.amount || 0), 0);

        setCarStats({
          totalCars:       cars.length,
          availableCars:   cars.filter(c => c.status === 'available').length,
          totalBookings:   bookings.length,
          pendingBookings: bookings.filter(b => b.status === 'pending').length,
          totalRevenue,
        });
        setRecentBookings(bookings.slice(0, 5));

      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  return (
    <div className="max-w-6xl mx-auto px-6 py-10">

      {/* Welcome */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Welcome, {admin?.username} 👋</h1>
        <p className="text-gray-500 mt-1">Here is an overview of your platform</p>
      </div>

      {loading ? (
        <div className="flex flex-col items-center py-24 gap-3">
          <div className="h-10 w-10 rounded-full border-[3px] border-gray-200 border-t-blue-600 animate-spin"/>
          <p className="text-gray-400 text-sm">Loading dashboard…</p>
        </div>
      ) : (
        <>
          {/* ── Platform Stats ── */}
          <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-3">📋 Platform Overview</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-5 mb-8">
            {[
              { icon:'📋', value: adsStats.totalAds,    label:'Total Ads',    color:'text-blue-700'    },
              { icon:'🚌', value: adsStats.services,    label:'Services',     color:'text-blue-500'    },
              { icon:'🎓', value: adsStats.internships, label:'Internships',  color:'text-emerald-500' },
              { icon:'🗂️', value: adsStats.categories,  label:'Categories',   color:'text-purple-500'  },
            ].map(s => (
              <div key={s.label} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 text-center">
                <p className="text-2xl mb-2">{s.icon}</p>
                <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
                <p className="text-gray-500 text-xs mt-1">{s.label}</p>
              </div>
            ))}
          </div>

          {/* ── Car Rental Stats ── */}
          <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-3">🚗 Car Rental Overview</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-5 mb-8">
            {[
              { icon:'🚗', value: carStats.totalCars,     label:'Total Cars',     color:'text-gray-800'    },
              { icon:'✅', value: carStats.availableCars, label:'Available Cars', color:'text-emerald-600' },
              { icon:'📋', value: carStats.totalBookings, label:'Total Bookings', color:'text-blue-600'    },
              { icon:'💰', value: `${carStats.totalRevenue.toLocaleString()} RWF`, label:'Revenue', color:'text-purple-600' },
            ].map(s => (
              <div key={s.label} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 text-center">
                <p className="text-2xl mb-2">{s.icon}</p>
                <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
                <p className="text-gray-500 text-xs mt-1">{s.label}</p>
              </div>
            ))}
          </div>

          {/* ── Quick Actions ── */}
          <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-3">⚡ Quick Actions</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-10">
            <Link to="/admin/ads"
              className="bg-blue-700 text-white rounded-2xl p-5 hover:bg-blue-800 transition">
              <p className="text-2xl mb-2">📋</p>
              <p className="font-bold">Manage Ads</p>
              <p className="text-blue-200 text-xs mt-1">Add, edit or delete ads</p>
            </Link>
            <Link to="/admin/categories"
              className="bg-purple-600 text-white rounded-2xl p-5 hover:bg-purple-700 transition">
              <p className="text-2xl mb-2">🗂️</p>
              <p className="font-bold">Categories</p>
              <p className="text-purple-200 text-xs mt-1">Manage ad categories</p>
            </Link>
            <Link to="/admin/cars"
              className="bg-blue-900 text-white rounded-2xl p-5 hover:bg-blue-800 transition">
              <p className="text-2xl mb-2">🚗</p>
              <p className="font-bold">Manage Cars</p>
              <p className="text-blue-300 text-xs mt-1">Add, edit or delete cars</p>
            </Link>
            <Link to="/admin/bookings"
              className="bg-emerald-700 text-white rounded-2xl p-5 hover:bg-emerald-600 transition">
              <p className="text-2xl mb-2">📅</p>
              <p className="font-bold">Bookings</p>
              <p className="text-emerald-200 text-xs mt-1">
                {carStats.pendingBookings} pending
              </p>
            </Link>
          </div>

          {/* ── Recent Ads + Recent Bookings ── */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

            {/* Recent Ads */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-base font-bold text-gray-800">Recent Ads</h2>
                <Link to="/admin/ads" className="text-blue-600 text-xs hover:underline">View all →</Link>
              </div>
              {recentAds.length === 0 ? (
                <p className="text-gray-400 text-sm">No ads yet.</p>
              ) : (
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-gray-400 text-xs uppercase border-b">
                      <th className="pb-2">Title</th>
                      <th className="pb-2">Type</th>
                      <th className="pb-2">Category</th>
                      <th className="pb-2">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentAds.map(ad => (
                      <tr key={ad.id} className="border-b last:border-0 hover:bg-gray-50">
                        <td className="py-2 font-medium text-gray-800 max-w-[120px] truncate">{ad.title}</td>
                        <td className="py-2">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold
                            ${ad.type === 'internship' ? 'bg-emerald-100 text-emerald-700' : 'bg-blue-100 text-blue-700'}`}>
                            {ad.type}
                          </span>
                        </td>
                        <td className="py-2 text-gray-400 text-xs">{ad.category_name || '—'}</td>
                        <td className="py-2 text-gray-400 text-xs">{new Date(ad.created_at).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            {/* Recent Bookings */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-base font-bold text-gray-800">Recent Bookings</h2>
                <Link to="/admin/bookings" className="text-blue-600 text-xs hover:underline">View all →</Link>
              </div>
              {recentBookings.length === 0 ? (
                <p className="text-gray-400 text-sm py-4 text-center">No bookings yet.</p>
              ) : (
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-gray-400 text-xs uppercase border-b">
                      <th className="pb-2">Invoice</th>
                      <th className="pb-2">Customer</th>
                      <th className="pb-2">Total</th>
                      <th className="pb-2">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentBookings.map(b => (
                      <tr key={b.id} className="border-b last:border-0 hover:bg-gray-50">
                        <td className="py-2 font-bold text-blue-600 text-xs">{b.invoice_number || `#${b.id}`}</td>
                        <td className="py-2 font-medium text-gray-800 max-w-[90px] truncate">{b.customer_name}</td>
                        <td className="py-2 text-xs font-semibold text-gray-700">
                          {Number(b.total_price).toLocaleString()} RWF
                        </td>
                        <td className="py-2">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold
                            ${b.status === 'approved'  ? 'bg-emerald-100 text-emerald-700' :
                              b.status === 'pending'   ? 'bg-yellow-100 text-yellow-700'  :
                              b.status === 'rejected'  ? 'bg-red-100 text-red-700'        :
                              'bg-blue-100 text-blue-700'}`}>
                            {b.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>

          {/* Payments shortcut */}
          <div className="mt-6">
            <Link to="/admin/payments"
              className="flex items-center gap-4 rounded-2xl bg-purple-700 text-white px-6 py-4 hover:bg-purple-800 transition">
              <span className="text-3xl">💳</span>
              <div>
                <p className="font-bold">Track Payments</p>
                <p className="text-purple-200 text-xs">Monitor all car rental payments</p>
              </div>
              <span className="ml-auto text-purple-300 text-lg">→</span>
            </Link>
          </div>

        </>
      )}
    </div>
  );
};

export default Dashboard;
