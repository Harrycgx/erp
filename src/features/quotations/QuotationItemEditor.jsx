import { formatCurrency } from '../../utils/formatters';

const inputClass =
  'w-full rounded-md border border-slate-300 bg-white px-2.5 py-1.5 text-sm text-slate-900 outline-none focus:border-slate-500';

export default function QuotationItemEditor({ items = [], calculatedItems = [], onItemChange, onAddItem, onRemoveItem }) {
  return (
    <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
      <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-3 py-2">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Line items</p>
          <p className="text-xs text-slate-500">Qty, price, discount, GST per line</p>
        </div>
        <button
          type="button"
          onClick={onAddItem}
          className="rounded-md border border-slate-300 bg-white px-3 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50"
        >
          Add item
        </button>
      </div>

      <div className="hidden overflow-x-auto md:block">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase text-slate-500">
            <tr>
              <th className="px-3 py-2 font-medium">Item</th>
              <th className="px-3 py-2 font-medium">Description</th>
              <th className="w-20 px-3 py-2 font-medium">Qty</th>
              <th className="w-28 px-3 py-2 font-medium">Unit price</th>
              <th className="w-24 px-3 py-2 font-medium">Discount</th>
              <th className="w-20 px-3 py-2 font-medium">GST %</th>
              <th className="w-28 px-3 py-2 text-right font-medium">Line total</th>
              <th className="w-16 px-3 py-2" />
            </tr>
          </thead>
          <tbody>
            {items.map((item, index) => {
              const calculated = calculatedItems[index] || {};
              const gstPercent = Number(calculated.tax_rate || 0) * 100;
              return (
                <tr key={`item-${index}`} className="border-b border-slate-100 last:border-b-0">
                  <td className="px-3 py-2">
                    <input
                      type="text"
                      value={item.item_name}
                      onChange={(e) => onItemChange(index, 'item_name', e.target.value)}
                      placeholder="Item name"
                      className={inputClass}
                    />
                  </td>
                  <td className="px-3 py-2">
                    <input
                      type="text"
                      value={item.description || ''}
                      onChange={(e) => onItemChange(index, 'description', e.target.value)}
                      placeholder="Description"
                      className={inputClass}
                    />
                  </td>
                  <td className="px-3 py-2">
                    <input
                      type="number"
                      min="0"
                      value={item.quantity}
                      onChange={(e) => onItemChange(index, 'quantity', e.target.value)}
                      className={inputClass}
                    />
                  </td>
                  <td className="px-3 py-2">
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={item.unit_price}
                      onChange={(e) => onItemChange(index, 'unit_price', e.target.value)}
                      className={inputClass}
                    />
                  </td>
                  <td className="px-3 py-2">
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={item.discount_amount}
                      onChange={(e) => onItemChange(index, 'discount_amount', e.target.value)}
                      className={inputClass}
                    />
                  </td>
                  <td className="px-3 py-2">
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={gstPercent ? gstPercent.toFixed(0) : ''}
                      onChange={(e) => onItemChange(index, 'tax_rate', e.target.value)}
                      placeholder="18"
                      className={inputClass}
                    />
                  </td>
                  <td className="px-3 py-2 text-right font-medium text-slate-900">
                    {formatCurrency(calculated.total || 0)}
                  </td>
                  <td className="px-3 py-2 text-right">
                    <button
                      type="button"
                      onClick={() => onRemoveItem(index)}
                      className="text-xs text-slate-500 hover:text-rose-600"
                    >
                      Remove
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="space-y-3 p-3 md:hidden">
        {items.map((item, index) => {
          const calculated = calculatedItems[index] || {};
          const gstPercent = Number(calculated.tax_rate || 0) * 100;
          return (
            <div key={`mobile-item-${index}`} className="rounded-md border border-slate-200 p-3">
              <input
                type="text"
                value={item.item_name}
                onChange={(e) => onItemChange(index, 'item_name', e.target.value)}
                placeholder="Item name"
                className={`${inputClass} mb-2`}
              />
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="number"
                  value={item.quantity}
                  onChange={(e) => onItemChange(index, 'quantity', e.target.value)}
                  placeholder="Qty"
                  className={inputClass}
                />
                <input
                  type="number"
                  value={item.unit_price}
                  onChange={(e) => onItemChange(index, 'unit_price', e.target.value)}
                  placeholder="Unit price"
                  className={inputClass}
                />
                <input
                  type="number"
                  value={item.discount_amount}
                  onChange={(e) => onItemChange(index, 'discount_amount', e.target.value)}
                  placeholder="Discount"
                  className={inputClass}
                />
                <input
                  type="number"
                  value={gstPercent ? gstPercent.toFixed(0) : ''}
                  onChange={(e) => onItemChange(index, 'tax_rate', e.target.value)}
                  placeholder="GST %"
                  className={inputClass}
                />
              </div>
              <div className="mt-2 flex items-center justify-between text-sm">
                <span className="text-slate-500">Line total</span>
                <span className="font-medium">{formatCurrency(calculated.total || 0)}</span>
              </div>
              <button type="button" onClick={() => onRemoveItem(index)} className="mt-2 text-xs text-rose-600">
                Remove line
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
