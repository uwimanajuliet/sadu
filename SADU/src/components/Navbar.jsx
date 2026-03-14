import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

const Navbar = () => {
  const { admin, logout } = useAuth();
  const navigate  = useNavigate();
  const location  = useLocation();
  const [open, setOpen] = useState(false);

  const handleLogout = () => { logout(); navigate('/'); setOpen(false); };

  const links = [
    { to: '/',            label: 'Home'         },
    { to: '/ads',         label: 'Ads'          },
    { to: '/cars',        label: '🚗 Cars'       },
    { to: '/tourism',     label: '🏨 Tourism'    },
    { to: '/internships', label: '🎓 Internships' },
    { to: '/about',       label: 'About'        },
    { to: '/contact',     label: 'Contact'      },
  ];

  const isActive = (to) =>
    to === '/' ? location.pathname === '/' : location.pathname.startsWith(to);

  return (
    <nav className="sticky top-0 z-50 bg-blue-700 text-white shadow-lg">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-3">

        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 shrink-0">
          <img src="/logo.png" alt="SADU Logo" className="h-12 w-auto object-contain" />
        </Link>

        {/* Desktop links */}
        <div className="hidden lg:flex items-center gap-2">
          {links.map(l => (
            <Link key={l.to} to={l.to}
              className={`relative px-4 py-2 text-sm font-bold rounded-lg transition-all duration-300
                ${isActive(l.to)
                  ? 'bg-white/20 text-white shadow-md'
                  : 'text-white/80 hover:bg-white/10 hover:text-white hover:scale-105'
                }`}>
              {l.label}
              {isActive(l.to) && (
                <span className="absolute bottom-0 left-1/2 h-0.5 w-6 -translate-x-1/2 rounded-full bg-yellow-300" />
              )}
              {l.to === '/internships' && (
                <span className="ml-2 rounded-full bg-emerald-400 px-2 py-0.5 text-[9px] font-bold text-white uppercase tracking-wide shadow-sm">
                  New
                </span>
              )}
            </Link>
          ))}
        </div>

        {/* Auth + mobile toggle */}
        <div className="flex items-center gap-3">
          {admin ? (
            <button onClick={handleLogout}
              className="hidden lg:inline-flex items-center rounded-lg bg-red-500 px-4 py-2 text-sm font-bold hover:bg-red-600 hover:shadow-md transition">
              Logout
            </button>
          ) : (
            <Link to="/login"
              className="hidden lg:inline-flex items-center rounded-lg bg-white text-blue-700 px-4 py-2 text-sm font-bold hover:bg-gray-100 hover:shadow-md transition">
              Login
            </Link>
          )}

          {/* Hamburger */}
          <button onClick={() => setOpen(o => !o)}
            className="lg:hidden flex flex-col justify-center gap-1.5 p-1 w-8 h-8">
            <span className={`block h-0.5 w-6 bg-white rounded transition-all duration-300 ${open ? 'rotate-45 translate-y-2' : ''}`}/>
            <span className={`block h-0.5 w-6 bg-white rounded transition-all duration-300 ${open ? 'opacity-0' : ''}`}/>
            <span className={`block h-0.5 w-6 bg-white rounded transition-all duration-300 ${open ? '-rotate-45 -translate-y-2' : ''}`}/>
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="lg:hidden border-t border-white/20 bg-blue-800 px-6 py-4 flex flex-col gap-2 rounded-b-lg shadow-md">
          {links.map(l => (
            <Link key={l.to} to={l.to} onClick={() => setOpen(false)}
              className={`flex items-center justify-between rounded-lg px-3 py-2 text-sm font-bold transition
                ${isActive(l.to) ? 'bg-white/20 text-white shadow-sm' : 'text-white/80 hover:bg-white/10 hover:text-white'}`}>
              <span>{l.label}</span>
              {l.to === '/internships' && (
                <span className="rounded-full bg-emerald-400 px-2 py-0.5 text-[9px] font-bold text-white uppercase shadow-sm">New</span>
              )}
            </Link>
          ))}
          <div className="mt-3 border-t border-white/20 pt-3">
            {admin ? (
              <button onClick={handleLogout}
                className="w-full rounded-lg bg-red-500 px-3 py-2 text-sm font-bold text-white hover:bg-red-600 hover:shadow-md transition text-left">
                Logout
              </button>
            ) : (
              <Link to="/login" onClick={() => setOpen(false)}
                className="block w-full rounded-lg bg-white text-center text-blue-700 px-3 py-2 text-sm font-bold hover:bg-gray-100 hover:shadow-md transition">
                Login
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
