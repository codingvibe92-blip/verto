import { useEffect, useState } from 'react';
import { InventoryService, Warehouse } from '../../services/inventory';
import Spinner from '../../components/Spinner';

export default function Warehouses() {
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Warehouse | null>(null);

  const [formData, setFormData] = useState({
    code: '',
    name: '',
    address_line1: '',
    city: '',
    state: '',
    postal_code: '',
    contact_name: '',
    contact_phone: '',
  });

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await InventoryService.allWarehouses();
      setWarehouses(data);
    } catch (err) {
      setError(InventoryService.errorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const openCreate = () => {
    setEditing(null);
    setFormData({
      code: `WH-${Math.floor(10 + Math.random() * 90)}`,
      name: '',
      address_line1: '',
      city: '',
      state: '',
      postal_code: '',
      contact_name: '',
      contact_phone: '',
    });
    setModalOpen(true);
  };

  const openEdit = (wh: Warehouse) => {
    setEditing(wh);
    setFormData({
      code: wh.code,
      name: wh.name,
      address_line1: wh.address_line1 || '',
      city: wh.city || '',
      state: wh.state || '',
      postal_code: wh.postal_code || '',
      contact_name: wh.contact_name || '',
      contact_phone: wh.contact_phone || '',
    });
    setModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editing) {
        await InventoryService.updateWarehouse(editing.id, formData);
      } else {
        await InventoryService.createWarehouse(formData);
      }
      setModalOpen(false);
      load();
    } catch (err) {
      alert(InventoryService.errorMessage(err));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Warehouses & Depots</h1>
          <p className="text-slate-500 text-sm">Manage fulfillment centers, distribution hubs, and storage facilities</p>
        </div>
        <button
          onClick={openCreate}
          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium shadow-sm transition-colors flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Warehouse
        </button>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">{error}</div>
      )}

      {/* Grid */}
      {loading ? (
        <div className="p-12 flex justify-center">
          <Spinner />
        </div>
      ) : warehouses.length === 0 ? (
        <div className="bg-white p-12 text-center rounded-xl border border-slate-200 text-slate-500">
          No warehouses found. Add your primary warehouse or fulfillment center.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {warehouses.map((wh) => (
            <div key={wh.id} className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-4 hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start">
                <div>
                  <span className="px-2 py-0.5 text-xs font-mono font-bold bg-slate-100 text-slate-700 rounded-md">
                    {wh.code}
                  </span>
                  <h2 className="text-lg font-bold text-slate-900 mt-2">{wh.name}</h2>
                </div>
                <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${wh.is_active ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}>
                  {wh.is_active ? 'Active' : 'Inactive'}
                </span>
              </div>

              <div className="text-xs text-slate-600 space-y-1">
                <div className="flex items-center gap-1.5">
                  <span className="text-slate-400">📍</span>
                  <span>{wh.address_line1 || 'Main Facility'}, {wh.city || ''} {wh.state || ''}</span>
                </div>
                {wh.contact_name && (
                  <div className="flex items-center gap-1.5">
                    <span className="text-slate-400">👤</span>
                    <span>Manager: {wh.contact_name} ({wh.contact_phone || 'No phone'})</span>
                  </div>
                )}
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
                <button
                  onClick={() => openEdit(wh)}
                  className="px-3 py-1.5 border border-slate-300 text-slate-700 rounded-lg text-xs font-medium hover:bg-slate-50 transition-colors"
                >
                  Edit Facility
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl space-y-4">
            <h2 className="text-xl font-bold text-slate-900">{editing ? 'Edit Warehouse' : 'Add Warehouse'}</h2>
            <form onSubmit={handleSave} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Code</label>
                  <input
                    type="text"
                    required
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm font-mono outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Facility Name</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Central Fulfillment Hub"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Address</label>
                <input
                  type="text"
                  value={formData.address_line1}
                  onChange={(e) => setFormData({ ...formData, address_line1: e.target.value })}
                  placeholder="Street Address"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-[10px] font-semibold text-slate-700 uppercase mb-1">City</label>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className="w-full px-2 py-1.5 border border-slate-300 rounded text-xs outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-semibold text-slate-700 uppercase mb-1">State</label>
                  <input
                    type="text"
                    value={formData.state}
                    onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                    className="w-full px-2 py-1.5 border border-slate-300 rounded text-xs outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-semibold text-slate-700 uppercase mb-1">Postal Code</label>
                  <input
                    type="text"
                    value={formData.postal_code}
                    onChange={(e) => setFormData({ ...formData, postal_code: e.target.value })}
                    className="w-full px-2 py-1.5 border border-slate-300 rounded text-xs outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Contact Name</label>
                  <input
                    type="text"
                    value={formData.contact_name}
                    onChange={(e) => setFormData({ ...formData, contact_name: e.target.value })}
                    placeholder="Warehouse Lead"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Phone</label>
                  <input
                    type="text"
                    value={formData.contact_phone}
                    onChange={(e) => setFormData({ ...formData, contact_phone: e.target.value })}
                    placeholder="+1 555-0199"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm outline-none"
                  />
                </div>
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
                  {editing ? 'Update Facility' : 'Create Facility'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
