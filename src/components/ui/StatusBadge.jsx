const statusStyles = {
  draft: "bg-slate-500/10 text-slate-400 border border-slate-500/20",
  submitted: "bg-blue-500/10 text-blue-400 border border-blue-500/20",
  approved: "bg-green-500/10 text-green-400 border border-green-500/20",
  production: "bg-orange-500/10 text-orange-400 border border-orange-500/20",
  qc: "bg-yellow-500/10 text-yellow-400 border border-yellow-500/20",
  dispatch: "bg-purple-500/10 text-purple-400 border border-purple-500/20",
  completed: "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20",
};

export default function StatusBadge({ status }) {
  // Fallback for null/undefined status
  const currentStyle = statusStyles[status?.toLowerCase()] || "bg-slate-500/10 text-slate-400 border border-slate-500/20";

  return (
    <span
      className={`
        inline-flex items-center justify-center
        rounded-full px-2.5 py-0.5
        text-[10px] font-bold uppercase tracking-wider
        ${currentStyle}
      `}
    >
      {status || "N/A"}
    </span>
  );
}