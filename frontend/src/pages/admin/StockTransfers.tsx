import { useEffect, useState } from 'react';
import { InventoryService, Warehouse } from '../../services/inventory';
import { CatalogService, Product } from '../../services/catalog';

export default function StockTransfers() {
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const [productId, setProductId] = useState<number>(0);
  const [sourceWarehouseId, setSourceWarehouseId] = useState<number>(0);
  const [destinationWarehouseId, setDestinationWarehouseId] = useState<number>(0);
  const [quantity, setQuantity] = useState<number>(10);
  const [notes, setNotes] = useState('');

  useEffect(() => {
    InventoryService.allWarehouses().then((whs) => {
      setWarehouses(whs);
      if (whs.length >= 2) {
        setSourceWarehouseId(whs[0].id);
        setDestinationWarehouseId(whs[1].id);
      } else if (whs.length === 1) {
        setSourceWarehouseId(whs[0].id);
        setDestinationWarehouseId(whs[0].id);
      }
    }).catch(() => undefined);

    CatalogService.listProducts({ limit: 100 }).then((prds) => {
      setProducts(prds.rows);
      if (prds.rows.length > 0) setProductId(prds.rows[0].id);
    }).catch(() => undefined);
  }, []);

  const handleTransfer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (sourceWarehouseId === destinationWarehouseId) {
      setError('Source and Destination warehouses must be different.');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      await InventoryService.transferStock({
        product_id: productId,
        source_warehouse_id: sourceWarehouseId,
        destination_warehouse_id: destinationWarehouseId,
        quantity,
        notes,
      });
      setSuccess(`Successfully transferred ${quantity} units!`);
      setQuantity(10);
      setNotes('');
    } catch (err) {
      setError(InventoryService.errorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Inter-Warehouse Stock Transfer</h1>
        <p className="text-slate-500 text-sm">
          Relocate finished products between distribution centers and local hubs
        </p>
      </div>

      {error && <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">{error}</div>}
      {success && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-700 text-sm">{success}</div>
      )}

      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
        <form onSubmit={handleTransfer} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Select Product</label>
            <select
              value={productId}
              onChange={(e) => setProductId(Number(e.target.value))}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-emerald-500 outline-none"
            >
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.sku})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                Source Warehouse (From)
              </label>
              <select
                value={sourceWarehouseId}
                onChange={(e) => setSourceWarehouseId(Number(e.target.value))}
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
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                Destination Warehouse (To)
              </label>
              <select
                value={destinationWarehouseId}
                onChange={(e) => setDestinationWarehouseId(Number(e.target.value))}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-emerald-500 outline-none"
              >
                {warehouses.map((w) => (
                  <option key={w.id} value={w.id}>
                    {w.name} ({w.code})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Quantity to Transfer</label>
            <input
              type="number"
              min={1}
              required
              value={quantity}
              onChange={(e) => setQuantity(Number(e.target.value))}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Transfer Notes / Reason</label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Stock replenishment for regional weekend demand"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
            />
          </div>

          <div className="pt-4 border-t border-slate-100 flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-lg text-sm font-semibold shadow-sm transition-colors flex items-center gap-2"
            >
              {loading ? 'Processing Transfer...' : 'Initiate Stock Transfer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
