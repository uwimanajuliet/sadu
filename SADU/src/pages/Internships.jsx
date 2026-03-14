import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import API from '../config.js';
import { useAuth } from '../context/AuthContext.jsx';
import ApplyModal from '../components/ApplyModal.jsx';

const Internships = () => {
  const { admin } = useAuth();
  const [ads, setAds]               = useState([]);
  const [filtered, setFiltered]     = useState([]);
  const [categories, setCategories] = useState(['All']);
  const [loading, setLoading]       = useState(true);
  const [search, setSearch]         = useState('');
  const [category, setCategory]     = useState('All');
  const [selectedAd, setSelectedAd] = useState(null); // ✅ controls ApplyModal

  useEffect(() => {
    Promise.all([
      API.get('/ads/type/internship'),
      API.get('/categories'),
    ]).then(([adsRes, catRes]) => {
      setAds(adsRes.data);
      setFiltered(adsRes.data);
      setCategories(['All', ...catRes.data.map(c => c.name)]);
    }).catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    let r = ads;
    if (category !== 'All') {
      r = r.filter(a =>
        a.category_name?.toLowerCase() === category.toLowerCase()
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
  }, [search, category, ads]);

  const handleDelete = async (id) => {
    if (!confirm('Delete this internship?')) return;
    await API.delete(`/ads/${id}`);
    setAds(p => p.filter(a => a.id !== id));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <style>{`
        @keyframes fadeUp  { from{opacity:0;transform:translateY(24px)} to{opacity:1;transform:translateY(0)} }
        @keyframes shimmer { 0%{background-position:-300% center} 100%{background-position:300% center} }
        @keyframes pdot    { 0%,100%{box-shadow:0 0 0 0 rgba(110,231,183,.7)} 50%{box-shadow:0 0 0 8px rgba(110,231,183,0)} }
        .shimmer-g{background:linear-gradient(90deg,#fff 0%,#6ee7b7 30%,#fff 55%,#a7f3d0 80%,#fff 100%);background-size:300% auto;-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;animation:shimmer 5s linear infinite}
        .a1{animation:fadeUp .7s cubic-bezier(.22,1,.36,1) .1s both}
        .a2{animation:fadeUp .7s cubic-bezier(.22,1,.36,1) .22s both}
        .a3{animation:fadeUp .7s cubic-bezier(.22,1,.36,1) .34s both}
        .pdot{animation:pdot 2s ease infinite}
        .lift{transition:transform .3s cubic-bezier(.34,1.56,.64,1),box-shadow .3s ease}
        .lift:hover{transform:translateY(-6px);box-shadow:0 16px 40px rgba(0,0,0,.10)}
        .img-zoom img{transition:transform .5s ease}
        .img-zoom:hover img{transform:scale(1.07)}
      `}</style>

      {/* HERO */}
      <section className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-emerald-950 to-slate-900 px-6 py-20 text-center">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -top-32 -right-32 h-[440px] w-[440px] rounded-full bg-emerald-600 opacity-20 blur-[100px] animate-pulse"/>
          <div className="absolute -bottom-24 -left-24 h-[360px] w-[360px] rounded-full bg-teal-500 opacity-15 blur-[80px] animate-pulse" style={{animationDelay:'1.2s'}}/>
        </div>
        <div className="relative z-10 mx-auto max-w-xl">
          <div className="a1 mb-5 inline-flex items-center gap-2 rounded-full border border-emerald-400/30 bg-emerald-400/10 px-4 py-2">
            <span className="pdot inline-block h-2 w-2 rounded-full bg-emerald-400"/>
            <span className="text-[11px] font-bold uppercase tracking-widest text-emerald-300">For Students & Graduates</span>
          </div>
          <h1 className="a2 mb-4 font-extrabold leading-tight" style={{fontSize:'clamp(2rem,5vw,3.8rem)'}}>
            <span className="shimmer-g">Internship Opportunities</span>
          </h1>
          <p className="a3 text-base leading-7 text-emerald-100/60 max-w-lg mx-auto">
            Curated internships across <span className="font-semibold text-white/90">Tech, Tourism, Accounting</span> & more — start your career today.
          </p>
        </div>
        <svg className="pointer-events-none absolute bottom-0 left-0 w-full" viewBox="0 0 1440 40" preserveAspectRatio="none">
          <path d="M0,20 C360,40 1080,0 1440,20 L1440,40 L0,40 Z" fill="#f9fafb"/>
        </svg>
      </section>

      {/* SEARCH + FILTER */}
      <section className="sticky top-[60px] z-30 bg-white border-b border-gray-100 shadow-sm px-6 py-4">
        <div className="mx-auto max-w-5xl flex flex-wrap gap-3 items-center justify-between">
          <div className="flex items-center gap-2 rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 flex-1 min-w-[200px] max-w-sm focus-within:border-emerald-400 transition">
            <span className="text-gray-400">🔍</span>
            <input value={search} onChange={e=>setSearch(e.target.value)}
              placeholder="Search internships…"
              className="flex-1 bg-transparent text-sm outline-none text-gray-700 placeholder-gray-400"/>
            {search && <button onClick={()=>setSearch('')} className="text-gray-400 text-xs hover:text-gray-600">✕</button>}
          </div>
          <span className="text-xs text-gray-400">{filtered.length} result{filtered.length!==1?'s':''}</span>
          {admin && (
            <Link to="/admin/post-ad" className="inline-flex items-center gap-1 rounded-xl bg-emerald-600 px-4 py-2 text-sm font-bold text-white hover:bg-emerald-700 transition">
              + Post Internship
            </Link>
          )}
        </div>
        <div className="mx-auto mt-3 max-w-5xl flex gap-2 flex-wrap">
          {categories.map(cat => (
            <button key={cat} onClick={()=>setCategory(cat)}
              className={`rounded-full px-3 py-1 text-xs font-bold border transition
                ${category===cat ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-white text-gray-500 border-gray-200 hover:border-emerald-400 hover:text-emerald-600'}`}>
              {cat}
            </button>
          ))}
        </div>
      </section>

      {/* CARDS */}
      <section className="mx-auto max-w-5xl px-6 py-10">
        {loading ? (
          <div className="flex flex-col items-center py-24 gap-3">
            <div className="h-10 w-10 rounded-full border-[3px] border-gray-200 border-t-emerald-600 animate-spin"/>
            <p className="text-gray-400 text-sm">Loading internships…</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center py-24 text-center gap-3">
            <div className="text-5xl">🔍</div>
            <h3 className="font-bold text-gray-700">No internships found</h3>
            <p className="text-gray-400 text-sm">Try a different search or category.</p>
            <button onClick={()=>{setSearch('');setCategory('All');}}
              className="mt-2 rounded-xl border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition">
              Clear Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((ad, i) => (
              <div key={ad.id} className="lift rounded-2xl border border-gray-100 bg-white shadow-sm overflow-hidden flex flex-col"
                style={{animation:`fadeUp .6s cubic-bezier(.22,1,.36,1) ${i*.07}s both`}}>

                <div className="img-zoom relative h-44 w-full overflow-hidden bg-emerald-50 shrink-0">
                  {ad.image
                    ? <img src={`http://localhost:5000/uploads/${ad.image}`} alt={ad.title} className="w-full h-full object-cover"/>
                    : <div className="flex h-full items-center justify-center text-5xl bg-gradient-to-br from-emerald-50 to-teal-50">🎓</div>
                  }
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"/>
                  <span className="absolute top-3 left-3 rounded-full bg-emerald-600 px-2.5 py-1 text-[10px] font-bold text-white uppercase tracking-wide">
                    {ad.category_name || 'Internship'}
                  </span>
                  {ad.deadline && (
                    <span className="absolute top-3 right-3 rounded-full bg-black/40 px-2 py-1 text-[10px] text-white backdrop-blur-sm">
                      ⏰ {new Date(ad.deadline).toLocaleDateString()}
                    </span>
                  )}
                </div>

                <div className="p-5 flex flex-col flex-1">
                  <h3 className="font-extrabold text-gray-800 text-base mb-1 line-clamp-2 leading-snug">{ad.title}</h3>
                  {ad.location && <p className="text-xs text-gray-400 mb-2">📍 {ad.location}</p>}
                  <p className="text-xs text-gray-500 leading-5 line-clamp-3 mb-4 flex-1">{ad.description}</p>
                  {ad.contact_info && <p className="text-xs text-gray-400 mb-3">📞 {ad.contact_info}</p>}

                  <div className="flex items-center justify-between gap-2 pt-3 border-t border-gray-100">
                    <Link to={`/ads/${ad.id}`} className="text-xs font-semibold text-emerald-600 hover:underline">View Details →</Link>

                    {/* ✅ Always opens ApplyModal — same as AdDetail */}
                    <button
                      onClick={() => setSelectedAd(ad)}
                      className="inline-flex items-center gap-1 rounded-xl px-3 py-1.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 hover:-translate-y-0.5 transition">
                      ✉ Apply Now
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
      <section className="bg-gradient-to-br from-emerald-700 to-teal-800 px-6 py-14 text-center">
        <h2 className="mb-3 text-2xl font-extrabold text-white">Are you a company?</h2>
        <p className="mb-6 text-emerald-200/75">Post internship opportunities and connect with talented students across Rwanda.</p>
        <Link to="/contact" className="inline-flex items-center gap-2 rounded-xl bg-white px-7 py-3 text-sm font-bold text-emerald-700 shadow-lg hover:-translate-y-1 transition">
          📬 Contact Us to Post
        </Link>
      </section>

      {/* ✅ ApplyModal — opens when student clicks Apply Now */}
      {selectedAd && (
        <ApplyModal ad={selectedAd} onClose={() => setSelectedAd(null)} />
      )}

    </div>
  );
};

export default Internships;
