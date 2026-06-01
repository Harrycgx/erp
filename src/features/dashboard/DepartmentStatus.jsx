export default function DepartmentStatus() {
  const departments = [
    {
      name: "Production",
      status: "Online",
      color: "bg-green-500",
    },
    {
      name: "Inventory",
      status: "Online",
      color: "bg-green-500",
    },
    {
      name: "Finance",
      status: "Online",
      color: "bg-green-500",
    },
    {
      name: "Procurement",
      status: "Online",
      color: "bg-green-500",
    },
    {
      name: "Dispatch",
      status: "Online",
      color: "bg-green-500",
    },
  ];

  return (
    <div className="rounded-3xl border border-white/10 bg-[#111827] p-6 shadow-xl">
      <h2 className="mb-6 text-2xl font-bold text-white">
        Department Status
      </h2>

      <div className="space-y-5">
        {departments.map(
          (dept) => (
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
                    ERP module monitoring
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <div
                    className={`h-3 w-3 rounded-full ${dept.color}`}
                  />

                  <span className="text-slate-300">
                    {dept.status}
                  </span>
                </div>
              </div>
            </div>
          )
        )}
      </div>
    </div>
  );
}