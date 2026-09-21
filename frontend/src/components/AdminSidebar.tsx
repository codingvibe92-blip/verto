import React, { useState, useMemo } from 'react';
import { NavLink, Link, useLocation } from 'react-router-dom';
import {
  FiHome,
  FiBox,
  FiLayers,
  FiUsers,
  FiShoppingBag,
  FiTag,
  FiDatabase,
  FiArchive,
  FiMapPin,
  FiRepeat,
  FiClock,
  FiFileText,
  FiCpu,
  FiCheckCircle,
  FiTruck,
  FiNavigation,
  FiDollarSign,
  FiRotateCcw,
  FiCreditCard,
  FiBarChart2,
  FiUserCheck,
  FiShield,
  FiBell,
  FiActivity,
  FiSettings,
  FiSearch,
  FiChevronDown,
  FiChevronRight,
  FiLogOut,
  FiExternalLink,
  FiX,
  FiChevronsLeft,
  FiChevronsRight,
} from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';

export interface NavItem {
  to: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
  permission?: string;
}

export interface NavSection {
  id: string;
  label: string;
  items: NavItem[];
}

const navSections: NavSection[] = [
  {
    id: 'main',
    label: 'Overview',
    items: [
      { to: '/admin', label: 'Dashboard', icon: FiHome },
    ],
  },
  {
    id: 'commerce',
    label: 'Commerce & Sales',
    items: [
      { to: '/admin/products', label: 'Products', icon: FiBox },
      { to: '/admin/categories', label: 'Categories', icon: FiLayers },
      { to: '/admin/customers', label: 'Customers', icon: FiUsers },
      { to: '/admin/orders', label: 'Orders', icon: FiShoppingBag },
      { to: '/admin/discounts', label: 'Discounts & Coupons', icon: FiTag },
    ],
  },
  {
    id: 'inventory',
    label: 'Supply Chain & Inventory',
    items: [
      { to: '/admin/inventory', label: 'Live Stock Levels', icon: FiDatabase },
      { to: '/admin/raw-materials', label: 'Raw Materials', icon: FiArchive },
      { to: '/admin/warehouses', label: 'Warehouses', icon: FiMapPin },
      { to: '/admin/stock-transfers', label: 'Stock Transfers', icon: FiRepeat },
      { to: '/admin/stock-history', label: 'Audit History', icon: FiClock },
    ],
  },
  {
    id: 'manufacturing',
    label: 'Manufacturing & QA',
    items: [
      { to: '/admin/bom', label: 'Bill of Materials', icon: FiFileText },
      { to: '/admin/production', label: 'Production Orders', icon: FiCpu },
      { to: '/admin/quality-checks', label: 'Quality Inspections', icon: FiCheckCircle },
    ],
  },
  {
    id: 'logistics',
    label: 'Logistics & Delivery',
    items: [
      { to: '/admin/shipments', label: 'Shipments', icon: FiTruck },
      { to: '/admin/tracking', label: 'Dispatch Tracking', icon: FiNavigation },
    ],
  },
  {
    id: 'finance',
    label: 'Finance & Payments',
    items: [
      { to: '/admin/payments', label: 'Payment Gateway', icon: FiDollarSign },
      { to: '/admin/refunds', label: 'Customer Refunds', icon: FiRotateCcw },
      { to: '/admin/transactions', label: 'Ledger Transactions', icon: FiCreditCard },
    ],
  },
  {
    id: 'reports',
    label: 'Reports & Analytics',
    items: [
      { to: '/admin/reports/sales', label: 'Sales Reports', icon: FiBarChart2 },
      { to: '/admin/reports/inventory', label: 'Inventory Reports', icon: FiDatabase },
      { to: '/admin/reports/production', label: 'Production Reports', icon: FiCpu },
      { to: '/admin/reports/customers', label: 'Customer Analytics', icon: FiUsers },
      { to: '/admin/reports/orders', label: 'Fulfillment Reports', icon: FiShoppingBag },
    ],
  },
  {
    id: 'system',
    label: 'System Administration',
    items: [
      { to: '/admin/users', label: 'Staff Accounts', icon: FiUserCheck },
      { to: '/admin/roles', label: 'Roles & Permissions', icon: FiShield },
      { to: '/admin/notifications', label: 'System Alerts', icon: FiBell },
      { to: '/admin/audit-logs', label: 'Security Audit Logs', icon: FiActivity },
      { to: '/admin/settings', label: 'ERP Settings', icon: FiSettings },
    ],
  },
];

interface AdminSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

export function AdminSidebar({ isOpen, onClose, isCollapsed, onToggleCollapse }: AdminSidebarProps) {
  const { user, logout, hasPermission } = useAuth();
  const location = useLocation();
  const [searchQuery, setSearchQuery] = useState('');
  const [collapsedSections, setCollapsedSections] = useState<Record<string, boolean>>({});

  const toggleSection = (sectionId: string) => {
    setCollapsedSections((prev) => ({
      ...prev,
      [sectionId]: !prev[sectionId],
    }));
  };

  const filteredSections = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return navSections
      .map((section) => {
        const filteredItems = section.items.filter((item) => {
          if (item.permission && !hasPermission(item.permission)) {
            return false;
          }
          if (!q) return true;
          return (
            item.label.toLowerCase().includes(q) ||
            section.label.toLowerCase().includes(q)
          );
        });
        return {
          ...section,
          items: filteredItems,
        };
      })
      .filter((section) => section.items.length > 0);
  }, [searchQuery, hasPermission]);

  const userRole = user?.roles?.[0]?.name || 'Admin';

  const sidebarContent = (
    <div className="flex h-full flex-col bg-[#0f172a] text-slate-200 select-none">
      {/* Brand Header */}
      <div className="flex h-16 items-center justify-between border-b border-slate-800/80 px-4">
        <Link to="/admin" className="flex items-center gap-3 group">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-cyan-500 shadow-md shadow-blue-500/30 ring-1 ring-white/20 transition-transform group-hover:scale-105">
            <span className="text-base font-black tracking-wider text-white">CX</span>
          </div>
          {!isCollapsed && (
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="text-base font-bold tracking-tight text-white group-hover:text-blue-400 transition-colors">
                  CRUNCHX
                </span>
                <span className="rounded-full bg-blue-500/10 px-2 py-0.5 text-[10px] font-semibold text-blue-400 border border-blue-500/20">
                  ERP
                </span>
              </div>
              <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                <span>PostgreSQL Cloud</span>
              </div>
            </div>
          )}
        </Link>

        {/* Desktop collapse button */}
        <button
          type="button"
          onClick={onToggleCollapse}
          className="hidden md:flex rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
          title={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
        >
          {isCollapsed ? <FiChevronsRight className="h-4 w-4" /> : <FiChevronsLeft className="h-4 w-4" />}
        </button>

        {/* Mobile close button */}
        <button
          onClick={onClose}
          className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white md:hidden"
          title="Close Menu"
        >
          <FiX className="h-5 w-5" />
        </button>
      </div>

      {/* Quick Search */}
      {!isCollapsed && (
        <div className="p-3 border-b border-slate-800/60">
          <div className="relative">
            <FiSearch className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search navigation..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-lg bg-slate-800/60 border border-slate-700/60 py-1.5 pl-9 pr-3 text-xs text-slate-200 placeholder-slate-400 focus:border-blue-500 focus:bg-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-2 text-xs text-slate-400 hover:text-slate-200"
              >
                ✕
              </button>
            )}
          </div>
        </div>
      )}

      {/* Navigation Links */}
      <nav className="flex-1 overflow-y-auto px-3 py-3 space-y-4 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent">
        {filteredSections.map((section) => {
          const isSectionOpen = !collapsedSections[section.id];
          const hasActiveChild = section.items.some((item) =>
            item.to === '/admin'
              ? location.pathname === '/admin'
              : location.pathname.startsWith(item.to)
          );

          return (
            <div key={section.id} className="space-y-1">
              {!isCollapsed && (
                <button
                  type="button"
                  onClick={() => toggleSection(section.id)}
                  className="flex w-full items-center justify-between px-2 py-1 text-[11px] font-semibold uppercase tracking-wider text-slate-400 hover:text-slate-200 transition-colors"
                >
                  <span className="flex items-center gap-1.5">
                    {section.label}
                    {hasActiveChild && (
                      <span className="h-1.5 w-1.5 rounded-full bg-blue-400"></span>
                    )}
                  </span>
                  <span className="text-slate-500">
                    {isSectionOpen ? (
                      <FiChevronDown className="h-3 w-3" />
                    ) : (
                      <FiChevronRight className="h-3 w-3" />
                    )}
                  </span>
                </button>
              )}

              {(isCollapsed || isSectionOpen) && (
                <div className="space-y-0.5">
                  {section.items.map((item) => {
                    const Icon = item.icon;
                    return (
                      <NavLink
                        key={item.to}
                        to={item.to}
                        end={item.to === '/admin'}
                        onClick={() => {
                          if (window.innerWidth < 768) {
                            onClose();
                          }
                        }}
                        title={isCollapsed ? item.label : undefined}
                        className={({ isActive }) =>
                          `group flex items-center gap-3 rounded-lg px-2.5 py-2 text-sm font-medium transition-all duration-150 ${
                            isActive
                              ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-600/30 ring-1 ring-white/10 font-semibold'
                              : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                          } ${isCollapsed ? 'justify-center px-2' : ''}`
                        }
                      >
                        <Icon className={`h-4 w-4 shrink-0 transition-transform group-hover:scale-110`} />
                        {!isCollapsed && (
                          <span className="flex-1 truncate">{item.label}</span>
                        )}
                        {!isCollapsed && item.badge && (
                          <span className="rounded-full bg-blue-500/20 px-1.5 py-0.5 text-[10px] font-medium text-blue-300">
                            {item.badge}
                          </span>
                        )}
                      </NavLink>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      {/* User Card & Footer Actions */}
      <div className="border-t border-slate-800/80 bg-slate-950/40 p-3">
        {!isCollapsed ? (
          <div className="space-y-2.5">
            <div className="flex items-center gap-3 rounded-lg bg-slate-800/40 p-2 border border-slate-800">
              <div className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-blue-600 font-bold text-white shadow-sm ring-1 ring-white/20">
                {user?.name ? user.name.slice(0, 2).toUpperCase() : 'AD'}
                <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-emerald-500 ring-2 ring-slate-900"></span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="truncate text-xs font-semibold text-white">
                  {user?.name || 'Administrator'}
                </div>
                <div className="flex items-center gap-1 text-[11px] text-slate-400">
                  <span className="inline-block truncate rounded bg-blue-500/10 px-1.5 py-0.2 text-[10px] font-medium text-blue-400 border border-blue-500/20">
                    {userRole}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1 pt-1">
              <Link
                to="/"
                target="_blank"
                rel="noreferrer"
                className="flex flex-1 items-center justify-center gap-1.5 rounded-md bg-slate-800/80 px-2 py-1.5 text-xs font-medium text-slate-300 hover:bg-slate-700 hover:text-white transition-colors"
                title="Open Storefront in new tab"
              >
                <FiExternalLink className="h-3.5 w-3.5" />
                <span>Storefront</span>
              </Link>
              <button
                onClick={logout}
                className="flex items-center justify-center rounded-md bg-red-500/10 px-2.5 py-1.5 text-xs font-medium text-red-400 hover:bg-red-500/20 hover:text-red-300 transition-colors border border-red-500/20"
                title="Sign out of Admin"
              >
                <FiLogOut className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2">
            <div
              className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-blue-600 font-bold text-white shadow-sm ring-1 ring-white/20"
              title={user?.name || 'Admin'}
            >
              {user?.name ? user.name.slice(0, 2).toUpperCase() : 'AD'}
            </div>
            <button
              onClick={logout}
              className="rounded-lg p-2 text-slate-400 hover:bg-red-500/20 hover:text-red-300 transition-colors"
              title="Logout"
            >
              <FiLogOut className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside
        className={`hidden md:flex shrink-0 flex-col border-r border-slate-800 transition-all duration-300 ease-in-out z-20 ${
          isCollapsed ? 'w-16' : 'w-64'
        }`}
      >
        {sidebarContent}
      </aside>

      {/* Mobile Drawer Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-xs md:hidden transition-opacity"
        />
      )}

      {/* Mobile Drawer Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-72 transform shadow-2xl transition-transform duration-300 ease-in-out md:hidden ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {sidebarContent}
      </div>
    </>
  );
}
export default AdminSidebar;