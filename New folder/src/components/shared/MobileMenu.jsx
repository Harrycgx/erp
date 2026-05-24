import { Link } from 'react-router-dom';

export default function MobileMenu({ open, onClose, pageLinks, sectionLinks, currentPath, onNavigate }) {
  return (
    <div className={`fixed inset-x-0 top-0 z-50 overflow-hidden bg-slate-950/95 px-6 py-6 transition-transform duration-300 ${open ? 'translate-y-0' : '-translate-y-full'}`}>
      <div className="flex items-center justify-between">
        <span className="text-lg font-black text-white">Menu</span>
        <button type="button" onClick={onClose} className="rounded-full bg-white/10 px-4 py-2 text-sm text-white">
          Close
        </button>
      </div>

      <div className="mt-10 space-y-6">
        {pageLinks.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            onClick={onClose}
            className="block w-full rounded-3xl bg-white/5 px-5 py-4 text-left text-base font-semibold text-white transition hover:bg-white/10"
          >
            {item.label}
          </Link>
        ))}
      </div>

      {currentPath === '/' && (
        <div className="mt-8 space-y-4">
          <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Landing sections</p>
          {sectionLinks.map((item) => (
            <button
              key={item.section}
              type="button"
              onClick={() => {
                onClose();
                onNavigate('/', item.section);
              }}
              className="block w-full rounded-3xl border border-slate-700 bg-slate-950/80 px-5 py-4 text-left text-sm text-slate-200 transition hover:border-slate-500 hover:bg-slate-900"
            >
              {item.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
