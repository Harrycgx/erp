export default function DepartmentCard({ counts = {} }) {
  return (
    <div className="rounded-[32px] border border-slate-700 bg-slate-950/90 p-6 shadow-xl shadow-black/20">
      <div className="mb-4">
        <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Departments</p>
        <h2 className="mt-2 text-2xl font-black text-white">Department overview</h2>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Object.entries(counts).map(([department, count]) => (
          <div key={department} className="rounded-3xl bg-slate-900/90 p-4">
            <p className="text-sm uppercase tracking-[0.24em] text-slate-400">{department}</p>
            <p className="mt-3 text-3xl font-black text-white">{count}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
