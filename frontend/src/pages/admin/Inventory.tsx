import { useEffect, useState } from 'react';
import { InventoryService, InventoryItem, Warehouse } from '../../services/inventory';
import { CatalogService, Product } from '../../services/catalog';
import Spinner from '../../components/Spinner';

export default function Inventory() {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Modals
  const [receiveModalOpen, setReceiveModalOpen] = useState(false);
  const [adjustModalOpen, setAdjustModalOpen] = useState(false);
  const [selectedInv, setSelectedInv] = useState<InventoryItem | null>(null);

  // Receive Form
  const [receiveData, setReceiveData] = useState({
    product_id: 0,
    warehouse_id: 0,
    quantity: 100,
    notes: 'Direct supplier receipt',
  });

  // Adjust Form
  const [adjustData, setAdjustData] = useState({
    quantity_change: 0,
    reason: 'Cycle count correction',
    notes: '',
  });

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await InventoryService.listInventory({ limit: 50 });
      setItems(data.rows);
    } catch (err) {
      setError(InventoryService.errorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    InventoryService.allWarehouses().then((whs) => {
      setWarehouses(whs);
      if (whs.length > 0) {
        setReceiveData((prev) => ({ ...prev, warehouse_id: whs[0].id }));
      }
    }).catch(() => undefined);

    CatalogService.listProducts({ limit: 100 }).then((prds) => {
      setProducts(prds.rows);
      if (prds.rows.length > 0) {
        setReceiveData((prev) => ({ ...prev, product_id: prds.rows[0].id }));
      }
    }).catch(() => undefined);
  }, []);

  const handleReceiveStock = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await InventoryService.receiveStock(receiveData);
      setReceiveModalOpen(false);
      load();
    } catch (err) {
      alert(InventoryService.errorMessage(err));
    }
  };

  const handleAdjustStock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedInv) return;
    try {
      await InventoryService.adjustStock({
        inventory_id: selectedInv.id,
        quantity_change: adjustData.quantity_change,
        reason: adjustData.reason,
        notes: adjustData.notes,
      });
      setAdjustModalOpen(false);
      load();
    } catch (err) {
      alert(InventoryService.errorMessage(err));
    }
  };

  const openAdjustModal = (inv: InventoryItem) => {
    setSelectedInv(inv);
    setAdjustData({
      quantity_change: 0,
      reason: 'Physical count audit',
      notes: '',
    });
    setAdjustModalOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Inventory & Stock Levels</h1>
          <p className="text-slate-500 text-sm">
            Live multi-warehouse finished goods inventory, reservations, and adjustments
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setReceiveModalOpen(true)}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium shadow-sm transition-colors flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Receive Stock
          </button>
        </div>
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
        ) : items.length === 0 ? (
          <div className="p-12 text-center text-slate-500">
            No stock records yet. Click "Receive Stock" or complete a production QC inspection to inward items.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-700">
              <thead className="bg-slate-50 border-b border-slate-200 text-xs uppercase font-semibold text-slate-500">
                <tr>
                  <th className="px-6 py-3">Product Name & SKU</th>
                  <th className="px-6 py-3">Warehouse</th>
                  <th className="px-6 py-3">Total On-Hand</th>
                  <th className="px-6 py-3">Reserved (Cart/Orders)</th>
                  <th className="px-6 py-3">Available for E-Commerce</th>
                  <th className="px-6 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {items.map((inv) => {
                  const available = Number(inv.quantity) - Number(inv.reserved_quantity || 0);

                  return (
                    <tr key={inv.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-semibold text-slate-900">{inv.product_name}</div>
                        <div className="text-xs text-slate-500 font-mono">{inv.product_sku}</div>
                      </td>
                      <td className="px-6 py-4 font-medium text-slate-700">{inv.warehouse_name}</td>
                      <td className="px-6 py-4 font-bold text-slate-900">{inv.quantity} units</td>
                      <td className="px-6 py-4 font-medium text-amber-600">
                        {inv.reserved_quantity || 0} units
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-2.5 py-1 text-xs font-bold rounded-full ${
                            available > 20
                              ? 'bg-emerald-100 text-emerald-800'
                              : available > 0
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {available} units available
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => openAdjustModal(inv)}
                          className="text-emerald-600 hover:text-emerald-800 font-medium text-xs transition-colors"
                        >
                          Adjust Stock
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Receive Stock Modal */}
      {receiveModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl space-y-4">
            <h2 className="text-xl font-bold text-slate-900">Receive Stock Inward</h2>
            <form onSubmit={handleReceiveStock} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Product</label>
                <select
                  value={receiveData.product_id}
                  onChange={(e) => setReceiveData({ ...receiveData, product_id: Number(e.target.value) })}
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
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Warehouse</label>
                <select
                  value={receiveData.warehouse_id}
                  onChange={(e) => setReceiveData({ ...receiveData, warehouse_id: Number(e.target.value) })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-emerald-500 outline-none"
                >
                  {warehouses.map((w) => (
                    <option key={w.id} value={w.id}>
                      {w.name} ({w.code})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Quantity Received</label>
                <input
                  type="number"
                  min={1}
                  required
                  value={receiveData.quantity}
                  onChange={(e) => setReceiveData({ ...receiveData, quantity: Number(e.target.value) })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Notes / Reference</label>
                <input
                  type="text"
                  value={receiveData.notes}
                  onChange={(e) => setReceiveData({ ...receiveData, notes: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setReceiveModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-medium"
                >
                  Confirm Receipt
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Adjust Stock Modal */}
      {adjustModalOpen && selectedInv && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl space-y-4">
            <h2 className="text-xl font-bold text-slate-900">Adjust Inventory</h2>
            <div className="bg-slate-50 p-3 rounded-lg text-xs">
              <div className="font-semibold text-slate-900">{selectedInv.product_name}</div>
              <div className="text-slate-500">Warehouse: {selectedInv.warehouse_name}</div>
              <div className="text-slate-500">Current On Hand: {selectedInv.quantity} units</div>
            </div>

            <form onSubmit={handleAdjustStock} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                  Quantity Change (+ to add, - to remove)
                </label>
                <input
                  type="number"
                  required
                  value={adjustData.quantity_change}
                  onChange={(e) => setAdjustData({ ...adjustData, quantity_change: Number(e.target.value) })}
                  placeholder="e.g. +10 or -5"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Reason</label>
                <select
                  value={adjustData.reason}
                  onChange={(e) => setAdjustData({ ...adjustData, reason: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-emerald-500 outline-none"
                >
                  <option value="Cycle count correction">Cycle count correction</option>
                  <option value="Damaged goods write-off">Damaged goods write-off</option>
                  <option value="Packaging sample testing">Packaging sample testing</option>
                  <option value="Return to supplier">Return to supplier</option>
                </select>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setAdjustModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-medium"
                >
                  Apply Adjustment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
