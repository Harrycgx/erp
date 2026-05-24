import { useEffect, useState } from 'react';
import { NavLink, Link, useLocation, useNavigate } from 'react-router-dom';
import MobileMenu from './MobileMenu';

const pageLinks = [
  { label: 'Home', path: '/' },
  { label: 'HR dashboard', path: '/hr' },
  { label: 'Employees', path: '/employees' },
  { label: 'Attendance', path: '/attendance' },
  { label: 'Payroll', path: '/payroll' },
  { label: 'Inventory', path: '/inventory' },
  { label: 'Production', path: '/production-planning' },
  { label: 'Procurement', path: '/procurement' },
  { label: 'Purchase orders', path: '/purchase-orders' },
  { label: 'Vendors', path: '/vendors' },
  { label: 'Suppliers', path: '/suppliers' },
  { label: 'Finance', path: '/finance' },
  { label: 'Invoices', path: '/invoices' },
  { label: 'Payments', path: '/payments' },
  { label: 'Ledger', path: '/ledger' },
  { label: 'Dashboard', path: '/dashboard' },
  { label: 'Customer portal', path: '/customer-portal' },
  { label: 'Orders', path: '/orders' },
  { label: 'Admin', path: '/admin' },
];

const sectionLinks = [
  { label: 'Trust', section: 'trust' },
  { label: 'Live quote', section: 'quote' },
  { label: 'Capacity', section: 'manufacturing' },
  { label: 'Factory', section: 'factory' },
  { label: 'Timeline', section: 'timeline' },
];

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState('home');
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (location.pathname !== '/') return undefined;
    const ids = sectionLinks.map((item) => item.section).concat('hero');
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
        if (visible[0]) setActiveSection(visible[0].target.id || 'hero');
      },
      { threshold: 0.42 }
    );
    ids.forEach((id) => document.getElementById(id) && observer.observe(document.getElementById(id)));
    return () => observer.disconnect();
  }, [location.pathname]);

  const handleNavigate = (path, section) => {
    setMenuOpen(false);
    if (section && location.pathname === '/') {
      const el = document.getElementById(section);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        return;
      }
    }
    navigate(path);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <header className={`fixed inset-x-0 top-0 z-40 border-b border-white/10 backdrop-blur-xl transition duration-300 ${scrolled ? 'bg-white/90 shadow-sm' : 'bg-transparent'}`}>
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <Link to="/" className="text-lg font-black tracking-tight text-slate-900">
          BoxIQ
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          {pageLinks.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/'}
              className={({ isActive }) =>
                `text-sm font-semibold transition ${isActive ? 'text-slate-900' : 'text-slate-500 hover:text-slate-900'}`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="hidden items-center gap-4 md:flex">
          <button
            type="button"
            onClick={() => handleNavigate('/quote-builder')}
            className="rounded-full bg-orange-500 px-5 py-2 text-sm font-semibold text-white shadow-[0_14px_40px_rgba(249,115,22,0.18)] transition hover:-translate-y-0.5 hover:bg-orange-400"
          >
            Build a quote
          </button>
        </div>

        <button type="button" onClick={() => setMenuOpen(true)} className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-white p-2 text-slate-900 md:hidden">
          <span className="sr-only">Open menu</span>
          ☰
        </button>
      </div>

      <div className="hidden border-t border-slate-200 bg-slate-950/5 px-6 py-3 md:block">
        <div className="flex flex-wrap items-center gap-4">
          {sectionLinks.map((item) => (
            <button
              key={item.section}
              type="button"
              onClick={() => handleNavigate('/', item.section)}
              className={`text-sm font-semibold transition ${activeSection === item.section ? 'text-slate-900' : 'text-slate-500 hover:text-slate-900'}`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      <MobileMenu
        open={menuOpen}
        onClose={() => setMenuOpen(false)}
        pageLinks={pageLinks}
        sectionLinks={sectionLinks}
        currentPath={location.pathname}
        onNavigate={handleNavigate}
      />
    </header>
  );
}
