import { useEffect, useState } from 'react';
import {
  ReportService,
  OverviewMetrics,
  SalesReport,
  InventoryReport,
  ProductionReport,
  CustomerReport,
} from '../../services/reports';
import Spinner from '../../components/Spinner';
import {
  FiBarChart2,
  FiDollarSign,
  FiShoppingBag,
  FiTrendingUp,
  FiPackage,
  FiActivity,
  FiUsers,
  FiCheckCircle,
  FiAlertTriangle,
  FiRefreshCw,
  FiCalendar,
} from 'react-icons/fi';

export default function Reports() {
  const [activeTab, setActiveTab] = useState<'sales' | 'inventory' | 'production' | 'customers'>('sales');
  const [days, setDays] = useState(30);

  const [overview, setOverview] = useState<OverviewMetrics | null>(null);
  const [sales, setSales] = useState<SalesReport | null>(null);
  const [inventory, setInventory] = useState<InventoryReport | null>(null);
  const [production, setProduction] = useState<ProductionReport | null>(null);
  const [customers, setCustomers] = useState<CustomerReport | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadAll = async () => {
    setLoading(true);
    setError('');
    try {
      const [overviewData, salesData, invData, prodData, custData] = await Promise.all([
        ReportService.getOverview(),
        ReportService.getSalesReport(days),
        ReportService.getInventoryReport(),
        ReportService.getProductionReport(),
        ReportService.getCustomerReport(),
      ]);
      setOverview(overviewData);
      setSales(salesData);
      setInventory(invData);
      setProduction(prodData);
      setCustomers(custData);
    } catch (err) {
      setError(ReportService.errorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAll();
  }, [days]);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <FiBarChart2 className="text-emerald-600" /> Enterprise Analytics & Reports
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Real-time cross-functional metrics across sales, inventory valuation, production, and CRM.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-lg px-3 py-1.5 shadow-xs">
            <FiCalendar className="text-gray-400 w-4 h-4" />
            <select
              value={days}
              onChange={(e) => setDays(Number(e.target.value))}
              className="text-xs font-medium text-gray-700 bg-transparent focus:outline-none cursor-pointer"
            >
              <option value={7}>Last 7 Days</option>
              <option value={30}>Last 30 Days</option>
              <option value={90}>Last 90 Days</option>
            </select>
          </div>

          <button
            onClick={loadAll}
            className="p-2 border border-gray-200 bg-white rounded-lg text-gray-600 hover:text-emerald-600 hover:bg-gray-50 transition-colors shadow-xs"
            title="Refresh Metrics"
          >
            <FiRefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
          {error}
        </div>
      )}

      {/* KPI Overview Cards */}
      {overview && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                Total Revenue
              </span>
              <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <FiDollarSign className="w-5 h-5" />
              </div>
            </div>
            <p className="text-2xl font-bold text-gray-900 mt-2">
              ₹{overview.revenue.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Avg Order: <span className="font-semibold text-gray-700">₹{overview.averageOrderValue}</span>
            </p>
          </div>

          <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                Total Orders
              </span>
              <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                <FiShoppingBag className="w-5 h-5" />
              </div>
            </div>
            <p className="text-2xl font-bold text-gray-900 mt-2">
              {overview.totalOrders.toLocaleString()}
            </p>
            <p className="text-xs text-emerald-600 mt-1 font-medium flex items-center gap-1">
              <FiTrendingUp /> {overview.ordersToday} placed today
            </p>
          </div>

          <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                Inventory Value
              </span>
              <div className="w-9 h-9 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
                <FiPackage className="w-5 h-5" />
              </div>
            </div>
            <p className="text-2xl font-bold text-gray-900 mt-2">
              ₹{overview.inventoryValuation.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Across <span className="font-semibold text-gray-700">{overview.totalProducts}</span> catalog SKUs
            </p>
          </div>

          <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                QC Pass Rate
              </span>
              <div className="w-9 h-9 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
                <FiCheckCircle className="w-5 h-5" />
              </div>
            </div>
            <p className="text-2xl font-bold text-gray-900 mt-2">
              {overview.qcPassRate}%
            </p>
            <p className="text-xs text-gray-500 mt-1">
              <span className="font-semibold text-gray-700">{overview.productionBatches}</span> total production runs
            </p>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="border-b border-gray-200 bg-white rounded-t-xl px-4 pt-2 shadow-xs">
        <nav className="flex space-x-6">
          {[
            { key: 'sales', label: 'Sales & Revenue', icon: FiDollarSign },
            { key: 'inventory', label: 'Inventory & Valuation', icon: FiPackage },
            { key: 'production', label: 'Production & Yield', icon: FiActivity },
            { key: 'customers', label: 'Customer CRM', icon: FiUsers },
          ].map((t) => {
            const Icon = t.icon;
            const active = activeTab === t.key;
            return (
              <button
                key={t.key}
                onClick={() => setActiveTab(t.key as any)}
                className={`py-3.5 px-1 border-b-2 font-medium text-sm flex items-center gap-2 transition-colors ${
                  active
                    ? 'border-emerald-600 text-emerald-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Icon className="w-4 h-4" />
                {t.label}
              </button>
            );
          })}
        </nav>
      </div>

      {loading ? (
        <div className="bg-white rounded-b-xl border border-t-0 border-gray-200 p-16 text-center shadow-sm">
          <Spinner />
          <p className="text-gray-500 text-sm mt-3">Compiling reports...</p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* TAB 1: SALES & REVENUE */}
          {activeTab === 'sales' && sales && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Daily Sales Chart / Table */}
              <div className="lg:col-span-8 bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                  <h3 className="font-bold text-gray-900 text-base flex items-center gap-2">
                    <FiTrendingUp className="text-emerald-600" /> Daily Revenue Timeline (Last {days} Days)
                  </h3>
                  <span className="text-xs text-gray-400">{sales.timeline.length} active sales days</span>
                </div>

                {sales.timeline.length === 0 ? (
                  <p className="text-center py-12 text-gray-400 text-sm">No orders recorded in this period.</p>
                ) : (
                  <div className="space-y-2">
                    {/* Visual bar list */}
                    {(() => {
                      const maxRev = Math.max(...sales.timeline.map((t) => Number(t.total_revenue)), 1);
                      return sales.timeline.slice(-15).map((day) => {
                        const pct = Math.round((Number(day.total_revenue) / maxRev) * 100);
                        return (
                          <div key={day.date} className="flex items-center gap-3 text-xs">
                            <span className="w-24 text-gray-500 font-mono">{day.date}</span>
                            <div className="flex-1 h-5 bg-gray-100 rounded overflow-hidden relative">
                              <div
                                style={{ width: `${Math.max(pct, 3)}%` }}
                                className="h-full bg-emerald-500 rounded transition-all"
                              />
                            </div>
                            <span className="w-20 text-right font-semibold text-gray-800">
                              ₹{Number(day.total_revenue).toLocaleString()}
                            </span>
                            <span className="w-16 text-right text-gray-400">({day.order_count} ord)</span>
                          </div>
                        );
                      });
                    })()}
                  </div>
                )}

                {/* Orders by Status */}
                <div className="pt-4 border-t border-gray-100">
                  <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                    Order Status Distribution
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {sales.statusBreakdown.map((s) => (
                      <div
                        key={s.status}
                        className="bg-gray-50 border border-gray-200 px-3 py-1.5 rounded-lg text-xs flex items-center gap-2"
                      >
                        <span className="font-medium text-gray-700">{s.status}:</span>
                        <span className="font-bold text-gray-900 bg-white px-2 py-0.5 rounded border border-gray-100 shadow-2xs">
                          {s.count}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Top Products & Category Breakdown */}
              <div className="lg:col-span-4 space-y-6">
                {/* Top Selling SKUs */}
                <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
                  <h3 className="font-bold text-gray-900 text-sm mb-3">Top Selling Products</h3>
                  {sales.topProducts.length === 0 ? (
                    <p className="text-xs text-gray-400 py-4 text-center">No sales data yet.</p>
                  ) : (
                    <div className="space-y-3">
                      {sales.topProducts.slice(0, 5).map((p, idx) => (
                        <div key={p.product_id} className="flex items-center justify-between text-xs pb-2 border-b border-gray-50 last:border-0 last:pb-0">
                          <div className="flex items-center gap-2">
                            <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 font-bold flex items-center justify-center text-[10px]">
                              {idx + 1}
                            </span>
                            <div>
                              <p className="font-medium text-gray-800 line-clamp-1">{p.product_name}</p>
                              <p className="text-gray-400 text-[11px]">{p.units_sold} units sold</p>
                            </div>
                          </div>
                          <span className="font-bold text-gray-900">
                            ₹{Number(p.revenue).toLocaleString()}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Category Sales */}
                <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
                  <h3 className="font-bold text-gray-900 text-sm mb-3">Revenue by Category</h3>
                  <div className="space-y-2">
                    {sales.categoryDistribution.map((c) => (
                      <div key={c.category_name} className="flex items-center justify-between text-xs">
                        <span className="text-gray-600 font-medium">{c.category_name}</span>
                        <div className="text-right">
                          <span className="font-bold text-gray-900 block">
                            ₹{Number(c.total_sales).toLocaleString()}
                          </span>
                          <span className="text-[10px] text-gray-400">{c.units_sold} units</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: INVENTORY & VALUATION */}
          {activeTab === 'inventory' && inventory && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Warehouse Valuation Breakdown */}
              <div className="lg:col-span-6 bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-4">
                <h3 className="font-bold text-gray-900 text-base flex items-center gap-2">
                  <FiPackage className="text-emerald-600" /> Stock Valuation by Warehouse
                </h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-gray-600">
                    <thead className="bg-gray-50 text-gray-700 uppercase font-semibold">
                      <tr>
                        <th className="py-2.5 px-3">Warehouse</th>
                        <th className="py-2.5 px-3 text-right">Items on Hand</th>
                        <th className="py-2.5 px-3 text-right">Valuation</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {inventory.warehouseValuation.map((w) => (
                        <tr key={w.warehouse_name} className="hover:bg-gray-50">
                          <td className="py-3 px-3 font-medium text-gray-900">{w.warehouse_name}</td>
                          <td className="py-3 px-3 text-right">{Number(w.total_items).toLocaleString()}</td>
                          <td className="py-3 px-3 text-right font-bold text-emerald-700">
                            ₹{Number(w.valuation).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Stock Movements Summary */}
                <div className="pt-4 border-t border-gray-100">
                  <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                    Stock Movements Activity
                  </h4>
                  <div className="grid grid-cols-2 gap-2">
                    {inventory.movementsSummary.map((m) => (
                      <div key={m.movement_type} className="p-2.5 rounded-lg border border-gray-200 bg-gray-50 text-xs">
                        <span className="text-gray-500 block font-medium capitalize">{m.movement_type.toLowerCase()}</span>
                        <div className="flex items-center justify-between mt-1">
                          <span className="font-bold text-gray-900">{m.count} logs</span>
                          <span className="font-semibold text-emerald-600">{Number(m.total_qty).toLocaleString()} qty</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Low Stock Alerts */}
              <div className="lg:col-span-6 bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-gray-100">
                  <h3 className="font-bold text-gray-900 text-base flex items-center gap-2">
                    <FiAlertTriangle className="text-amber-500" /> Reorder & Low Stock Alerts
                  </h3>
                  <span className="text-xs font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded">
                    {inventory.lowStockAlerts.length} items
                  </span>
                </div>

                {inventory.lowStockAlerts.length === 0 ? (
                  <p className="text-xs text-gray-400 py-8 text-center">
                    All inventory levels are above reorder thresholds. Healthy stock!
                  </p>
                ) : (
                  <div className="max-h-96 overflow-y-auto space-y-2">
                    {inventory.lowStockAlerts.map((item) => (
                      <div
                        key={`${item.type}-${item.id}`}
                        className="flex items-center justify-between p-3 rounded-lg border border-red-100 bg-red-50/40 text-xs"
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-gray-900">{item.name}</span>
                            <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold uppercase ${
                              item.type === 'RAW_MATERIAL' ? 'bg-amber-100 text-amber-800' : 'bg-blue-100 text-blue-800'
                            }`}>
                              {item.type === 'RAW_MATERIAL' ? 'Raw Mat' : 'Product'}
                            </span>
                          </div>
                          <p className="text-gray-400 text-[11px] mt-0.5">SKU: {item.sku || 'N/A'}</p>
                        </div>
                        <div className="text-right">
                          <span className="text-red-700 font-bold block text-sm">
                            {item.current_stock} {item.unit || 'PCS'}
                          </span>
                          <span className="text-gray-400 text-[10px]">
                            Reorder at: {item.threshold}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 3: PRODUCTION & YIELD */}
          {activeTab === 'production' && production && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Batch Statuses and Quality Breakdown */}
              <div className="lg:col-span-6 bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-6">
                <div>
                  <h3 className="font-bold text-gray-900 text-base mb-3 flex items-center gap-2">
                    <FiActivity className="text-emerald-600" /> Production Batch Statuses
                  </h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {production.statusCounts.map((s) => (
                      <div key={s.status} className="p-3 bg-gray-50 border border-gray-200 rounded-lg text-xs">
                        <span className="text-gray-500 font-medium block">{s.status}</span>
                        <span className="text-lg font-bold text-gray-900 mt-1 block">{s.count}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-100">
                  <h3 className="font-bold text-gray-900 text-sm mb-3">Quality Assurance Yield</h3>
                  <div className="grid grid-cols-3 gap-3">
                    <div className="p-3 bg-gray-50 rounded-lg text-center">
                      <span className="text-xs text-gray-500 block">Total Inspected</span>
                      <span className="text-lg font-bold text-gray-900 mt-1 block">{production.totalProduced}</span>
                    </div>
                    <div className="p-3 bg-emerald-50 rounded-lg text-center border border-emerald-200">
                      <span className="text-xs text-emerald-700 font-medium block">Passed</span>
                      <span className="text-lg font-bold text-emerald-800 mt-1 block">{production.qualityPassed}</span>
                    </div>
                    <div className="p-3 bg-red-50 rounded-lg text-center border border-red-200">
                      <span className="text-xs text-red-700 font-medium block">Failed / Reject</span>
                      <span className="text-lg font-bold text-red-800 mt-1 block">{production.qualityFailed}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Material Usage Leaderboard */}
              <div className="lg:col-span-6 bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-4">
                <h3 className="font-bold text-gray-900 text-base">Top Consumed Raw Materials</h3>
                {production.materialUsage.length === 0 ? (
                  <p className="text-xs text-gray-400 py-8 text-center">No production materials logged yet.</p>
                ) : (
                  <div className="space-y-3">
                    {production.materialUsage.map((m, idx) => (
                      <div key={m.material_name} className="flex items-center justify-between text-xs pb-2 border-b border-gray-50 last:border-0 last:pb-0">
                        <div className="flex items-center gap-2">
                          <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center text-[10px]">
                            {idx + 1}
                          </span>
                          <span className="font-medium text-gray-800">{m.material_name}</span>
                        </div>
                        <span className="font-bold text-gray-900">
                          {Number(m.total_consumed).toLocaleString()} {m.unit}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 4: CUSTOMER CRM */}
          {activeTab === 'customers' && customers && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
                  <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    Total Customer Base
                  </span>
                  <p className="text-3xl font-bold text-gray-900 mt-2">
                    {customers.totalCustomers.toLocaleString()}
                  </p>
                </div>
                <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
                  <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    New Customers (Past 30 Days)
                  </span>
                  <p className="text-3xl font-bold text-emerald-600 mt-2">
                    +{customers.newCustomersLast30Days.toLocaleString()}
                  </p>
                </div>
              </div>

              {/* Top VIP Customers */}
              <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                <h3 className="font-bold text-gray-900 text-base mb-4 flex items-center gap-2">
                  <FiUsers className="text-emerald-600" /> Top Customers by Lifetime Value (LTV)
                </h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-gray-600">
                    <thead className="bg-gray-50 text-gray-700 uppercase font-semibold">
                      <tr>
                        <th className="py-2.5 px-3">Customer</th>
                        <th className="py-2.5 px-3">Email</th>
                        <th className="py-2.5 px-3 text-right">Orders Placed</th>
                        <th className="py-2.5 px-3 text-right">Lifetime Spend</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {customers.topCustomers.map((c) => (
                        <tr key={c.id} className="hover:bg-gray-50">
                          <td className="py-3 px-3 font-medium text-gray-900">{c.name}</td>
                          <td className="py-3 px-3 text-gray-500">{c.email}</td>
                          <td className="py-3 px-3 text-right">{c.order_count}</td>
                          <td className="py-3 px-3 text-right font-bold text-emerald-700">
                            ₹{Number(c.total_spent).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
