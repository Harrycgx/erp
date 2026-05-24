import { getPoBadgeClasses } from '../../utils/procurementHelpers';

export default function PurchaseOrderStatusBadge({ status }) {
  return (
    <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.3em] ${getPoBadgeClasses(status)}`}>
      {status || 'Draft'}
    </span>
  );
}
