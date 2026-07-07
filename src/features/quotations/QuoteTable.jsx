import { useMemo, useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import QuoteStatusBadge from './QuoteStatusBadge';
import QuoteCard from './QuoteCard';

const sortConfig = {
  quoteNumber: 'quote_number',
  customer: 'customer',
  date: 'created_at',
  total: 'total',
  status: 'status',
};

export default function QuoteTable({ quotations, customers, onView, onEdit }) {
  const [sortKey, setSortKey] = useState('date');
  const [sortDirection, setSortDirection] = useState('desc');
  const [page, setPage] = useState(1);
  const pageSize = 8;

  const sortedQuotes = useMemo(() => {
    const rows = [...quotations];
    rows.sort((a, b) => {
      const aValue = sortKey === 'customer'
        ? customers.find((item) => item.id === a.customer_id)?.company_name || ''
        : sortKey === 'date'
          ? new Date(a.created_at || 0).getTime()
          : sortKey === 'total'
            ? Number(a.total || 0)
            : String(a[sortConfig[sortKey] || sortKey] || '').toLowerCase();
      const bValue = sortKey === 'customer'
        ? customers.find((item) => item.id === b.customer_id)?.company_name || ''
        : sortKey === 'date'
          ? new Date(b.created_at || 0).getTime()
          : sortKey === 'total'
            ? Number(b.total || 0)
            : String(b[sortConfig[sortKey] || sortKey] || '').toLowerCase();

      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
    return rows;
  }, [quotations, customers, sortDirection, sortKey]);

  const pages = Math.max(1, Math.ceil(sortedQuotes.length / pageSize));
  const currentQuotes = useMemo(() => sortedQuotes.slice((page - 1) * pageSize, page * pageSize), [page, pageSize, sortedQuotes]);

  const handleSort = (key) => {
    if (sortKey === key) {
      setSortDirection((current) => (current === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDirection('desc');
    }
  };

  return (
    <div className="space-y-4">
      <div className="hidden rounded-[32px] border border-slate-700 bg-slate-950/90 p-6 shadow-xl shadow-black/20 sm:block">
        <div className="overflow-x-auto">
          <table className="min-w-full table-auto text-left text-sm text-slate-300">
            <thead className="border-b border-slate-800 text-slate-500">
              <tr>
                {[
                  { key: 'quoteNumber', label: 'Quote #' },
                  { key: 'customer', label: 'Customer' },
                  { key: 'date', label: 'Date' },
                  { key: 'status', label: 'Status' },
                  { key: 'total', label: 'Total' },
                  { key: 'actions', label: 'Actions' },
                ].map((column) => (
                  <th key={column.key} className="px-4 py-4">
                    {column.key !== 'actions' ? (
                      <button
                        type="button"
                        onClick={() => handleSort(column.key)}
                        className="inline-flex items-center gap-2 font-semibold text-slate-300 transition hover:text-white"
                      >
                        {column.label}
                        {sortKey === column.key ? (
                          sortDirection === 'asc' ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />
                        ) : null}
                      </button>
                    ) : (
                      column.label
                    )}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {currentQuotes.map((quote) => {
                const customer = customers.find((item) => item.id === quote.customer_id);
                return (
                  <tr key={quote.id} className="border-b border-slate-800 hover:bg-slate-900/70">
                    <td className="px-4 py-4 text-white">{quote.quote_number || quote.id}</td>
                    <td className="px-4 py-4 text-slate-300">{customer?.company_name || 'Unknown'}</td>
                    <td className="px-4 py-4 text-slate-300">{quote.created_at ? new Date(quote.created_at).toLocaleDateString() : '—'}</td>
                    <td className="px-4 py-4"><QuoteStatusBadge status={quote.status} /></td>
                    <td className="px-4 py-4 text-slate-300">Rs {Number(quote.total || 0).toFixed(2)}</td>
                    <td className="px-4 py-4">
                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() => onView(quote)}
                          className="rounded-full border border-slate-700 bg-slate-900/80 px-3 py-2 text-xs font-semibold text-white transition hover:bg-slate-800"
                        >
                          View
                        </button>
                        <button
                          type="button"
                          onClick={() => onEdit(quote)}
                          className="rounded-full border border-slate-700 bg-slate-900/80 px-3 py-2 text-xs font-semibold text-white transition hover:bg-slate-800"
                        >
                          Edit
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <div className="space-y-4 sm:hidden">
        {currentQuotes.map((quote) => (
          <QuoteCard key={quote.id} quote={quote} customer={customers.find((item) => item.id === quote.customer_id)} onView={onView} onEdit={onEdit} />
        ))}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4 rounded-[28px] border border-slate-700 bg-slate-950/90 p-4 text-sm text-slate-300 shadow-xl shadow-black/20">
        <p>
          Showing {currentQuotes.length} of {quotations.length} quotations
        </p>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            disabled={page === 1}
            onClick={() => setPage((value) => Math.max(1, value - 1))}
            className="rounded-full border border-slate-700 bg-slate-900/80 px-4 py-2 text-xs font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            Previous
          </button>
          <button
            type="button"
            disabled={page === pages}
            onClick={() => setPage((value) => Math.min(pages, value + 1))}
            className="rounded-full border border-slate-700 bg-slate-900/80 px-4 py-2 text-xs font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
