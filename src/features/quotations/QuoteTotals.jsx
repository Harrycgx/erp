import { formatCurrency } from '../../utils/formatters';

export default function QuoteTotals({ quote }) {
  const subtotal = Number(quote.subtotal || 0);
  const gst = Number(quote.gst || quote.tax_amount || 0);
  const total = Number(quote.total || 0);
  const discount = Number(quote.discount_amount || 0);
  return (
    <div className="rounded-[32px] border border-slate-700 bg-slate-950/90 p-5 shadow-xl shadow-black/20">
      <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Pricing summary</p>
      <div className="mt-4 space-y-3 text-sm text-slate-300">
        <div className="flex items-center justify-between gap-4">
          <span>Subtotal</span>
          <span>{formatCurrency(subtotal)}</span>
        </div>
        <div className="flex items-center justify-between gap-4">
          <span>Discount</span>
          <span>{formatCurrency(discount)}</span>
        </div>
        <div className="flex items-center justify-between gap-4">
          <span>GST / Tax</span>
          <span>{formatCurrency(gst)}</span>
        </div>
      </div>
      <div className="mt-5 border-t border-slate-800 pt-4 text-base font-black text-white">
        <div className="flex items-center justify-between gap-4">
          <span>Total</span>
          <span>{formatCurrency(total)}</span>
        </div>
      </div>
    </div>
  );
}
