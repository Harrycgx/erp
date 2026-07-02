export default function KPIStrip({ items = [] }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-7 gap-2 mb-4">
      {items.map((item, idx) => (
        <div
          key={idx}
          className="
            bg-slate-900
            border border-slate-800
            rounded-lg
            px-3 py-2
            hover:border-slate-700
            transition-colors
            min-h-[70px]
            flex flex-col justify-center
          "
        >
          <div className="text-[10px] font-medium uppercase tracking-wider text-slate-500">
            {item.label}
          </div>

          <div className="mt-1 text-xl font-bold text-slate-100 leading-none">
            {item.value}
          </div>

          {item.change && (
            <div
              className={`mt-1 text-[11px] ${
                item.change.startsWith("+")
                  ? "text-emerald-400"
                  : "text-red-400"
              }`}
            >
              {item.change}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}