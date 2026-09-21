import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import client, { apiErrorMessage } from '../../api/client';
import {
  FiDollarSign,
  FiShoppingBag,
  FiUsers,
  FiDatabase,
  FiAlertTriangle,
  FiCpu,
  FiTruck,
  FiArrowUpRight,
  FiPlus,
  FiExternalLink,
  FiPackage,
  FiChevronRight,
  FiRefreshCw,
} from 'react-icons/fi';

interface DashboardStats {
  totalOrders: number;
  todayOrders: number;
  revenue: number;
  pendingOrders: number;
  customers: number;
  inventoryValue: number;
  lowStock: number;
  productionToday: number;
  pendingProduction: number;
  shipments: number;
}

interface RecentOrder {
  id: string | number;
  order_number: string;
  customer_name?: string;
  total_amount: number;
  status: string;
  payment_status: string;
  created_at: string;
}

const defaultStats: DashboardStats = {
  totalOrders: 0,
  todayOrders: 0,
  revenue: 0,
  pendingOrders: 0,
  customers: 0,
  inventoryValue: 0,
  lowStock: 0,
  productionToday: 0,
  pendingProduction: 0,
  shipments: 0,
};

export default function Dashboard() {
  const { user, hasPermission } = useAuth();
  const [stats, setStats] = useState<DashboardStats>(defaultStats);
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadData = async () => {
    setLoading(true);
    setError('');
    try {
      if (hasPermission('reports.view')) {
        const res = await client.get('/dashboard/stats');
        setStats(res.data?.data || defaultStats);
      }
      if (hasPermission('orders.view')) {
        const orderRes = await client.get('/orders?limit=5');
        const list = orderRes.data?.data?.orders || orderRes.data?.data || [];
        setRecentOrders(Array.isArray(list) ? list.slice(0, 5) : []);
      }
    } catch (err) {
      setError(apiErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [hasPermission]);

  if (!hasPermission('reports.view') && !hasPermission('orders.view')) {
    return (
      <div className="card p-12 text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-amber-50 text-amber-600 mb-3">
          <FiAlertTriangle className="h-6 w-6" />
        </div>
        <h3 className="text-base font-semibold text-slate-900">Access Restricted</h3>
        <p className="mt-1 text-sm text-slate-500">
          Your account role does not have permission to view high-level enterprise metrics.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-950 p-6 md:p-8 text-white shadow-xl">
        <div className="absolute right-0 top-0 -mt-8 -mr-8 h-64 w-64 rounded-full bg-blue-500/10 blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-medium backdrop-blur-md border border-white/10 text-blue-200">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>CRUNCHX Enterprise Operating System</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-white font-heading">
              Welcome back, {user?.name?.split(' ')[0] || 'Administrator'} 👋
            </h1>
            <p className="text-sm text-slate-300 max-w-xl">
              Here is your real-time supply chain telemetry, active production queue, and business revenue metrics.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={loadData}
              disabled={loading}
              className="inline-flex items-center gap-1.5 rounded-xl bg-white/10 px-3.5 py-2 text-xs font-semibold text-white backdrop-blur-md hover:bg-white/20 transition-all border border-white/15"
              title="Refresh Stats"
            >
              <FiRefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>
            <Link
              to="/admin/products"
              className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 px-4 py-2 text-xs font-semibold text-white shadow-md shadow-blue-500/30 hover:from-blue-600 hover:to-indigo-700 transition-all"
            >
              <FiPlus className="h-3.5 w-3.5" />
              <span>Add Product</span>
            </Link>
            <Link
              to="/"
              target="_blank"
              className="inline-flex items-center gap-1.5 rounded-xl bg-white text-slate-900 px-4 py-2 text-xs font-semibold hover:bg-slate-100 transition-all shadow-md"
            >
              <FiExternalLink className="h-3.5 w-3.5 text-slate-600" />
              <span>View Storefront</span>
            </Link>
          </div>
        </div>
      </div>

      {error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FiAlertTriangle className="h-5 w-5 text-red-500 shrink-0" />
            <span>{error}</span>
          </div>
          <button onClick={() => setError('')} className="text-red-500 hover:text-red-700 font-bold">
            ✕
          </button>
        </div>
      )}

      {/* 4 Hero KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Revenue */}
        <div className="card-hover p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Total Revenue
            </span>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600">
              <FiDollarSign className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl lg:text-3xl font-bold tracking-tight text-slate-900">
              ₹{Number(stats.revenue ?? 0).toLocaleString('en-IN')}
            </div>
            <div className="mt-2 flex items-center gap-1.5 text-xs text-emerald-600 font-medium">
              <FiArrowUpRight className="h-3.5 w-3.5" />
              <span>+18.4% this month</span>
            </div>
          </div>
        </div>

        {/* Orders */}
        <div className="card-hover p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Orders Volume
            </span>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10 text-blue-600">
              <FiShoppingBag className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl lg:text-3xl font-bold tracking-tight text-slate-900">
              {Number(stats.totalOrders ?? 0).toLocaleString('en-IN')}
            </div>
            <div className="mt-2 flex items-center gap-1.5 text-xs text-slate-500">
              <span className="font-semibold text-blue-600">
                {stats.todayOrders ?? 0} orders
              </span>
              <span>placed today</span>
            </div>
          </div>
        </div>

        {/* Customers */}
        <div className="card-hover p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Customer Base
            </span>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-500/10 text-purple-600">
              <FiUsers className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl lg:text-3xl font-bold tracking-tight text-slate-900">
              {Number(stats.customers ?? 0).toLocaleString('en-IN')}
            </div>
            <div className="mt-2 flex items-center gap-1.5 text-xs text-slate-500">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              <span>Active consumer profiles</span>
            </div>
          </div>
        </div>

        {/* Inventory Value */}
        <div className="card-hover p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Inventory Valuation
            </span>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600">
              <FiDatabase className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl lg:text-3xl font-bold tracking-tight text-slate-900">
              ₹{Number(stats.inventoryValue ?? 0).toLocaleString('en-IN')}
            </div>
            <div className="mt-2 flex items-center gap-1.5 text-xs text-slate-500">
              <span>Across all warehouse nodes</span>
            </div>
          </div>
        </div>
      </div>

      {/* Operational Telemetry Pulse */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Link
          to="/admin/orders?status=PENDING"
          className="card p-4 hover:border-blue-300 transition-all flex items-center justify-between group"
        >
          <div className="space-y-1">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Pending Orders</p>
            <p className="text-xl font-bold text-slate-900">{stats.pendingOrders ?? 0}</p>
          </div>
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-blue-600 group-hover:scale-110 transition-transform">
            <FiShoppingBag className="h-4 w-4" />
          </div>
        </Link>

        <Link
          to="/admin/inventory"
          className="card p-4 hover:border-amber-300 transition-all flex items-center justify-between group"
        >
          <div className="space-y-1">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Low Stock Alerts</p>
            <p className={`text-xl font-bold ${(stats.lowStock ?? 0) > 0 ? 'text-amber-600' : 'text-slate-900'}`}>
              {stats.lowStock ?? 0}
            </p>
          </div>
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-50 text-amber-600 group-hover:scale-110 transition-transform">
            <FiAlertTriangle className="h-4 w-4" />
          </div>
        </Link>

        <Link
          to="/admin/production"
          className="card p-4 hover:border-indigo-300 transition-all flex items-center justify-between group"
        >
          <div className="space-y-1">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Production Queue</p>
            <p className="text-xl font-bold text-slate-900">{stats.pendingProduction ?? 0}</p>
          </div>
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 group-hover:scale-110 transition-transform">
            <FiCpu className="h-4 w-4" />
          </div>
        </Link>

        <Link
          to="/admin/shipments"
          className="card p-4 hover:border-emerald-300 transition-all flex items-center justify-between group"
        >
          <div className="space-y-1">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Active Shipments</p>
            <p className="text-xl font-bold text-slate-900">{stats.shipments ?? 0}</p>
          </div>
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 group-hover:scale-110 transition-transform">
            <FiTruck className="h-4 w-4" />
          </div>
        </Link>
      </div>

      {/* Main Grid: Recent Orders & Quick Launchpad */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Recent Orders Table (2 Cols) */}
        <div className="card lg:col-span-2 overflow-hidden flex flex-col">
          <div className="flex items-center justify-between border-b border-slate-100 p-5">
            <div>
              <h2 className="text-base font-bold text-slate-900 font-heading">Recent Customer Orders</h2>
              <p className="text-xs text-slate-500 mt-0.5">Live transaction orders from the storefront checkout</p>
            </div>
            <Link
              to="/admin/orders"
              className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-800 transition-colors"
            >
              <span>View All Orders</span>
              <FiChevronRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="overflow-x-auto flex-1">
            {recentOrders.length === 0 ? (
              <div className="p-8 text-center text-slate-500 text-sm">
                <FiPackage className="mx-auto h-8 w-8 text-slate-300 mb-2" />
                No orders recorded yet. As customers place orders, they will appear here live.
              </div>
            ) : (
              <table className="w-full text-left">
                <thead>
                  <tr>
                    <th className="th">Order #</th>
                    <th className="th">Customer</th>
                    <th className="th">Amount</th>
                    <th className="th">Payment</th>
                    <th className="th">Status</th>
                    <th className="th text-right">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {recentOrders.map((order) => (
                    <tr key={order.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="td font-semibold text-blue-600">
                        <Link to={`/admin/orders`}>{order.order_number}</Link>
                      </td>
                      <td className="td text-slate-800 font-medium">
                        {order.customer_name || 'Guest Customer'}
                      </td>
                      <td className="td font-bold text-slate-900">
                        ₹{Number(order.total_amount).toLocaleString('en-IN')}
                      </td>
                      <td className="td">
                        <span
                          className={`badge ${
                            order.payment_status === 'PAID'
                              ? 'badge-success'
                              : order.payment_status === 'FAILED'
                              ? 'badge-danger'
                              : 'badge-warning'
                          }`}
                        >
                          {order.payment_status || 'PENDING'}
                        </span>
                      </td>
                      <td className="td">
                        <span
                          className={`badge ${
                            order.status === 'DELIVERED'
                              ? 'badge-success'
                              : order.status === 'CANCELLED'
                              ? 'badge-danger'
                              : 'badge-info'
                          }`}
                        >
                          {order.status}
                        </span>
                      </td>
                      <td className="td text-right">
                        <Link
                          to={`/admin/orders`}
                          className="text-xs font-semibold text-slate-600 hover:text-blue-600 transition-colors"
                        >
                          View Details →
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Quick Launchpad & Shortcuts (1 Col) */}
        <div className="card p-5 space-y-4">
          <div>
            <h2 className="text-base font-bold text-slate-900 font-heading">Operations Launchpad</h2>
            <p className="text-xs text-slate-500 mt-0.5">Quick workflows across your manufacturing & commerce stack</p>
          </div>

          <div className="space-y-2.5">
            <Link
              to="/admin/products"
              className="flex items-center gap-3.5 p-3 rounded-xl border border-slate-100 hover:border-blue-200 hover:bg-blue-50/50 transition-all group"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-500/10 text-blue-600 group-hover:scale-105 transition-transform">
                <FiPackage className="h-5 w-5" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-slate-900">Catalog Management</p>
                <p className="text-[11px] text-slate-500 truncate">Create SKUs, pricing & product media</p>
              </div>
              <FiChevronRight className="h-4 w-4 text-slate-400 group-hover:text-blue-600 transition-colors" />
            </Link>

            <Link
              to="/admin/inventory"
              className="flex items-center gap-3.5 p-3 rounded-xl border border-slate-100 hover:border-emerald-200 hover:bg-emerald-50/50 transition-all group"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600 group-hover:scale-105 transition-transform">
                <FiDatabase className="h-5 w-5" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-slate-900">Inventory Adjustments</p>
                <p className="text-[11px] text-slate-500 truncate">Receive batches, adjust damaged units</p>
              </div>
              <FiChevronRight className="h-4 w-4 text-slate-400 group-hover:text-emerald-600 transition-colors" />
            </Link>

            <Link
              to="/admin/production"
              className="flex items-center gap-3.5 p-3 rounded-xl border border-slate-100 hover:border-indigo-200 hover:bg-indigo-50/50 transition-all group"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-600 group-hover:scale-105 transition-transform">
                <FiCpu className="h-5 w-5" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-slate-900">Production Work Orders</p>
                <p className="text-[11px] text-slate-500 truncate">Execute BOM batches & QC sign-off</p>
              </div>
              <FiChevronRight className="h-4 w-4 text-slate-400 group-hover:text-indigo-600 transition-colors" />
            </Link>

            <Link
              to="/admin/settings"
              className="flex items-center gap-3.5 p-3 rounded-xl border border-slate-100 hover:border-slate-300 hover:bg-slate-50 transition-all group"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-600 group-hover:scale-105 transition-transform">
                <FiDollarSign className="h-5 w-5" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-slate-900">Payment & Tax Configuration</p>
                <p className="text-[11px] text-slate-500 truncate">Stripe, Razorpay, COD, & shipping rules</p>
              </div>
              <FiChevronRight className="h-4 w-4 text-slate-400 group-hover:text-slate-800 transition-colors" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}