import { useEffect, useState } from 'react';
import { BOX_TYPES, FLUTE_TYPES, PLY_OPTIONS, GSM_OPTIONS, PRINTING_TYPES, LAMINATION_OPTIONS, URGENCY_OPTIONS } from '../../utils/quotationHelpers';
import { validateQuotationInput } from '../../utils/validationHelpers';
import MaterialSelector from './MaterialSelector';
import PrintingOptions from './PrintingOptions';
import FinishingOptions from './FinishingOptions';

const initialState = {
  customer_id: '',
  inquiry_id: '',
  box_type: '',
  length: '',
  width: '',
  height: '',
  quantity: '',
  flute_type: '',
  ply: '',
  gsm: '',
  printing_type: 'None',
  lamination: 'None',
  tooling_cost: '',
  stitching: '',
  urgency: 'Standard',
  discount_amount: '',
  tax_rate: '0.18',
  status: 'draft',
};

const emptyItem = {
  item_name: '',
  description: '',
  quantity: 1,
  unit_price: '',
  discount_amount: '',
  tax_rate: '0.18',
};

export default function QuoteForm({ customers, inquiries, quote, onSave, onCancel, loading }) {
  const [formData, setFormData] = useState(initialState);
  const [items, setItems] = useState([emptyItem]);
  const [error, setError] = useState('');

  useEffect(() => {
    if (quote) {
      setFormData({
        customer_id: quote.customer_id || '',
        inquiry_id: quote.inquiry_id || '',
        box_type: quote.box_type || '',
        length: quote.length || '',
        width: quote.width || '',
        height: quote.height || '',
        quantity: quote.quantity || '',
        flute_type: quote.flute_type || '',
        ply: quote.ply || '',
        gsm: quote.gsm || '',
        printing_type: quote.printing_type || 'None',
        lamination: quote.lamination || 'None',
        tooling_cost: quote.tooling_cost || '',
        stitching: quote.stitching || '',
        urgency: quote.urgency || 'Standard',
        discount_amount: quote.discount_amount || '',
        tax_rate: quote.tax_rate || '0.18',
        status: quote.status || 'draft',
      });
      setItems(quote.items?.length ? quote.items : [{
        ...emptyItem,
        item_name: quote.box_type || '',
        quantity: quote.quantity || 1,
        unit_price: quote.unit_price || '',
      }]);
      setError('');
      return;
    }
    setFormData(initialState);
    setItems([emptyItem]);
    setError('');
  }, [quote]);

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleItemChange = (index, field, value) => {
    setItems((prev) => prev.map((item, itemIndex) => (itemIndex === index ? { ...item, [field]: value } : item)));
  };

  const addItem = () => setItems((prev) => [...prev, emptyItem]);

  const removeItem = (index) => {
    setItems((prev) => (prev.length === 1 ? prev : prev.filter((_, itemIndex) => itemIndex !== index)));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const validationError = validateQuotationInput(formData);
    if (validationError) {
      setError(validationError);
      return;
    }
    setError('');
    onSave({
      ...formData,
      dimensions: `${formData.length}x${formData.width}x${formData.height}`,
      tooling_cost: Number(formData.tooling_cost) || 0,
      quantity: Number(formData.quantity) || 0,
      created_at: quote?.created_at || new Date().toISOString(),
      quotation_items: items
        .filter((item) => item.item_name.trim())
        .map((item) => ({
          ...item,
          quantity: Number(item.quantity) || 1,
          unit_price: Number(item.unit_price) || 0,
          discount_amount: Number(item.discount_amount) || 0,
          tax_rate: Number(item.tax_rate) || 0,
        })),
    });
  };

  return (
    <div className="rounded-[32px] border border-slate-700 bg-slate-950/90 p-6 shadow-xl shadow-black/20">
      <div className="mb-5">
        <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Quotation details</p>
        <h2 className="mt-2 text-2xl font-black text-white">{quote ? 'Edit quote' : 'New quote'}</h2>
      </div>

      <form className="space-y-4" onSubmit={handleSubmit}>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block text-sm text-slate-300">
            Customer
            <select
              value={formData.customer_id}
              onChange={(event) => handleChange('customer_id', event.target.value)}
              className="mt-2 w-full rounded-3xl border border-slate-700 bg-slate-900/90 px-4 py-3 text-sm text-white outline-none transition focus:border-orange-400"
            >
              <option value="">Select customer</option>
              {customers.map((customer) => (
                <option key={customer.id} value={customer.id}>{customer.company_name || customer.full_name}</option>
              ))}
            </select>
          </label>

          <label className="block text-sm text-slate-300">
            Inquiry
            <select
              value={formData.inquiry_id}
              onChange={(event) => handleChange('inquiry_id', event.target.value)}
              className="mt-2 w-full rounded-3xl border border-slate-700 bg-slate-900/90 px-4 py-3 text-sm text-white outline-none transition focus:border-orange-400"
            >
              <option value="">Link inquiry (optional)</option>
              {inquiries.map((inquiry) => (
                <option key={inquiry.id} value={inquiry.id}>{inquiry.box_type} • {inquiry.status}</option>
              ))}
            </select>
          </label>
        </div>

        <div className="rounded-[28px] border border-slate-800 bg-slate-900/70 p-4">
          <div className="mb-4 flex items-center justify-between gap-4">
            <div>
              <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Quote items</p>
              <p className="mt-1 text-sm text-slate-300">Line items drive taxes, discounts, and locked order pricing.</p>
            </div>
            <button
              type="button"
              onClick={addItem}
              className="rounded-full border border-slate-700 px-4 py-2 text-xs font-semibold text-white transition hover:bg-slate-800"
            >
              Add item
            </button>
          </div>

          <div className="space-y-4">
            {items.map((item, index) => (
              <div key={`${index}-${item.id || 'new'}`} className="grid gap-3 rounded-3xl border border-slate-800 bg-slate-950/80 p-4 lg:grid-cols-[1.2fr_1fr_90px_120px_120px_100px_auto]">
                <input
                  type="text"
                  value={item.item_name}
                  onChange={(event) => handleItemChange(index, 'item_name', event.target.value)}
                  placeholder="Item name"
                  className="rounded-2xl border border-slate-700 bg-slate-900/90 px-3 py-2 text-sm text-white outline-none focus:border-orange-400"
                />
                <input
                  type="text"
                  value={item.description || ''}
                  onChange={(event) => handleItemChange(index, 'description', event.target.value)}
                  placeholder="Description"
                  className="rounded-2xl border border-slate-700 bg-slate-900/90 px-3 py-2 text-sm text-white outline-none focus:border-orange-400"
                />
                <input
                  type="number"
                  value={item.quantity}
                  onChange={(event) => handleItemChange(index, 'quantity', event.target.value)}
                  placeholder="Qty"
                  className="rounded-2xl border border-slate-700 bg-slate-900/90 px-3 py-2 text-sm text-white outline-none focus:border-orange-400"
                />
                <input
                  type="number"
                  value={item.unit_price}
                  onChange={(event) => handleItemChange(index, 'unit_price', event.target.value)}
                  placeholder="Unit price"
                  className="rounded-2xl border border-slate-700 bg-slate-900/90 px-3 py-2 text-sm text-white outline-none focus:border-orange-400"
                />
                <input
                  type="number"
                  value={item.discount_amount}
                  onChange={(event) => handleItemChange(index, 'discount_amount', event.target.value)}
                  placeholder="Discount"
                  className="rounded-2xl border border-slate-700 bg-slate-900/90 px-3 py-2 text-sm text-white outline-none focus:border-orange-400"
                />
                <input
                  type="number"
                  step="0.01"
                  value={item.tax_rate}
                  onChange={(event) => handleItemChange(index, 'tax_rate', event.target.value)}
                  placeholder="Tax"
                  className="rounded-2xl border border-slate-700 bg-slate-900/90 px-3 py-2 text-sm text-white outline-none focus:border-orange-400"
                />
                <button
                  type="button"
                  onClick={() => removeItem(index)}
                  className="rounded-2xl border border-slate-700 px-3 py-2 text-xs font-semibold text-slate-300 transition hover:bg-slate-800"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block text-sm text-slate-300">
            Box type
            <select
              value={formData.box_type}
              onChange={(event) => handleChange('box_type', event.target.value)}
              className="mt-2 w-full rounded-3xl border border-slate-700 bg-slate-900/90 px-4 py-3 text-sm text-white outline-none transition focus:border-orange-400"
            >
              <option value="">Select box type</option>
              {BOX_TYPES.map((option) => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
          </label>

          <label className="block text-sm text-slate-300">
            Quantity
            <input
              type="number"
              value={formData.quantity}
              onChange={(event) => handleChange('quantity', event.target.value)}
              placeholder="2500"
              className="mt-2 w-full rounded-3xl border border-slate-700 bg-slate-900/90 px-4 py-3 text-sm text-white outline-none transition focus:border-orange-400"
            />
          </label>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <label className="block text-sm text-slate-300">
            Length (mm)
            <input
              type="number"
              value={formData.length}
              onChange={(event) => handleChange('length', event.target.value)}
              placeholder="400"
              className="mt-2 w-full rounded-3xl border border-slate-700 bg-slate-900/90 px-4 py-3 text-sm text-white outline-none transition focus:border-orange-400"
            />
          </label>
          <label className="block text-sm text-slate-300">
            Width (mm)
            <input
              type="number"
              value={formData.width}
              onChange={(event) => handleChange('width', event.target.value)}
              placeholder="300"
              className="mt-2 w-full rounded-3xl border border-slate-700 bg-slate-900/90 px-4 py-3 text-sm text-white outline-none transition focus:border-orange-400"
            />
          </label>
          <label className="block text-sm text-slate-300">
            Height (mm)
            <input
              type="number"
              value={formData.height}
              onChange={(event) => handleChange('height', event.target.value)}
              placeholder="120"
              className="mt-2 w-full rounded-3xl border border-slate-700 bg-slate-900/90 px-4 py-3 text-sm text-white outline-none transition focus:border-orange-400"
            />
          </label>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <MaterialSelector value={formData.flute_type} onChange={(value) => handleChange('flute_type', value)} />
          <label className="block text-sm text-slate-300">
            Ply
            <select
              value={formData.ply}
              onChange={(event) => handleChange('ply', event.target.value)}
              className="mt-2 w-full rounded-3xl border border-slate-700 bg-slate-900/90 px-4 py-3 text-sm text-white outline-none transition focus:border-orange-400"
            >
              <option value="">Select ply</option>
              {PLY_OPTIONS.map((option) => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
          </label>
          <label className="block text-sm text-slate-300">
            GSM
            <select
              value={formData.gsm}
              onChange={(event) => handleChange('gsm', event.target.value)}
              className="mt-2 w-full rounded-3xl border border-slate-700 bg-slate-900/90 px-4 py-3 text-sm text-white outline-none transition focus:border-orange-400"
            >
              <option value="">Select GSM</option>
              {GSM_OPTIONS.map((option) => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
          </label>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <PrintingOptions value={formData.printing_type} onChange={(value) => handleChange('printing_type', value)} />
          <FinishingOptions value={formData.lamination} onChange={(value) => handleChange('lamination', value)} />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block text-sm text-slate-300">
            Die / punch
            <input
              type="text"
              value={formData.stitching}
              onChange={(event) => handleChange('stitching', event.target.value)}
              placeholder="Die-cut / stitching notes"
              className="mt-2 w-full rounded-3xl border border-slate-700 bg-slate-900/90 px-4 py-3 text-sm text-white outline-none transition focus:border-orange-400"
            />
          </label>
          <label className="block text-sm text-slate-300">
            Tooling cost
            <input
              type="number"
              value={formData.tooling_cost}
              onChange={(event) => handleChange('tooling_cost', event.target.value)}
              placeholder="₹0"
              className="mt-2 w-full rounded-3xl border border-slate-700 bg-slate-900/90 px-4 py-3 text-sm text-white outline-none transition focus:border-orange-400"
            />
          </label>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block text-sm text-slate-300">
            Urgency
            <select
              value={formData.urgency}
              onChange={(event) => handleChange('urgency', event.target.value)}
              className="mt-2 w-full rounded-3xl border border-slate-700 bg-slate-900/90 px-4 py-3 text-sm text-white outline-none transition focus:border-orange-400"
            >
              {URGENCY_OPTIONS.map((option) => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
          </label>
          <label className="block text-sm text-slate-300">
            Status
            <select
              value={formData.status}
              onChange={(event) => handleChange('status', event.target.value)}
              className="mt-2 w-full rounded-3xl border border-slate-700 bg-slate-900/90 px-4 py-3 text-sm text-white outline-none transition focus:border-orange-400"
            >
              <option value="draft">Draft</option>
              <option value="sent">Sent</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
              <option value="expired">Expired</option>
              <option value="revision_requested">Revision requested</option>
              <option value="revised">Revised</option>
              <option value="converted">Converted</option>
            </select>
          </label>
        </div>

        {error ? <p className="rounded-3xl border border-rose-600/20 bg-rose-600/10 px-4 py-3 text-sm text-rose-100">{error}</p> : null}

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-full bg-orange-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-orange-400 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
          >
            {loading ? 'Saving quote…' : quote ? 'Update quote' : 'Create quote'}
          </button>
          {quote ? (
            <button
              type="button"
              onClick={onCancel}
              className="w-full rounded-full border border-slate-700 bg-slate-900/80 px-5 py-3 text-sm font-semibold text-slate-200 transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
            >
              Cancel
            </button>
          ) : null}
        </div>
      </form>
    </div>
  );
}
