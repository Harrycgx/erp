import { statusClasses } from '../../modules/orders/orderStatus';

export default function StatusBadge({ status }) {
  const classes = statusClasses[status] ?? statusClasses['Quote Requested'];
  return (
    <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.3em] ${classes}`}>
      {status}
    </span>
  );
}
