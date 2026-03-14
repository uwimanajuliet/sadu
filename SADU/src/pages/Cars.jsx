import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import API from '../config.js';
import { useAuth } from '../context/AuthContext.jsx';

const VEHICLE_TYPES = ['All', 'Sedan', 'SUV', 'Minibus', 'Bus', 'Pickup', 'Moto-Taxi', 'Delivery'];

const Cars = () => {
  const { admin } = useAuth();
  const [ads, setAds]             = useState([]);
  const [filtered, setFiltered]   = useState([]);
  const [loading, setLoading]     = useState(true);
  const [search, setSearch]       = useState('');
  const [type, setType]           = useState('All');
  const [booked, setBooked]       = useState({});

  useEffect(() => {
    API.get('/ads/type/service')
      .then(r => {
        // ✅ backend returns category_name via JOIN
        const cars = r.data.filter(a => {
          const cat = a.category_name?.toLowerCase() || '';
          return cat.includes('transport') || cat.includes('car') || cat.includes('vehicle') || cat.includes('taxi');
        });
        setAds(cars);
        setFiltered(cars);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    let r = ads;
    if (type !== 'All') {
      r = r.filter(a =>
        a.title?.toLowerCase().includes(type.toLowerCase()) ||
        a.description?.toLowerCase().includes(type.toLowerCase())
      );
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      r = r.filter(a =>
        a.title?.toLowerCase().includes(q) ||
        a.description?.toLowerCase().includes(q) ||
        a.location?.toLowerCase().includes(q)
      );
    }
    setFiltered(r);
  }, [search, type, ads]);

  const handleDelete = async (id) => {
    if (!confirm('Delete this listing?')) return;
    await API.delete(`/ads/${id}`);
    setAds(p => p.filter(a => a.id !== id));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <style>{`
        @keyframes fadeUp  { from{opacity:0;transform:translateY(24px)} to{opacity:1;transform:translateY(0)} }
        @keyframes shimmer { 0%{background-position:-300% center} 100%{background-position:300% center} }
        @keyframes pdot    { 0%,100%{box-shadow:0 0 0 0 rgba(96,165,250,.7)} 50%{box-shadow:0 0 0 8px rgba(96,165,250,0)} }
        .shimmer-b{background:linear-gradient(90deg,#fff 0%,#60a5fa 25%,#fff 50%,#93c5fd 75%,#fff 100%);background-size:300% auto;-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;animation:shimmer 5s linear infinite}
        .a1{animation:fadeUp .7s cubic-bezier(.22,1,.36,1) .1s both}
        .a2{animation:fadeUp .7s cubic-bezier(.22,1,.36,1) .22s both}
        .a3{animation:fadeUp .7s cubic-bezier(.22,1,.36,1) .34s both}
        .pdot{animation:pdot 2s ease infinite}
        .lift{transition:transform .3s cubic-bezier(.34,1.56,.64,1),box-shadow .3s ease}
        .lift:hover{transform:translateY(-6px);box-shadow:0 20px 48px rgba(0,0,0,.10)}
        .img-zoom img{transition:transform .5s ease}
        .img-zoom:hover img{transform:scale(1.07)}
      `}</style>

      {/* HERO */}
      <section className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 px-6 py-20 text-center">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -top-32 -right-32 h-[440px] w-[440px] rounded-full bg-blue-600 opacity-20 blur-[100px] animate-pulse"/>
          <div className="absolute -bottom-24 -left-24 h-[360px] w-[360px] rounded-full bg-cyan-500 opacity-15 blur-[80px] animate-pulse" style={{animationDelay:'1.4s'}}/>
        </div>
        <div className="pointer-events-none absolute inset-0 opacity-[0.04]"
          style={{backgroundImage:'linear-gradient(rgba(255,255,255,1) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,1) 1px,transparent 1px)',backgroundSize:'60px 60px'}}/>
        <div className="relative z-10 mx-auto max-w-xl">
          <div className="a1 mb-5 inline-flex items-center gap-2 rounded-full border border-blue-400/30 bg-blue-400/10 px-4 py-2">
            <span className="pdot inline-block h-2 w-2 rounded-full bg-blue-400"/>
            <span className="text-[11px] font-bold uppercase tracking-widest text-blue-300">Transport Services</span>
          </div>
          <h1 className="a2 mb-4 font-extrabold leading-tight" style={{fontSize:'clamp(2rem,5vw,3.8rem)'}}>
            <span className="shimmer-b">Cars & Transport</span>
          </h1>
          <p className="a3 text-base leading-7 text-blue-100/60 max-w-lg mx-auto">
            Find reliable <span className="font-semibold text-white/90">taxis, buses, minibuses, SUVs</span> and delivery services available across Rwanda.
          </p>
          <div className="a3 mt-8 inline-flex items-center gap-8 rounded-2xl border border-white/10 bg-white/5 px-8 py-4 backdrop-blur-md">
            {[['🚗','Sedans & SUVs'],['🚌','Buses'],['🏍️','Moto-Taxis']].map(([ic,l])=>(
              <div key={l} className="text-center">
                <div className="text-2xl">{ic}</div>
                <div className="text-[10px] font-semibold uppercase tracking-wider text-white/50 mt-1">{l}</div>
              </div>
            ))}
          </div>
        </div>
        <svg className="pointer-events-none absolute bottom-0 left-0 w-full" viewBox="0 0 1440 40" preserveAspectRatio="none">
          <path d="M0,20 C360,40 1080,0 1440,20 L1440,40 L0,40 Z" fill="#f9fafb"/>
        </svg>
      </section>

      {/* SEARCH + FILTER */}
      <section className="sticky top-[60px] z-30 bg-white border-b border-gray-100 shadow-sm px-6 py-4">
        <div className="mx-auto max-w-5xl flex flex-wrap gap-3 items-center justify-between">
          <div className="flex items-center gap-2 rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 flex-1 min-w-[200px] max-w-sm focus-within:border-blue-400 transition">
            <span className="text-gray-400">🔍</span>
            <input value={search} onChange={e=>setSearch(e.target.value)}
              placeholder="Search by vehicle type, location…"
              className="flex-1 bg-transparent text-sm outline-none text-gray-700 placeholder-gray-400"/>
            {search && <button onClick={()=>setSearch('')} className="text-gray-400 text-xs hover:text-gray-600">✕</button>}
          </div>
          <span className="text-xs text-gray-400">{filtered.length} vehicle{filtered.length!==1?'s':''}</span>
          {admin && (
            <Link to="/admin/post-ad" className="inline-flex items-center gap-1 rounded-xl bg-blue-600 px-4 py-2 text-sm font-bold text-white hover:bg-blue-700 transition">
              + Add Vehicle
            </Link>
          )}
        </div>
        <div className="mx-auto mt-3 max-w-5xl flex gap-2 flex-wrap">
          {VEHICLE_TYPES.map(t => (
            <button key={t} onClick={()=>setType(t)}
              className={`rounded-full px-3 py-1 text-xs font-bold border transition
                ${type===t ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-500 border-gray-200 hover:border-blue-400 hover:text-blue-600'}`}>
              {t}
            </button>
          ))}
        </div>
      </section>

      {/* CARDS */}
      <section className="mx-auto max-w-5xl px-6 py-10">
        {loading ? (
          <div className="flex flex-col items-center py-24 gap-3">
            <div className="h-10 w-10 rounded-full border-[3px] border-gray-200 border-t-blue-600 animate-spin"/>
            <p className="text-gray-400 text-sm">Loading vehicles…</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center py-24 text-center gap-3">
            <div className="text-5xl">🚗</div>
            <h3 className="font-bold text-gray-700">No vehicles found</h3>
            <p className="text-gray-400 text-sm">Try a different search or vehicle type.</p>
            <button onClick={()=>{setSearch('');setType('All');}}
              className="mt-2 rounded-xl border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition">
              Clear Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((ad, i) => (
              <div key={ad.id} className="lift rounded-2xl border border-gray-100 bg-white shadow-sm overflow-hidden flex flex-col"
                style={{animation:`fadeUp .6s cubic-bezier(.22,1,.36,1) ${i*.07}s both`}}>
                <div className="img-zoom relative h-48 w-full overflow-hidden bg-blue-50 shrink-0">
                  {ad.image
                    ? <img src={`http://localhost:5000/uploads/${ad.image}`} alt={ad.title} className="w-full h-full object-cover"/>
                    : <div className="flex h-full items-center justify-center text-5xl bg-gradient-to-br from-blue-50 to-cyan-50">🚗</div>
                  }
                  <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent"/>
                  {/* ✅ use category_name */}
                  <span className="absolute top-3 left-3 rounded-full bg-blue-600 px-2.5 py-1 text-[10px] font-bold text-white uppercase tracking-wide">
                    {ad.category_name || 'Transport'}
                  </span>
                  {ad.location && (
                    <span className="absolute bottom-3 left-3 flex items-center gap-1 rounded-full bg-black/40 px-2.5 py-1 text-[11px] text-white backdrop-blur-sm">
                      📍 {ad.location}
                    </span>
                  )}
                </div>
                <div className="p-5 flex flex-col flex-1">
                  <h3 className="font-extrabold text-gray-800 text-base mb-2 line-clamp-2 leading-snug">{ad.title}</h3>
                  <p className="text-xs text-gray-500 leading-5 line-clamp-3 mb-4 flex-1">{ad.description}</p>
                  {ad.contact_info && (
                    <p className="text-xs text-gray-400 mb-3">📞 {ad.contact_info}</p>
                  )}
                  <div className="flex items-center justify-between gap-2 pt-3 border-t border-gray-100">
                    <Link to={`/ads/${ad.id}`} className="text-xs font-semibold text-blue-600 hover:underline">View Details →</Link>
                    <button
                      onClick={()=>setBooked(p=>({...p,[ad.id]:true}))}
                      disabled={booked[ad.id]}
                      className={`inline-flex items-center gap-1 rounded-xl px-3 py-1.5 text-xs font-bold text-white transition
                        ${booked[ad.id] ? 'bg-gray-300 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 hover:-translate-y-0.5'}`}>
                      {booked[ad.id] ? '✓ Booked' : '🚗 Book Now'}
                    </button>
                  </div>
                  {admin && (
                    <div className="flex gap-2 mt-3 pt-3 border-t border-gray-100">
                      <Link to={`/admin/edit-ad/${ad.id}`} className="flex-1 text-center rounded-lg bg-blue-50 py-1.5 text-[11px] font-bold text-blue-600 hover:bg-blue-100 transition">✏️ Edit</Link>
                      <button onClick={()=>handleDelete(ad.id)} className="flex-1 rounded-lg bg-red-50 py-1.5 text-[11px] font-bold text-red-500 hover:bg-red-100 transition">🗑 Delete</button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* CTA */}
      <section className="bg-gradient-to-br from-blue-700 to-blue-900 px-6 py-14 text-center">
        <h2 className="mb-3 text-2xl font-extrabold text-white">Have a transport business?</h2>
        <p className="mb-6 text-blue-200/75">List your vehicles and reach thousands of customers looking for reliable transport in Rwanda.</p>
        <Link to="/contact" className="inline-flex items-center gap-2 rounded-xl bg-white px-7 py-3 text-sm font-bold text-blue-700 shadow-lg hover:-translate-y-1 transition">
          📬 Contact Us to List
        </Link>
      </section>
    </div>
  );
};

export default Cars;
