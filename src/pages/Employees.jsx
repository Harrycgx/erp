import PageContainer from "../components/PageContainer";

const employees = [
  {
    name: "Raj Sharma",
    role: "Production Manager",
  },
  {
    name: "Priya Singh",
    role: "Procurement Officer",
  },
  {
    name: "Aman Verma",
    role: "Inventory Lead",
  },
];

export default function Employees() {
  return (
    <PageContainer
      title="Employees"
      description="Manage employee operations and workforce records."
    >
      <div className="space-y-4">
        {employees.map((employee) => (
          <div
            key={employee.name}
            className="rounded-2xl bg-black/30 p-5"
          >
            <h2 className="text-2xl font-semibold text-white">
              {employee.name}
            </h2>

            <p className="mt-2 text-slate-400">
              {employee.role}
            </p>
          </div>
        ))}
      </div>
    </PageContainer>
  );
}