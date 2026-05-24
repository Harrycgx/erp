import { getLeaveStatusClass } from '../../utils/leaveHelpers';

export default function LeaveRequestTable({ requests = [], onApprove, onReject }) {
  return (
    <div className="overflow-x-auto rounded-[32px] border border-slate-700 bg-slate-950/90 p-4 shadow-xl shadow-black/20">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Leave management</p>
          <h2 className="mt-2 text-2xl font-black text-white">Leave requests</h2>
        </div>
      </div>
      <table className="min-w-full divide-y divide-slate-800 text-sm text-slate-300">
        <thead>
          <tr>
            <th className="px-4 py-3 text-left uppercase tracking-[0.3em] text-slate-500">Employee</th>
            <th className="px-4 py-3 text-left uppercase tracking-[0.3em] text-slate-500">Type</th>
            <th className="px-4 py-3 text-left uppercase tracking-[0.3em] text-slate-500">Period</th>
            <th className="px-4 py-3 text-left uppercase tracking-[0.3em] text-slate-500">Status</th>
            <th className="px-4 py-3 text-left uppercase tracking-[0.3em] text-slate-500">Action</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-800">
          {requests.map((request) => (
            <tr key={request.id} className="hover:bg-slate-900/80">
              <td className="px-4 py-4 text-white">{request.employee_name || request.employee_id}</td>
              <td className="px-4 py-4 text-slate-300">{request.leave_type}</td>
              <td className="px-4 py-4 text-slate-300">{request.start_date} — {request.end_date}</td>
              <td className="px-4 py-4">
                <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.3em] ${getLeaveStatusClass(request.approval_status)}`}>
                  {request.approval_status}
                </span>
              </td>
              <td className="px-4 py-4 space-x-2">
                {request.approval_status === 'Pending' ? (
                  <>
                    <button
                      type="button"
                      onClick={() => onApprove(request.id)}
                      className="rounded-full bg-emerald-500 px-3 py-2 text-xs font-semibold text-white transition hover:bg-emerald-400"
                    >Approve</button>
                    <button
                      type="button"
                      onClick={() => onReject(request.id)}
                      className="rounded-full bg-rose-500 px-3 py-2 text-xs font-semibold text-white transition hover:bg-rose-400"
                    >Reject</button>
                  </>
                ) : (
                  <span className="text-slate-400">No action</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
