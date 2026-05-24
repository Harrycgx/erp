import { getInvoiceStatus, getStatusClass } from '../../utils/financeHelpers';

export default function InvoiceStatusBadge({ invoice }) {
  const label = getInvoiceStatus({
    total: invoice.total_amount ?? invoice.total,
    paid: invoice.paid_amount,
    dueDate: invoice.due_date,
    status: invoice.status,
  });

  return (
    <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${getStatusClass(label)}`}>
      {label}
    </span>
  );
}
