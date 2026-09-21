import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import client, { apiErrorMessage } from '../../api/client';

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

const empty: DashboardStats = {
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

const cards: { key: keyof DashboardStats; label: string; prefix?: string }[] = [
  { key: 'totalOrders', label: 'Total Orders' },
  { key: 'todayOrders', label: "Today's Orders" },
  { key: 'revenue', label: 'Revenue', prefix: '₹' },
  { key: 'pendingOrders', label: 'Pending Orders' },
  { key: 'customers', label: 'Customers' },
  { key: 'inventoryValue', label: 'Inventory Value', prefix: '₹' },
  { key: 'lowStock', label: 'Low Stock Items' },
  { key: 'productionToday', label: 'Production Today' },
  { key: 'pendingProduction', label: 'Pending Production' },
  { key: 'shipments', label: 'Shipments' },
];

export default function Dashboard() {
  const { hasPermission } = useAuth();
  const [stats, setStats] = useState<DashboardStats>(empty);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!hasPermission('reports.view')) return;
    client
      .get('/dashboard/stats')
      .then((res) => setStats(res.data.data))
      .catch((err) => setError(apiErrorMessage(err)));
  }, [hasPermission]);

  if (!hasPermission('reports.view')) {
    return (
      <div className="card p-8 text-sm text-slate-500">
        You do not have permission to view the dashboard.
      </div>
    );
  }

  return (
    <div>
      <h1 className="mb-6 text-xl font-semibold">Dashboard</h1>
      {error && <div className="mb-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {cards.map((card) => (
          <div key={card.key} className="card p-4">
            <div className="text-xs font-medium uppercase tracking-wide text-slate-400">
              {card.label}
            </div>
            <div className="mt-1 text-2xl font-bold text-slate-800">
              {card.prefix ?? ''}
              {Number(stats[card.key] ?? 0).toLocaleString('en-IN')}
            </div>
          </div>
        ))}
      </div>
      <div className="card mt-6 p-6">
        <h2 className="text-sm font-semibold text-slate-700">Recent Activity</h2>
        <p className="mt-2 text-sm text-slate-500">
          Charts (sales trend, order trend, top products) arrive with the Reports phase.
        </p>
      </div>
    </div>
  );
}