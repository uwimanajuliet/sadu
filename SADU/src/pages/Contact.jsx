import { useState } from 'react';
import emailjs from '@emailjs/browser';

// ─────────────────────────────────────────────────────────────────
//  SETUP — 3 easy steps:
//  1. npm install @emailjs/browser
//  2. Sign up free at https://www.emailjs.com
//  3. Replace the three values below with yours:
//     - Create an Email Service (Gmail) → copy Service ID
//     - Create a Template with vars: {{from_name}} {{from_email}}
//       {{phone}} {{subject}} {{message}} → copy Template ID
//     - Account → API Keys → copy Public Key
// ─────────────────────────────────────────────────────────────────
const SERVICE_ID  = 'service_7whbtnr';
const TEMPLATE_ID = 'template_zx1za2d';
const PUBLIC_KEY  = 'd_11a_Zj8lpf-1wnh';

// Your WhatsApp number WITHOUT the + sign
const WA_NUMBER = '250789846899';

const WA_URL = `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(
  'Hello! I have an inquiry about your car rental service.'
)}`;

const INFO_ITEMS = [
  { icon: '📍', bg: '#eff6ff', title: 'Location',      lines: ['Nyamata, Rwanda', 'KG 123 Street, Nyamata'] },
  { icon: '📞', bg: '#f0fdf4', title: 'Phone',         lines: ['+250 789 846 899', '+250 789 846 899'] },
  { icon: '📧', bg: '#fdf4ff', title: 'Email',         lines: ['julietuwimana30@gmail.com', 'info@greathelp.com'] },
  { icon: '🕐', bg: '#fffbeb', title: 'Working Hours', lines: ['Mon – Fri: 8:00 AM – 6:00 PM', 'Sat – Sun: 9:00 AM – 4:00 PM'] },
];

const WaIcon = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="white">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
    <path d="M12 0C5.373 0 0 5.373 0 12c0 2.117.554 4.104 1.523 5.824L0 24l6.344-1.494A11.956 11.956 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.818 9.818 0 01-5.006-1.372l-.36-.214-3.727.977.997-3.645-.234-.374A9.818 9.818 0 1112 21.818z"/>
  </svg>
);

const Contact = () => {
  const [form, setForm]     = useState({ name: '', email: '', phone: '', subject: '', message: '' });
  const [status, setStatus] = useState('idle'); // idle | sending | success | error
  const [errMsg, setErrMsg] = useState('');

  const set = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const submit = async () => {
    if (!form.name || !form.email || !form.message) {
      setErrMsg('Please fill in Name, Email and Message.'); return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      setErrMsg('Please enter a valid email address.'); return;
    }
    setErrMsg('');
    setStatus('sending');
    try {
      await emailjs.send(SERVICE_ID, TEMPLATE_ID, {
        from_name:  form.name,
        from_email: form.email,
        phone:      form.phone || 'Not provided',
        subject:    form.subject || 'General inquiry',
        message:    form.message,
        reply_to:   form.email,
      }, PUBLIC_KEY);
      setStatus('success');
    } catch {
      setStatus('error');
      setErrMsg('Failed to send. Please try WhatsApp or email us directly.');
    }
  };

  const reset = () => {
    setForm({ name: '', email: '', phone: '', subject: '', message: '' });
    setStatus('idle'); setErrMsg('');
  };

  return (
    <div style={{ background: '#f8fafc', minHeight: '100vh' }}>
      <style>{`
        /* HERO */
        .ch {
          background: linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%);
          color: #fff;
          padding: 5rem 2rem 4rem;
          text-align: center;
          position: relative;
          overflow: hidden;
        }
        .ch::before {
          content: '';
          position: absolute; inset: 0;
          background: radial-gradient(ellipse at 70% 40%, rgba(255,255,255,0.08) 0%, transparent 60%);
          pointer-events: none;
        }
        .ch h1 { font-size: clamp(2rem,5vw,3.2rem); font-weight: 800; margin-bottom: .8rem; letter-spacing: -.5px; }
        .ch p  { font-size: 1.05rem; color: rgba(255,255,255,.7); max-width: 460px; margin: 0 auto 2rem; line-height: 1.7; }
        .ch-wa {
          display: inline-flex; align-items: center; gap: 10px;
          background: #25d366; color: #fff; font-weight: 700; font-size: .95rem;
          padding: 13px 28px; border-radius: 50px; text-decoration: none;
          transition: background .2s, transform .2s;
          box-shadow: 0 4px 20px rgba(37,211,102,.4);
        }
        .ch-wa:hover { background: #1ebe5d; transform: translateY(-2px); }

        /* BODY */
        .cb { max-width: 1100px; margin: 0 auto; padding: 4rem 2rem 5rem; }
        .cg { display: grid; grid-template-columns: 1fr 1.45fr; gap: 3rem; align-items: start; }
        @media(max-width:768px){ .cg{ grid-template-columns:1fr; gap:2rem; } }

        /* INFO */
        .ip h2 { font-size: 1.5rem; font-weight: 800; color: #0f172a; margin-bottom: 1.4rem; letter-spacing: -.3px; }
        .ic-list { display:flex; flex-direction:column; gap:.9rem; margin-bottom:1.4rem; }
        .ic {
          display: flex; align-items: flex-start; gap: 1rem;
          background: #fff; border: 1px solid #e2e8f0; border-radius: 14px;
          padding: 1.1rem 1.3rem; transition: box-shadow .2s, transform .2s;
        }
        .ic:hover { box-shadow: 0 6px 20px rgba(0,0,0,.07); transform: translateY(-2px); }
        .ic-icon { width:44px;height:44px;border-radius:12px;display:flex;align-items:center;justify-content:center;font-size:1.25rem;flex-shrink:0; }
        .ic h3 { font-size:.78rem;font-weight:700;color:#0f172a;margin-bottom:4px;text-transform:uppercase;letter-spacing:.5px; }
        .ic p  { font-size:.88rem;color:#64748b;line-height:1.6;margin:0; }

        /* WA card */
        .wa-card {
          display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:1rem;
          background:linear-gradient(135deg,#dcfce7,#bbf7d0);
          border:1px solid #86efac;border-radius:16px;padding:1.3rem 1.5rem;
        }
        .wa-left { display:flex;align-items:center;gap:12px; }
        .wa-circle { width:46px;height:46px;background:#25d366;border-radius:50%;display:flex;align-items:center;justify-content:center;flex-shrink:0; }
        .wa-card h3 { font-size:.98rem;font-weight:700;color:#14532d;margin-bottom:2px; }
        .wa-card p  { font-size:.82rem;color:#166534;margin:0; }
        .wa-go {
          display:inline-flex;align-items:center;gap:8px;
          background:#25d366;color:#fff;font-weight:700;font-size:.88rem;
          padding:10px 20px;border-radius:50px;text-decoration:none;white-space:nowrap;
          transition:background .2s,transform .2s;box-shadow:0 4px 14px rgba(37,211,102,.3);
        }
        .wa-go:hover { background:#1ebe5d; transform:translateY(-1px); }

        /* FORM */
        .fc {
          background:#fff;border:1px solid #e2e8f0;border-radius:20px;
          padding:2.5rem;box-shadow:0 4px 24px rgba(0,0,0,.05);
        }
        .fc h2  { font-size:1.5rem;font-weight:800;color:#0f172a;margin-bottom:.3rem;letter-spacing:-.3px; }
        .fc-sub { font-size:.87rem;color:#94a3b8;margin-bottom:1.8rem; }
        .fr     { display:grid;grid-template-columns:1fr 1fr;gap:1rem; }
        @media(max-width:480px){ .fr{grid-template-columns:1fr;} }
        .fg     { margin-bottom:1rem; }
        .fg label { display:block;font-size:.75rem;font-weight:700;color:#475569;margin-bottom:6px;text-transform:uppercase;letter-spacing:.5px; }
        .fg input,.fg textarea,.fg select {
          width:100%;border:1.5px solid #e2e8f0;border-radius:10px;
          padding:11px 14px;font-size:.92rem;color:#0f172a;
          background:#f8fafc;transition:border-color .2s,box-shadow .2s;
          outline:none;resize:none;
        }
        .fg input:focus,.fg textarea:focus,.fg select:focus {
          border-color:#3b82f6;background:#fff;box-shadow:0 0 0 3px rgba(59,130,246,.12);
        }
        .fg textarea { min-height:130px;line-height:1.6; }
        .req { color:#ef4444;margin-left:2px; }
        .err { background:#fef2f2;border:1px solid #fecaca;color:#dc2626;border-radius:10px;padding:11px 14px;font-size:.88rem;display:flex;align-items:center;gap:8px;margin-bottom:1rem; }
        .sbtn {
          width:100%;background:#1d4ed8;color:#fff;font-weight:700;font-size:1rem;
          padding:14px;border-radius:12px;border:none;cursor:pointer;
          display:flex;align-items:center;justify-content:center;gap:8px;
          transition:background .2s,transform .2s;margin-top:.4rem;
        }
        .sbtn:hover:not(:disabled){ background:#1e40af;transform:translateY(-1px); }
        .sbtn:disabled{ opacity:.6;cursor:not-allowed; }
        .spin { width:18px;height:18px;border:2px solid rgba(255,255,255,.3);border-top-color:#fff;border-radius:50%;animation:sp .7s linear infinite; }
        @keyframes sp{ to{transform:rotate(360deg)} }

        /* SUCCESS */
        .sc { text-align:center;padding:2rem 1rem; }
        .sc-ico { width:72px;height:72px;background:#f0fdf4;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:2rem;margin:0 auto 1.2rem; }
        .sc h3 { font-size:1.5rem;font-weight:800;color:#0f172a;margin-bottom:.4rem; }
        .sc p  { font-size:.9rem;color:#64748b;line-height:1.7;margin-bottom:1.5rem; }
        .sc-btn { background:#1d4ed8;color:#fff;font-weight:700;font-size:.9rem;padding:11px 28px;border-radius:50px;border:none;cursor:pointer;transition:background .2s; }
        .sc-btn:hover{ background:#1e40af; }

        /* MAP */
        .map-sec { margin-top:3.5rem; }
        .map-sec h2 { font-size:1.4rem;font-weight:800;color:#0f172a;margin-bottom:1.2rem; }
        .map-wrap { border-radius:20px;overflow:hidden;border:1px solid #e2e8f0;box-shadow:0 4px 24px rgba(0,0,0,.06); }
        .map-wrap iframe { display:block;width:100%;height:340px;border:none; }
      `}</style>

      {/* HERO */}
      <div className="ch">
        <h1>Contact Us</h1>
        <p>Have a question or need help with a booking? We're here for you — reach us anytime.</p>
        <a href={WA_URL} target="_blank" rel="noreferrer" className="ch-wa">
          <WaIcon size={22} /> Chat on WhatsApp
        </a>
      </div>

      {/* BODY */}
      <div className="cb">
        <div className="cg">

          {/* LEFT */}
          <div className="ip">
            <h2>Get In Touch</h2>
            <div className="ic-list">
              {INFO_ITEMS.map(({ icon, bg, title, lines }) => (
                <div className="ic" key={title}>
                  <div className="ic-icon" style={{ background: bg }}>{icon}</div>
                  <div>
                    <h3>{title}</h3>
                    {lines.map((l, i) => <p key={i}>{l}</p>)}
                  </div>
                </div>
              ))}
            </div>

            {/* WhatsApp card */}
            <div className="wa-card">
              <div className="wa-left">
                <div className="wa-circle"><WaIcon size={24} /></div>
                <div>
                  <h3>Chat on WhatsApp</h3>
                  <p>We reply within minutes during working hours</p>
                </div>
              </div>
              <a href={WA_URL} target="_blank" rel="noreferrer" className="wa-go">
                <WaIcon size={16} /> Open WhatsApp
              </a>
            </div>
          </div>

          {/* RIGHT — Form */}
          <div className="fc">
            {status === 'success' ? (
              <div className="sc">
                <div className="sc-ico">✅</div>
                <h3>Message Sent!</h3>
                <p>
                  Thank you, <strong>{form.name}</strong>!<br />
                  We received your message and will reply to <strong>{form.email}</strong> within 24 hours.
                </p>
                <button className="sc-btn" onClick={reset}>Send Another Message</button>
              </div>
            ) : (
              <>
                <h2>Send Us a Message</h2>
                <p className="fc-sub">Fill out the form and we'll get back to you as soon as possible.</p>

                {errMsg && <div className="err">⚠️ {errMsg}</div>}

                <div className="fr">
                  <div className="fg">
                    <label>Full Name <span className="req">*</span></label>
                    <input type="text" name="name" value={form.name} onChange={set} placeholder="John Doe" />
                  </div>
                  <div className="fg">
                    <label>Email <span className="req">*</span></label>
                    <input type="email" name="email" value={form.email} onChange={set} placeholder="john@example.com" />
                  </div>
                </div>

                <div className="fr">
                  <div className="fg">
                    <label>Phone Number</label>
                    <input type="tel" name="phone" value={form.phone} onChange={set} placeholder="+250 789 846 899" />
                  </div>
                  <div className="fg">
                    <label>Subject</label>
                    <select name="subject" value={form.subject} onChange={set}>
                      <option value="">Select a topic...</option>
                      <option>Booking Inquiry</option>
                      <option>applying for internship</option>
                      <option>Pricing & Rates</option>
                      <option>Car Availability</option>
                      <option>Payment Issue</option>
                      <option>Complaint</option>
                      <option>General Question</option>
                      <option>Other</option>
                    </select>
                  </div>
                </div>

                <div className="fg">
                  <label>Message <span className="req">*</span></label>
                  <textarea name="message" value={form.message} onChange={set} placeholder="Tell us how we can help you..." />
                </div>

                <button className="sbtn" onClick={submit} disabled={status === 'sending'}>
                  {status === 'sending' ? <><div className="spin" /> Sending...</> : <>✉️ Send Message</>}
                </button>

                {status === 'error' && (
                  <div className="err" style={{ marginTop: '1rem' }}>❌ {errMsg}</div>
                )}
              </>
            )}
          </div>
        </div>

        {/* MAP */}
        <div className="map-sec">
          <h2>📍 Find Us on the Map</h2>
          <div className="map-wrap">
            <iframe
              title="Our Location — Nyamata, Rwanda"
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d63800.0!2d30.1!3d-2.15!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x19db9e31dce0c22f%3A0x72375fa33c02a104!2sNyamata%2C%20Rwanda!5e0!3m2!1sen!2srw!4v1700000000000"
              allowFullScreen=""
              loading="lazy"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;
