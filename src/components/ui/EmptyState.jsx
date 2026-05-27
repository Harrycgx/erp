export default function EmptyState({
  title = "No Data Found",
  description = "There is currently no data available.",
}) {
  return (
    <div className="rounded-3xl border border-white/10 bg-[#111827] p-12 text-center">
      <h2 className="text-3xl font-black text-white">
        {title}
      </h2>

      <p className="mt-4 text-slate-400">
        {description}
      </p>
    </div>
  );
}