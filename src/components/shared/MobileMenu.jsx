import { Link } from 'react-router-dom';

export default function MobileMenu({ open, onClose, pageLinks, isAuthenticated, onLogout }) {
  return (
    <div className={`fixed inset-x-0 top-0 z-50 overflow-hidden bg-slate-950 px-6 py-6 transition-transform duration-300 ${open ? 'translate-y-0' : '-translate-y-full'}`}>
      <div className="flex items-center justify-between">
        <span className="text-lg font-black text-white uppercase tracking-tighter">BoxIQ</span>
        <button type="button" onClick={onClose} className="rounded-full bg-white/10 px-4 py-2 text-sm text-white font-bold">
          Close
        </button>
      </div>

      <div className="mt-10 space-y-3">
        {pageLinks.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            onClick={onClose}
            className="block w-full rounded-2xl bg-slate-900 border border-slate-800 px-5 py-4 text-left text-sm font-bold uppercase tracking-wider text-white transition hover:bg-slate-800"
          >
            {item.label}
          </Link>
        ))}
      </div>

      {isAuthenticated && (
        <div className="mt-8 border-t border-slate-800 pt-8">
          <button
            type="button"
            onClick={() => {
              onLogout();
              onClose();
            }}
            className="w-full rounded-2xl bg-rose-950/30 border border-rose-900/50 px-5 py-4 text-left text-sm font-bold uppercase tracking-wider text-rose-200"
          >
            Logout session
          </button>
        </div>
      )}
    </div>
  );
}
