import { useEffect, useState } from 'react';
import { ProductionService, QualityCheck, ProductionOrder } from '../../services/production';
import { InventoryService, Warehouse } from '../../services/inventory';
import Spinner from '../../components/Spinner';

export default function QualityChecks() {
  const [checks, setChecks] = useState<QualityCheck[]>([]);
  const [orders, setOrders] = useState<ProductionOrder[]>([]);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [modalOpen, setModalOpen] = useState(false);

  // Form State
  const [selectedOrderId, setSelectedOrderId] = useState<number>(0);
  const [quantityChecked, setQuantityChecked] = useState(100);
  const [passedQty, setPassedQty] = useState(98);
  const [failedQty, setFailedQty] = useState(2);
  const [remarks, setRemarks] = useState('');
  const [warehouseId, setWarehouseId] = useState<number>(0);

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await ProductionService.listQualityChecks({ limit: 50 });
      setChecks(data.rows);
    } catch (err) {
      setError(ProductionService.errorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    ProductionService.listOrders({ limit: 100 }).then((d) => setOrders(d.rows)).catch(() => undefined);
    InventoryService.allWarehouses().then((d) => {
      setWarehouses(d);
      if (d.length > 0) setWarehouseId(d[0].id);
    }).catch(() => undefined);
  }, []);

  const openInspectionModal = () => {
    const defaultOrder = orders.find((o) => o.status === 'COMPLETED' || o.status === 'IN_PROGRESS') || orders[0];
    if (defaultOrder) {
      setSelectedOrderId(defaultOrder.id);
      setQuantityChecked(defaultOrder.quantity);
      setPassedQty(defaultOrder.quantity);
      setFailedQty(0);
    }
    setRemarks('Batch meets sensory, crispiness, and seal integrity specifications.');
    setModalOpen(true);
  };

  const handleOrderSelect = (orderId: number) => {
    setSelectedOrderId(orderId);
    const ord = orders.find((o) => o.id === orderId);
    if (ord) {
      setQuantityChecked(ord.quantity);
      setPassedQty(ord.quantity);
      setFailedQty(0);
    }
  };

  const handleSubmitQC = async (e: React.FormEvent) => {
    e.preventDefault();
    const ord = orders.find((o) => o.id === selectedOrderId);
    if (!ord) {
      alert('Please select a valid production batch');
      return;
    }

    try {
      await ProductionService.createQualityCheck({
        production_order_id: selectedOrderId,
        product_id: ord.product_id,
        quantity_checked: quantityChecked,
        passed_qty: passedQty,
        failed_qty: failedQty,
        remarks,
        warehouse_id: warehouseId,
      });
      setModalOpen(false);
      load();
      alert(`Quality check logged successfully! ${passedQty} finished goods inwarded to inventory.`);
    } catch (err) {
      alert(ProductionService.errorMessage(err));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Quality Control (QC)</h1>
          <p className="text-slate-500 text-sm">
            Inspect finished snack batches and release certified products to e-commerce inventory
          </p>
        </div>
        <button
          onClick={openInspectionModal}
          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium shadow-sm transition-colors flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Record QC Inspection
        </button>
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
        ) : checks.length === 0 ? (
          <div className="p-12 text-center text-slate-500">
            No quality inspections recorded yet. Completed batches will appear here after inspection.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-700">
              <thead className="bg-slate-50 border-b border-slate-200 text-xs uppercase font-semibold text-slate-500">
                <tr>
                  <th className="px-6 py-3">Production Batch</th>
                  <th className="px-6 py-3">Product Inspected</th>
                  <th className="px-6 py-3">Checked Qty</th>
                  <th className="px-6 py-3">Passed Qty</th>
                  <th className="px-6 py-3">Failed Qty</th>
                  <th className="px-6 py-3">Pass Rate</th>
                  <th className="px-6 py-3">Inspector & Date</th>
                  <th className="px-6 py-3">Remarks</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {checks.map((qc) => {
                  const passRate =
                    qc.quantity_checked > 0 ? Math.round((qc.passed_qty / qc.quantity_checked) * 100) : 100;
                  const isHealthy = passRate >= 95;

                  return (
                    <tr key={qc.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-6 py-4 font-mono font-semibold text-slate-900">{qc.order_number}</td>
                      <td className="px-6 py-4 font-medium text-slate-800">{qc.product_name}</td>
                      <td className="px-6 py-4 text-slate-700">{qc.quantity_checked}</td>
                      <td className="px-6 py-4 font-semibold text-emerald-600">{qc.passed_qty}</td>
                      <td className="px-6 py-4 font-semibold text-red-500">{qc.failed_qty}</td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-2 py-0.5 text-xs font-bold rounded-md ${
                            isHealthy ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {passRate}%
                        </span>
                      </td>
                      <td className="px-6 py-4 text-xs text-slate-500">
                        <div>{qc.checked_by_name || 'Inspector'}</div>
                        <div>{new Date(qc.checked_at).toLocaleString()}</div>
                      </td>
                      <td className="px-6 py-4 text-xs text-slate-600 max-w-xs truncate">{qc.remarks || '—'}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* QC Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl space-y-4">
            <h2 className="text-xl font-bold text-slate-900">Record Quality Check</h2>
            <form onSubmit={handleSubmitQC} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Production Batch</label>
                <select
                  value={selectedOrderId}
                  onChange={(e) => handleOrderSelect(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-emerald-500 outline-none"
                >
                  {orders.map((o) => (
                    <option key={o.id} value={o.id}>
                      {o.order_number} — {o.product_name} ({o.quantity} units, {o.status})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                  Destination Warehouse (For Passed Stock)
                </label>
                <select
                  value={warehouseId}
                  onChange={(e) => setWarehouseId(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-emerald-500 outline-none"
                >
                  {warehouses.map((w) => (
                    <option key={w.id} value={w.id}>
                      {w.name} ({w.code})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 uppercase mb-1">Total Inspected</label>
                  <input
                    type="number"
                    min={1}
                    value={quantityChecked}
                    onChange={(e) => setQuantityChecked(Number(e.target.value))}
                    className="w-full px-2.5 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-emerald-700 uppercase mb-1">Passed (Inward)</label>
                  <input
                    type="number"
                    min={0}
                    value={passedQty}
                    onChange={(e) => setPassedQty(Number(e.target.value))}
                    className="w-full px-2.5 py-2 border border-emerald-300 bg-emerald-50 text-emerald-800 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 outline-none font-bold"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-red-700 uppercase mb-1">Failed / Scrap</label>
                  <input
                    type="number"
                    min={0}
                    value={failedQty}
                    onChange={(e) => setFailedQty(Number(e.target.value))}
                    className="w-full px-2.5 py-2 border border-red-300 bg-red-50 text-red-800 rounded-lg text-sm focus:ring-2 focus:ring-red-500 outline-none font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Inspection Remarks</label>
                <textarea
                  rows={2}
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  placeholder="Notes on packaging, taste profile, or moisture test..."
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
                  Confirm & Inward
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
