export default function QuoteItemRow({ item }) {
  return (
    <tr className="border-b border-slate-800 last:border-b-0">
      <td className="px-4 py-3 text-sm text-white">{item.item_name || 'Item'}</td>
      <td className="px-4 py-3 text-sm text-slate-300">{item.quantity || 0}</td>
      <td className="px-4 py-3 text-sm text-slate-300">Rs {Number(item.unit_price || 0).toFixed(2)}</td>
      <td className="px-4 py-3 text-sm text-slate-300">{item.discount_amount ? `Rs ${Number(item.discount_amount).toFixed(2)}` : '—'}</td>
      <td className="px-4 py-3 text-sm text-slate-300">{item.tax_rate ? `${Number(item.tax_rate) * 100}%` : '0%'}</td>
      <td className="px-4 py-3 text-right text-sm font-semibold text-white">Rs {Number(item.total || 0).toFixed(2)}</td>
    </tr>
  );
}
