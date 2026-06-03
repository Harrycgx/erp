import { Outlet, NavLink } from "react-router-dom";
import { Brain } from "lucide-react";
import NotificationBell from "./components/ui/NotificationBell";

const navItems = [
  { label: "Dashboard", path: "/dashboard" },
  { label: "Analytics", path: "/analytics" },
  { label: "Products", path: "/products" },
  { label: "Employees", path: "/employees" },
  { label: "Inventory", path: "/inventory" },
  { label: "Production", path: "/production" },
  { label: "Orders", path: "/orders" },
  { label: "Quotations", path: "/quotations" },
  { label: "Finance", path: "/finance" },
  { label: "Procurement", path: "/procurement" },
  { label: "Customers", path: "/customers" },
  {label: "AI Center", path: "/ai", icon: <Brain size={18} />},
];

export default function AppLayout() {
  return (
    <div className="flex min-h-screen bg-[#020817] text-white">

      {/* Sidebar */}
      <aside className="w-72 border-r border-white/10 bg-[#081028] p-6">

        <div className="mb-10">
          <h1 className="text-4xl font-black text-orange-400">
            BoxIQ ERP
          </h1>

          <p className="mt-2 text-slate-400">
            Manufacturing Intelligence Workspace
          </p>
        </div>

        <nav className="space-y-3">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `block rounded-2xl px-5 py-4 text-lg transition-all duration-200 ${
                  isActive
                    ? "bg-orange-500 text-white shadow-lg shadow-orange-500/20"
                    : "text-slate-300 hover:bg-white/10 hover:text-white"
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-8">
        <Outlet />
      </main>

    </div>
  );
}