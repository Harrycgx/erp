import QuoteItemRow from './QuoteItemRow';
import QuoteStatusBadge from './QuoteStatusBadge';

export default function QuoteDetails({ quote, customer, onPrint, onPreview, onConvert, onEdit, onDelete, showActions = true, showApprovalPanel = false, approvalProps = {} }) {
  if (!quote) {
    return (
      <div className="rounded-[32px] border border-slate-700 bg-slate-950/90 p-6 shadow-xl shadow-black/20">
        <p className="text-sm text-slate-400">Select a quote from the list to view details.</p>
      </div>
    );
  }

  const createdDate = quote.created_at ? new Date(quote.created_at).toLocaleDateString() : '—';
  const validUntil = quote.created_at ? new Date(new Date(quote.created_at).getTime() + 15 * 24 * 60 * 60 * 1000).toLocaleDateString() : '—';

  const timelineEvents = [
    {
      type: 'created',
      label: 'Quotation created',
      description: `Created on ${createdDate}`,
      date: quote.created_at || new Date().toISOString(),
    },
    ...((quote.notes || []).map((note) => ({
      type: 'note',
      label: note.note_type === 'customer_comment' ? 'Customer comment' : 'Staff note',
      description: note.note || 'Comment added',
      date: note.created_at || new Date().toISOString(),
    }))),
  ];

  return (
    <div className="space-y-6">
      <div className="rounded-[32px] border border-slate-700 bg-slate-950/90 p-6 shadow-xl shadow-black/20">
        <div className="flex flex-col gap-6 xl:flex-row xl:items-start xl:justify-between">
          <div className="space-y-4">
            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Quotation details</p>
              <h2 className="mt-2 text-3xl font-black text-white">{quote.quote_number || quote.box_type || 'Quotation'}</h2>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-4">
                <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Customer</p>
                <p className="mt-2 text-sm font-semibold text-white">{customer?.company_name || 'Unknown'}</p>
              </div>
              <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-4">
                <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Status</p>
                <div className="mt-2"><QuoteStatusBadge status={quote.status} /></div>
              </div>
              <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-4">
                <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Valid until</p>
                <p className="mt-2 text-sm font-semibold text-white">{validUntil}</p>
              </div>
              <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-4">
                <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Created</p>
                <p className="mt-2 text-sm font-semibold text-white">{createdDate}</p>
              </div>
            </div>
          </div>
          {showActions ? (
            <div className="flex flex-col gap-3 xl:w-[280px]">
              <button
                type="button"
                onClick={() => onEdit(quote)}
                className="rounded-full border border-slate-700 bg-slate-900/90 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
              >
                Edit quotation
              </button>
              <button
                type="button"
                onClick={onPreview}
                className="rounded-full border border-slate-700 bg-slate-900/90 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
              >
                PDF preview
              </button>
              <button
                type="button"
                onClick={onConvert}
                className="rounded-full bg-orange-500 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-orange-400"
              >
                Convert to order
              </button>
            </div>
          ) : null}
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.4fr_0.9fr]">
        <div className="space-y-6">
          <div className="rounded-[32px] border border-slate-700 bg-slate-950/90 p-6 shadow-xl shadow-black/20">
            <div className="mb-5 flex items-center justify-between gap-4">
              <div>
                <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Product & pricing</p>
                <h3 className="mt-2 text-xl font-black text-white">Item specifications</h3>
              </div>
              <button
                type="button"
                onClick={onPrint}
                className="rounded-full border border-slate-700 bg-slate-900/90 px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-white transition hover:bg-slate-800"
              >
                Print
              </button>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-4">
                <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Box type</p>
                <p className="mt-2 text-sm font-semibold text-white">{quote.box_type || 'N/A'}</p>
              </div>
              <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-4">
                <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Dimensions</p>
                <p className="mt-2 text-sm font-semibold text-white">{quote.length} × {quote.width} × {quote.height} mm</p>
              </div>
              <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-4">
                <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Flute</p>
                <p className="mt-2 text-sm font-semibold text-white">{quote.flute_type || 'N/A'}</p>
              </div>
              <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-4">
                <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Ply / GSM</p>
                <p className="mt-2 text-sm font-semibold text-white">{quote.ply || 'N/A'} / {quote.gsm || 'N/A'}</p>
              </div>
            </div>
          </div>

          <div className="rounded-[32px] border border-slate-700 bg-slate-950/90 p-6 shadow-xl shadow-black/20">
            <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Quote items</p>
            <div className="mt-5 overflow-x-auto">
              <table className="min-w-full text-left text-sm text-slate-300">
                <thead className="border-b border-slate-800 text-slate-500">
                  <tr>
                    <th className="px-4 py-3">Item</th>
                    <th className="px-4 py-3">Qty</th>
                    <th className="px-4 py-3">Unit price</th>
                    <th className="px-4 py-3">Discount</th>
                    <th className="px-4 py-3">Tax</th>
                    <th className="px-4 py-3 text-right">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {(quote.items || []).map((item) => (
                    <QuoteItemRow key={item.id || `${item.item_name}-${item.quantity}`} item={item} />
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="rounded-[32px] border border-slate-700 bg-slate-950/90 p-6 shadow-xl shadow-black/20">
            <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Notes</p>
            <p className="mt-4 text-sm leading-7 text-slate-300">{quote.notes?.length ? quote.notes[0].note : quote.notes || 'No notes provided.'}</p>
          </div>

          <QuoteTimeline events={timelineEvents} />
        </div>

        <aside className="space-y-6">
          <QuoteTotals quote={quote} />
          {showApprovalPanel ? <QuoteApprovalPanel quote={quote} {...approvalProps} /> : null}
        </aside>
      </div>
    </div>
  );
}
