import { useEffect, useState } from 'react';
import { ProductionService, BOM } from '../../services/production';
import { InventoryService, RawMaterial } from '../../services/inventory';
import { CatalogService, Product } from '../../services/catalog';
import Spinner from '../../components/Spinner';

export default function BillOfMaterials() {
  const [boms, setBoms] = useState<BOM[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [rawMaterials, setRawMaterials] = useState<RawMaterial[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [viewingBOM, setViewingBOM] = useState<BOM | null>(null);

  // Form State
  const [productId, setProductId] = useState<number>(0);
  const [name, setName] = useState('');
  const [yieldQuantity, setYieldQuantity] = useState(1);
  const [wastagePercent, setWastagePercent] = useState(0);
  const [items, setItems] = useState<Array<{ raw_material_id: number; quantity: number; unit: string }>>([
    { raw_material_id: 0, quantity: 1, unit: 'KG' },
  ]);

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await ProductionService.listBOMs();
      setBoms(data.rows);
    } catch (err) {
      setError(ProductionService.errorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    CatalogService.listProducts({ limit: 100 }).then((d) => setProducts(d.rows)).catch(() => undefined);
    InventoryService.listRawMaterials({ limit: 100 }).then((d) => setRawMaterials(d.rows)).catch(() => undefined);
  }, []);

  const openCreateModal = () => {
    setProductId(products[0]?.id || 0);
    setName('');
    setYieldQuantity(100);
    setWastagePercent(2);
    setItems([{ raw_material_id: rawMaterials[0]?.id || 0, quantity: 10, unit: 'KG' }]);
    setModalOpen(true);
  };

  const addItemRow = () => {
    setItems([...items, { raw_material_id: rawMaterials[0]?.id || 0, quantity: 1, unit: 'KG' }]);
  };

  const removeItemRow = (index: number) => {
    if (items.length <= 1) return;
    setItems(items.filter((_, i) => i !== index));
  };

  const handleCreateBOM = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await ProductionService.createBOM({
        product_id: productId,
        name,
        yield_quantity: yieldQuantity,
        wastage_percent: wastagePercent,
        items,
      });
      setModalOpen(false);
      load();
    } catch (err) {
      alert(ProductionService.errorMessage(err));
    }
  };

  const handleViewBOM = async (id: number) => {
    try {
      const detail = await ProductionService.getBOM(id);
      setViewingBOM(detail);
    } catch (err) {
      alert(ProductionService.errorMessage(err));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Bill of Materials (BOM)</h1>
          <p className="text-slate-500 text-sm">Define recipes, ingredient proportions, and manufacturing yield</p>
        </div>
        <button
          onClick={openCreateModal}
          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium shadow-sm transition-colors flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Create BOM Recipe
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
        ) : boms.length === 0 ? (
          <div className="p-12 text-center text-slate-500">
            No recipes created yet. Click "Create BOM Recipe" to define manufacturing formulations.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-700">
              <thead className="bg-slate-50 border-b border-slate-200 text-xs uppercase font-semibold text-slate-500">
                <tr>
                  <th className="px-6 py-3">BOM Recipe Name</th>
                  <th className="px-6 py-3">Target Product</th>
                  <th className="px-6 py-3">Batch Yield</th>
                  <th className="px-6 py-3">Est. Wastage</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3">Version</th>
                  <th className="px-6 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {boms.map((b) => (
                  <tr key={b.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-6 py-4 font-semibold text-slate-900">{b.name}</td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-slate-800">{b.product_name}</div>
                      <div className="text-xs text-slate-500 font-mono">{b.product_sku}</div>
                    </td>
                    <td className="px-6 py-4 font-medium text-slate-700">{b.yield_quantity} units</td>
                    <td className="px-6 py-4 text-slate-500">{b.wastage_percent}%</td>
                    <td className="px-6 py-4">
                      <span className="px-2.5 py-1 text-xs font-medium rounded-full bg-emerald-100 text-emerald-700">
                        {b.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-xs font-mono text-slate-500">v{b.version}</td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => handleViewBOM(b.id)}
                        className="text-emerald-600 hover:text-emerald-800 font-medium text-xs mr-3 transition-colors"
                      >
                        View Ingredients
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal: Create BOM */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-xl space-y-4 my-8">
            <h2 className="text-xl font-bold text-slate-900">New Bill of Materials (BOM)</h2>
            <form onSubmit={handleCreateBOM} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Recipe Name</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Sea Salt Crunch Batch Formulation"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Target Product</label>
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
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Batch Yield (Units)</label>
                  <input
                    type="number"
                    min={1}
                    value={yieldQuantity}
                    onChange={(e) => setYieldQuantity(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Expected Wastage (%)</label>
                  <input
                    type="number"
                    min={0}
                    max={100}
                    value={wastagePercent}
                    onChange={(e) => setWastagePercent(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>
              </div>

              {/* Recipe Ingredients */}
              <div className="border-t border-slate-200 pt-4 space-y-3">
                <div className="flex justify-between items-center">
                  <h3 className="text-sm font-bold text-slate-800">Required Ingredients</h3>
                  <button
                    type="button"
                    onClick={addItemRow}
                    className="text-xs text-emerald-600 hover:text-emerald-700 font-semibold flex items-center gap-1"
                  >
                    + Add Ingredient
                  </button>
                </div>

                <div className="space-y-2 max-h-56 overflow-y-auto">
                  {items.map((item, idx) => (
                    <div key={idx} className="flex gap-2 items-center bg-slate-50 p-2 rounded-lg border border-slate-200">
                      <select
                        value={item.raw_material_id}
                        onChange={(e) => {
                          const updated = [...items];
                          updated[idx].raw_material_id = Number(e.target.value);
                          setItems(updated);
                        }}
                        className="flex-1 px-2 py-1.5 border border-slate-300 rounded text-xs bg-white outline-none"
                      >
                        {rawMaterials.map((rm) => (
                          <option key={rm.id} value={rm.id}>
                            {rm.name} ({rm.sku}) — Available: {rm.quantity_on_hand} {rm.unit}
                          </option>
                        ))}
                      </select>

                      <input
                        type="number"
                        min={0.01}
                        step="0.01"
                        value={item.quantity}
                        onChange={(e) => {
                          const updated = [...items];
                          updated[idx].quantity = Number(e.target.value);
                          setItems(updated);
                        }}
                        placeholder="Qty"
                        className="w-24 px-2 py-1.5 border border-slate-300 rounded text-xs outline-none"
                      />

                      <span className="text-xs text-slate-500 font-medium w-10">{item.unit}</span>

                      <button
                        type="button"
                        onClick={() => removeItemRow(idx)}
                        className="text-slate-400 hover:text-red-500 p-1"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
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
                  Save Recipe
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: View BOM detail */}
      {viewingBOM && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl space-y-4">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-xl font-bold text-slate-900">{viewingBOM.name}</h2>
                <p className="text-xs text-slate-500">For: {viewingBOM.product_name} ({viewingBOM.product_sku})</p>
              </div>
              <button onClick={() => setViewingBOM(null)} className="text-slate-400 hover:text-slate-600 text-xl font-bold">
                ✕
              </button>
            </div>

            <div className="bg-slate-50 p-3 rounded-lg flex justify-between text-xs font-semibold text-slate-700">
              <span>Batch Yield: {viewingBOM.yield_quantity} units</span>
              <span>Wastage: {viewingBOM.wastage_percent}%</span>
              <span>Version: v{viewingBOM.version}</span>
            </div>

            <h3 className="text-xs font-bold text-slate-700 uppercase">Ingredient Breakdown</h3>
            <div className="divide-y divide-slate-100 max-h-60 overflow-y-auto">
              {viewingBOM.items?.map((item) => (
                <div key={item.id} className="py-2.5 flex justify-between items-center text-sm">
                  <div>
                    <div className="font-medium text-slate-800">{item.raw_material_name}</div>
                    <div className="text-xs text-slate-500 font-mono">{item.raw_material_sku}</div>
                  </div>
                  <div className="font-semibold text-slate-900">
                    {item.quantity} {item.unit}
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-end pt-3 border-t border-slate-100">
              <button
                onClick={() => setViewingBOM(null)}
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
