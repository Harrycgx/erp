import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <main className="min-h-screen bg-[#0B1020] px-6 py-24 text-white">
      <div className="mx-auto max-w-3xl rounded-[32px] border border-slate-700 bg-slate-950/90 p-12 text-center shadow-xl shadow-black/20">
        <p className="text-sm uppercase tracking-[0.3em] text-slate-500">Page not found</p>
        <h1 className="mt-6 text-5xl font-black">404</h1>
        <p className="mt-4 text-lg text-slate-400">The page you are looking for does not exist or has been moved.</p>
        <Link
          to="/"
          className="mt-8 inline-flex rounded-full bg-orange-500 px-8 py-3 text-sm font-semibold text-white transition hover:bg-orange-400"
        >
          Return to home
        </Link>
      </div>
    </main>
  );
}
