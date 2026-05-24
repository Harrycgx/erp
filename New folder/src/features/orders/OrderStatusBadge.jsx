import { orderStatusClasses } from '../../utils/orderHelpers';

export default function OrderStatusBadge({ status }) {
  return (
    <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.3em] ${orderStatusClasses(status)}`}>
      {status}
    </span>
  );
}
