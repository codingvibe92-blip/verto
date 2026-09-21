import { useEffect, useState } from 'react';
import { InventoryService, RawMaterial } from '../../services/inventory';
import Spinner from '../../components/Spinner';

export default function RawMaterials() {
  const [rows, setRows] = useState<RawMaterial[]>([]);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<RawMaterial | null>(null);

  // Form fields
  const [formData, setFormData] = useState({
    name: '',
    sku: '',
    unit: 'KG',
    cost: 0,
    min_quantity: 0,
    storage_location: '',
    description: '',
  });

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await InventoryService.listRawMaterials({
        page,
        limit: 20,
        search: search || undefined,
        status: status || undefined,
      });
      setRows(data.rows);
    } catch (err) {
      setError(InventoryService.errorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [page, status]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    load();
  };

  const openCreate = () => {
    setEditing(null);
    setFormData({
      name: '',
      sku: `RM-${Math.floor(1000 + Math.random() * 9000)}`,
      unit: 'KG',
      cost: 0,
      min_quantity: 10,
      storage_location: '',
      description: '',
    });
    setModalOpen(true);
  };

  const openEdit = (rm: RawMaterial) => {
    setEditing(rm);
    setFormData({
      name: rm.name,
      sku: rm.sku,
      unit: rm.unit,
      cost: Number(rm.cost) || 0,
      min_quantity: Number(rm.min_quantity) || 0,
      storage_location: rm.storage_location || '',
      description: rm.description || '',
    });
    setModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editing) {
        await InventoryService.updateRawMaterial(editing.id, formData);
      } else {
        await InventoryService.createRawMaterial(formData);
      }
      setModalOpen(false);
      load();
    } catch (err) {
      alert(InventoryService.errorMessage(err));
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to deactivate this raw material?')) return;
    try {
      await InventoryService.deleteRawMaterial(id);
      load();
    } catch (err) {
      alert(InventoryService.errorMessage(err));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Raw Materials</h1>
          <p className="text-slate-500 text-sm">Track raw ingredients, seasonings, and packaging materials</p>
        </div>
        <button
          onClick={openCreate}
          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium shadow-sm transition-colors flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Raw Material
        </button>
      </div>

      {/* Filter and Search */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-3 justify-between items-center">
        <form onSubmit={handleSearchSubmit} className="flex gap-2 w-full md:w-96">
          <input
            type="text"
            placeholder="Search material or SKU..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
          <button type="submit" className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-sm font-medium">
            Search
          </button>
        </form>

        <div className="flex gap-2 w-full md:w-auto">
          <select
            value={status}
            onChange={(e) => {
              setStatus(e.target.value);
              setPage(1);
            }}
            className="px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <option value="">All Statuses</option>
            <option value="ACTIVE">Active</option>
            <option value="INACTIVE">Inactive</option>
          </select>
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
        ) : rows.length === 0 ? (
          <div className="p-12 text-center text-slate-500">No raw materials found. Add one to get started.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-700">
              <thead className="bg-slate-50 border-b border-slate-200 text-xs uppercase font-semibold text-slate-500">
                <tr>
                  <th className="px-6 py-3">Material Name & SKU</th>
                  <th className="px-6 py-3">Category</th>
                  <th className="px-6 py-3">Current Stock</th>
                  <th className="px-6 py-3">Min Qty</th>
                  <th className="px-6 py-3">Unit Cost</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {rows.map((rm) => {
                  const onHand = Number(rm.quantity_on_hand);
                  const min = Number(rm.min_quantity);
                  const isLow = onHand <= min;

                  return (
                    <tr key={rm.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-medium text-slate-900">{rm.name}</div>
                        <div className="text-xs text-slate-500 font-mono">{rm.sku}</div>
                      </td>
                      <td className="px-6 py-4 text-slate-600">{rm.category_name || 'General'}</td>
                      <td className="px-6 py-4">
                        <span className={`font-semibold ${isLow ? 'text-amber-600' : 'text-slate-900'}`}>
                          {onHand} {rm.unit}
                        </span>
                        {isLow && (
                          <span className="ml-2 px-1.5 py-0.5 text-[10px] bg-amber-100 text-amber-700 rounded-md font-medium">
                            Low
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-slate-500">
                        {min} {rm.unit}
                      </td>
                      <td className="px-6 py-4 text-slate-700 font-mono">${Number(rm.cost).toFixed(2)}</td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-2.5 py-1 text-xs font-medium rounded-full ${
                            rm.status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          {rm.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right space-x-2">
                        <button
                          onClick={() => openEdit(rm)}
                          className="text-slate-500 hover:text-emerald-600 font-medium text-xs transition-colors"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(rm.id)}
                          className="text-slate-400 hover:text-red-600 font-medium text-xs transition-colors"
                        >
                          Deactivate
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

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl space-y-4">
            <h2 className="text-xl font-bold text-slate-900">
              {editing ? 'Edit Raw Material' : 'Add Raw Material'}
            </h2>
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Name</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Organic Potato Flakes"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">SKU</label>
                  <input
                    type="text"
                    required
                    value={formData.sku}
                    onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 outline-none font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Unit</label>
                  <select
                    value={formData.unit}
                    onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 outline-none bg-white"
                  >
                    <option value="KG">Kilogram (KG)</option>
                    <option value="G">Gram (G)</option>
                    <option value="L">Liter (L)</option>
                    <option value="PCS">Pieces (PCS)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Unit Cost ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.cost}
                    onChange={(e) => setFormData({ ...formData, cost: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Min Threshold</label>
                  <input
                    type="number"
                    value={formData.min_quantity}
                    onChange={(e) => setFormData({ ...formData, min_quantity: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Storage Bin / Location</label>
                <input
                  type="text"
                  value={formData.storage_location}
                  onChange={(e) => setFormData({ ...formData, storage_location: e.target.value })}
                  placeholder="e.g. Aisle 3, Rack B"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-medium transition-colors"
                >
                  {editing ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
