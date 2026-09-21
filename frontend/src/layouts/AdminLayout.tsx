import { useState, useMemo } from 'react';
import { Outlet, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { AdminSidebar } from '../components/AdminSidebar';
import {
  FiMenu,
  FiBell,
  FiExternalLink,
  FiChevronRight,
  FiSidebar,
  FiLogOut,
  FiLayers,
} from 'react-icons/fi';

const routeTitleMap: Record<string, { title: string; category: string }> = {
  '/admin': { title: 'Dashboard & Metrics', category: 'Overview' },
  '/admin/products': { title: 'Product Catalog', category: 'Commerce' },
  '/admin/categories': { title: 'Product Categories', category: 'Commerce' },
  '/admin/customers': { title: 'Customer Directory', category: 'Commerce' },
  '/admin/orders': { title: 'Customer Orders', category: 'Commerce' },
  '/admin/discounts': { title: 'Coupons & Promotions', category: 'Commerce' },
  '/admin/inventory': { title: 'Stock & Inventory Levels', category: 'Supply Chain' },
  '/admin/raw-materials': { title: 'Raw Materials & Batches', category: 'Supply Chain' },
  '/admin/warehouses': { title: 'Warehouses & Locations', category: 'Supply Chain' },
  '/admin/stock-transfers': { title: 'Inter-Warehouse Transfers', category: 'Supply Chain' },
  '/admin/stock-history': { title: 'Inventory Transaction Log', category: 'Supply Chain' },
  '/admin/bom': { title: 'Bill of Materials (BOM)', category: 'Manufacturing' },
  '/admin/production': { title: 'Production Work Orders', category: 'Manufacturing' },
  '/admin/quality-checks': { title: 'Quality Assurance Inspections', category: 'Manufacturing' },
  '/admin/shipments': { title: 'Fulfillment & Logistics', category: 'Logistics' },
  '/admin/tracking': { title: 'Package Tracking', category: 'Logistics' },
  '/admin/payments': { title: 'Payment Gateways & Capture', category: 'Finance' },
  '/admin/refunds': { title: 'Refund Requests', category: 'Finance' },
  '/admin/transactions': { title: 'General Ledger Transactions', category: 'Finance' },
  '/admin/reports': { title: 'Business Intelligence', category: 'Analytics' },
  '/admin/reports/sales': { title: 'Sales Analytics', category: 'Analytics' },
  '/admin/reports/inventory': { title: 'Inventory Analytics', category: 'Analytics' },
  '/admin/reports/production': { title: 'Production Analytics', category: 'Analytics' },
  '/admin/reports/customers': { title: 'Customer Analytics', category: 'Analytics' },
  '/admin/reports/orders': { title: 'Fulfillment Analytics', category: 'Analytics' },
  '/admin/users': { title: 'User & Staff Management', category: 'System' },
  '/admin/roles': { title: 'Roles & Access Control', category: 'System' },
  '/admin/notifications': { title: 'System Notifications', category: 'System' },
  '/admin/audit-logs': { title: 'Security Audit Trail', category: 'System' },
  '/admin/settings': { title: 'Enterprise Configuration', category: 'System' },
};

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const routeInfo = useMemo(() => {
    return (
      routeTitleMap[location.pathname] || {
        title: location.pathname.replace('/admin/', '').replace('-', ' ').toUpperCase(),
        category: 'Administration',
      }
    );
  }, [location.pathname]);

  return (
    <div className="flex h-screen overflow-hidden bg-slate-100/70 antialiased">
      {/* Sidebar Navigation */}
      <AdminSidebar
        isOpen={isMobileOpen}
        onClose={() => setIsMobileOpen(false)}
        isCollapsed={isCollapsed}
        onToggleCollapse={() => setIsCollapsed(!isCollapsed)}
      />

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col min-w-0 overflow-hidden">
        {/* Top Header Bar */}
        <header className="sticky top-0 z-10 flex h-16 shrink-0 items-center justify-between border-b border-slate-200/80 bg-white/95 px-4 md:px-6 shadow-2xs backdrop-blur-md">
          {/* Left: Mobile Menu & Breadcrumbs */}
          <div className="flex items-center gap-3 md:gap-4 min-w-0">
            {/* Mobile Hamburger */}
            <button
              type="button"
              onClick={() => setIsMobileOpen(true)}
              className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-800 md:hidden transition-colors"
              title="Open Navigation"
            >
              <FiMenu className="h-5 w-5" />
            </button>

            {/* Desktop Collapse Toggle */}
            <button
              type="button"
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="hidden md:flex rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition-colors"
              title={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
            >
              <FiSidebar className="h-4 w-4" />
            </button>

            {/* Breadcrumb Path */}
            <nav className="flex items-center gap-1.5 text-xs text-slate-500 min-w-0">
              <span className="font-semibold text-slate-800">Admin</span>
              <FiChevronRight className="h-3 w-3 text-slate-400 shrink-0" />
              <span className="hidden sm:inline-block text-slate-500 truncate">
                {routeInfo.category}
              </span>
              <FiChevronRight className="hidden sm:inline-block h-3 w-3 text-slate-400 shrink-0" />
              <span className="font-medium text-blue-600 truncate">{routeInfo.title}</span>
            </nav>
          </div>

          {/* Right: Actions & User Info */}
          <div className="flex items-center gap-2.5 sm:gap-4 shrink-0">
            {/* Supabase Live Status Pill */}
            <div className="hidden lg:flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700 border border-emerald-200/70">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span>Supabase Cloud Connected</span>
            </div>

            {/* View Storefront Link */}
            <Link
              to="/"
              target="_blank"
              rel="noreferrer"
              className="hidden sm:inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-colors shadow-2xs"
            >
              <FiExternalLink className="h-3.5 w-3.5 text-slate-500" />
              <span>Live Store</span>
            </Link>

            {/* Notifications Shortcut */}
            <Link
              to="/admin/notifications"
              className="relative rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-700 transition-colors"
              title="System Alerts"
            >
              <FiBell className="h-4 w-4" />
              <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-blue-500 ring-2 ring-white"></span>
            </Link>

            {/* User Profile Dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-2 rounded-lg p-1 hover:bg-slate-100 transition-colors"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 text-xs font-bold text-white shadow-2xs">
                  {user?.name ? user.name.slice(0, 2).toUpperCase() : 'AD'}
                </div>
                <div className="hidden text-left md:block">
                  <div className="text-xs font-semibold text-slate-800 leading-tight">
                    {user?.name || 'Administrator'}
                  </div>
                  <div className="text-[10px] text-slate-500">
                    {user?.roles?.[0]?.name || 'Super Admin'}
                  </div>
                </div>
              </button>

              {/* Dropdown Menu */}
              {showUserMenu && (
                <>
                  <div
                    className="fixed inset-0 z-30"
                    onClick={() => setShowUserMenu(false)}
                  />
                  <div className="absolute right-0 mt-2 w-48 rounded-xl bg-white p-1.5 shadow-xl ring-1 ring-black/5 z-40 text-xs text-slate-700">
                    <div className="px-3 py-2 border-b border-slate-100">
                      <p className="font-semibold text-slate-900">{user?.name}</p>
                      <p className="text-[11px] text-slate-500 truncate">{user?.email}</p>
                    </div>
                    <Link
                      to="/admin/settings"
                      onClick={() => setShowUserMenu(false)}
                      className="flex items-center gap-2 rounded-lg px-3 py-2 hover:bg-slate-50 transition-colors"
                    >
                      <FiLayers className="h-3.5 w-3.5 text-slate-400" />
                      <span>ERP Settings</span>
                    </Link>
                    <Link
                      to="/"
                      target="_blank"
                      onClick={() => setShowUserMenu(false)}
                      className="flex items-center gap-2 rounded-lg px-3 py-2 hover:bg-slate-50 transition-colors"
                    >
                      <FiExternalLink className="h-3.5 w-3.5 text-slate-400" />
                      <span>Storefront</span>
                    </Link>
                    <div className="my-1 border-t border-slate-100" />
                    <button
                      onClick={() => {
                        setShowUserMenu(false);
                        logout();
                      }}
                      className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-red-600 hover:bg-red-50 transition-colors font-medium"
                    >
                      <FiLogOut className="h-3.5 w-3.5" />
                      <span>Sign out</span>
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </header>

        {/* Page Content Canvas */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-transparent">
          <div className="mx-auto max-w-7xl">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}