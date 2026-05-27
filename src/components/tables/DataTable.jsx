import EmptyState from "../ui/EmptyState";
import StatusBadge from "../ui/StatusBadge";

export default function DataTable({
  columns = [],
  data = [],
}) {
  if (!data.length) {
    return (
      <EmptyState
        title="No Records Found"
        description="No operational records available."
      />
    );
  }

  return (
    <div className="overflow-hidden rounded-3xl border border-white/10 bg-[#111827] shadow-xl">
      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead className="border-b border-white/10 bg-black/20">
            <tr>
              {columns.map((column) => (
                <th
                  key={column.key}
                  className="px-6 py-4 text-left text-sm font-semibold uppercase tracking-[0.15em] text-slate-400"
                >
                  {column.label}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {data.map((row, index) => (
              <tr
                key={index}
                className="border-b border-white/5 transition hover:bg-white/5"
              >
                {columns.map((column) => (
                  <td
                    key={column.key}
                    className="px-6 py-5 text-slate-200"
                  >
                    {column.key === "status" ? (
  <StatusBadge
    status={row[column.key]}
  />
) : (
  row[column.key]
)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}