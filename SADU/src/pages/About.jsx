import { useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.jsx'; // adjust path if needed

import slideInternship   from '../assets/internship.png';
import slideTransport    from '../assets/transport.png';
import slideTourism      from '../assets/tourism.png';
import slideTeam         from '../assets/team.png';

/* ── Team data — photos from assets ── */
const DEFAULT_TEAM = [
  { id: 1, name: 'Admin',           role: 'Platform Manager',  emoji: '👨‍💼', color: 'blue'    },
  { id: 2, name: 'Support Team',    role: 'Customer Support',  emoji: '👩‍💻', color: 'emerald' },
  { id: 3, name: 'Internship Team', role: 'Student Relations', emoji: '👨‍🎓', color: 'violet'  },
];

const C = {
  blue:    { ring:'ring-blue-300',    bg:'bg-blue-50',    btn:'bg-blue-600 hover:bg-blue-700'     },
  emerald: { ring:'ring-emerald-300', bg:'bg-emerald-50', btn:'bg-emerald-600 hover:bg-emerald-700'},
  violet:  { ring:'ring-violet-300',  bg:'bg-violet-50',  btn:'bg-violet-600 hover:bg-violet-700' },
};

/* ── Hero slides ── */
const SLIDES = [
  { img: slideInternship, label: 'Find Internships',      sub: 'Opportunities for students across Rwanda',         badge: 'Internships',  badgeColor: 'bg-violet-400/20 text-violet-200 border-violet-400/30' },
  { img: slideTransport,  label: 'Book Transport',        sub: 'Reliable taxis, buses & delivery across Rwanda',   badge: 'Transport',    badgeColor: 'bg-blue-400/20 text-blue-200 border-blue-400/30'       },
  { img: slideTourism,    label: 'Explore Tourism',       sub: 'Hotels, tours & premium hospitality experiences',  badge: 'Tourism',      badgeColor: 'bg-emerald-400/20 text-emerald-200 border-emerald-400/30'},
  { img: slideTeam,       label: 'Meet Our Team',         sub: "The people behind Rwanda's trusted platform",     badge: 'About Us',     badgeColor: 'bg-amber-400/20 text-amber-200 border-amber-400/30'    },
];

/* load any admin-uploaded overrides from localStorage */
function loadTeam() {
  try {
    const overrides = JSON.parse(localStorage.getItem('team_media') || '[]');
    return DEFAULT_TEAM.map(m => {
      const o = overrides.find(x => x.id === m.id);
      return o ? { ...m, uploadedUrl: o.mediaUrl, uploadedType: o.mediaType } : m;
    });
  } catch { return DEFAULT_TEAM; }
}

export default function About() {
  const { admin } = useAuth();               // ← null = not logged in, object = admin
  const isAdmin = !!admin;

  const [slideIndex, setSlideIndex] = useState(0);
  const [team, setTeam]           = useState(loadTeam);
  const [editId, setEditId]       = useState(null);
  const [preview, setPreview]     = useState(null);
  const [mediaType, setMediaType] = useState('');
  const [dragOver, setDragOver]   = useState(false);
  const [saving, setSaving]       = useState(false);
  const [fileObj, setFileObj]     = useState(null);
  const fileRef = useRef();

  // Auto-advance slides every 4 seconds
  useEffect(() => {
    const t = setInterval(() => setSlideIndex(p => (p + 1) % SLIDES.length), 4000);
    return () => clearInterval(t);
  }, []);

  /* ── file pick ── */
  const handleFile = (file) => {
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) return alert('File too large. Max 10 MB.');
    const isVideo = file.type.startsWith('video/');
    const isImage = file.type.startsWith('image/');
    if (!isVideo && !isImage) return alert('Please choose an image or video file.');
    setMediaType(isVideo ? 'video' : 'image');
    setFileObj(file);
    setPreview(URL.createObjectURL(file));
  };

  const onDrop = (e) => { e.preventDefault(); setDragOver(false); handleFile(e.dataTransfer.files[0]); };

  /* ── save as base64 to localStorage ── */
  const handleSave = () => {
    if (!fileObj || editId === null) return;
    setSaving(true);
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target.result;
      const updated = team.map(m =>
        m.id === editId ? { ...m, uploadedUrl: dataUrl, uploadedType: mediaType } : m
      );
      setTeam(updated);
      const toSave = updated
        .filter(m => m.uploadedUrl)
        .map(m => ({ id: m.id, mediaUrl: m.uploadedUrl, mediaType: m.uploadedType }));
      localStorage.setItem('team_media', JSON.stringify(toSave));
      setSaving(false);
      closeModal();
    };
    reader.readAsDataURL(fileObj);
  };

  /* ── remove uploaded override (reverts to assets photo) ── */
  const handleRemove = (id) => {
    const updated = team.map(m =>
      m.id === id ? { ...m, uploadedUrl: undefined, uploadedType: undefined } : m
    );
    setTeam(updated);
    const toSave = updated.filter(m => m.uploadedUrl).map(m => ({ id: m.id, mediaUrl: m.uploadedUrl, mediaType: m.uploadedType }));
    localStorage.setItem('team_media', JSON.stringify(toSave));
  };

  const openModal  = (id) => { setEditId(id); setPreview(null); setMediaType(''); setFileObj(null); };
  const closeModal = () => { setEditId(null); setPreview(null); setMediaType(''); setFileObj(null); if (fileRef.current) fileRef.current.value = ''; };

  /* ── which media to show: uploaded override OR emoji placeholder ── */
  const getMedia = (m) => {
    if (m.uploadedUrl) return { url: m.uploadedUrl, type: m.uploadedType };
    return null; // no default photo — show emoji placeholder
  };

  return (
    <div className="overflow-x-hidden">
      <style>{`
        @keyframes fadeSlideUp { from{opacity:0;transform:translateY(32px)} to{opacity:1;transform:translateY(0)} }
        @keyframes shimmerText { 0%{background-position:-300% center} 100%{background-position:300% center} }
        @keyframes floatEmoji  { 0%,100%{transform:translateY(0) rotate(0deg)} 45%{transform:translateY(-14px) rotate(4deg)} }
        @keyframes pulseDot    { 0%,100%{box-shadow:0 0 0 0 rgba(110,231,183,.7)} 50%{box-shadow:0 0 0 8px rgba(110,231,183,0)} }
        @keyframes scaleIn     { from{opacity:0;transform:scale(.88)} to{opacity:1;transform:scale(1)} }
        @keyframes fadeIn      { from{opacity:0} to{opacity:1} }
        @keyframes spin        { to{transform:rotate(360deg)} }

        .shimmer-white{background:linear-gradient(90deg,#fff 0%,#93c5fd 22%,#6ee7b7 40%,#fff 55%,#fcd34d 75%,#fff 100%);background-size:300% auto;-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;animation:shimmerText 5s linear infinite}
        .a1{animation:fadeIn      .6s ease .1s  both}
        .a2{animation:fadeSlideUp .8s cubic-bezier(.22,1,.36,1) .25s both}
        .a3{animation:fadeSlideUp .8s cubic-bezier(.22,1,.36,1) .40s both}
        .a5{animation:scaleIn     .7s cubic-bezier(.22,1,.36,1) .30s both}
        .a6{animation:fadeSlideUp .8s cubic-bezier(.22,1,.36,1) .20s both}
        .a7{animation:fadeSlideUp .8s cubic-bezier(.22,1,.36,1) .30s both}
        .a8{animation:fadeSlideUp .8s cubic-bezier(.22,1,.36,1) .15s both}
        .float-e{animation:floatEmoji 6s ease-in-out infinite}
        .p-dot{animation:pulseDot 2s ease infinite}
        .lift{transition:transform .3s cubic-bezier(.34,1.56,.64,1),box-shadow .3s ease}
        .lift:hover{transform:translateY(-8px);box-shadow:0 20px 48px rgba(0,0,0,.10)}
        .team-card:hover .t-av{transform:scale(1.06);box-shadow:0 10px 28px rgba(0,0,0,.12)}
        .t-av{transition:transform .3s cubic-bezier(.34,1.56,.64,1),box-shadow .3s ease}
        .dz{transition:border-color .2s,background .2s}
        .mo{animation:fadeIn .2s ease both}
        .mb{animation:scaleIn .25s cubic-bezier(.22,1,.36,1) both}
        .spin-s{animation:spin .75s linear infinite}
      `}</style>

      {/* ══ HERO SLIDESHOW ══ */}
      <section className="relative overflow-hidden" style={{height:'clamp(420px,70vh,680px)'}}>

        {/* Slides */}
        {SLIDES.map((s, i) => (
          <div key={i}
            className="absolute inset-0 transition-opacity duration-1000"
            style={{opacity: i === slideIndex ? 1 : 0, zIndex: i === slideIndex ? 1 : 0}}>
            {/* Background image */}
            <img src={s.img} alt={s.label}
              className="absolute inset-0 w-full h-full object-cover"
              style={{filter:'brightness(1)'}}/>
            {/* Dark gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/70"/>
            {/* Subtle grid */}
            <div className="pointer-events-none absolute inset-0 opacity-[0.03]"
              style={{backgroundImage:'linear-gradient(rgba(255,255,255,1) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,1) 1px,transparent 1px)',backgroundSize:'60px 60px'}}/>
          </div>
        ))}

        {/* Content */}
        <div className="relative z-10 flex h-full flex-col items-center justify-center px-6 text-center">
          {/* Badge */}
          <div className={`mb-5 inline-flex items-center gap-2 rounded-full border px-4 py-1.5 backdrop-blur-sm transition-all duration-700 ${SLIDES[slideIndex].badgeColor}`}>
            <span className="p-dot inline-block h-2 w-2 rounded-full bg-current opacity-70"/>
            <span className="text-[11px] font-bold uppercase tracking-widest">{SLIDES[slideIndex].badge}</span>
          </div>

          {/* Heading */}
          <h1 className="mb-4 font-extrabold leading-tight text-white drop-shadow-lg"
            style={{fontSize:'clamp(2.4rem,6vw,4.4rem)'}}>
            {SLIDES[slideIndex].label}
          </h1>

          {/* Sub */}
          <p className="mx-auto max-w-lg text-base leading-8 text-white/70 sm:text-lg drop-shadow">
            {SLIDES[slideIndex].sub}
          </p>

          {/* Dot indicators */}
          <div className="mt-8 flex items-center gap-2">
            {SLIDES.map((_, i) => (
              <button key={i} onClick={() => setSlideIndex(i)}
                className={`rounded-full transition-all duration-300 ${
                  i === slideIndex
                    ? 'w-7 h-2.5 bg-white'
                    : 'w-2.5 h-2.5 bg-white/40 hover:bg-white/70'
                }`}/>
            ))}
          </div>

          {/* Prev / Next arrows */}
          <div className="absolute left-4 right-4 top-1/2 -translate-y-1/2 flex justify-between pointer-events-none z-20">
            <button onClick={() => setSlideIndex(p => (p - 1 + SLIDES.length) % SLIDES.length)}
              className="pointer-events-auto flex h-10 w-10 items-center justify-center rounded-full bg-black/30 text-white backdrop-blur-sm hover:bg-black/50 transition text-lg">‹</button>
            <button onClick={() => setSlideIndex(p => (p + 1) % SLIDES.length)}
              className="pointer-events-auto flex h-10 w-10 items-center justify-center rounded-full bg-black/30 text-white backdrop-blur-sm hover:bg-black/50 transition text-lg">›</button>
          </div>
        </div>

        {/* Wave */}
        <svg className="pointer-events-none absolute bottom-0 left-0 w-full z-10" viewBox="0 0 1440 56" preserveAspectRatio="none">
          <path d="M0,28 C360,56 1080,0 1440,28 L1440,56 L0,56 Z" fill="#f9fafb"/>
        </svg>
      </section>

      {/* ══ STATS ══ */}
      <section className="bg-gray-50 py-12 px-6">
        <div className="mx-auto grid max-w-3xl grid-cols-2 gap-6 sm:grid-cols-4">
          {[{icon:'🚗',num:'120+',label:'Transport'},{icon:'🏨',num:'85+',label:'Tourism'},{icon:'🎓',num:'60+',label:'Internships'},{icon:'⭐',num:'98%',label:'Satisfaction'}]
            .map((s,i)=>(
            <div key={s.label} className="lift a8 flex flex-col items-center gap-2 rounded-2xl border border-gray-100 bg-white px-4 py-6 shadow-sm text-center" style={{animationDelay:`${i*.1}s`}}>
              <span className="text-3xl">{s.icon}</span>
              <span className="text-2xl font-extrabold text-blue-700">{s.num}</span>
              <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">{s.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ══ WHO + MISSION ══ */}
      <section className="bg-white px-6 py-16">
        <div className="mx-auto grid max-w-5xl gap-10 md:grid-cols-2">
          <div className="a6 lift rounded-2xl border border-blue-100 bg-gradient-to-br from-blue-50 to-white p-8 shadow-sm">
            <div className="mb-5 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-blue-600 text-2xl shadow-md shadow-blue-200">🏢</div>
            <div className="mb-3 h-1 w-10 rounded-full bg-blue-600"/>
            <h2 className="mb-4 text-2xl font-extrabold text-gray-900">Who We Are</h2>
            <p className="leading-relaxed text-gray-500 text-[15px]">SADU is a technology company based in Kigali, Rwanda, founded with a vision to simplify how people access transport, tourism and career opportunities across the country.
We are a passionate team of young Rwandan professionals and developers who believe that technology should solve real, everyday problems. From a student looking for their first internship, to a traveler needing a reliable ride or a comfortable hotel — we saw a gap, and we built SADU to fill it.
Our company operates at the intersection of technology and service delivery. We work closely with transport providers, tourism businesses, hotels, travel agencies and organizations offering internships to bring their services online and make them discoverable to thousands of people across Rwanda.
At SADU, we are driven by three core values — reliability, accessibility and innovation. Everything we build is designed to be simple, trustworthy and built for Rwanda first.
We are proud to be a Made-in-Rwanda company, and our mission is to keep growing — connecting more businesses, more students and more travelers every day</p>
          </div>
          <div className="a7 lift rounded-2xl border border-emerald-100 bg-gradient-to-br from-emerald-50 to-white p-8 shadow-sm">
            <div className="mb-5 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-600 text-2xl shadow-md shadow-emerald-200">🎯</div>
            <div className="mb-3 h-1 w-10 rounded-full bg-emerald-600"/>
            <h2 className="mb-4 text-2xl font-extrabold text-gray-900">Our Mission</h2>
            <p className="leading-relaxed text-gray-500 text-[15px]">Our mission is to empower Rwandans by making transport, tourism and career opportunities accessible to everyone through technology.
We exist to bridge the gap between service providers and the people who need them — making it faster, simpler and more reliable to find a trusted taxi, book a hotel, discover a tour, or land a life-changing internship.
We are committed to supporting local businesses by giving them a digital presence that reaches more customers, and to supporting Rwandan students by connecting them with companies that invest in the next generation of talent.
Through continuous innovation, we aim to become Rwanda's most trusted digital services platform — one booking, one internship and one journey at a time.</p>
          </div>
        </div>
      </section>

      {/* ══ WHAT WE OFFER ══ */}
      <section className="bg-gray-50 px-6 py-16">
        <div className="mx-auto max-w-5xl">
          <div className="a5 mb-12 text-center">
            <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-blue-600"/>
            <h2 className="text-3xl font-extrabold text-gray-900">What We Offer</h2>
          </div>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
            {[
              {emoji:'🚌',title:'Transport',   desc:'Find taxis, buses, delivery services and more across Rwanda.',                    grad:'from-blue-600 to-blue-700',      light:'bg-blue-50',    badge:'bg-blue-100 text-blue-700',    d:'0s'   },
              {emoji:'🏨',title:'Tourism',     desc:'Discover hotels, tours, travel agencies and premium hospitality experiences.',    grad:'from-emerald-600 to-emerald-700', light:'bg-emerald-50', badge:'bg-emerald-100 text-emerald-700',d:'.12s' },
              {emoji:'🎓',title:'Internships', desc:'Find curated internship opportunities for students across diverse career fields.', grad:'from-violet-600 to-violet-700',   light:'bg-violet-50',  badge:'bg-violet-100 text-violet-700',  d:'.24s' },
            ].map(c=>(
              <div key={c.title} className="lift a8 group rounded-2xl overflow-hidden border border-gray-100 bg-white shadow-sm" style={{animationDelay:c.d}}>
                <div className={`h-2 w-full bg-gradient-to-r ${c.grad}`}/>
                <div className="p-7 text-center">
                  <div className={`mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl ${c.light} text-4xl transition-transform duration-300 group-hover:scale-110`}>{c.emoji}</div>
                  <span className={`mb-3 inline-block rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-wider ${c.badge}`}>{c.title}</span>
                  <p className="mt-2 text-sm leading-7 text-gray-500">{c.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ TEAM ══ */}
      <section className="bg-gradient-to-br from-gray-50 to-blue-50/40 px-6 py-16">
        <div className="mx-auto max-w-5xl">
          <div className="a5 mb-3 text-center">
            <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-blue-600"/>
            <h2 className="text-3xl font-extrabold text-gray-900">Our Team</h2>
            <p className="mt-2 text-gray-400 text-sm">The people behind the platform</p>
          </div>

          {/* admin-only hint */}
          {isAdmin && (
            <div className="mb-10 flex items-center justify-center gap-2 rounded-xl border border-blue-100 bg-blue-50 py-3 px-5 text-xs text-blue-600 font-semibold max-w-md mx-auto">
              🔐 Admin mode — click <span className="font-bold mx-1">Change Photo / Video</span> to update team media
            </div>
          )}

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
            {team.map((m, i) => {
              const c   = C[m.color];
              const med = getMedia(m);
              return (
                <div key={m.id} className="team-card lift a8 rounded-2xl border border-gray-100 bg-white shadow-sm overflow-hidden" style={{animationDelay:`${i*.12}s`}}>

                  {/* ── photo / video area ── */}
                  <div className="relative w-full">
                    {med === null ? (
                      <div className={`flex h-52 w-full items-center justify-center text-7xl ${C[m.color].bg}`}>
                        {m.emoji}
                      </div>
                    ) : med.type === 'video'
                      ? <video src={med.url} controls className="w-full h-52 object-cover"/>
                      : <img   src={med.url} alt={m.name} className="t-av w-full h-52 object-cover"/>
                    }

                    {/* admin-only: remove uploaded override (reverts to assets photo) */}
                    {isAdmin && m.uploadedUrl && (
                      <button onClick={() => handleRemove(m.id)}
                        title="Revert to default photo"
                        className="absolute top-2 right-2 flex items-center gap-1 rounded-full bg-red-500 px-2 py-1 text-white text-[10px] font-bold shadow-md hover:bg-red-600 transition">
                        ↩ Revert
                      </button>
                    )}

                    {/* admin badge overlay */}
                    {isAdmin && (
                      <div className="absolute top-2 left-2 rounded-full bg-black/50 px-2 py-1 text-[10px] font-bold text-white backdrop-blur-sm">
                        🔐 Admin
                      </div>
                    )}
                  </div>

                  {/* ── info ── */}
                  <div className="p-6 text-center">
                    <h3 className="font-extrabold text-gray-800 text-lg">{m.name}</h3>
                    <p className="mt-1 text-sm text-gray-400">{m.role}</p>
                    <div className="mt-4 h-px w-10 mx-auto bg-gray-100"/>

                    {/* only admin sees upload button */}
                    {isAdmin ? (
                      <button onClick={() => openModal(m.id)}
                        className={`mt-4 inline-flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-bold text-white shadow transition hover:-translate-y-0.5 ${c.btn}`}>
                        📷 {m.uploadedUrl ? 'Change Photo / Video' : 'Upload Photo / Video'}
                      </button>
                    ) : (
                      <span className={`mt-4 inline-block rounded-full px-3 py-1 text-[11px] font-semibold ${
                        m.color==='blue'?'bg-blue-50 text-blue-600':m.color==='emerald'?'bg-emerald-50 text-emerald-600':'bg-violet-50 text-violet-600'
                      }`}>
                        {m.role}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ══ CTA ══ */}
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-700 to-blue-900 px-6 py-16 text-center">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -top-24 -right-24 h-64 w-64 rounded-full bg-blue-400 opacity-20 blur-[80px]"/>
          <div className="absolute -bottom-16 -left-16 h-48 w-48 rounded-full bg-cyan-400 opacity-15 blur-[60px]"/>
        </div>
        <div className="relative z-10 mx-auto max-w-xl a5">
          <h2 className="mb-4 text-2xl font-extrabold text-white sm:text-3xl">Ready to explore Rwanda's services?</h2>
          <p className="mb-8 text-blue-200/75 leading-7">Browse transport, tourism listings or discover internship opportunities today.</p>
          <div className="flex flex-wrap justify-center gap-4">
            <a href="/ads?type=service"    className="inline-flex items-center gap-2 rounded-xl bg-white px-7 py-3.5 text-sm font-bold text-blue-700 shadow-lg transition hover:-translate-y-1">🔍 Browse Services</a>
            <a href="/ads?type=internship" className="inline-flex items-center gap-2 rounded-xl border border-white/25 bg-white/10 px-7 py-3.5 text-sm font-bold text-white backdrop-blur-sm transition hover:-translate-y-1 hover:bg-white/20">🎓 View Internships</a>
          </div>
        </div>
      </section>

      {/* ══ UPLOAD MODAL (admin only) ══ */}
      {isAdmin && editId !== null && (
        <div className="mo fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4 backdrop-blur-sm" onClick={closeModal}>
          <div className="mb w-full max-w-md rounded-2xl bg-white shadow-2xl overflow-hidden" onClick={e => e.stopPropagation()}>

            {/* header */}
            <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
              <div>
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-bold text-blue-600 uppercase tracking-wider">🔐 Admin Only</span>
                </div>
                <h3 className="font-extrabold text-gray-900 text-lg">Upload Photo or Video</h3>
                <p className="text-xs text-gray-400 mt-0.5">
                  For: <span className="font-semibold text-gray-600">{team.find(m=>m.id===editId)?.name}</span>
                </p>
              </div>
              <button onClick={closeModal} className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200 transition">✕</button>
            </div>

            <div className="p-6 space-y-4">
              {/* drop zone */}
              <div
                className={`dz flex flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed p-8 text-center cursor-pointer
                  ${dragOver ? 'border-blue-500 bg-blue-50' : 'border-gray-200 bg-gray-50 hover:border-blue-400 hover:bg-blue-50/60'}`}
                onDragOver={e=>{e.preventDefault();setDragOver(true);}}
                onDragLeave={()=>setDragOver(false)}
                onDrop={onDrop}
                onClick={()=>fileRef.current?.click()}
              >
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-100 text-3xl">
                  {dragOver ? '📂' : '📁'}
                </div>
                <div>
                  <p className="font-bold text-gray-700">Drag &amp; drop or <span className="text-blue-600 underline underline-offset-2">click to browse</span></p>
                  <p className="mt-1 text-xs text-gray-400">Images: JPG, PNG, GIF, WEBP</p>
                  <p className="text-xs text-gray-400">Videos: MP4, MOV, WEBM · Max 10 MB</p>
                </div>
                <input ref={fileRef} type="file" accept="image/*,video/*" className="hidden" onChange={e=>handleFile(e.target.files[0])}/>
              </div>

              {/* preview */}
              {preview && (
                <div className="overflow-hidden rounded-xl border border-gray-100 bg-gray-50">
                  {mediaType==='video'
                    ? <video src={preview} controls className="w-full max-h-48 object-contain"/>
                    : <img   src={preview} alt="preview" className="w-full max-h-48 object-contain"/>
                  }
                  <p className="px-4 py-2 text-xs text-gray-400 text-center">
                    {mediaType==='video' ? '🎬 Video preview' : '🖼️ Image preview'} — looks good?
                  </p>
                </div>
              )}

              <p className="text-center text-xs text-gray-400 bg-gray-50 rounded-xl py-2 px-3">
                💾 Saved in browser storage. Visible to all visitors instantly.
              </p>

              {/* buttons */}
              <div className="flex gap-3 pt-1">
                <button onClick={closeModal}
                  className="flex-1 rounded-xl border border-gray-200 py-3 text-sm font-bold text-gray-600 hover:bg-gray-50 transition">
                  Cancel
                </button>
                <button onClick={handleSave} disabled={!preview || saving}
                  className={`flex-1 rounded-xl py-3 text-sm font-bold text-white transition
                    ${preview && !saving ? 'bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-200 hover:-translate-y-0.5' : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}>
                  {saving
                    ? <span className="flex items-center justify-center gap-2">
                        <span className="spin-s inline-block h-4 w-4 rounded-full border-2 border-white/30 border-t-white"/>
                        Saving…
                      </span>
                    : '💾 Save'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
