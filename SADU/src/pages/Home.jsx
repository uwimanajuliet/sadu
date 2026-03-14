import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import API from '../config.js';
import AdCard from '../components/AdCard.jsx';

import carsImg      from '../assets/cars.png';
import tourismImg   from '../assets/tourismdest.png';
import studentsImg  from '../assets/students.png';
import teamSaduImg  from '../assets/teamsadu.png';

const SLIDES = [
  {
    img:     carsImg,
    tag:     'Transport Services',
    title:   'Find Your Perfect\nRide Across Rwanda',
    sub:     'Taxis, buses, minibuses & delivery — book the right vehicle for every journey.',
    cta:     { label: '🚗 Browse Vehicles', to: '/ads?type=service' },
    ghost:   { label: 'View Internships',   to: '/ads?type=internship' },
    accent:  '#d0d0df',
    overlay: ' from-black/20 via-black/10 to-transparent',
  },
  {
    img:     tourismImg,
    tag:     'Tourism & Hospitality',
    title:   "Discover Rwanda's\nBreathtaking Destinations",
    sub:     'Hotels, tour agencies & travel experiences crafted for every kind of traveller.',
    cta:     { label: '🏨 Explore Tourism', to: '/ads?type=service' },
    ghost:   { label: 'Learn More',          to: '/about' },
    accent:  '#0ce68fb6',
    overlay: 'from-slate-900/75 via-slate-900/45 to-transparent',
  },
  {
    img:     studentsImg,
    tag:     'Internship Opportunities',
    title:   'Launch Your Career\nWith Top Companies',
    sub:     'Curated internships in Tech, Tourism, Accounting, Networking & more for students.',
    cta:     { label: '🎓 Find Internships', to: '/ads?type=internship' },
    ghost:   { label: 'Browse Services',      to: '/ads?type=service' },
    accent:  '#eaddddca',
    overlay: 'from-slate-900/80 via-slate-900/50 to-transparent',
  },
  {
    img:     teamSaduImg,
    tag:     'About SADU',
    title:   'Meet the Team\nBehind the Platform',
    sub:     "A dedicated team connecting Rwanda's service providers, tourists and future professionals.",
    cta:     { label: '👥 Meet the Team', to: '/about' },
    ghost:   { label: 'Browse Services',   to: '/ads?type=service' },
    accent:  '#c0c0d3',
    overlay: 'from-slate-900/75 via-slate-900/45 to-transparent',
  },
];

/* ── Hero Slider ── */
const HeroSlider = () => {
  const [current, setCurrent] = useState(0);
  const [animKey, setAnimKey] = useState(0);
  const [paused,  setPaused]  = useState(false);

  const goTo = useCallback((idx) => {
    setCurrent(idx);
    setAnimKey(k => k + 1);
  }, []);

  const next  = useCallback(() => goTo((current + 1) % SLIDES.length), [current, goTo]);
  const prev  = useCallback(() => goTo((current - 1 + SLIDES.length) % SLIDES.length), [current, goTo]);

  useEffect(() => {
    if (paused) return;
    const t = setInterval(next, 5500);
    return () => clearInterval(t);
  }, [next, paused]);

  const s = SLIDES[current];

  return (
    <section
      className="relative w-full overflow-hidden"
      style={{ height: 'min(92vh, 720px)' }}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <style>{`
        @keyframes kenBurns   { from{transform:scale(1.0)} to{transform:scale(1.10)} }
        @keyframes fadeXIn    { from{opacity:0} to{opacity:1} }
        @keyframes slideUpTxt { from{opacity:0;transform:translateY(28px)} to{opacity:1;transform:translateY(0)} }
        @keyframes fadeUpTxt  { from{opacity:0;transform:translateY(18px)} to{opacity:1;transform:translateY(0)} }
        @keyframes pulseDotS  { 0%,100%{box-shadow:0 0 0 0 rgba(12, 10, 10, 0.9)} 50%{box-shadow:0 0 0 6px rgba(255,255,255,0)} }
        @keyframes progressBar{ from{width:0%} to{width:100%} }

        .kb-img      { animation: kenBurns   6s ease-out forwards; }
        .txt-tag     { animation: slideUpTxt .7s cubic-bezier(.22,1,.36,1) .15s both; }
        .txt-h1      { animation: slideUpTxt .8s cubic-bezier(.22,1,.36,1) .28s both; }
        .txt-sub     { animation: fadeUpTxt  .8s cubic-bezier(.22,1,.36,1) .42s both; }
        .txt-btns    { animation: fadeUpTxt  .8s cubic-bezier(.22,1,.36,1) .55s both; }
        .txt-stats   { animation: fadeUpTxt  .8s cubic-bezier(.22,1,.36,1) .68s both; }
        .dot-pulse-s { animation: pulseDotS  2s ease infinite; }
        .prog-bar    { animation: progressBar 5.5s linear forwards; }
        .arrow-btn   { transition: background .2s, transform .2s; }
        .arrow-btn:hover { background: rgba(23, 5, 5, 0.91) !important; transform: scale(1.1); }
        .thumb-dot   { transition: width .3s ease, background .3s ease; }
      `}</style>

      {/* ── Slide images ── */}
      {SLIDES.map((slide, i) => (
        <div key={i} className="absolute inset-0 "
          style={{ opacity: i === current ? 1 : 0, transition: 'opacity 1s ease', zIndex: i === current ? 1 : 0 }}>
          <img
            src={slide.img} alt={slide.tag}
            className={`absolute inset-0 w-full h-full object-cover ${i === current ? 'kb-img' : ''}`}
            key={i === current ? animKey : i}
          />
          <div className={`absolute inset-0 bg-gradient-to-r ${slide.overlay}`} />
          <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-black/40 to-transparent" />
        </div>
      ))}

      {/* ── Text content ── */}
      <div className="relative z-10 flex h-full flex-col justify-center px-8 md:px-16 lg:px-24">
        <div key={animKey} className="max-w-2xl">

          <div className="txt-tag mb-5 inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-4 py-1.5 backdrop-blur-sm">
            <span className="dot-pulse-s inline-block h-2 w-2 rounded-full" style={{ background: s.accent }} />
            <span className="text-[11px] font-bold uppercase tracking-widest text-black/90">{s.tag}</span>
          </div>

          <h1 className="txt-h1 mb-5 font-extrabold leading-[1.1] text-white drop-shadow-lg"
            style={{ fontSize: 'clamp(2rem,5vw,4rem)' }}>
            {s.title.split('\n').map((line, i) => (
              <span key={i}>
                {i === 1 ? <span style={{ color: s.accent }}>{line}</span> : line}
                {i === 0 && <br />}
              </span>
            ))}
          </h1>

          <p className="txt-sub mb-8 max-w-lg text-[1rem] leading-7 text-white/75">{s.sub}</p>

          <div className="txt-btns flex flex-wrap items-center gap-3 mb-10">
            <Link to={s.cta.to}
              className="inline-flex items-center gap-2 rounded-xl px-6 py-3 text-sm font-bold text-white shadow-lg transition hover:-translate-y-1"
              style={{ background: s.accent, boxShadow: `0 8px 24px ${s.accent}55` }}>
              {s.cta.label}
            </Link>
            <Link to={s.ghost.to}
              className="inline-flex items-center gap-2 rounded-xl border border-white/30 bg-white/10 px-6 py-3 text-sm font-bold text-white backdrop-blur-sm transition hover:-translate-y-1 hover:bg-white/20">
              {s.ghost.label}
            </Link>
          </div>

          <div className="txt-stats flex items-center gap-6 flex-wrap">
            {[['120+','Transport'],['85+','Tourism'],['60+','Internships']].map(([n,l]) => (
              <div key={l} className="flex items-center gap-2">
                <span className="text-xl font-extrabold text-white">{n}</span>
                <span className="text-xs text-white/50 font-medium">{l}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Progress bar ── */}
      <div className="absolute top-0 left-0 z-20 h-[3px] w-full bg-white/10">
        {!paused && (
          <div key={`${animKey}-prog`} className="prog-bar h-full rounded-full" style={{ background: s.accent }} />
        )}
      </div>

      {/* ── Arrows ── */}
      <button onClick={prev}
        className="arrow-btn absolute left-4 top-1/2 z-20 -translate-y-1/2 flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white text-2xl backdrop-blur-sm border border-white/20">
        ‹
      </button>
      <button onClick={next}
        className="arrow-btn absolute right-4 top-1/2 z-20 -translate-y-1/2 flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white text-2xl backdrop-blur-sm border border-white/20">
        ›
      </button>

      {/* ── Dots ── */}
      <div className="absolute bottom-6 left-1/2 z-20 -translate-x-1/2 flex items-center gap-2">
        {SLIDES.map((_, i) => (
          <button key={i} onClick={() => goTo(i)}
            className="thumb-dot rounded-full border border-white/30"
            style={{ width: i === current ? 28 : 8, height: 8, background: i === current ? s.accent : 'rgba(255,255,255,0.4)' }} />
        ))}
      </div>

      {/* ── Counter ── */}
      <div className="absolute bottom-6 right-6 z-20 text-white/50 text-xs font-bold tracking-widest">
        {String(current + 1).padStart(2,'0')} / {String(SLIDES.length).padStart(2,'0')}
      </div>

      {/* ── Wave ── */}
      <svg className="pointer-events-none absolute bottom-0 left-0 z-10 w-full" viewBox="0 0 1440 56" preserveAspectRatio="none">
        <path d="M0,28 C360,56 1080,0 1440,28 L1440,56 L0,56 Z" fill="white" fillOpacity=".06"/>
      </svg>
    </section>
  );
};

/* ══════════════════════════════════════════ */

const Home = () => {
  const [services, setServices] = useState([]);
  const [internships, setInternships] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAds = async () => {
      try {
        const [s, i] = await Promise.all([
          API.get('/ads/type/service'),
          API.get('/ads/type/internship'),
        ]);
        setServices(s.data.slice(0, 3));
        setInternships(i.data.slice(0, 3));
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchAds();
  }, []);

  return (
    <div>

      {/* ── Hero Slider ── */}
      <HeroSlider />

      {/* ── Stats ── */}
      <section className="bg-gray-50 py-10 px-6">
        <div className="max-w-5xl mx-auto grid grid-cols-3 gap-6 text-center">
          <div className="bg-white rounded-xl shadow p-6">
            <p className="text-3xl font-bold text-blue-700">🚌</p>
            <p className="font-semibold mt-2">Transport</p>
            <p className="text-gray-500 text-sm">Taxis, buses, delivery</p>
          </div>
          <div className="bg-white rounded-xl shadow p-6">
            <p className="text-3xl font-bold text-blue-700">🏨</p>
            <p className="font-semibold mt-2">Tourism & Hospitality</p>
            <p className="text-gray-500 text-sm">Hotels, tours, agencies</p>
          </div>
          <div className="bg-white rounded-xl shadow p-6">
            <p className="text-3xl font-bold text-blue-700">🎓</p>
            <p className="font-semibold mt-2">Internships</p>
            <p className="text-gray-500 text-sm">For students</p>
          </div>
        </div>
      </section>

      {/* ── Listings ── */}
      {loading ? (
        <div className="text-center py-20 text-gray-500">Loading...</div>
      ) : (
        <>
          {/* Latest Services */}
          <section className="max-w-6xl mx-auto px-6 py-12">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800">Latest Services</h2>
              <Link to="/ads?type=service" className="text-blue-600 hover:underline text-sm">
                View all →
              </Link>
            </div>
            {services.length === 0 ? (
              <p className="text-gray-500">No services available yet.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {services.map((ad) => <AdCard key={ad.id} ad={ad} />)}
              </div>
            )}
          </section>

          {/* Latest Internships */}
          <section className="max-w-6xl mx-auto px-6 py-12">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800">Latest Internships</h2>
              <Link to="/ads?type=internship" className="text-blue-600 hover:underline text-sm">
                View all →
              </Link>
            </div>
            {internships.length === 0 ? (
              <p className="text-gray-500">No internships available yet.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {internships.map((ad) => <AdCard key={ad.id} ad={ad} />)}
              </div>
            )}
          </section>
        </>
      )}

    </div>
  );
};

export default Home;
