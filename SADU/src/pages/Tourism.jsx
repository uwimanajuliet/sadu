import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import API from '../config.js';
import { useAuth } from '../context/AuthContext.jsx';

import tourdest1 from '../assets/tourdest1.png';
import tourdest2 from '../assets/tourdest2.png';
import tourdest3 from '../assets/tourdest3.png';
import tourdest4 from '../assets/tourdest4.png';

const SLIDES = [tourdest1, tourdest2, tourdest3, tourdest4];

const Tourism = () => {
  const { admin } = useAuth();
  const [ads, setAds]           = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [search, setSearch]     = useState('');
  const [booked, setBooked]     = useState({});
  const [slideIndex, setSlideIndex] = useState(0);

  // Auto-advance slides every 4 seconds
  useEffect(() => {
    const t = setInterval(() => setSlideIndex(p => (p + 1) % SLIDES.length), 4000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    API.get('/ads/type/service')
      .then(r => {
        // ✅ use category_name from JOIN
        const tourism = r.data.filter(a =>
          a.category_name?.toLowerCase().includes('tourism')
        );
        setAds(tourism);
        setFiltered(tourism);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!search.trim()) { setFiltered(ads); return; }
    const q = search.toLowerCase();
    setFiltered(ads.filter(a =>
      a.title?.toLowerCase().includes(q) ||
      a.description?.toLowerCase().includes(q) ||
      a.location?.toLowerCase().includes(q)
    ));
  }, [search, ads]);

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
        @keyframes pdot    { 0%,100%{box-shadow:0 0 0 0 rgba(52,211,153,.7)} 50%{box-shadow:0 0 0 8px rgba(52,211,153,0)} }
        .shimmer-t{background:linear-gradient(90deg,#fff 0%,#34d399 25%,#fff 50%,#6ee7b7 75%,#fff 100%);background-size:300% auto;-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;animation:shimmer 5s linear infinite}
        .a1{animation:fadeUp .7s cubic-bezier(.22,1,.36,1) .1s both}
        .a2{animation:fadeUp .7s cubic-bezier(.22,1,.36,1) .22s both}
        .a3{animation:fadeUp .7s cubic-bezier(.22,1,.36,1) .34s both}
        .pdot{animation:pdot 2s ease infinite}
        .lift{transition:transform .3s cubic-bezier(.34,1.56,.64,1),box-shadow .3s ease}
        .lift:hover{transform:translateY(-6px);box-shadow:0 20px 48px rgba(0,0,0,.10)}
        .img-zoom img{transition:transform .5s ease}
        .img-zoom:hover img{transform:scale(1.07)}
      `}</style>

      {/* ══ HERO SLIDESHOW ══ */}
      <section className="relative overflow-visible" style={{height:'clamp(400px,67vh,650px)'}}>

        {/* Slides */}
        {SLIDES.map((src, i) => (
          <div key={i}
            className="absolute inset-0 transition-opacity duration-1000"
            style={{ opacity: i === slideIndex ? 1 : 0, zIndex: i === slideIndex ? 1 : 0 }}>
            <img src={src} alt={`tourdest-${i+1}`}
              className="absolute inset-0 w-full h-full  object-cover"
              style={{ filter: 'brightness(1)' }}/>
            <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/70"/>
            <div className="pointer-events-none absolute inset-0 opacity-[0.04]"
              style={{backgroundImage:'linear-gradient(rgba(255,255,255,1) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,1) 1px,transparent 1px)',backgroundSize:'60px 60px'}}/>
          </div>
        ))}

        {/* Content */}
        <div className="relative z-10 flex h-full flex-col items-center justify-center px-6 text-center">
          <div className="a1 mb-5 inline-flex items-center gap-2 rounded-full border border-teal-400/30 bg-teal-400/10 px-4 py-2 backdrop-blur-sm">
            <span className="pdot inline-block h-2 w-2 rounded-full bg-teal-400"/>
            <span className="text-[11px] font-bold uppercase tracking-widest text-teal-300">Explore Rwanda's Beauty</span>
          </div>
          <h1 className="a2 mb-4 font-extrabold leading-tight text-green drop-shadow-lg" style={{fontSize:'clamp(2rem,5vw,3.8rem)'}}>
            <span className="shimmer-t">Tourism Destinations</span>
          </h1>
          <p className="a3 text-base leading-7 text-white/90 max-w-lg mx-auto drop-shadow">
            Discover breathtaking <span className="font-semibold text-white/90">hotels, safari tours, travel agencies</span> and unforgettable experiences across Rwanda.
          </p>

          {/* Icon badges */}
          <div className="a3 mt-6 inline-flex items-center gap-8 rounded-2xl border border-white/10 bg-white/10 px-8 py-4 backdrop-blur-md">
            {[['🏨','Hotels'],['🗺️','Tours'],['⭐','Top Rated']].map(([ic,l])=>(
              <div key={l} className="text-center">
                <div className="text-2xl">{ic}</div>
                <div className="text-[10px] font-semibold uppercase tracking-wider text-white/50 mt-1">{l}</div>
              </div>
            ))}
          </div>

          {/* Dot indicators */}
          <div className="mt-6 flex items-center gap-2">
            {SLIDES.map((_, i) => (
              <button key={i} onClick={() => setSlideIndex(i)}
                className={`rounded-full transition-all duration-300 ${
                  i === slideIndex ? 'w-7 h-2.5 bg-white' : 'w-2.5 h-2.5 bg-white/40 hover:bg-white/70'
                }`}/>
            ))}
          </div>
        </div>

        {/* Prev / Next arrows */}
        <div className="absolute left-4 right-4 top-1/2 -translate-y-1/2 flex justify-between z-20 pointer-events-none">
          <button onClick={() => setSlideIndex(p => (p - 1 + SLIDES.length) % SLIDES.length)}
            className="pointer-events-auto flex h-10 w-10 items-center justify-center rounded-full bg-black/30 text-white backdrop-blur-sm hover:bg-black/50 transition text-lg">‹</button>
          <button onClick={() => setSlideIndex(p => (p + 1) % SLIDES.length)}
            className="pointer-events-auto flex h-10 w-10 items-center justify-center rounded-full bg-black/30 text-white backdrop-blur-sm hover:bg-black/50 transition text-lg">›</button>
        </div>

        {/* Wave */}
        <svg className="pointer-events-none absolute bottom-0 left-0 w-full z-10" viewBox="0 0 1440 40" preserveAspectRatio="none">
          <path d="M0,20 C360,40 1080,0 1440,20 L1440,40 L0,40 Z" fill="#f9fafb"/>
        </svg>
      </section>

      {/* SEARCH */}
      <section className="sticky top-[60px] z-30 bg-white border-b border-gray-100 shadow-sm px-6 py-4">
        <div className="mx-auto max-w-5xl flex flex-wrap gap-3 items-center justify-between">
          <div className="flex items-center gap-2 rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 flex-1 min-w-[200px] max-w-sm focus-within:border-teal-400 transition">
            <span className="text-gray-400">🔍</span>
            <input value={search} onChange={e=>setSearch(e.target.value)}
              placeholder="Search destinations, hotels, tours…"
              className="flex-1 bg-transparent text-sm outline-none text-gray-700 placeholder-gray-400"/>
            {search && <button onClick={()=>setSearch('')} className="text-gray-400 text-xs hover:text-gray-600">✕</button>}
          </div>
          <span className="text-xs text-gray-400">{filtered.length} listing{filtered.length!==1?'s':''}</span>
          {admin && (
            <Link to="/admin/post-ad" className="inline-flex items-center gap-1 rounded-xl bg-teal-600 px-4 py-2 text-sm font-bold text-white hover:bg-teal-700 transition">
              + Add Destination
            </Link>
          )}
        </div>
      </section>

      {/* CARDS */}
      <section className="mx-auto max-w-5xl px-6 py-10">
        {loading ? (
          <div className="flex flex-col items-center py-24 gap-3">
            <div className="h-10 w-10 rounded-full border-[3px] border-gray-200 border-t-teal-600 animate-spin"/>
            <p className="text-gray-400 text-sm">Loading destinations…</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center py-24 text-center gap-3">
            <div className="text-5xl">🏔️</div>
            <h3 className="font-bold text-gray-700">No destinations found</h3>
            <p className="text-gray-400 text-sm">Try a different search term.</p>
            <button onClick={()=>setSearch('')} className="mt-2 rounded-xl border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition">Clear Search</button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((ad, i) => (
              <div key={ad.id} className="lift rounded-2xl border border-gray-100 bg-white shadow-sm overflow-hidden flex flex-col"
                style={{animation:`fadeUp .6s cubic-bezier(.22,1,.36,1) ${i*.07}s both`}}>
                <div className="img-zoom relative h-48 w-full overflow-hidden bg-teal-50 shrink-0">
                  {ad.image
                    ? <img src={`http://localhost:5000/uploads/${ad.image}`} alt={ad.title} className="w-full h-full object-cover"/>
                    : <div className="flex h-full items-center justify-center text-5xl bg-gradient-to-br from-teal-50 to-emerald-50">🏔️</div>
                  }
                  <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent"/>
                  {/* ✅ use category_name */}
                  <span className="absolute top-3 left-3 rounded-full bg-teal-600 px-2.5 py-1 text-[10px] font-bold text-white uppercase tracking-wide">
                    {ad.category_name || 'Tourism'}
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
                  {ad.deadline && (
                    <p className="text-xs text-gray-400 mb-3">📅 Until: {new Date(ad.deadline).toLocaleDateString()}</p>
                  )}
                  <div className="flex items-center justify-between gap-2 pt-3 border-t border-gray-100">
                    <Link to={`/ads/${ad.id}`} className="text-xs font-semibold text-teal-600 hover:underline">View Details →</Link>
                    <button
                      onClick={()=>setBooked(p=>({...p,[ad.id]:true}))}
                      disabled={booked[ad.id]}
                      className={`inline-flex items-center gap-1 rounded-xl px-3 py-1.5 text-xs font-bold text-white transition
                        ${booked[ad.id] ? 'bg-gray-300 cursor-not-allowed' : 'bg-teal-600 hover:bg-teal-700 hover:-translate-y-0.5'}`}>
                      {booked[ad.id] ? '✓ Booked' : '📅 Book Now'}
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
      <section className="bg-gradient-to-br from-teal-700 to-emerald-800 px-6 py-14 text-center">
        <h2 className="mb-3 text-2xl font-extrabold text-white">Have a tourism business?</h2>
        <p className="mb-6 text-teal-200/75">List your hotel, tour package or travel agency and reach thousands of visitors.</p>
        <Link to="/contact" className="inline-flex items-center gap-2 rounded-xl bg-white px-7 py-3 text-sm font-bold text-teal-700 shadow-lg hover:-translate-y-1 transition">
          📬 Contact Us to List
        </Link>
      </section>
    </div>
  );
};

export default Tourism;
