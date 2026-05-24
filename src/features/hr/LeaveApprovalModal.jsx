export default function LeaveApprovalModal({ open, request, onClose, onApprove, onReject }) {
  if (!open || !request) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4">
      <div className="w-full max-w-xl rounded-[32px] border border-slate-700 bg-slate-950/95 p-6 shadow-xl shadow-black/50">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Leave approval</p>
            <h2 className="mt-2 text-2xl font-black text-white">Review request</h2>
          </div>
          <button type="button" onClick={onClose} className="text-slate-300 hover:text-white">✕</button>
        </div>
        <div className="mt-6 grid gap-4">
          <div className="rounded-3xl bg-slate-900/90 p-4">
            <p className="text-sm uppercase tracking-[0.24em] text-slate-400">Employee</p>
            <p className="mt-2 text-white">{request.employee_name || request.employee_id}</p>
            <p className="mt-1 text-slate-400">{request.leave_type}</p>
          </div>
          <div className="rounded-3xl bg-slate-900/90 p-4">
            <p className="text-sm uppercase tracking-[0.24em] text-slate-400">Period</p>
            <p className="mt-2 text-white">{request.start_date} — {request.end_date}</p>
            <p className="mt-1 text-slate-400">Reason: {request.reason || 'Not provided'}</p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={() => onReject(request.id)}
              className="rounded-full bg-rose-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-rose-400"
            >Reject</button>
            <button
              type="button"
              onClick={() => onApprove(request.id)}
              className="rounded-full bg-emerald-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-400"
            >Approve</button>
          </div>
        </div>
      </div>
    </div>
  );
}
