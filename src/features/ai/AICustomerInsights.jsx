export default function AICustomerInsights({ customers = [] }) {
  return (
    <div className="rounded-3xl border border-slate-700 bg-slate-950/90 p-6 shadow-xl shadow-black/20">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Customer insights</p>
          <h2 className="mt-2 text-3xl font-black text-white">Engagement signals</h2>
        </div>
      </div>
      <div className="mt-6 space-y-4">
        {customers.map((customer) => (
          <div key={customer.name} className="rounded-3xl border border-slate-800 bg-slate-900/95 p-5">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h3 className="font-semibold text-white">{customer.name}</h3>
                <p className="text-sm text-slate-400">{customer.status}</p>
              </div>
              <span className="rounded-full bg-slate-800 px-3 py-1 text-xs uppercase tracking-[0.24em] text-slate-300">{customer.priority}</span>
            </div>
            <p className="mt-3 text-sm leading-6 text-slate-400">{customer.insight}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
