import { NavLink, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { canAccessModule } from '../../config/permissions';
import MobileMenu from './MobileMenu';
import { useState } from 'react';

const navItems = [
  { label: 'Staff dashboard', path: '/dashboard', module: 'internal' },
  { label: 'Quotations', path: '/quotations', module: 'sales' },
  { label: 'Sales orders', path: '/sales-orders', module: 'sales' },
  { label: 'Inventory', path: '/inventory', module: 'inventory' },
  { label: 'Production', path: '/production', module: 'production' },
  { label: 'Procurement', path: '/procurement', module: 'procurement' },
  { label: 'Finance', path: '/finance', module: 'finance' },
  { label: 'Employees', path: '/employees', module: 'hr' },
  { label: 'Attendance', path: '/attendance', module: 'hr' },
  { label: 'Payroll', path: '/payroll', module: 'hr' },
  { label: 'Admin panel', path: '/admin', module: 'admin' },
];

export default function Navbar() {
  const { profile, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const filteredLinks = navItems.filter(item => 
    isAuthenticated && profile && canAccessModule(profile, item.module)
  );

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <header className="fixed inset-x-0 top-0 z-40 border-b border-slate-800 bg-slate-950/90 backdrop-blur-xl transition duration-300">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <Link to="/" className="text-lg font-black tracking-tight text-white">
          BoxIQ <span className="ml-2 text-[10px] font-medium text-orange-500 uppercase tracking-widest border border-orange-500/30 px-2 py-0.5 rounded">Internal ERP</span>
        </Link>

        {isAuthenticated && (
          <nav className="hidden items-center gap-6 lg:flex">
            {filteredLinks.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `text-xs font-bold uppercase tracking-wider transition ${isActive ? 'text-orange-400' : 'text-slate-400 hover:text-white'}`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>
        )}

        <div className="hidden items-center gap-4 lg:flex">
          {isAuthenticated ? (
            <div className="flex items-center gap-4 border-l border-slate-800 pl-4">
              <div className="text-right">
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-tighter">{profile?.role}</p>
                <p className="text-xs font-semibold text-white">{profile?.full_name?.split(' ')[0]}</p>
              </div>
              <button
                type="button"
                onClick={handleLogout}
                className="rounded-full border border-slate-700 bg-slate-900 px-4 py-1.5 text-xs font-bold text-slate-300 transition hover:border-rose-500 hover:text-white"
              >
                Logout
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => navigate('/login')}
              className="rounded-full bg-orange-500 px-5 py-2 text-sm font-semibold text-white transition hover:bg-orange-400"
            >
              Staff login
            </button>
          )}
        </div>

        <button 
          type="button" 
          onClick={() => setMenuOpen(true)} 
          className="inline-flex items-center justify-center rounded-full border border-slate-700 bg-slate-900 p-2 text-white lg:hidden"
        >
          <span className="sr-only">Open menu</span>
          ☰
        </button>
      </div>

      <MobileMenu
        open={menuOpen}
        onClose={() => setMenuOpen(false)}
        pageLinks={filteredLinks}
        isAuthenticated={isAuthenticated}
        onLogout={handleLogout}
      />
    </header>
  );
}
