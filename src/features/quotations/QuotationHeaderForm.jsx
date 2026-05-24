import { BOX_TYPES, URGENCY_OPTIONS } from '../../utils/quotationHelpers';
import { QUOTATION_STATUSES } from '../../services/quotationService';

const fieldClass =
  'mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-slate-500';

export default function QuotationHeaderForm({
  quotation,
  customers = [],
  inquiries = [],
  onFieldChange,
}) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Quotation header</p>

      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        <label className="block text-sm text-slate-700">
          Customer <span className="text-rose-600">*</span>
          <select
            value={quotation.customer_id}
            onChange={(e) => onFieldChange('customer_id', e.target.value)}
            className={fieldClass}
          >
            <option value="">Select customer</option>
            {customers.map((customer) => (
              <option key={customer.id} value={customer.id}>
                {customer.company_name || customer.full_name}
              </option>
            ))}
          </select>
        </label>

        <label className="block text-sm text-slate-700">
          Linked inquiry
          <select
            value={quotation.inquiry_id || ''}
            onChange={(e) => onFieldChange('inquiry_id', e.target.value)}
            className={fieldClass}
          >
            <option value="">Optional</option>
            {inquiries.map((inquiry) => (
              <option key={inquiry.id} value={inquiry.id}>
                {inquiry.box_type} — {inquiry.status}
              </option>
            ))}
          </select>
        </label>

        <label className="block text-sm text-slate-700">
          Box type
          <select value={quotation.box_type} onChange={(e) => onFieldChange('box_type', e.target.value)} className={fieldClass}>
            <option value="">Select type</option>
            {BOX_TYPES.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </label>

        <label className="block text-sm text-slate-700">
          Urgency
          <select value={quotation.urgency} onChange={(e) => onFieldChange('urgency', e.target.value)} className={fieldClass}>
            {URGENCY_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </label>

        <label className="block text-sm text-slate-700">
          Valid until
          <input
            type="date"
            value={quotation.valid_until || ''}
            onChange={(e) => onFieldChange('valid_until', e.target.value)}
            className={fieldClass}
          />
        </label>

        <label className="block text-sm text-slate-700">
          Status
          <select value={quotation.status} onChange={(e) => onFieldChange('status', e.target.value)} className={fieldClass}>
            <option value={QUOTATION_STATUSES.DRAFT}>Draft</option>
            <option value={QUOTATION_STATUSES.SENT}>Sent</option>
          </select>
        </label>

        <label className="block text-sm text-slate-700 sm:col-span-2">
          Internal notes
          <textarea
            rows={2}
            value={quotation.notes || ''}
            onChange={(e) => onFieldChange('notes', e.target.value)}
            className={fieldClass}
            placeholder="Production notes, delivery constraints, etc."
          />
        </label>
      </div>
    </div>
  );
}
