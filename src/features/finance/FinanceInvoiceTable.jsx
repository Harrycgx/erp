import { Link } from 'react-router-dom';
import { formatCurrency } from '../../utils/formatters';
import { formatDate } from '../../utils/financeHelpers';
import InvoiceStatusBadge from './InvoiceStatusBadge';

export default function FinanceInvoiceTable({ invoices = [], customers = [], loading }) {
  if (loading) {
    return <p className="py-6 text-center text-sm text-slate-400">Loading invoices…</p>;
  }

  if (!invoices.length) {
    return <p className="py-6 text-center text-sm text-slate-400">No invoices yet. Invoices generate when production reaches dispatch ready.</p>;
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-slate-700 bg-slate-950/90">
      <table className="w-full min-w-[720px] text-left text-sm">
        <thead className="border-b border-slate-700 bg-slate-900/80 text-xs uppercase text-slate-400">
          <tr>
            <th className="px-4 py-3">Invoice</th>
            <th className="px-4 py-3">Customer</th>
            <th className="px-4 py-3">Total</th>
            <th className="px-4 py-3">Due</th>
            <th className="px-4 py-3">Status</th>
            <th className="px-4 py-3">Due date</th>
          </tr>
        </thead>
        <tbody>
          {invoices.map((invoice) => {
            const customer = customers.find((c) => c.id === invoice.customer_id);
            return (
              <tr key={invoice.id} className="border-b border-slate-800 hover:bg-slate-900/50">
                <td className="px-4 py-3">
                  <Link to={`/invoices/${invoice.id}`} className="font-medium text-orange-400 hover:text-orange-300">
                    {invoice.invoice_number}
                  </Link>
                </td>
                <td className="px-4 py-3 text-slate-300">{customer?.company_name || customer?.full_name || '—'}</td>
                <td className="px-4 py-3 text-slate-200">{formatCurrency(invoice.total_amount ?? invoice.total)}</td>
                <td className="px-4 py-3 text-slate-300">{formatCurrency(invoice.due_amount ?? 0)}</td>
                <td className="px-4 py-3">
                  <InvoiceStatusBadge invoice={invoice} />
                </td>
                <td className="px-4 py-3 text-slate-500">{formatDate(invoice.due_date)}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
