import { formatSalesOrderStatusLabel, salesOrderStatusClasses } from '../../utils/salesOrderHelpers';

export default function SalesOrderStatusBadge({ status }) {
  return (
    <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${salesOrderStatusClasses(status)}`}>
      {formatSalesOrderStatusLabel(status)}
    </span>
  );
}
