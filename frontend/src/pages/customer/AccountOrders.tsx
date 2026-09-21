import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { OrderService, Order } from '../../services/orders';
import Spinner from '../../components/Spinner';

export default function AccountOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    OrderService.listOrders({ limit: 50 })
      .then((d) => setOrders(d.rows))
      .catch((err) => setError(OrderService.errorMessage(err)))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">My Orders</h1>
        <p className="text-slate-500 text-sm">Review your past purchases and track ongoing deliveries</p>
      </div>

      {error && <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">{error}</div>}

      {loading ? (
        <div className="p-12 flex justify-center">
          <Spinner />
        </div>
      ) : orders.length === 0 ? (
        <div className="bg-white p-12 text-center rounded-2xl border border-slate-200 space-y-4">
          <div className="text-4xl">📦</div>
          <p className="text-slate-600 font-medium">You have not placed any orders yet.</p>
          <Link
            to="/products"
            className="inline-block px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl"
          >
            Start Shopping
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((ord) => (
            <div key={ord.id} className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
              <div className="flex flex-wrap justify-between items-start gap-2 border-b border-slate-100 pb-3">
                <div>
                  <div className="text-xs text-slate-500 font-mono">ORDER #{ord.order_number}</div>
                  <div className="text-xs text-slate-400">Placed on {new Date(ord.created_at).toLocaleDateString()}</div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 text-xs font-bold rounded-full">
                    {ord.status}
                  </span>
                  <span className="font-mono font-bold text-slate-900 text-base">
                    ${Number(ord.grand_total).toFixed(2)}
                  </span>
                </div>
              </div>

              <div className="flex justify-between items-center pt-2">
                <span className="text-xs text-slate-500">Payment: {ord.payment_status}</span>
                <Link
                  to={`/order-success/${ord.order_number}`}
                  className="text-xs font-bold text-emerald-600 hover:text-emerald-700"
                >
                  View Invoice & Tracking →
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
