import { useEffect, useMemo, useState } from 'react';
import { BOX_TYPES, FLUTE_TYPES, PLY_OPTIONS, GSM_OPTIONS, PRINTING_TYPES, LAMINATION_OPTIONS, URGENCY_OPTIONS } from '../../utils/quotationHelpers';
import { validateQuotationInput } from '../../utils/validationHelpers';
import { buildQuotationFinancials } from '../../services/quotationCalculationService';
import MaterialSelector from './MaterialSelector';
import PrintingOptions from './PrintingOptions';
import FinishingOptions from './FinishingOptions';
import QuotationItemEditor from './QuotationItemEditor';
import QuotationTotalsPanel from './QuotationTotalsPanel';

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

  const financials = useMemo(() => buildQuotationFinancials(formData, items), [formData, items]);

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
    const validationError = validateQuotationInput(formData, items);
    if (validationError) {
      setError(validationError);
      return;
    }
    setError('');
    onSave({
      ...financials.quotation,
      ...formData,
      dimensions: `${formData.length}x${formData.width}x${formData.height}`,
      tooling_cost: Number(formData.tooling_cost) || 0,
      quantity: Number(formData.quantity) || financials.quotation.quantity || 0,
      subtotal: financials.totals.subtotal,
      discount_amount: financials.totals.discount_amount,
      gst_amount: financials.totals.gst_amount,
      tax_amount: financials.totals.tax_amount,
      total: financials.totals.total,
      total_amount: financials.totals.total_amount,
      created_at: quote?.created_at || new Date().toISOString(),
      quotation_items: financials.items.filter((item) => String(item.item_name || '').trim()),
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

        <QuotationItemEditor
          items={items}
          calculatedItems={financials.items}
          onItemChange={handleItemChange}
          onAddItem={addItem}
          onRemoveItem={removeItem}
        />

        <QuotationTotalsPanel totals={financials.totals} />

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
