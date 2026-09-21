import { NavLink } from 'react-router-dom';

const sections: { label: string; items: { to: string; label: string; permission?: string }[] }[] = [
  {
    label: 'Main',
    items: [{ to: '/admin', label: 'Dashboard' }],
  },
  {
    label: 'Business',
    items: [
      { to: '/admin/products', label: 'Products' },
      { to: '/admin/categories', label: 'Categories' },
      { to: '/admin/customers', label: 'Customers' },
      { to: '/admin/orders', label: 'Orders' },
      { to: '/admin/discounts', label: 'Discounts' },
    ],
  },
  {
    label: 'Inventory',
    items: [
      { to: '/admin/inventory', label: 'Inventory' },
      { to: '/admin/raw-materials', label: 'Raw Materials' },
      { to: '/admin/warehouses', label: 'Warehouses' },
      { to: '/admin/stock-transfers', label: 'Stock Transfers' },
      { to: '/admin/stock-history', label: 'Stock History' },
    ],
  },
  {
    label: 'Production',
    items: [
      { to: '/admin/bom', label: 'Bill of Materials' },
      { to: '/admin/production', label: 'Production Orders' },
      { to: '/admin/quality-checks', label: 'Quality Checks' },
    ],
  },
  {
    label: 'Shipping',
    items: [
      { to: '/admin/shipments', label: 'Shipments' },
      { to: '/admin/tracking', label: 'Tracking' },
    ],
  },
  {
    label: 'Finance',
    items: [
      { to: '/admin/payments', label: 'Payments' },
      { to: '/admin/refunds', label: 'Refunds' },
      { to: '/admin/transactions', label: 'Transactions' },
    ],
  },
  {
    label: 'Reports',
    items: [
      { to: '/admin/reports/sales', label: 'Sales' },
      { to: '/admin/reports/inventory', label: 'Inventory' },
      { to: '/admin/reports/production', label: 'Production' },
      { to: '/admin/reports/customers', label: 'Customers' },
      { to: '/admin/reports/orders', label: 'Orders' },
    ],
  },
  {
    label: 'System',
    items: [
      { to: '/admin/users', label: 'Users' },
      { to: '/admin/roles', label: 'Roles & Permissions' },
      { to: '/admin/notifications', label: 'Notifications' },
      { to: '/admin/audit-logs', label: 'Audit Logs' },
      { to: '/admin/settings', label: 'Settings' },
    ],
  },
];

export function AdminSidebar() {
  return (
    <aside className="w-60 shrink-0 border-r border-slate-200 bg-white overflow-y-auto">
      <div className="p-4 text-lg font-bold text-brand-600">CRUNCHX</div>
      <nav className="px-2 pb-6">
        {sections.map((section) => (
          <div key={section.label} className="mb-4">
            <div className="px-3 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
              {section.label}
            </div>
            {section.items.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/admin'}
                className={({ isActive }) =>
                  `mt-1 block rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-brand-600 text-white'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </div>
        ))}
      </nav>
    </aside>
  );
}