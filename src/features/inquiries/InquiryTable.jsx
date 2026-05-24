import InquiryStatusBadge from './InquiryStatusBadge';
import { formatTimestamp } from '../../utils/inquiryHelpers';

export default function InquiryTable({ inquiries, customers, onEdit, onDelete }) {
  const findCustomer = (customerId) => customers.find((item) => item.id === customerId);

  if (!inquiries.length) {
    return (
      <div className="rounded-[32px] border border-dashed border-slate-700 bg-slate-950/90 p-10 text-center text-slate-400">
        <p className="text-base font-medium">No inquiries match the current filters.</p>
        <p className="mt-2 text-sm text-slate-500">Create a new inquiry to start tracking customer conversations.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-[32px] border border-slate-700 bg-slate-950/90 shadow-xl shadow-black/20">
      <table className="min-w-full table-auto border-collapse text-left text-sm text-slate-300">
        <thead className="border-b border-slate-800 bg-slate-950/95 text-slate-400">
          <tr>
            <th className="px-5 py-4">Customer</th>
            <th className="px-5 py-4">Box type</th>
            <th className="px-5 py-4">Status</th>
            <th className="px-5 py-4">Priority</th>
            <th className="px-5 py-4">Follow-up</th>
            <th className="px-5 py-4">Assigned</th>
            <th className="px-5 py-4">Actions</th>
          </tr>
        </thead>
        <tbody>
          {inquiries.map((inquiry) => {
            const customer = findCustomer(inquiry.customer_id);
            return (
              <tr key={inquiry.id} className="border-b border-slate-800 hover:bg-slate-900/70">
                <td className="px-5 py-4">
                  <p className="font-semibold text-white">{customer?.company_name || inquiry.customer_id || 'Unknown'}</p>
                  <p className="text-xs text-slate-500">{customer?.full_name || 'Customer record'}</p>
                </td>
                <td className="px-5 py-4 text-slate-200">{inquiry.box_type}</td>
                <td className="px-5 py-4">
                  <InquiryStatusBadge status={inquiry.status} />
                </td>
                <td className="px-5 py-4 text-slate-200">{inquiry.priority}</td>
                <td className="px-5 py-4 text-slate-200">{formatTimestamp(inquiry.follow_up_date)}</td>
                <td className="px-5 py-4 text-slate-200">{inquiry.assigned_to || '—'}</td>
                <td className="px-5 py-4">
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => onEdit(inquiry)}
                      className="rounded-full border border-slate-700 bg-slate-900/80 px-3 py-2 text-xs font-semibold text-white transition hover:bg-slate-800"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => onDelete(inquiry)}
                      className="rounded-full border border-rose-600 bg-rose-600/10 px-3 py-2 text-xs font-semibold text-rose-200 transition hover:bg-rose-600/20"
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
