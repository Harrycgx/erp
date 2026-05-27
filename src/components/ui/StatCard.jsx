export default function StatCard({
  title,
  value,
  icon: Icon,
  color,
  suffix = "",
}) {
  return (
    <div
      className={`group relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br ${color} p-6 shadow-xl transition duration-300 hover:-translate-y-2 hover:shadow-orange-500/10`}
    >
      <div className="absolute right-4 top-4 opacity-10">
        <Icon size={90} />
      </div>

      <div className="relative z-10">
        <div className="mb-6 flex items-center gap-3">
          <div className="rounded-2xl bg-white/10 p-3">
            <Icon size={24} className="text-white" />
          </div>

          <p className="text-sm uppercase tracking-[0.2em] text-slate-300">
            {title}
          </p>
        </div>

        <h2 className="text-5xl font-black text-white">
          {value}
          {suffix}
        </h2>

        <div className="mt-5 text-sm text-green-400">
          Live operational data
        </div>
      </div>
    </div>
  );
}