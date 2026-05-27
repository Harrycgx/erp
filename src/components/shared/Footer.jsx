export default function Footer() {
  return (
    <footer className="border-t border-slate-800 bg-slate-950 py-10 text-slate-400">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 px-6 sm:flex-row sm:items-center sm:justify-between text-[11px] uppercase tracking-widest font-bold">
        <p>© {new Date().getFullYear()} MAYUR PACKAGING · BOXIQ ERP</p>
        <div className="flex flex-wrap gap-6 text-slate-500">
          <span className="text-orange-500/50">Internal Operations Only</span>
          <span>System Version 2.4.0</span>
        </div>
      </div>
    </footer>
  );
}
