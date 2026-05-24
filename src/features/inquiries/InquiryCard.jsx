import InquiryStatusBadge from './InquiryStatusBadge';
import { formatTimestamp } from '../../utils/inquiryHelpers';

export default function InquiryCard({ inquiry, customer, onEdit, onDelete }) {
  return (
    <article className="rounded-[28px] border border-slate-700 bg-slate-950/90 p-5 shadow-xl shadow-black/20">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-slate-500">{customer?.company_name || 'Unlinked customer'}</p>
          <h3 className="mt-2 text-xl font-semibold text-white">{inquiry.box_type || 'Box inquiry'}</h3>
          <p className="mt-1 text-sm text-slate-400">{customer?.full_name || 'No customer selected'}</p>
        </div>
        <InquiryStatusBadge status={inquiry.status} />
      </div>

      <div className="mt-5 grid gap-3 text-sm text-slate-300 sm:grid-cols-2">
        <div>
          <p className="font-semibold text-slate-100">Quantity</p>
          <p>{inquiry.quantity || '—'}</p>
        </div>
        <div>
          <p className="font-semibold text-slate-100">Priority</p>
          <p>{inquiry.priority || 'Normal'}</p>
        </div>
        <div>
          <p className="font-semibold text-slate-100">Follow-up</p>
          <p>{formatTimestamp(inquiry.follow_up_date)}</p>
        </div>
        <div>
          <p className="font-semibold text-slate-100">Assigned</p>
          <p>{inquiry.assigned_to || 'Unassigned'}</p>
        </div>
      </div>

      {inquiry.notes ? (
        <div className="mt-4 rounded-3xl border border-slate-800 bg-slate-900/80 p-4 text-sm text-slate-300">
          <p className="font-semibold text-slate-100">Notes</p>
          <p className="mt-2 leading-6">{inquiry.notes}</p>
        </div>
      ) : null}

      <div className="mt-5 flex flex-wrap gap-3">
        <button
          type="button"
          onClick={() => onEdit(inquiry)}
          className="rounded-full border border-slate-700 bg-slate-900/80 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
        >
          Edit
        </button>
        <button
          type="button"
          onClick={() => onDelete(inquiry)}
          className="rounded-full border border-rose-600 bg-rose-600/10 px-4 py-2 text-sm font-semibold text-rose-200 transition hover:bg-rose-600/20"
        >
          Delete
        </button>
      </div>
    </article>
  );
}
