import { useEffect, useMemo, useState } from 'react';
import ProductionTimeline from './ProductionTimeline';
import StaffAssignment from './StaffAssignment';
import QCChecklist from './QCChecklist';
import { formatDateTime } from '../../utils/productionHelpers';

export default function ProductionDetails({ job, onUpdateJob }) {
  const [notes, setNotes] = useState(job?.notes || '');

  useEffect(() => {
    setNotes(job?.notes || '');
  }, [job]);

  const details = useMemo(
    () => [
      { label: 'Order', value: job?.order_number || `Order ${job?.order_id || job?.id}` },
      { label: 'Customer', value: job?.customer_name || 'Mayur client' },
      { label: 'Machine', value: job?.machine_name || 'Unassigned' },
      { label: 'Priority', value: job?.priority || 'Normal' },
      { label: 'Created', value: formatDateTime(job?.created_at) },
      { label: 'Updated', value: formatDateTime(job?.actual_completion || job?.created_at) },
    ],
    [job]
  );

  const handleSaveNotes = () => {
    if (!job?.id) return;
    onUpdateJob(job.id, { notes });
  };

  return (
    <aside className="space-y-6 rounded-[32px] border border-slate-700 bg-slate-950/95 p-6 shadow-xl shadow-black/20">
      <div>
        <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Production details</p>
        <h2 className="mt-2 text-2xl font-black text-white">Job overview</h2>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {details.map((item) => (
          <div key={item.label} className="rounded-3xl border border-slate-800 bg-slate-900/85 p-4">
            <p className="text-xs uppercase tracking-[0.3em] text-slate-400">{item.label}</p>
            <p className="mt-2 text-sm font-semibold text-white">{item.value}</p>
          </div>
        ))}
      </div>

      <StaffAssignment job={job} onUpdateJob={onUpdateJob} />

      <div className="rounded-3xl border border-slate-800 bg-slate-900/85 p-4">
        <div className="flex items-center justify-between gap-3">
          <p className="text-sm font-semibold text-white">Production notes</p>
          <button
            type="button"
            onClick={handleSaveNotes}
            className="rounded-full border border-slate-700 bg-slate-900/90 px-4 py-2 text-xs font-semibold text-slate-100 transition hover:bg-slate-800"
          >
            Save
          </button>
        </div>
        <textarea
          value={notes}
          onChange={(event) => setNotes(event.target.value)}
          rows={5}
          className="mt-4 w-full rounded-3xl border border-slate-800 bg-slate-950/90 p-4 text-sm text-slate-100 outline-none transition focus:border-orange-400"
        />
      </div>

      <QCChecklist />

      <ProductionTimeline currentStage={job?.production_stage} />
    </aside>
  );
}
