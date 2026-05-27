const statusStyles = {
  draft:
    "bg-slate-500/20 text-slate-300",

  submitted:
    "bg-blue-500/20 text-blue-300",

  approved:
    "bg-green-500/20 text-green-300",

  production:
    "bg-orange-500/20 text-orange-300",

  qc:
    "bg-yellow-500/20 text-yellow-300",

  dispatch:
    "bg-purple-500/20 text-purple-300",

  completed:
    "bg-emerald-500/20 text-emerald-300",
};

export default function StatusBadge({
  status,
}) {
  return (
    <span
      className={`
        rounded-full
        px-3 py-1
        text-xs font-semibold
        capitalize
        ${
          statusStyles[status] ||
          "bg-white/10 text-white"
        }
      `}
    >
      {status}
    </span>
  );
}