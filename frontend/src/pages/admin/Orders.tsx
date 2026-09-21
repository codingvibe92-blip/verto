import { useEffect, useState } from 'react';
import { OrderService, Order } from '../../services/orders';
import Spinner from '../../components/Spinner';

const statusBadges: Record<string, { bg: string; text: string }> = {
  PENDING_PAYMENT: { bg: 'bg-amber-100', text: 'text-amber-800' },
  CONFIRMED: { bg: 'bg-blue-100', text: 'text-blue-800' },
  PROCESSING: { bg: 'bg-indigo-100', text: 'text-indigo-800' },
  SHIPPED: { bg: 'bg-purple-100', text: 'text-purple-800' },
  DELIVERED: { bg: 'bg-emerald-100', text: 'text-emerald-800' },
  CANCELLED: { bg: 'bg-red-100', text: 'text-red-800' },
  REFUNDED: { bg: 'bg-slate-100', text: 'text-slate-700' },
};

export default function Orders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await OrderService.listOrders({
        page,
        limit: 20,
        search: search || undefined,
        status: filterStatus || undefined,
      });
      setOrders(data.rows);
    } catch (err) {
      setError(OrderService.errorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [page, filterStatus]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    load();
  };

  const handleViewDetails = async (id: number) => {
    try {
      const detail = await OrderService.getOrder(id);
      setSelectedOrder(detail);
    } catch (err) {
      alert(OrderService.errorMessage(err));
    }
  };

  const handleUpdateStatus = async (newStatus: string) => {
    if (!selectedOrder) return;
    try {
      const updated = await OrderService.updateStatus(selectedOrder.id, newStatus, `Status updated by Admin to ${newStatus}`);
      setSelectedOrder(updated);
      load();
    } catch (err) {
      alert(OrderService.errorMessage(err));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Orders & Fulfillment</h1>
          <p className="text-slate-500 text-sm">
            Process incoming customer orders, manage picking & packing, and update dispatch status
          </p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-2">
        {['', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'].map((st) => (
          <button
            key={st}
            onClick={() => {
              setFilterStatus(st);
              setPage(1);
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              filterStatus === st ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            {st || 'All Orders'}
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <form onSubmit={handleSearchSubmit} className="flex gap-2 max-w-md">
          <input
            type="text"
            placeholder="Search by Order #, Customer, or Email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 px-3 py-2 border border-slate-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-emerald-500"
          />
          <button type="submit" className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-sm font-medium">
            Search
          </button>
        </form>
      </div>

      {error && <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">{error}</div>}

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 flex justify-center">
            <Spinner />
          </div>
        ) : orders.length === 0 ? (
          <div className="p-12 text-center text-slate-500">No customer orders in this view.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-700">
              <thead className="bg-slate-50 border-b border-slate-200 text-xs uppercase font-semibold text-slate-500">
                <tr>
                  <th className="px-6 py-3">Order Number</th>
                  <th className="px-6 py-3">Customer</th>
                  <th className="px-6 py-3">Total Amount</th>
                  <th className="px-6 py-3">Payment</th>
                  <th className="px-6 py-3">Fulfillment Status</th>
                  <th className="px-6 py-3">Order Date</th>
                  <th className="px-6 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {orders.map((o) => {
                  const badge = statusBadges[o.status] || { bg: 'bg-slate-100', text: 'text-slate-700' };

                  return (
                    <tr key={o.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-6 py-4 font-mono font-bold text-slate-900">{o.order_number}</td>
                      <td className="px-6 py-4">
                        <div className="font-semibold text-slate-900">{o.customer_name || 'Guest Customer'}</div>
                        <div className="text-xs text-slate-500">{o.customer_email}</div>
                      </td>
                      <td className="px-6 py-4 font-bold text-slate-900 font-mono">
                        ${Number(o.grand_total).toFixed(2)}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-0.5 text-xs font-semibold rounded-md ${o.payment_status === 'PAID' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>
                          {o.payment_status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 text-xs font-bold rounded-full ${badge.bg} ${badge.text}`}>
                          {o.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-xs text-slate-500">
                        {new Date(o.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => handleViewDetails(o.id)}
                          className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition-colors"
                        >
                          View Details
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

      {/* Order Detail Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-xl space-y-5 my-8">
            <div className="flex justify-between items-start border-b border-slate-100 pb-3">
              <div>
                <span className="text-xs font-mono font-bold text-slate-500">ORDER DETAILS</span>
                <h2 className="text-xl font-bold text-slate-900">{selectedOrder.order_number}</h2>
                <span className="text-xs text-slate-500">Placed on {new Date(selectedOrder.created_at).toLocaleString()}</span>
              </div>
              <button onClick={() => setSelectedOrder(null)} className="text-slate-400 hover:text-slate-600 font-bold text-lg">
                ✕
              </button>
            </div>

            {/* Quick Status Bar */}
            <div className="flex flex-wrap gap-2 items-center justify-between bg-slate-50 p-3 rounded-xl">
              <div>
                <span className="text-xs text-slate-500 block">Current Status:</span>
                <span className="text-sm font-bold text-slate-800">{selectedOrder.status}</span>
              </div>
              <div className="flex gap-2">
                {selectedOrder.status === 'CONFIRMED' && (
                  <button
                    onClick={() => handleUpdateStatus('PROCESSING')}
                    className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold"
                  >
                    Pack Order (Processing)
                  </button>
                )}
                {selectedOrder.status === 'PROCESSING' && (
                  <button
                    onClick={() => handleUpdateStatus('SHIPPED')}
                    className="px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-xs font-semibold"
                  >
                    Dispatch / Shipped
                  </button>
                )}
                {selectedOrder.status === 'SHIPPED' && (
                  <button
                    onClick={() => handleUpdateStatus('DELIVERED')}
                    className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold"
                  >
                    Confirm Delivered
                  </button>
                )}
                {selectedOrder.status !== 'CANCELLED' && selectedOrder.status !== 'DELIVERED' && (
                  <button
                    onClick={() => {
                      if (confirm('Cancel this order? Stock will be automatically restocked.')) {
                        handleUpdateStatus('CANCELLED');
                      }
                    }}
                    className="px-3 py-1.5 border border-red-200 text-red-600 hover:bg-red-50 rounded-lg text-xs font-semibold"
                  >
                    Cancel Order
                  </button>
                )}
              </div>
            </div>

            {/* Customer & Shipping Address */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="bg-slate-50 p-3 rounded-xl space-y-1">
                <span className="font-bold text-slate-700 uppercase">Customer Information</span>
                <div className="font-semibold text-slate-900">{selectedOrder.customer_name}</div>
                <div className="text-slate-600">{selectedOrder.customer_email}</div>
                <div className="text-slate-600">{selectedOrder.customer_phone}</div>
              </div>
              <div className="bg-slate-50 p-3 rounded-xl space-y-1">
                <span className="font-bold text-slate-700 uppercase">Shipping Destination</span>
                {selectedOrder.shipping_address ? (
                  <>
                    <div className="text-slate-800">{selectedOrder.shipping_address.address_line1}</div>
                    <div className="text-slate-800">
                      {selectedOrder.shipping_address.city}, {selectedOrder.shipping_address.state} {selectedOrder.shipping_address.postal_code}
                    </div>
                    <div className="text-slate-500">{selectedOrder.shipping_address.country}</div>
                  </>
                ) : (
                  <div className="text-slate-500">Standard delivery address</div>
                )}
              </div>
            </div>

            {/* Items */}
            <div className="space-y-2">
              <h3 className="text-xs font-bold text-slate-700 uppercase">Purchased Items</h3>
              <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden">
                {selectedOrder.items?.map((it) => (
                  <div key={it.id} className="p-3 flex justify-between items-center text-xs">
                    <div>
                      <div className="font-bold text-slate-900">{it.product_name}</div>
                      <div className="text-slate-500 font-mono">SKU: {it.sku || '—'}</div>
                      <div className="text-slate-500">${Number(it.unit_price).toFixed(2)} × {it.quantity}</div>
                    </div>
                    <div className="font-mono font-bold text-slate-900 text-sm">
                      ${Number(it.line_total).toFixed(2)}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Financial Totals */}
            <div className="bg-slate-50 p-3.5 rounded-xl space-y-1.5 text-xs text-slate-700">
              <div className="flex justify-between">
                <span>Items Subtotal:</span>
                <span className="font-mono">${Number(selectedOrder.items_total).toFixed(2)}</span>
              </div>
              {Number(selectedOrder.discount_amount) > 0 && (
                <div className="flex justify-between text-emerald-600 font-semibold">
                  <span>Coupon Discount ({selectedOrder.coupon_code}):</span>
                  <span className="font-mono">-${Number(selectedOrder.discount_amount).toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Sales Tax (5%):</span>
                <span className="font-mono">${Number(selectedOrder.tax_amount).toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Shipping:</span>
                <span className="font-mono">${Number(selectedOrder.shipping_amount).toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm font-bold text-slate-900 border-t border-slate-200 pt-2">
                <span>Grand Total:</span>
                <span className="font-mono">${Number(selectedOrder.grand_total).toFixed(2)}</span>
              </div>
            </div>

            {/* Status History Timeline */}
            {selectedOrder.history && selectedOrder.history.length > 0 && (
              <div className="space-y-2">
                <h3 className="text-xs font-bold text-slate-700 uppercase">Timeline</h3>
                <div className="space-y-1 max-h-32 overflow-y-auto text-xs text-slate-600">
                  {selectedOrder.history.map((h, i) => (
                    <div key={i} className="flex justify-between py-1 border-b border-slate-100">
                      <span>
                        Advanced to <strong className="text-slate-800">{h.to_status}</strong> {h.reason ? `(${h.reason})` : ''}
                      </span>
                      <span className="text-slate-400">{new Date(h.created_at).toLocaleTimeString()}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

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
