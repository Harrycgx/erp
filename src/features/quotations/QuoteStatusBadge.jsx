import { quoteStatusClasses } from '../../utils/quotationHelpers';

export default function QuoteStatusBadge({ status }) {
  const label = String(status || 'draft').replace(/_/g, ' ');
  return (
    <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.3em] ${quoteStatusClasses(status)}`}>
      {label}
    </span>
  );
}
