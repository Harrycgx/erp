import { Outlet, NavLink } from 'react-router-dom';

import Navbar from '../components/shared/Navbar';

import {
  LayoutDashboard,
  BarChart3,
  Users,
  Boxes,
  Factory,
  ClipboardList,
  Wallet,
  Truck,
  FileText,
  Building2,
} from 'lucide-react';

const navItems = [
  {
    label: 'Dashboard',
    path: '/dashboard',
    icon: LayoutDashboard,
  },
  {
    label: 'Analytics',
    path: '/analytics',
    icon: BarChart3,
  },
  {
    label: 'Employees',
    path: '/employees',
    icon: Users,
  },
  {
    label: 'Inventory',
    path: '/inventory',
    icon: Boxes,
  },
  {
    label: 'Production',
    path: '/production',
    icon: Factory,
  },
  {
    label: 'Orders',
    path: '/orders',
    icon: ClipboardList,
  },
  {
    label: 'Quotations',
    path: '/quotations',
    icon: FileText,
  },
  {
    label: 'Finance',
    path: '/finance',
    icon: Wallet,
  },
  {
    label: 'Procurement',
    path: '/procurement',
    icon: Truck,
  },
  {
    label: 'Customers',
    path: '/customers',
    icon: Building2,
  },
];

export default function AppLayout() {
  return (
    <div className="min-h-screen bg-[#071028] text-white">

      {/* Top Navbar */}
      <Navbar />

      <div className="flex pt-24">

        {/* Sidebar */}
        <aside className="sticky top-24 h-[calc(100vh-6rem)] w-72 border-r border-white/10 bg-[#0B172E]/95 backdrop-blur-xl">

          {/* Logo */}
          <div className="border-b border-white/10 p-6">
            <h1 className="text-3xl font-black tracking-tight text-orange-400">
              BoxIQ ERP
            </h1>

            <p className="mt-2 text-sm text-slate-400">
              Manufacturing Intelligence Workspace
            </p>
          </div>

          {/* Navigation */}
          <nav className="flex flex-col gap-2 p-4">

            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `group flex items-center gap-4 rounded-2xl px-4 py-4 text-sm font-medium transition-all duration-300 ${
                    isActive
                      ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/20'
                      : 'text-slate-300 hover:bg-white/10 hover:text-white'
                  }`
                }
              >
                <item.icon
                  size={22}
                  className="transition-transform duration-300 group-hover:scale-110"
                />

                <span>{item.label}</span>
              </NavLink>
            ))}

          </nav>

          {/* Sidebar Footer */}
          <div className="absolute bottom-0 left-0 right-0 border-t border-white/10 p-5">

            <div className="rounded-2xl bg-black/20 p-4 backdrop-blur-lg">
              <p className="text-xs uppercase tracking-[0.25em] text-orange-400">
                System Status
              </p>

              <div className="mt-3 flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-green-400 animate-pulse"></div>

                <span className="text-sm text-slate-300">
                  ERP Operational
                </span>
              </div>
            </div>

          </div>

        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-auto bg-gradient-to-br from-[#071028] via-[#081225] to-[#0A1630] p-8">

          <div className="mx-auto max-w-[1600px]">
            <Outlet />
          </div>

        </main>

      </div>
    </div>
  );
}