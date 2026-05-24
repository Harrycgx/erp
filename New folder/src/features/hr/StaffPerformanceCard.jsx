export default function StaffPerformanceCard({ metrics = {} }) {
  return (
    <div className="rounded-[32px] border border-slate-700 bg-slate-950/90 p-6 shadow-xl shadow-black/20">
      <div className="mb-4">
        <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Staff performance</p>
        <h2 className="mt-2 text-2xl font-black text-white">Factory workforce metrics</h2>
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-3xl bg-slate-900/90 p-4">
          <p className="text-sm uppercase tracking-[0.24em] text-slate-400">Attendance consistency</p>
          <p className="mt-3 text-3xl font-black text-white">{metrics.attendanceConsistency || 0}%</p>
        </div>
        <div className="rounded-3xl bg-slate-900/90 p-4">
          <p className="text-sm uppercase tracking-[0.24em] text-slate-400">Shift efficiency</p>
          <p className="mt-3 text-3xl font-black text-white">{metrics.shiftEfficiency || 0}%</p>
        </div>
        <div className="rounded-3xl bg-slate-900/90 p-4">
          <p className="text-sm uppercase tracking-[0.24em] text-slate-400">Overtime trend</p>
          <p className="mt-3 text-3xl font-black text-white">{metrics.overtimeTrend || 0}h</p>
        </div>
      </div>
    </div>
  );
}
