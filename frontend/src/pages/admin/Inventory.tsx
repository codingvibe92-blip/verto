import { useEffect, useState, useMemo } from 'react';
import { InventoryService, InventoryItem, Warehouse } from '../../services/inventory';
import { CatalogService, Product } from '../../services/catalog';
import Spinner from '../../components/Spinner';
import {
  FiDatabase,
  FiPlus,
  FiSliders,
  FiSearch,
  FiMapPin,
  FiRefreshCw,
} from 'react-icons/fi';

export default function Inventory() {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState('');
  const [selectedWarehouseId, setSelectedWarehouseId] = useState<string>('');
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
      const data = await InventoryService.listInventory({ limit: 100 });
      setItems(data.rows);
    } catch (err) {
      setError(InventoryService.errorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    InventoryService.allWarehouses()
      .then((whs) => {
        setWarehouses(whs);
        if (whs.length > 0) {
          setReceiveData((prev) => ({ ...prev, warehouse_id: whs[0].id }));
        }
      })
      .catch(() => undefined);

    CatalogService.listProducts({ limit: 100 })
      .then((prds) => {
        setProducts(prds.rows);
        if (prds.rows.length > 0) {
          setReceiveData((prev) => ({ ...prev, product_id: prds.rows[0].id }));
        }
      })
      .catch(() => undefined);
  }, []);

  const filteredItems = useMemo(() => {
    const q = search.trim().toLowerCase();
    return items.filter((inv) => {
      if (selectedWarehouseId && String(inv.warehouse_id) !== selectedWarehouseId) {
        return false;
      }
      if (!q) return true;
      return (
        inv.product_name.toLowerCase().includes(q) ||
        inv.product_sku.toLowerCase().includes(q) ||
        inv.warehouse_name.toLowerCase().includes(q)
      );
    });
  }, [items, search, selectedWarehouseId]);

  const summary = useMemo(() => {
    const totalUnits = items.reduce((sum, i) => sum + Number(i.quantity || 0), 0);
    const totalReserved = items.reduce((sum, i) => sum + Number(i.reserved_quantity || 0), 0);
    const lowStockCount = items.filter(
      (i) => Number(i.quantity) - Number(i.reserved_quantity || 0) <= 15
    ).length;
    return { totalUnits, totalReserved, lowStockCount, totalSKUs: items.length };
  }, [items]);

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
      reason: 'Cycle count correction',
      notes: '',
    });
    setAdjustModalOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 font-heading">
              Inventory & Warehouse Levels
            </h1>
            <span className="rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-semibold text-blue-700 border border-blue-200">
              {summary.totalSKUs} records
            </span>
          </div>
          <p className="mt-1 text-xs text-slate-500">
            Real-time multi-warehouse stock allocations, safety stock buffers, and manual receipt/adjustment logs.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setReceiveModalOpen(true)}
            className="btn-primary btn-sm inline-flex items-center gap-1.5"
          >
            <FiPlus className="h-4 w-4" />
            <span>Receive Inward Stock</span>
          </button>
        </div>
      </div>

      {/* Summary KPI Strip */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="card p-4">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
            Total Units On-Hand
          </span>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900">
              {summary.totalUnits.toLocaleString('en-IN')}
            </span>
            <span className="text-xs text-slate-400">units</span>
          </div>
        </div>

        <div className="card p-4">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
            Reserved Units (Carts/Orders)
          </span>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-amber-600">
              {summary.totalReserved.toLocaleString('en-IN')}
            </span>
            <span className="text-xs text-slate-400">units</span>
          </div>
        </div>

        <div className="card p-4">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
            Low Stock Warnings
          </span>
          <div className="mt-1 flex items-baseline gap-2">
            <span
              className={`text-2xl font-bold ${
                summary.lowStockCount > 0 ? 'text-rose-600' : 'text-slate-900'
              }`}
            >
              {summary.lowStockCount}
            </span>
            <span className="text-xs text-slate-400">SKUs below buffer</span>
          </div>
        </div>

        <div className="card p-4">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
            Active Warehouse Nodes
          </span>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900">{warehouses.length}</span>
            <span className="text-xs text-slate-400">facilities connected</span>
          </div>
        </div>
      </div>

      {/* Filters Toolbar */}
      <div className="card p-4 flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[220px]">
          <FiSearch className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by product name, SKU, or warehouse…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input pl-9.5 py-2 text-xs"
          />
        </div>

        <div className="w-52">
          <select
            value={selectedWarehouseId}
            onChange={(e) => setSelectedWarehouseId(e.target.value)}
            className="input py-2 text-xs cursor-pointer"
          >
            <option value="">All Warehouses ({warehouses.length})</option>
            {warehouses.map((wh) => (
              <option key={wh.id} value={String(wh.id)}>
                {wh.name} ({wh.code})
              </option>
            ))}
          </select>
        </div>

        <button onClick={load} className="btn-secondary btn-sm" title="Refresh Inventory">
          <FiRefreshCw className="h-3.5 w-3.5" />
          <span>Refresh</span>
        </button>
      </div>

      {error && (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-xs font-medium text-rose-800 flex items-center justify-between">
          <span>{error}</span>
          <button onClick={() => setError('')} className="text-rose-700 font-bold">
            ✕
          </button>
        </div>
      )}

      {/* Inventory Table Card */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr>
                <th className="th">Product & SKU</th>
                <th className="th">Warehouse Location</th>
                <th className="th">Physical On-Hand</th>
                <th className="th">Reserved</th>
                <th className="th">Available to Sell</th>
                <th className="th">Stock Health</th>
                <th className="th text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredItems.map((inv) => {
                const total = Number(inv.quantity);
                const reserved = Number(inv.reserved_quantity || 0);
                const available = total - reserved;
                const percent = total > 0 ? Math.min(100, Math.round((available / total) * 100)) : 0;

                return (
                  <tr key={inv.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="td">
                      <div className="font-semibold text-slate-900">{inv.product_name}</div>
                      <div className="mt-0.5 inline-block rounded bg-slate-100 px-1.5 py-0.2 font-mono text-[11px] text-slate-600">
                        {inv.product_sku}
                      </div>
                    </td>
                    <td className="td">
                      <div className="flex items-center gap-1.5 text-slate-800 font-medium">
                        <FiMapPin className="h-3.5 w-3.5 text-slate-400" />
                        <span>{inv.warehouse_name}</span>
                      </div>
                    </td>
                    <td className="td font-bold text-slate-900">{total} units</td>
                    <td className="td font-medium text-amber-600">
                      {reserved > 0 ? `${reserved} units` : '—'}
                    </td>
                    <td className="td font-bold text-slate-900">
                      <span
                        className={`badge ${
                          available > 20
                            ? 'badge-success'
                            : available > 0
                            ? 'badge-warning'
                            : 'badge-danger'
                        }`}
                      >
                        <span className="h-1.5 w-1.5 rounded-full bg-current" />
                        <span>{available} units</span>
                      </span>
                    </td>
                    <td className="td w-36">
                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-[11px] text-slate-500">
                          <span>{percent}% free</span>
                        </div>
                        <div className="h-1.5 w-full rounded-full bg-slate-100 overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              available > 20
                                ? 'bg-emerald-500'
                                : available > 0
                                ? 'bg-amber-500'
                                : 'bg-rose-500'
                            }`}
                            style={{ width: `${percent}%` }}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="td text-right">
                      <button
                        onClick={() => openAdjustModal(inv)}
                        className="btn-secondary btn-sm inline-flex items-center gap-1"
                      >
                        <FiSliders className="h-3.5 w-3.5 text-slate-500" />
                        <span>Adjust</span>
                      </button>
                    </td>
                  </tr>
                );
              })}
              {!loading && filteredItems.length === 0 && (
                <tr>
                  <td colSpan={7} className="td py-12 text-center text-slate-400">
                    <FiDatabase className="mx-auto h-8 w-8 text-slate-300 mb-2" />
                    <p className="text-sm font-medium">No inventory records found</p>
                    <p className="text-xs mt-0.5">Click "Receive Inward Stock" to inward stock to a warehouse.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        {loading && (
          <div className="py-8">
            <Spinner />
          </div>
        )}
      </div>

      {/* Receive Stock Modal */}
      {receiveModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl space-y-5 border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="text-lg font-bold text-slate-900 font-heading">Receive Stock Inward</h2>
              <button
                onClick={() => setReceiveModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleReceiveStock} className="space-y-4">
              <div>
                <label className="label">Product Item</label>
                <select
                  value={receiveData.product_id}
                  onChange={(e) =>
                    setReceiveData({ ...receiveData, product_id: Number(e.target.value) })
                  }
                  className="input cursor-pointer"
                >
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.sku})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="label">Receiving Warehouse</label>
                <select
                  value={receiveData.warehouse_id}
                  onChange={(e) =>
                    setReceiveData({ ...receiveData, warehouse_id: Number(e.target.value) })
                  }
                  className="input cursor-pointer"
                >
                  {warehouses.map((w) => (
                    <option key={w.id} value={w.id}>
                      {w.name} ({w.code})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="label">Quantity Inwarded</label>
                <input
                  type="number"
                  min={1}
                  required
                  value={receiveData.quantity}
                  onChange={(e) =>
                    setReceiveData({ ...receiveData, quantity: Number(e.target.value) })
                  }
                  className="input font-mono"
                />
              </div>

              <div>
                <label className="label">Reference / PO Notes</label>
                <input
                  type="text"
                  value={receiveData.notes}
                  onChange={(e) => setReceiveData({ ...receiveData, notes: e.target.value })}
                  className="input"
                  placeholder="e.g. PO-2026-0819 Supplier shipment"
                />
              </div>

              <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setReceiveModalOpen(false)}
                  className="btn-secondary btn-sm"
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary btn-sm">
                  Confirm Inward
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Adjust Stock Modal */}
      {adjustModalOpen && selectedInv && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl space-y-5 border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="text-lg font-bold text-slate-900 font-heading">Adjust Inventory</h2>
              <button
                onClick={() => setAdjustModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 font-bold"
              >
                ✕
              </button>
            </div>

            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 text-xs space-y-1">
              <div className="font-bold text-slate-900 text-sm">{selectedInv.product_name}</div>
              <div className="text-slate-500">Warehouse: {selectedInv.warehouse_name}</div>
              <div className="text-slate-700 font-semibold">
                Current On-Hand: {selectedInv.quantity} units
              </div>
            </div>

            <form onSubmit={handleAdjustStock} className="space-y-4">
              <div>
                <label className="label">Quantity Difference (+ or -)</label>
                <input
                  type="number"
                  required
                  value={adjustData.quantity_change}
                  onChange={(e) =>
                    setAdjustData({ ...adjustData, quantity_change: Number(e.target.value) })
                  }
                  placeholder="e.g. +10 or -5"
                  className="input font-mono"
                />
                <p className="mt-1 text-[11px] text-slate-400">
                  Use negative numbers for damaged/expired items, positive for physical discovery.
                </p>
              </div>

              <div>
                <label className="label">Adjustment Reason</label>
                <select
                  value={adjustData.reason}
                  onChange={(e) => setAdjustData({ ...adjustData, reason: e.target.value })}
                  className="input cursor-pointer"
                >
                  <option value="Cycle count correction">Cycle count correction</option>
                  <option value="Damaged goods write-off">Damaged goods write-off</option>
                  <option value="Packaging sample testing">Packaging sample testing</option>
                  <option value="Return to supplier">Return to supplier</option>
                </select>
              </div>

              <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setAdjustModalOpen(false)}
                  className="btn-secondary btn-sm"
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary btn-sm">
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
