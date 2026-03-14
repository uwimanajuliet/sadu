import { useEffect, useState } from 'react';
import API from '../config.js';
import BookingModal from '../components/BookingModal.jsx';

const TRANSMISSIONS = ['All', 'Automatic', 'Manual'];
const FUEL_TYPES    = ['All', 'Petrol', 'Diesel', 'Electric', 'Hybrid'];

const CarsPage = () => {
  const [cars, setCars]         = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [search, setSearch]     = useState('');
  const [transmission, setTransmission] = useState('All');
  const [fuel, setFuel]         = useState('All');
  const [selectedCar, setSelectedCar] = useState(null);

  useEffect(() => {
    API.get('/cars/available')
      .then(r => { setCars(r.data); setFiltered(r.data); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    let r = cars;
    if (transmission !== 'All') r = r.filter(c => c.transmission?.toLowerCase() === transmission.toLowerCase());
    if (fuel !== 'All')         r = r.filter(c => c.fuel_type?.toLowerCase() === fuel.toLowerCase());
    if (search.trim()) {
      const q = search.toLowerCase();
      r = r.filter(c =>
        c.name?.toLowerCase().includes(q) ||
        c.brand?.toLowerCase().includes(q) ||
        c.model?.toLowerCase().includes(q) ||
        c.description?.toLowerCase().includes(q)
      );
    }
    setFiltered(r);
  }, [search, transmission, fuel, cars]);

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
            <span className="text-[11px] font-bold uppercase tracking-widest text-blue-300">Available Now</span>
          </div>
          <h1 className="a2 mb-4 font-extrabold leading-tight" style={{fontSize:'clamp(2rem,5vw,3.8rem)'}}>
            <span className="shimmer-b">Cars & Transport</span>
          </h1>
          <p className="a3 text-base leading-7 text-blue-100/60 max-w-lg mx-auto">
            Browse available vehicles and book instantly with <span className="font-semibold text-white/90">Mobile Money or Credit Card</span>.
          </p>
          <div className="a3 mt-8 inline-flex items-center gap-8 rounded-2xl border border-white/10 bg-white/5 px-8 py-4 backdrop-blur-md">
            {[['🚗',`${cars.length}+`,'Vehicles'],['⚡','Instant','Booking'],['💳','MoMo &','Card']].map(([ic,n,l])=>(
              <div key={l} className="text-center">
                <div className="text-2xl">{ic}</div>
                <div className="text-sm font-extrabold text-white">{n}</div>
                <div className="text-[10px] font-semibold uppercase tracking-wider text-white/40">{l}</div>
              </div>
            ))}
          </div>
        </div>
        <svg className="pointer-events-none absolute bottom-0 left-0 w-full" viewBox="0 0 1440 40" preserveAspectRatio="none">
          <path d="M0,20 C360,40 1080,0 1440,20 L1440,40 L0,40 Z" fill="#f9fafb"/>
        </svg>
      </section>

      {/* SEARCH + FILTERS */}
      <section className="sticky top-[60px] z-30 bg-white border-b border-gray-100 shadow-sm px-6 py-4">
        <div className="mx-auto max-w-5xl flex flex-wrap gap-3 items-center justify-between">
          <div className="flex items-center gap-2 rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 flex-1 min-w-[200px] max-w-sm focus-within:border-blue-400 transition">
            <span className="text-gray-400">🔍</span>
            <input value={search} onChange={e=>setSearch(e.target.value)}
              placeholder="Search by name, brand, model…"
              className="flex-1 bg-transparent text-sm outline-none text-gray-700 placeholder-gray-400"/>
            {search && <button onClick={()=>setSearch('')} className="text-gray-400 text-xs hover:text-gray-600">✕</button>}
          </div>
          <span className="text-xs text-gray-400">{filtered.length} available</span>
        </div>
        <div className="mx-auto mt-3 max-w-5xl flex gap-4 flex-wrap">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-bold text-gray-400 uppercase">Transmission:</span>
            {TRANSMISSIONS.map(t => (
              <button key={t} onClick={()=>setTransmission(t)}
                className={`rounded-full px-3 py-1 text-xs font-bold border transition
                  ${transmission===t ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-500 border-gray-200 hover:border-blue-400 hover:text-blue-600'}`}>
                {t}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-bold text-gray-400 uppercase">Fuel:</span>
            {FUEL_TYPES.map(f => (
              <button key={f} onClick={()=>setFuel(f)}
                className={`rounded-full px-3 py-1 text-xs font-bold border transition
                  ${fuel===f ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-500 border-gray-200 hover:border-blue-400 hover:text-blue-600'}`}>
                {f}
              </button>
            ))}
          </div>
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
            <p className="text-gray-400 text-sm">Try clearing filters.</p>
            <button onClick={()=>{setSearch('');setTransmission('All');setFuel('All');}}
              className="mt-2 rounded-xl border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition">
              Clear Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((car, i) => (
              <div key={car.id} className="lift rounded-2xl border border-gray-100 bg-white shadow-sm overflow-hidden flex flex-col"
                style={{animation:`fadeUp .6s cubic-bezier(.22,1,.36,1) ${i*.07}s both`}}>

                {/* image */}
                <div className="img-zoom relative h-48 w-full overflow-hidden bg-blue-50 shrink-0">
                  {car.image
                    ? <img src={`http://localhost:5000/uploads/${car.image}`} alt={car.name} className="w-full h-full object-cover"/>
                    : <div className="flex h-full items-center justify-center text-5xl bg-gradient-to-br from-blue-50 to-cyan-50">🚗</div>
                  }
                  <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent"/>
                  <span className={`absolute top-3 left-3 rounded-full px-2.5 py-1 text-[10px] font-bold text-white uppercase tracking-wide
                    ${car.status === 'available' ? 'bg-emerald-600' : car.status === 'rented' ? 'bg-red-500' : 'bg-yellow-500'}`}>
                    {car.status}
                  </span>
                  <span className="absolute bottom-3 right-3 rounded-full bg-black/50 px-2.5 py-1 text-xs font-extrabold text-white backdrop-blur-sm">
                    {Number(car.price_per_day).toLocaleString()} RWF/day
                  </span>
                </div>

                <div className="p-5 flex flex-col flex-1">
                  <h3 className="font-extrabold text-gray-800 text-base mb-1">{car.name}</h3>
                  <p className="text-xs text-gray-400 mb-3">{car.brand} {car.model} · {car.year}</p>

                  {/* specs */}
                  <div className="grid grid-cols-2 gap-2 mb-4">
                    {[
                      ['👥', `${car.seats} seats`],
                      ['⚙️', car.transmission],
                      ['⛽', car.fuel_type],
                      ['📅', `${car.year}`],
                    ].map(([ic, val]) => (
                      <div key={val} className="flex items-center gap-1.5 rounded-lg bg-gray-50 px-2.5 py-1.5 text-xs text-gray-600">
                        <span>{ic}</span><span className="font-semibold capitalize">{val}</span>
                      </div>
                    ))}
                  </div>

                  {car.description && (
                    <p className="text-xs text-gray-400 leading-5 line-clamp-2 mb-4 flex-1">{car.description}</p>
                  )}

                  <button
                    onClick={() => setSelectedCar(car)}
                    disabled={car.status !== 'available'}
                    className={`w-full rounded-xl py-2.5 text-sm font-bold text-white transition
                      ${car.status === 'available'
                        ? 'bg-blue-600 hover:bg-blue-700 hover:-translate-y-0.5'
                        : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                      }`}>
                    {car.status === 'available' ? '🚗 Book Now' : car.status === 'rented' ? 'Currently Rented' : 'In Maintenance'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* CTA */}
      <section className="bg-gradient-to-br from-blue-700 to-blue-900 px-6 py-14 text-center">
        <h2 className="mb-3 text-2xl font-extrabold text-white">Have a transport business?</h2>
        <p className="mb-6 text-blue-200/75">List your vehicles and reach thousands of customers.</p>
        <a href="/contact" className="inline-flex items-center gap-2 rounded-xl bg-white px-7 py-3 text-sm font-bold text-blue-700 shadow-lg hover:-translate-y-1 transition">
          📬 Contact Us to List
        </a>
      </section>

      {/* BOOKING MODAL */}
      {selectedCar && (
        <BookingModal
          car={selectedCar}
          onClose={() => setSelectedCar(null)}
          onSuccess={() => {
            // refresh to update availability
            API.get('/cars/available').then(r => { setCars(r.data); setFiltered(r.data); });
          }}
        />
      )}
    </div>
  );
};

export default CarsPage;
