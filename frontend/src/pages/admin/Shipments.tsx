import { useEffect, useState } from 'react';
import client, { apiErrorMessage } from '../../api/client';
import { OrderService, Order } from '../../services/orders';
import Spinner from '../../components/Spinner';

export interface Shipment {
  id: number;
  order_id: number;
  order_number: string;
  customer_name?: string;
  provider: string;
  awb: string;
  courier: string;
  status: string;
  created_at: string;
}

export default function Shipments() {
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [modalOpen, setModalOpen] = useState(false);

  // Form
  const [orderId, setOrderId] = useState<number>(0);
  const [courier, setCourier] = useState('FedEx Express');

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await client.get('/shipments');
      setShipments(res.data.data);
    } catch (err) {
      setError(apiErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    OrderService.listOrders({ limit: 100 }).then((d) => setOrders(d.rows)).catch(() => undefined);
  }, []);

  const openCreate = () => {
    const readyOrder = orders.find((o) => o.status === 'PROCESSING' || o.status === 'CONFIRMED') || orders[0];
    if (readyOrder) setOrderId(readyOrder.id);
    setCourier('FedEx Ground');
    setModalOpen(true);
  };

  const handleCreateShipment = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await client.post('/shipments', {
        order_id: orderId,
        courier,
      });
      setModalOpen(false);
      load();
      alert('Shipment generated and carrier AWB assigned!');
    } catch (err) {
      alert(apiErrorMessage(err));
    }
  };

  const handleAddCheckpoint = async (shipmentId: number) => {
    const status = prompt('Select status: IN_TRANSIT or DELIVERED', 'IN_TRANSIT');
    if (!status) return;
    const location = prompt('Current Hub / Facility:', 'Regional Hub Sort Facility');
    if (!location) return;

    try {
      await client.post(`/shipments/${shipmentId}/checkpoints`, {
        status,
        location,
        description: `Package checkpoint reached at ${location}`,
      });
      load();
    } catch (err) {
      alert(apiErrorMessage(err));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Shipments & Carrier Dispatch</h1>
          <p className="text-slate-500 text-sm">
            Generate AWB tracking numbers, assign shipping partners, and broadcast delivery checkpoints
          </p>
        </div>
        <button
          onClick={openCreate}
          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium shadow-sm transition-colors flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Create Dispatch Shipment
        </button>
      </div>

      {error && <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">{error}</div>}

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 flex justify-center">
            <Spinner />
          </div>
        ) : shipments.length === 0 ? (
          <div className="p-12 text-center text-slate-500">
            No shipments dispatched yet. Click "Create Dispatch Shipment" to generate tracking for an order.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-700">
              <thead className="bg-slate-50 border-b border-slate-200 text-xs uppercase font-semibold text-slate-500">
                <tr>
                  <th className="px-6 py-3">AWB Tracking Number</th>
                  <th className="px-6 py-3">Order Ref</th>
                  <th className="px-6 py-3">Customer</th>
                  <th className="px-6 py-3">Courier</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3">Dispatched Date</th>
                  <th className="px-6 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {shipments.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-6 py-4 font-mono font-bold text-slate-900">{s.awb}</td>
                    <td className="px-6 py-4 font-mono text-slate-600">{s.order_number}</td>
                    <td className="px-6 py-4 font-medium text-slate-800">{s.customer_name || 'Customer'}</td>
                    <td className="px-6 py-4 text-slate-700">{s.courier}</td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-2.5 py-1 text-xs font-bold rounded-full ${
                          s.status === 'DELIVERED'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-purple-100 text-purple-800'
                        }`}
                      >
                        {s.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-500">
                      {new Date(s.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      {s.status !== 'DELIVERED' && (
                        <button
                          onClick={() => handleAddCheckpoint(s.id)}
                          className="text-xs font-semibold text-emerald-600 hover:text-emerald-700"
                        >
                          + Add Checkpoint
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create Shipment Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl space-y-4">
            <h2 className="text-xl font-bold text-slate-900">Create Carrier Shipment</h2>
            <form onSubmit={handleCreateShipment} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Select Order</label>
                <select
                  value={orderId}
                  onChange={(e) => setOrderId(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-emerald-500 outline-none"
                >
                  {orders.map((o) => (
                    <option key={o.id} value={o.id}>
                      {o.order_number} — {o.customer_name} (${Number(o.grand_total).toFixed(2)}, {o.status})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Logistics Courier</label>
                <select
                  value={courier}
                  onChange={(e) => setCourier(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-emerald-500 outline-none"
                >
                  <option value="FedEx Express">FedEx Express</option>
                  <option value="UPS Ground">UPS Ground</option>
                  <option value="DHL Priority">DHL Priority</option>
                  <option value="USPS Priority Mail">USPS Priority Mail</option>
                </select>
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
                  Generate AWB & Dispatch
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
