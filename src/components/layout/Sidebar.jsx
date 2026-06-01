import { NavLink } from "react-router-dom";

export default function Sidebar() {
  const navItems = [
    {
      label: "Dashboard",
      path: "/dashboard",
    },
    {
      label: "Customers",
      path: "/customers",
    },
    {
      label: "Quotations",
      path: "/quotations",
    },
    {
      label: "Orders",
      path: "/orders",
    },
    {
      label: "Production",
      path: "/production",
    },
    {
      label: "Inventory",
      path: "/inventory",
    },
    {
      label: "Procurement",
      path: "/procurement",
    },
    {
      label: "Dispatch",
      path: "/dispatch",
    },
    {
      label: "Finance",
      path: "/finance",
    },
    {
      label: "Inventory Ledger",
      path: "/inventory-ledger",
    },
    {
      label: "Finance Ledger",
      path: "/finance-ledger",
    },
    {
      label: "AI Insights",
      path: "/ai-insights",
    },
    {
  label: "Analytics",
  path: "/analytics",
},
{
  label: "Employees",
  path: "/employees",
},
{
  label: "Import Center",
  path: "/imports",
},
{
  label: "Audit Logs",
  path: "/audit-logs",
},
{
  label: "AI",
  path: "/ai",
},
  ];

  return (
    <aside
      className="
        min-h-screen
        w-72
        border-r border-white/10
        bg-[#0f172a]
        p-6
      "
    >
      <div className="mb-10">
        <h1 className="text-4xl font-black text-orange-500">
          BOXIQ ERP
        </h1>

        <p className="mt-2 text-sm text-slate-400">
          Manufacturing Intelligence Workspace
        </p>
      </div>

      <nav className="space-y-2">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `
                block
                rounded-2xl
                px-4
                py-3
                font-medium
                transition-all
                duration-300

                ${
                  isActive
                    ? "bg-orange-500 text-white"
                    : "text-slate-300 hover:bg-white/5 hover:text-white"
                }
              `
            }
          >
            {item.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}