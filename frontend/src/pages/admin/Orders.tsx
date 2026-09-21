import { useEffect, useState } from 'react';
import { OrderService, Order } from '../../services/orders';
import Spinner from '../../components/Spinner';
import {
  FiShoppingBag,
  FiSearch,
  FiEye,
  FiUser,
  FiMapPin,
} from 'react-icons/fi';

const statusBadgeClasses: Record<string, string> = {
  PENDING: 'badge-warning',
  PENDING_PAYMENT: 'badge-warning',
  CONFIRMED: 'badge-info',
  PROCESSING: 'badge-info',
  SHIPPED: 'badge-info',
  DELIVERED: 'badge-success',
  CANCELLED: 'badge-danger',
  REFUNDED: 'badge-neutral',
};

const filterTabs = [
  { key: '', label: 'All Orders' },
  { key: 'CONFIRMED', label: 'Confirmed' },
  { key: 'PROCESSING', label: 'Processing' },
  { key: 'SHIPPED', label: 'Shipped' },
  { key: 'DELIVERED', label: 'Delivered' },
  { key: 'CANCELLED', label: 'Cancelled' },
];

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
      const updated = await OrderService.updateStatus(
        selectedOrder.id,
        newStatus,
        `Status updated by Admin to ${newStatus}`
      );
      setSelectedOrder(updated);
      load();
    } catch (err) {
      alert(OrderService.errorMessage(err));
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 font-heading">
              Orders & Fulfillment
            </h1>
            <span className="rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-semibold text-blue-700 border border-blue-200">
              {orders.length} in view
            </span>
          </div>
          <p className="mt-1 text-xs text-slate-500">
            Process customer orders, monitor payment verifications, assign dispatch batches, and manage delivery status.
          </p>
        </div>
      </div>

      {/* Filter Tabs & Search Card */}
      <div className="card p-4 space-y-3">
        {/* Status Tabs */}
        <div className="flex flex-wrap items-center gap-2">
          {filterTabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => {
                setFilterStatus(tab.key);
                setPage(1);
              }}
              className={`rounded-xl px-3.5 py-1.5 text-xs font-semibold transition-all ${
                filterStatus === tab.key
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-sm shadow-blue-500/25'
                  : 'bg-slate-100/80 text-slate-600 hover:bg-slate-200/80'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search */}
        <form onSubmit={handleSearchSubmit} className="flex gap-2 max-w-md pt-1">
          <div className="relative flex-1">
            <FiSearch className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by Order #, Customer, or Email…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input pl-9.5 py-2 text-xs"
            />
          </div>
          <button type="submit" className="btn-secondary btn-sm">
            Search
          </button>
        </form>
      </div>

      {error && (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-xs font-medium text-rose-800 flex items-center justify-between">
          <span>{error}</span>
          <button onClick={() => setError('')} className="text-rose-700 font-bold">
            ✕
          </button>
        </div>
      )}

      {/* Orders Table Card */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr>
                <th className="th">Order #</th>
                <th className="th">Customer</th>
                <th className="th">Total Amount</th>
                <th className="th">Payment Status</th>
                <th className="th">Fulfillment Status</th>
                <th className="th">Order Date</th>
                <th className="th text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {orders.map((o) => (
                <tr key={o.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="td">
                    <div className="flex items-center gap-2">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                        <FiShoppingBag className="h-4 w-4" />
                      </div>
                      <span className="font-mono font-bold text-slate-900">{o.order_number}</span>
                    </div>
                  </td>
                  <td className="td">
                    <div className="font-semibold text-slate-900">
                      {o.customer_name || 'Guest Customer'}
                    </div>
                    <div className="text-[11px] text-slate-400">{o.customer_email}</div>
                  </td>
                  <td className="td font-bold text-slate-900">
                    ₹{Number(o.grand_total || 0).toLocaleString('en-IN')}
                  </td>
                  <td className="td">
                    <span
                      className={`badge ${
                        o.payment_status === 'PAID'
                          ? 'badge-success'
                          : o.payment_status === 'FAILED'
                          ? 'badge-danger'
                          : 'badge-warning'
                      }`}
                    >
                      <span className="h-1.5 w-1.5 rounded-full bg-current" />
                      <span>{o.payment_status}</span>
                    </span>
                  </td>
                  <td className="td">
                    <span className={`badge ${statusBadgeClasses[o.status] || 'badge-neutral'}`}>
                      <span className="h-1.5 w-1.5 rounded-full bg-current" />
                      <span>{o.status}</span>
                    </span>
                  </td>
                  <td className="td text-slate-500 text-xs">
                    {new Date(o.created_at).toLocaleDateString('en-IN', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </td>
                  <td className="td text-right">
                    <button
                      onClick={() => handleViewDetails(o.id)}
                      className="btn-secondary btn-sm inline-flex items-center gap-1.5"
                    >
                      <FiEye className="h-3.5 w-3.5" />
                      <span>Details</span>
                    </button>
                  </td>
                </tr>
              ))}
              {!loading && orders.length === 0 && (
                <tr>
                  <td colSpan={7} className="td py-12 text-center text-slate-400">
                    <FiShoppingBag className="mx-auto h-8 w-8 text-slate-300 mb-2" />
                    <p className="text-sm font-medium">No orders found</p>
                    <p className="text-xs mt-0.5">Try selecting a different status filter or search query.</p>
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

      {/* Order Detail Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl space-y-6 my-8 border border-slate-200">
            {/* Modal Header */}
            <div className="flex justify-between items-start border-b border-slate-100 pb-4">
              <div>
                <span className="inline-block rounded-md bg-blue-50 px-2 py-0.5 font-mono text-xs font-bold text-blue-700">
                  ORDER DETAILS
                </span>
                <h2 className="text-xl font-bold text-slate-900 font-heading mt-1">
                  {selectedOrder.order_number}
                </h2>
                <span className="text-xs text-slate-500">
                  Placed on {new Date(selectedOrder.created_at).toLocaleString()}
                </span>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors"
              >
                ✕
              </button>
            </div>

            {/* Quick Status Action Bar */}
            <div className="flex flex-wrap gap-3 items-center justify-between bg-slate-50 p-4 rounded-2xl border border-slate-100">
              <div>
                <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 block">
                  Current Status
                </span>
                <span className="text-sm font-bold text-slate-900">{selectedOrder.status}</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {selectedOrder.status === 'CONFIRMED' && (
                  <button
                    onClick={() => handleUpdateStatus('PROCESSING')}
                    className="btn-primary btn-sm"
                  >
                    Pack Order (Processing)
                  </button>
                )}
                {selectedOrder.status === 'PROCESSING' && (
                  <button
                    onClick={() => handleUpdateStatus('SHIPPED')}
                    className="btn-primary btn-sm"
                  >
                    Dispatch / Shipped
                  </button>
                )}
                {selectedOrder.status === 'SHIPPED' && (
                  <button
                    onClick={() => handleUpdateStatus('DELIVERED')}
                    className="btn-success btn-sm"
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
                    className="btn-danger btn-sm"
                  >
                    Cancel Order
                  </button>
                )}
              </div>
            </div>

            {/* Customer & Address Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-1.5">
                <div className="flex items-center gap-1.5 font-bold text-slate-700 uppercase">
                  <FiUser className="h-3.5 w-3.5 text-slate-500" />
                  <span>Customer Info</span>
                </div>
                <div className="font-semibold text-slate-900 text-sm">
                  {selectedOrder.customer_name}
                </div>
                <div className="text-slate-600">{selectedOrder.customer_email}</div>
                {selectedOrder.customer_phone && (
                  <div className="text-slate-600">{selectedOrder.customer_phone}</div>
                )}
              </div>

              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-1.5">
                <div className="flex items-center gap-1.5 font-bold text-slate-700 uppercase">
                  <FiMapPin className="h-3.5 w-3.5 text-slate-500" />
                  <span>Delivery Address</span>
                </div>
                <div className="text-slate-700 leading-relaxed">
                  {selectedOrder.shipping_address?.address_line1 || 'Standard Delivery Address'}
                  {selectedOrder.shipping_address?.city && `, ${selectedOrder.shipping_address.city}`}
                  {selectedOrder.shipping_address?.state && `, ${selectedOrder.shipping_address.state}`}
                  {selectedOrder.shipping_address?.postal_code && ` - ${selectedOrder.shipping_address.postal_code}`}
                </div>
              </div>
            </div>

            {/* Total Amount Summary */}
            <div className="border-t border-slate-100 pt-4 flex items-center justify-between">
              <div className="text-xs text-slate-500">Payment: {selectedOrder.payment_status}</div>
              <div className="text-right">
                <div className="text-xs text-slate-500">Total Order Value</div>
                <div className="text-2xl font-bold text-slate-900 font-heading">
                  ₹{Number(selectedOrder.grand_total || 0).toLocaleString('en-IN')}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
