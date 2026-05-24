import { QUOTE_STATUSES } from '../../utils/quotationHelpers';

const items = [
  { status: '', label: 'All' },
  { status: QUOTE_STATUSES.DRAFT, label: 'Draft' },
  { status: QUOTE_STATUSES.SENT, label: 'Sent' },
  { status: QUOTE_STATUSES.APPROVED, label: 'Approved' },
  { status: QUOTE_STATUSES.REJECTED, label: 'Rejected' },
  { status: QUOTE_STATUSES.EXPIRED, label: 'Expired' },
  { status: QUOTE_STATUSES.REVISION_REQUESTED, label: 'Revision requested' },
  { status: QUOTE_STATUSES.REVISED, label: 'Revised' },
  { status: QUOTE_STATUSES.CONVERTED, label: 'Converted' },
];

export default function QuoteFilters({ activeStatus, onStatusChange, counts = {} }) {
  return (
    <div className="flex flex-wrap gap-2">
      {items.map((item) => (
        <button
          type="button"
          key={item.status || 'all'}
          onClick={() => onStatusChange(item.status)}
          className={`rounded-full border px-4 py-2 text-xs font-semibold transition ${
            activeStatus === item.status
              ? 'border-orange-400 bg-orange-500 text-slate-950'
              : 'border-slate-700 bg-slate-950/70 text-slate-300 hover:border-slate-500 hover:bg-slate-900/80'
          }`}
        >
          {item.label}
          {counts[item.status] !== undefined ? ` · ${counts[item.status]}` : ''}
        </button>
      ))}
    </div>
  );
}
