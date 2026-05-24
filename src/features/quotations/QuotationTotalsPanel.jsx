import { formatCurrency } from '../../utils/formatters';

export default function QuotationTotalsPanel({ totals = {}, quotationNumber = '' }) {
  return (
    <aside className="rounded-lg border border-slate-200 bg-white p-4">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Totals</p>
      {quotationNumber ? (
        <p className="mt-1 text-sm font-medium text-slate-900">{quotationNumber}</p>
      ) : null}

      <dl className="mt-4 space-y-2 text-sm">
        <div className="flex justify-between gap-4 text-slate-600">
          <dt>Items subtotal</dt>
          <dd>{formatCurrency(totals.items_subtotal || 0)}</dd>
        </div>
        <div className="flex justify-between gap-4 text-slate-600">
          <dt>Line discounts</dt>
          <dd>{formatCurrency(totals.line_discount_amount || 0)}</dd>
        </div>
        {totals.header_discount_amount > 0 ? (
          <div className="flex justify-between gap-4 text-slate-600">
            <dt>Header discount</dt>
            <dd>{formatCurrency(totals.header_discount_amount || 0)}</dd>
          </div>
        ) : null}
        {totals.tooling_cost > 0 ? (
          <div className="flex justify-between gap-4 text-slate-600">
            <dt>Tooling</dt>
            <dd>{formatCurrency(totals.tooling_cost || 0)}</dd>
          </div>
        ) : null}
        <div className="flex justify-between gap-4 text-slate-600">
          <dt>Subtotal</dt>
          <dd>{formatCurrency(totals.subtotal || 0)}</dd>
        </div>
        <div className="flex justify-between gap-4 text-slate-600">
          <dt>GST</dt>
          <dd>{formatCurrency(totals.gst_amount || totals.tax_amount || 0)}</dd>
        </div>
      </dl>

      <div className="mt-4 flex justify-between gap-4 border-t border-slate-200 pt-3 text-base font-semibold text-slate-900">
        <span>Grand total</span>
        <span>{formatCurrency(totals.total_amount || totals.total || 0)}</span>
      </div>
    </aside>
  );
}
