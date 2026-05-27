const departments = [
  {
    name: "Production",
    status: "Operational",
    color: "bg-green-500",
  },
  {
    name: "Inventory",
    status: "Low Stock Warning",
    color: "bg-yellow-500",
  },
  {
    name: "Finance",
    status: "Healthy",
    color: "bg-blue-500",
  },
  {
    name: "Procurement",
    status: "Pending Approval",
    color: "bg-orange-500",
  },
];

export default function DepartmentStatus() {
  return (
    <div className="rounded-3xl border border-white/10 bg-[#111827] p-6 shadow-xl">
      <h2 className="mb-6 text-2xl font-bold text-white">
        Department Status
      </h2>

      <div className="space-y-5">
        {departments.map((dept) => (
          <div
            key={dept.name}
            className="rounded-2xl border border-white/5 bg-black/20 p-5"
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-semibold text-white">
                  {dept.name}
                </h3>

                <p className="mt-1 text-slate-400">
                  ERP operational monitoring
                </p>
              </div>

              <div className="flex items-center gap-3">
                <div className={`h-3 w-3 rounded-full ${dept.color}`} />

                <span className="text-slate-300">
                  {dept.status}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}