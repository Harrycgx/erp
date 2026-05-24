import InquiryStatusBadge from './InquiryStatusBadge';
import { formatTimestamp } from '../../utils/inquiryHelpers';

export default function CustomerDetails({ customer, inquiries }) {
  if (!customer) {
    return (
      <div className="rounded-[32px] border border-dashed border-slate-700 bg-slate-950/90 p-10 text-center text-slate-400">
        <p className="text-base font-medium">Select a customer to view inquiry history.</p>
        <p className="mt-2 text-sm text-slate-500">Customer activity and repeat order details appear here.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 rounded-[32px] border border-slate-700 bg-slate-950/90 p-6 shadow-xl shadow-black/20">
      <div>
        <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Customer details</p>
        <h2 className="mt-2 text-2xl font-black text-white">{customer.company_name}</h2>
        <p className="mt-1 text-sm text-slate-300">{customer.full_name}</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-4">
          <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Contact</p>
          <p className="mt-2 text-sm text-slate-200">{customer.phone}</p>
          <p className="mt-1 text-sm text-slate-500">{customer.email}</p>
        </div>
        <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-4">
          <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Location</p>
          <p className="mt-2 text-sm text-slate-200">{customer.address || 'Not provided'}</p>
          <p className="mt-1 text-sm text-slate-500">GST: {customer.gst_number || 'N/A'}</p>
        </div>
      </div>

      <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-4">
        <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Notes</p>
        <p className="mt-2 text-sm text-slate-300">{customer.notes || 'No notes available.'}</p>
      </div>

      <div className="rounded-[28px] border border-slate-700 bg-slate-950/90 p-4">
        <div className="mb-4 flex items-center justify-between gap-4">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Inquiry history</p>
            <h3 className="mt-2 text-xl font-black text-white">Recent customer requests</h3>
          </div>
          <span className="rounded-full bg-slate-800 px-3 py-2 text-xs uppercase tracking-[0.3em] text-slate-300">{inquiries.length} inquiries</span>
        </div>

        <div className="space-y-4">
          {inquiries.length ? (
            inquiries.map((inquiry) => (
              <div key={inquiry.id} className="rounded-3xl border border-slate-800 bg-slate-900/80 p-4">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <p className="font-semibold text-white">{inquiry.box_type}</p>
                    <p className="text-sm text-slate-400">Quantity: {inquiry.quantity}</p>
                  </div>
                  <InquiryStatusBadge status={inquiry.status} />
                </div>
                <div className="mt-3 grid gap-3 sm:grid-cols-3 text-sm text-slate-400">
                  <p>Priority: {inquiry.priority}</p>
                  <p>Follow-up: {formatTimestamp(inquiry.follow_up_date)}</p>
                  <p>Assigned: {inquiry.assigned_to || 'TBD'}</p>
                </div>
                {inquiry.notes ? <p className="mt-3 text-sm leading-6 text-slate-300">{inquiry.notes}</p> : null}
              </div>
            ))
          ) : (
            <p className="text-sm text-slate-400">No historical inquiries found for this customer.</p>
          )}
        </div>
      </div>
    </div>
  );
}
