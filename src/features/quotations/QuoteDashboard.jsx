import QuoteSearchBar from './QuoteSearchBar';
import QuoteFilters from './QuoteFilters';

export default function QuoteDashboard({ stats, activeStatus, onStatusChange, search, onSearch }) {
  return (
    <section className="rounded-[32px] border border-slate-700 bg-slate-950/90 p-6 shadow-xl shadow-black/20">
      <div className="flex flex-col gap-6 xl:flex-row xl:items-center xl:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-slate-500">Quotation dashboard</p>
          <h1 className="mt-3 text-3xl font-black text-white">Quotation operations</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">Review pipeline status, filter active quotes, and manage customer approvals with production-ready controls.</p>
        </div>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          <div className="min-w-[280px]">
            <QuoteSearchBar value={search} onChange={onSearch} />
          </div>
        </div>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => (
          <div key={stat.label} className="rounded-[28px] border border-slate-800 bg-slate-900/80 p-4">
            <p className="text-sm uppercase tracking-[0.3em] text-slate-400">{stat.label}</p>
            <p className="mt-3 text-3xl font-black text-white">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="mt-6">
        <QuoteFilters activeStatus={activeStatus} onStatusChange={onStatusChange} counts={stats.reduce((acc, stat) => ({ ...acc, [stat.key]: stat.value }), {})} />
      </div>
    </section>
  );
}
