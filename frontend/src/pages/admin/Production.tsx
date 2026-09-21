import { useEffect, useState } from 'react';
import { ProductionService, ProductionOrder, BOM } from '../../services/production';
import { CatalogService, Product } from '../../services/catalog';
import Spinner from '../../components/Spinner';

const statusBadges: Record<string, { bg: string; text: string }> = {
  PLANNED: { bg: 'bg-blue-100', text: 'text-blue-700' },
  IN_PROGRESS: { bg: 'bg-amber-100', text: 'text-amber-700' },
  COMPLETED: { bg: 'bg-emerald-100', text: 'text-emerald-700' },
  CANCELLED: { bg: 'bg-slate-100', text: 'text-slate-600' },
};

export default function Production() {
  const [orders, setOrders] = useState<ProductionOrder[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [boms, setBoms] = useState<BOM[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<ProductionOrder | null>(null);

  // Form
  const [productId, setProductId] = useState<number>(0);
  const [bomId, setBomId] = useState<number | undefined>(undefined);
  const [quantity, setQuantity] = useState(500);

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await ProductionService.listOrders({
        status: filterStatus || undefined,
        limit: 50,
      });
      setOrders(data.rows);
    } catch (err) {
      setError(ProductionService.errorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [filterStatus]);

  useEffect(() => {
    CatalogService.listProducts({ limit: 100 }).then((d) => setProducts(d.rows)).catch(() => undefined);
    ProductionService.listBOMs({ limit: 100 }).then((d) => setBoms(d.rows)).catch(() => undefined);
  }, []);

  const openScheduleModal = () => {
    const defaultProduct = products[0]?.id || 0;
    setProductId(defaultProduct);
    const matchingBom = boms.find((b) => b.product_id === defaultProduct);
    setBomId(matchingBom?.id);
    setQuantity(500);
    setModalOpen(true);
  };

  const handleProductChange = (id: number) => {
    setProductId(id);
    const matchingBom = boms.find((b) => b.product_id === id);
    setBomId(matchingBom?.id);
  };

  const handleScheduleOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await ProductionService.createOrder({
        product_id: productId,
        bom_id: bomId,
        quantity,
      });
      setModalOpen(false);
      load();
    } catch (err) {
      alert(ProductionService.errorMessage(err));
    }
  };

  const handleStart = async (id: number) => {
    if (!confirm('Start batch? This will verify and deduct raw materials from inventory.')) return;
    try {
      await ProductionService.startOrder(id);
      load();
    } catch (err) {
      alert(ProductionService.errorMessage(err));
    }
  };

  const handleComplete = async (id: number) => {
    if (!confirm('Mark production batch as completed?')) return;
    try {
      await ProductionService.completeOrder(id);
      load();
    } catch (err) {
      alert(ProductionService.errorMessage(err));
    }
  };

  const handleCancel = async (id: number) => {
    const reason = prompt('Enter cancellation reason:');
    if (!reason) return;
    try {
      await ProductionService.cancelOrder(id, reason);
      load();
    } catch (err) {
      alert(ProductionService.errorMessage(err));
    }
  };

  const handleViewDetails = async (id: number) => {
    try {
      const detail = await ProductionService.getOrder(id);
      setSelectedOrder(detail);
    } catch (err) {
      alert(ProductionService.errorMessage(err));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Production Batches</h1>
          <p className="text-slate-500 text-sm">Schedule manufacturing runs, issue raw materials, and track batch progress</p>
        </div>
        <button
          onClick={openScheduleModal}
          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium shadow-sm transition-colors flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Schedule Batch Run
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 border-b border-slate-200 pb-2">
        {['', 'PLANNED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'].map((st) => (
          <button
            key={st}
            onClick={() => setFilterStatus(st)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              filterStatus === st ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            {st || 'All Batches'}
          </button>
        ))}
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">{error}</div>
      )}

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 flex justify-center">
            <Spinner />
          </div>
        ) : orders.length === 0 ? (
          <div className="p-12 text-center text-slate-500">No production orders in this status.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-700">
              <thead className="bg-slate-50 border-b border-slate-200 text-xs uppercase font-semibold text-slate-500">
                <tr>
                  <th className="px-6 py-3">Batch Number</th>
                  <th className="px-6 py-3">Target Finished Product</th>
                  <th className="px-6 py-3">BOM Recipe</th>
                  <th className="px-6 py-3">Batch Quantity</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3">Schedule</th>
                  <th className="px-6 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {orders.map((po) => {
                  const badge = statusBadges[po.status] || { bg: 'bg-slate-100', text: 'text-slate-600' };

                  return (
                    <tr key={po.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-6 py-4 font-mono font-semibold text-slate-900">{po.order_number}</td>
                      <td className="px-6 py-4">
                        <div className="font-medium text-slate-900">{po.product_name}</div>
                        <div className="text-xs text-slate-500 font-mono">{po.product_sku}</div>
                      </td>
                      <td className="px-6 py-4 text-slate-600">{po.bom_name || 'Manual Batch'}</td>
                      <td className="px-6 py-4 font-semibold text-slate-900">{po.quantity} units</td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${badge.bg} ${badge.text}`}>
                          {po.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-xs text-slate-500">
                        {po.started_at ? `Started: ${new Date(po.started_at).toLocaleDateString()}` : 'Scheduled'}
                      </td>
                      <td className="px-6 py-4 text-right space-x-2">
                        <button
                          onClick={() => handleViewDetails(po.id)}
                          className="text-slate-500 hover:text-slate-800 text-xs font-medium"
                        >
                          Details
                        </button>
                        {po.status === 'PLANNED' && (
                          <button
                            onClick={() => handleStart(po.id)}
                            className="text-emerald-600 hover:text-emerald-700 font-semibold text-xs"
                          >
                            Start Run
                          </button>
                        )}
                        {po.status === 'IN_PROGRESS' && (
                          <button
                            onClick={() => handleComplete(po.id)}
                            className="text-blue-600 hover:text-blue-700 font-semibold text-xs"
                          >
                            Complete
                          </button>
                        )}
                        {(po.status === 'PLANNED' || po.status === 'IN_PROGRESS') && (
                          <button
                            onClick={() => handleCancel(po.id)}
                            className="text-red-500 hover:text-red-700 text-xs"
                          >
                            Cancel
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Schedule Batch Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl space-y-4">
            <h2 className="text-xl font-bold text-slate-900">Schedule Production Batch</h2>
            <form onSubmit={handleScheduleOrder} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Target Product</label>
                <select
                  value={productId}
                  onChange={(e) => handleProductChange(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-emerald-500 outline-none"
                >
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.sku})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">BOM Recipe</label>
                <select
                  value={bomId || ''}
                  onChange={(e) => setBomId(e.target.value ? Number(e.target.value) : undefined)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-emerald-500 outline-none"
                >
                  <option value="">No recipe (Custom material consumption)</option>
                  {boms
                    .filter((b) => b.product_id === productId)
                    .map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.name} (Yield: {b.yield_quantity})
                      </option>
                    ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Batch Units to Produce</label>
                <input
                  type="number"
                  min={1}
                  required
                  value={quantity}
                  onChange={(e) => setQuantity(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-medium"
                >
                  Schedule Batch
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Batch Details Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-xl space-y-4">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-xl font-bold text-slate-900">Batch {selectedOrder.order_number}</h2>
                <p className="text-xs text-slate-500">{selectedOrder.product_name} ({selectedOrder.product_sku})</p>
              </div>
              <button onClick={() => setSelectedOrder(null)} className="text-slate-400 hover:text-slate-600 font-bold text-lg">
                ✕
              </button>
            </div>

            <div className="bg-slate-50 p-3 rounded-lg flex justify-between text-xs font-semibold text-slate-700">
              <span>Quantity: {selectedOrder.quantity} units</span>
              <span>Status: {selectedOrder.status}</span>
              <span>Recipe: {selectedOrder.bom_name || 'Standard'}</span>
            </div>

            <h3 className="text-xs font-bold text-slate-700 uppercase">Material Requirements & Consumption</h3>
            <div className="divide-y divide-slate-100 max-h-48 overflow-y-auto">
              {selectedOrder.items && selectedOrder.items.length > 0 ? (
                selectedOrder.items.map((it, idx) => (
                  <div key={idx} className="py-2 flex justify-between items-center text-sm">
                    <div>
                      <div className="font-medium text-slate-800">{it.raw_material_name}</div>
                      <div className="text-xs text-slate-500 font-mono">{it.raw_material_sku}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold text-slate-900">
                        {it.consumed_quantity} / {it.planned_quantity} {it.unit}
                      </div>
                      <div className="text-[10px] text-slate-500">Consumed / Planned</div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-4 text-center text-xs text-slate-500">No material items recorded.</div>
              )}
            </div>

            <div className="flex justify-end pt-3 border-t border-slate-100">
              <button
                onClick={() => setSelectedOrder(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-sm font-medium"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
