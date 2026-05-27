import { NavLink } from "react-router-dom";

import useAuth from "../../features/auth/useAuth";

export default function Sidebar() {
  const { hasRole } = useAuth();

  const navItems = [
    {
  label: "AI Insights",
  path: "/ai-insights",
  roles: [
    "admin",
  ],
},
    {
      label: "Dashboard",
      path: "/dashboard",
      roles: [
        "admin",
        "sales",
      ],
    },
    {
  label: "Finance Ledger",
  path: "/finance-ledger",
  roles: [
    "admin",
    "accounts",
  ],
},
     {
  label: "Inventory Ledger",
  path: "/inventory-ledger",
  roles: [
    "admin",
    "inventory",
  ],
},
    {
      label: "Quotations",
      path: "/quotations",
      roles: [
        "admin",
        "sales",
      ],
    },

    {
      label: "Production",
      path: "/production",
      roles: [
        "admin",
        "production",
      ],
    },

    {
      label: "Import Center",
      path: "/imports",
      roles: [
        "admin",
      ],
    },

    {
      label: "Finance",
      path: "/finance",
      roles: [
        "admin",
        "accounts",
      ],
    },
  ];

  const filteredNav =
    navItems.filter((item) =>
      item.roles.some((role) =>
        hasRole(role)
      )
    );

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
          BOXIQ
        </h1>

        <p className="mt-2 text-sm text-slate-400">
          Manufacturing ERP
        </p>
      </div>

      <nav className="space-y-2">
        {filteredNav.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `
                block rounded-2xl
                px-4 py-3
                font-medium
                transition-all duration-300

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