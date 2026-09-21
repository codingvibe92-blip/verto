import { useEffect, useState } from 'react';
import { InventoryService, StockHistoryItem } from '../../services/inventory';
import Spinner from '../../components/Spinner';

export default function StockHistory() {
  const [history, setHistory] = useState<StockHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page] = useState(1);

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await InventoryService.stockHistory({ page, limit: 25 });
      setHistory(data.rows);
    } catch (err) {
      setError(InventoryService.errorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [page]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Stock Movement History</h1>
        <p className="text-slate-500 text-sm">
          Complete immutable audit trail of receipts, production inputs, order fulfillments, and adjustments
        </p>
      </div>

      {error && <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">{error}</div>}

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 flex justify-center">
            <Spinner />
          </div>
        ) : history.length === 0 ? (
          <div className="p-12 text-center text-slate-500">No stock movements recorded yet.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-700">
              <thead className="bg-slate-50 border-b border-slate-200 text-xs uppercase font-semibold text-slate-500">
                <tr>
                  <th className="px-6 py-3">Movement Type</th>
                  <th className="px-6 py-3">Product</th>
                  <th className="px-6 py-3">Warehouse</th>
                  <th className="px-6 py-3">Quantity Delta</th>
                  <th className="px-6 py-3">Notes & Reason</th>
                  <th className="px-6 py-3 text-right">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {history.map((h) => {
                  const isPositive = Number(h.quantity) > 0;

                  return (
                    <tr key={h.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-6 py-4">
                        <span className="px-2 py-0.5 text-xs font-mono font-bold bg-slate-100 text-slate-800 rounded-md">
                          {h.type}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-medium text-slate-900">{h.product_name || `Item #${h.inventory_id}`}</td>
                      <td className="px-6 py-4 text-slate-600">{h.warehouse_name || 'Main Warehouse'}</td>
                      <td className="px-6 py-4">
                        <span
                          className={`font-bold font-mono ${
                            isPositive ? 'text-emerald-600' : 'text-red-500'
                          }`}
                        >
                          {isPositive ? `+${h.quantity}` : h.quantity} units
                        </span>
                      </td>
                      <td className="px-6 py-4 text-xs text-slate-600 max-w-xs truncate">{h.notes || '—'}</td>
                      <td className="px-6 py-4 text-right text-xs text-slate-500">
                        {new Date(h.created_at).toLocaleString()}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
