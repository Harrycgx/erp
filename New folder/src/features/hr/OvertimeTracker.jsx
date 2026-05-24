export default function OvertimeTracker({ records = [] }) {
  const totalOvertime = records.reduce((sum, record) => sum + Number(record.overtime_hours || 0), 0);
  const average = records.length ? (totalOvertime / records.length).toFixed(1) : 0;

  return (
    <div className="rounded-[32px] border border-slate-700 bg-slate-950/90 p-6 shadow-xl shadow-black/20">
      <div className="mb-4">
        <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Overtime</p>
        <h2 className="mt-2 text-2xl font-black text-white">Overtime tracker</h2>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-3xl bg-slate-900/90 p-4">
          <p className="text-sm uppercase tracking-[0.24em] text-slate-400">Total overtime hours</p>
          <p className="mt-3 text-3xl font-black text-white">{totalOvertime}h</p>
        </div>
        <div className="rounded-3xl bg-slate-900/90 p-4">
          <p className="text-sm uppercase tracking-[0.24em] text-slate-400">Average daily</p>
          <p className="mt-3 text-3xl font-black text-white">{average}h</p>
        </div>
      </div>
    </div>
  );
}
