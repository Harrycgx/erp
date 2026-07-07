import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, FileText, ShoppingCart, Factory, 
  Box, Wallet, Users, Settings, ClipboardList, Landmark,
  Layers // Explicitly added to handle Products & BOM master data
} from 'lucide-react';

const workspaceGroups = [
  {
    title: 'Overview',
    links: [
      { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    ]
  },
  {
    title: 'Sales',
    links: [
      { label: 'Customers', path: '/customers', icon: Users },
      { label: 'Quotations', path: '/quotations', icon: FileText },
      { label: 'Orders', path: '/orders', icon: ClipboardList },
      { label: 'Pricing', path: '/pricing', icon: Wallet },
    ]
  },
  {
    title: 'Operations',
    links: [
      { label: 'Products & BOM', path: '/products', icon: Layers }, // Fixed and injected
      { label: 'Production', path: '/production', icon: Factory },
      { label: 'Inventory', path: '/inventory', icon: Box },
      { label: 'Dispatch', path: '/dispatch', icon: ShoppingCart },
    ]
  },
  {
    title: 'Finance',
    links: [
      { label: 'Finance', path: '/finance', icon: Landmark },
    ]
  },
  {
    title: 'Admin',
    links: [
      { label: 'Employees', path: '/employees', icon: Users },
      { label: 'Settings', path: '/settings', icon: Settings },
    ]
  }
];

export default function Sidebar() {
  return (
    <aside className="w-[240px] bg-surface border-r border-border flex flex-col h-screen">
      <div className="h-16 flex items-center px-6 font-bold text-lg text-textMain border-b border-border">
        BoxIQ ERP
      </div>
      <nav className="flex-1 py-4 overflow-y-auto">
        {workspaceGroups.map((group) => (
          <div key={group.title} className="mb-6">
            <h3 className="px-6 text-[10px] font-bold text-textSub uppercase tracking-wider mb-2">
              {group.title}
            </h3>
            {group.links.map((link) => {
              const Icon = link.icon;
              return (
                <NavLink
                  key={link.path}
                  to={link.path}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-6 py-2.5 border-l-4 transition-colors text-sm ${
                      isActive 
                        ? 'bg-blue-900/20 border-primary text-textMain' 
                        : 'border-transparent text-textSub hover:bg-surface hover:text-textMain'
                    }`
                  }
                >
                  <Icon size={18} />
                  {link.label}
                </NavLink>
              );
            })}
          </div>
        ))}
      </nav>
    </aside>
  );
}