import { useEffect, useState } from 'react';
import client, { apiErrorMessage } from '../../api/client';
import Spinner from '../../components/Spinner';

export interface Customer {
  id: number;
  first_name: string;
  last_name: string | null;
  email: string;
  phone: string | null;
  status: string;
  orders_count?: number;
  total_spent?: string;
  created_at: string;
}

export default function Customers() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await client.get('/customers', {
        params: { search: search || undefined, limit: 50 },
      });
      setCustomers(res.data.data);
    } catch (err) {
      setError(apiErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    load();
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Customer CRM Directory</h1>
        <p className="text-slate-500 text-sm">
          Registered customer accounts, contact details, lifetime order counts, and total spend
        </p>
      </div>

      {/* Search */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm max-w-md">
        <form onSubmit={handleSearch} className="flex gap-2">
          <input
            type="text"
            placeholder="Search by customer name, email, phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 px-3 py-2 border border-slate-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-emerald-500"
          />
          <button type="submit" className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-sm font-semibold">
            Search
          </button>
        </form>
      </div>

      {error && <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">{error}</div>}

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 flex justify-center">
            <Spinner />
          </div>
        ) : customers.length === 0 ? (
          <div className="p-12 text-center text-slate-500">No customers registered yet.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-700">
              <thead className="bg-slate-50 border-b border-slate-200 text-xs uppercase font-semibold text-slate-500">
                <tr>
                  <th className="px-6 py-3">Customer Name</th>
                  <th className="px-6 py-3">Email Address</th>
                  <th className="px-6 py-3">Phone</th>
                  <th className="px-6 py-3">Lifetime Orders</th>
                  <th className="px-6 py-3">Total Spend</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3">Registered</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {customers.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-6 py-4 font-bold text-slate-900">
                      {c.first_name} {c.last_name || ''}
                    </td>
                    <td className="px-6 py-4 text-slate-600">{c.email}</td>
                    <td className="px-6 py-4 text-slate-500 font-mono text-xs">{c.phone || '—'}</td>
                    <td className="px-6 py-4 font-semibold text-slate-800">{c.orders_count || 0} orders</td>
                    <td className="px-6 py-4 font-bold font-mono text-emerald-600">
                      ${Number(c.total_spent || 0).toFixed(2)}
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2.5 py-1 text-xs font-bold rounded-full bg-emerald-100 text-emerald-800">
                        {c.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-500">
                      {new Date(c.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
