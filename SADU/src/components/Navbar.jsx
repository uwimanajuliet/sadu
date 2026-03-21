import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

const Navbar = () => {
  const { admin, logout } = useAuth();
  const navigate  = useNavigate();
  const location  = useLocation();
  const [open, setOpen]         = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => { setOpen(false); }, [location.pathname]);

  const handleLogout = () => { logout(); navigate('/'); };

  const links = [
    { to: '/',            label: 'Home',         },
    { to: '/ads',         label: 'Ads',          },
    { to: '/cars',        label: 'Cars',         },
    { to: '/tourism',     label: 'Tourism',      },
    { to: '/internships', label: 'Internships',  badge: 'New' },
    { to: '/about',       label: 'About',       },
    { to: '/contact',     label: 'Contact',      },
  ];

  const isActive = (to) =>
    to === '/' ? location.pathname === '/' : location.pathname.startsWith(to);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;600;700;800&display=swap');

        .nav-root { font-family: 'Outfit', sans-serif; }

        .nav-glass {
          background: linear-gradient(135deg, rgba(15,23,42,0.97) 0%, rgba(29,78,216,0.95) 100%);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border-bottom: 1px solid rgba(255,255,255,0.08);
          transition: all 0.35s cubic-bezier(.4,0,.2,1);
        }
        .nav-glass.scrolled {
          background: linear-gradient(135deg, rgba(10,16,35,0.99) 0%, rgba(20,60,180,0.98) 100%);
          box-shadow: 0 8px 40px rgba(0,0,0,0.35), 0 1px 0 rgba(255,255,255,0.06);
        }

        .logo-text {
          background: linear-gradient(90deg, #fff 0%, #93c5fd 40%, #fbbf24 70%, #fff 100%);
          background-size: 200% auto;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          animation: logoShimmer 4s linear infinite;
          font-weight: 800;
          letter-spacing: -0.03em;
        }
        @keyframes logoShimmer {
          0%   { background-position: 0% center }
          100% { background-position: 200% center }
        }

        .nav-link {
          position: relative;
          display: inline-flex;
          align-items: center;
          gap: 5px;
          padding: 6px 13px;
          border-radius: 10px;
          font-size: 13px;
          font-weight: 600;
          color: rgba(255,255,255,0.72);
          text-decoration: none;
          transition: all 0.22s cubic-bezier(.34,1.56,.64,1);
          white-space: nowrap;
          letter-spacing: 0.01em;
          font-family: 'Outfit', sans-serif;
        }
        .nav-link:hover {
          color: #fff;
          background: rgba(255,255,255,0.1);
          transform: translateY(-1px);
        }
        .nav-link.active {
          color: #fff;
          background: rgba(255,255,255,0.15);
          box-shadow: 0 2px 12px rgba(96,165,250,0.25), inset 0 1px 0 rgba(255,255,255,0.15);
        }
        .nav-link.active::after {
          content: '';
          position: absolute;
          bottom: -1px;
          left: 50%;
          transform: translateX(-50%);
          width: 20px;
          height: 2px;
          border-radius: 2px;
          background: linear-gradient(90deg, #60a5fa, #fbbf24);
          box-shadow: 0 0 6px rgba(96,165,250,0.7);
        }

        .nav-badge {
          display: inline-block;
          padding: 1px 6px;
          border-radius: 20px;
          font-size: 9px;
          font-weight: 800;
          letter-spacing: 0.05em;
          text-transform: uppercase;
          background: linear-gradient(135deg, #10b981, #059669);
          color: #fff;
          box-shadow: 0 2px 6px rgba(16,185,129,0.4);
          animation: pulseBadge 2s ease infinite;
        }
        @keyframes pulseBadge {
          0%,100% { box-shadow: 0 2px 6px rgba(16,185,129,0.4); }
          50%      { box-shadow: 0 2px 12px rgba(16,185,129,0.7); }
        }

        .btn-login {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 7px 18px;
          border-radius: 10px;
          font-size: 13px;
          font-weight: 700;
          font-family: 'Outfit', sans-serif;
          background: linear-gradient(135deg, #fff 0%, #e0e7ff 100%);
          color: #1d4ed8;
          border: none;
          cursor: pointer;
          text-decoration: none;
          transition: all 0.22s cubic-bezier(.34,1.56,.64,1);
          box-shadow: 0 2px 10px rgba(255,255,255,0.15);
        }
        .btn-login:hover {
          transform: translateY(-2px) scale(1.03);
          box-shadow: 0 6px 20px rgba(255,255,255,0.25);
        }
        .btn-logout {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 7px 18px;
          border-radius: 10px;
          font-size: 13px;
          font-weight: 700;
          font-family: 'Outfit', sans-serif;
          background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
          color: #fff;
          border: none;
          cursor: pointer;
          transition: all 0.22s cubic-bezier(.34,1.56,.64,1);
          box-shadow: 0 2px 10px rgba(239,68,68,0.35);
          text-decoration: none;
        }
        .btn-logout:hover {
          transform: translateY(-2px) scale(1.03);
          box-shadow: 0 6px 20px rgba(239,68,68,0.45);
        }

        .admin-chip {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          padding: 3px 10px 3px 6px;
          border-radius: 20px;
          font-size: 11px;
          font-weight: 700;
          font-family: 'Outfit', sans-serif;
          background: rgba(250,204,21,0.15);
          border: 1px solid rgba(250,204,21,0.3);
          color: #fcd34d;
          letter-spacing: 0.02em;
        }
        .admin-dot {
          width: 6px; height: 6px;
          border-radius: 50%;
          background: #fcd34d;
          box-shadow: 0 0 6px #fcd34d;
          animation: adminPulse 1.5s ease infinite;
          flex-shrink: 0;
        }
        @keyframes adminPulse {
          0%,100% { box-shadow: 0 0 4px #fcd34d; }
          50%      { box-shadow: 0 0 10px #fcd34d, 0 0 20px rgba(252,211,77,0.4); }
        }

        .nav-divider {
          width: 1px; height: 20px;
          background: rgba(255,255,255,0.15);
          margin: 0 4px;
        }

        .ham-bar {
          display: block;
          width: 22px; height: 2px;
          background: #fff;
          border-radius: 2px;
          transition: all 0.3s cubic-bezier(.4,0,.2,1);
        }

        .mobile-menu {
          animation: slideDown 0.28s cubic-bezier(.22,1,.36,1) both;
        }
        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-10px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        .mob-link {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 10px 14px;
          border-radius: 12px;
          font-size: 14px;
          font-weight: 600;
          color: rgba(255,255,255,0.75);
          text-decoration: none;
          transition: all 0.2s ease;
          font-family: 'Outfit', sans-serif;
        }
        .mob-link:hover { background: rgba(255,255,255,0.1); color: #fff; }
        .mob-link.active {
          background: rgba(96,165,250,0.15);
          color: #fff;
          border-left: 2px solid #60a5fa;
        }
        .mob-icon {
          width: 32px; height: 32px;
          display: flex; align-items: center; justify-content: center;
          border-radius: 8px;
          background: rgba(255,255,255,0.08);
          font-size: 15px;
          flex-shrink: 0;
        }
      `}</style>

      <nav className={`nav-root nav-glass sticky top-0 z-50 ${scrolled ? 'scrolled' : ''}`}>
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-2.5">

          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 shrink-0 group">
            <div className="relative">
              <img src="/logo.png" alt="SADU" className="h-11 w-auto object-contain drop-shadow-lg transition-transform duration-300 group-hover:scale-105"/>
            </div>
            <div className="hidden sm:block">
              <span className="logo-text text-xl tracking-tight">SADU</span>
              <p className="text-[9px] font-semibold uppercase tracking-[0.15em] text-white/40 -mt-0.5">Transport & Tourism</p>
            </div>
          </Link>

          {/* Desktop links */}
          <div className="hidden lg:flex items-center gap-0.5">
            {links.map(l => (
              <Link key={l.to} to={l.to}
                className={`nav-link ${isActive(l.to) ? 'active' : ''}`}>
                <span className="text-sm">{l.icon}</span>
                {l.label}
                {l.badge && <span className="nav-badge">{l.badge}</span>}
              </Link>
            ))}
          </div>

          {/* Right side */}
          <div className="hidden lg:flex items-center gap-3">
            {admin ? (
              <>
                <div className="admin-chip">
                  <span className="admin-dot"/>
                  {admin.username || 'Admin'}
                </div>
                <Link to="/admin" className="nav-link"
                  style={{background:'rgba(250,204,21,0.1)', border:'1px solid rgba(250,204,21,0.2)', color:'#fcd34d'}}>
                  ⚡ Dashboard
                </Link>
                <div className="nav-divider"/>
                <button onClick={handleLogout} className="btn-logout">↩ Logout</button>
              </>
            ) : (
              <Link to="/login" className="btn-login">🔐 Login</Link>
            )}
          </div>

          {/* Hamburger */}
          <button onClick={() => setOpen(o => !o)}
            className="lg:hidden flex flex-col justify-center items-center gap-1.5 w-9 h-9 rounded-xl hover:bg-white/10 transition-colors">
            <span className="ham-bar" style={open ? {transform:'rotate(45deg) translate(3px,3px)'} : {}}/>
            <span className="ham-bar" style={open ? {opacity:0, transform:'scaleX(0)'} : {}}/>
            <span className="ham-bar" style={open ? {transform:'rotate(-45deg) translate(3px,-3px)'} : {}}/>
          </button>
        </div>

        {/* Mobile menu */}
        {open && (
          <div className="mobile-menu lg:hidden px-4 pb-5 pt-2"
            style={{background:'linear-gradient(180deg,rgba(15,23,80,0.98) 0%,rgba(10,16,50,0.99) 100%)',
              borderTop:'1px solid rgba(255,255,255,0.07)'}}>

            {admin && (
              <div className="mb-3 flex items-center gap-2 rounded-xl bg-yellow-400/10 border border-yellow-400/20 px-3 py-2">
                <span className="admin-dot"/>
                <span className="text-xs font-bold text-yellow-300">Logged in as {admin.username || 'Admin'}</span>
              </div>
            )}

            <div className="flex flex-col gap-1">
              {links.map(l => (
                <Link key={l.to} to={l.to}
                  className={`mob-link ${isActive(l.to) ? 'active' : ''}`}>
                  <span className="mob-icon">{l.icon}</span>
                  <span className="flex-1">{l.label}</span>
                  {l.badge && <span className="nav-badge">{l.badge}</span>}
                  {isActive(l.to) && <span className="text-blue-400 text-xs">●</span>}
                </Link>
              ))}
              {admin && (
                <Link to="/admin" className="mob-link"
                  style={{background:'rgba(250,204,21,0.08)', border:'1px solid rgba(250,204,21,0.15)'}}>
                 
                  <span className="flex-1 text-yellow-300 font-bold">Dashboard</span>
                </Link>
              )}
            </div>

            <div className="mt-4 pt-4 border-t border-white/10">
              {admin ? (
                <button onClick={handleLogout} className="btn-logout w-full justify-center py-3 text-base">
                  ↩ Logout
                </button>
              ) : (
                <Link to="/login" className="btn-login w-full justify-center py-3 text-base">
                  🔐 Login 
                </Link>
              )}
            </div>
          </div>
        )}
      </nav>
    </>
  );
};

export default Navbar;
