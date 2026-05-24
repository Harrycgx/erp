import QuoteStatusBadge from './QuoteStatusBadge';

export default function QuoteHistory({ quotations, customers, search, status, onSearch, onStatusChange, onView }) {
  const findCustomer = (customerId) => customers.find((item) => item.id === customerId);

  return (
    <div className="rounded-[32px] border border-slate-700 bg-slate-950/90 p-6 shadow-xl shadow-black/20">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Quotation history</p>
          <h2 className="mt-2 text-2xl font-black text-white">Saved quotes</h2>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <input
            type="search"
            value={search}
            onChange={(event) => onSearch(event.target.value)}
            placeholder="Search customer or box type"
            className="w-full rounded-3xl border border-slate-700 bg-slate-900/90 px-4 py-3 text-sm text-white outline-none transition focus:border-orange-400"
          />
          <select
            value={status}
            onChange={(event) => onStatusChange(event.target.value)}
            className="w-full rounded-3xl border border-slate-700 bg-slate-900/90 px-4 py-3 text-sm text-white outline-none transition focus:border-orange-400"
          >
            <option value="">All statuses</option>
            <option value="draft">Draft</option>
            <option value="sent">Sent</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
            <option value="expired">Expired</option>
            <option value="revision_requested">Revision requested</option>
            <option value="revised">Revised</option>
            <option value="converted">Converted</option>
          </select>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full table-auto text-left text-sm text-slate-300">
          <thead className="border-b border-slate-800 text-slate-500">
            <tr>
              <th className="px-4 py-3">Customer</th>
              <th className="px-4 py-3">Box type</th>
              <th className="px-4 py-3">Quantity</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Total</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {quotations.map((quote) => {
              const customer = findCustomer(quote.customer_id);
              return (
                <tr key={quote.id} className="border-b border-slate-800 hover:bg-slate-900/70">
                  <td className="px-4 py-4 text-white">{customer?.company_name || 'Unknown'}</td>
                  <td className="px-4 py-4 text-slate-300">{quote.box_type}</td>
                  <td className="px-4 py-4 text-slate-300">{quote.quantity}</td>
                  <td className="px-4 py-4"><QuoteStatusBadge status={quote.status} /></td>
                  <td className="px-4 py-4 text-slate-300">Rs {Number(quote.total || 0).toFixed(2)}</td>
                  <td className="px-4 py-4">
                    <button
                      type="button"
                      onClick={() => onView(quote)}
                      className="rounded-full border border-slate-700 bg-slate-900/80 px-3 py-2 text-xs font-semibold text-white transition hover:bg-slate-800"
                    >
                      View
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
