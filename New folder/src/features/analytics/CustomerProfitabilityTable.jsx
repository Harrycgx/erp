export default function CustomerProfitabilityTable({ customers = [] }) {
  return (
    <div className="rounded-[32px] border border-slate-700 bg-slate-950/90 p-6 shadow-xl shadow-black/20">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Customer profitability</p>
          <h2 className="mt-2 text-2xl font-black text-white">Top customers</h2>
        </div>
      </div>
      <div className="mt-6 overflow-hidden rounded-[28px] border border-slate-800 bg-slate-900/95">
        <div className="grid grid-cols-[2fr_1fr_1fr] gap-4 border-b border-slate-800 px-5 py-4 text-sm uppercase tracking-[0.3em] text-slate-400">
          <span>Name</span>
          <span>Revenue</span>
          <span>Margin</span>
        </div>
        <div className="divide-y divide-slate-800">
          {customers.map((customer) => (
            <div key={customer.name} className="grid grid-cols-[2fr_1fr_1fr] gap-4 px-5 py-4 text-sm text-slate-200">
              <span>{customer.name}</span>
              <span>₹{customer.revenue}</span>
              <span>{customer.margin}%</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
