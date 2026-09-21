import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { OrderService, Order } from '../../services/orders';
import Spinner from '../../components/Spinner';

export default function OrderSuccess() {
  const { orderNumber } = useParams<{ orderNumber: string }>();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!orderNumber) return;
    OrderService.getOrderByNumber(orderNumber)
      .then((ord) => setOrder(ord))
      .catch((err) => setError(OrderService.errorMessage(err)))
      .finally(() => setLoading(false));
  }, [orderNumber]);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-24 flex justify-center">
        <Spinner />
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center space-y-4">
        <div className="text-4xl">⚠️</div>
        <h1 className="text-2xl font-bold text-slate-900">Order Not Found</h1>
        <p className="text-slate-600 text-sm">We could not retrieve order details for #{orderNumber}.</p>
        <Link to="/products" className="inline-block px-6 py-2.5 bg-emerald-600 text-white rounded-lg font-bold">
          Browse Catalog
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12 space-y-8">
      {/* Hero Confirmed Banner */}
      <div className="text-center space-y-3">
        <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto text-3xl shadow-sm">
          ✓
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Order Confirmed!</h1>
        <p className="text-slate-600 text-sm">
          Thank you for choosing CRUNCHX. Your healthy artisan snacks are being prepared for dispatch.
        </p>
        <div className="inline-block bg-slate-100 px-4 py-2 rounded-xl text-xs font-mono font-bold text-slate-800">
          Order Reference: {order.order_number}
        </div>
      </div>

      {/* Fulfillment Status Banner */}
      <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="text-2xl">📦</div>
          <div>
            <div className="font-bold text-emerald-950 text-sm">Status: {order.status}</div>
            <div className="text-xs text-emerald-700">Payment: {order.payment_status} via Instant Gateway</div>
          </div>
        </div>
        <span className="px-3 py-1 bg-emerald-600 text-white text-xs font-bold rounded-full">
          Confirmed
        </span>
      </div>

      {/* Invoice Card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-5">
        <h2 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3">Purchased Items</h2>

        <div className="divide-y divide-slate-100">
          {order.items?.map((it) => (
            <div key={it.id} className="py-3 flex justify-between items-center text-sm">
              <div>
                <div className="font-bold text-slate-900">{it.product_name}</div>
                <div className="text-xs text-slate-500 font-mono">
                  Qty: {it.quantity} × ${Number(it.unit_price).toFixed(2)}
                </div>
              </div>
              <div className="font-mono font-bold text-slate-900">
                ${Number(it.line_total).toFixed(2)}
              </div>
            </div>
          ))}
        </div>

        <div className="border-t border-slate-100 pt-3 space-y-2 text-xs text-slate-600">
          <div className="flex justify-between">
            <span>Items Subtotal:</span>
            <span className="font-mono font-semibold text-slate-900">${Number(order.items_total).toFixed(2)}</span>
          </div>
          {Number(order.discount_amount) > 0 && (
            <div className="flex justify-between text-emerald-600 font-semibold">
              <span>Promo Discount ({order.coupon_code}):</span>
              <span className="font-mono">-${Number(order.discount_amount).toFixed(2)}</span>
            </div>
          )}
          <div className="flex justify-between">
            <span>Sales Tax (5%):</span>
            <span className="font-mono">${Number(order.tax_amount).toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span>Shipping:</span>
            <span className="font-mono">{Number(order.shipping_amount) === 0 ? 'FREE' : `$${Number(order.shipping_amount).toFixed(2)}`}</span>
          </div>
          <div className="border-t border-slate-200 pt-2 flex justify-between items-baseline text-base font-bold text-slate-900">
            <span>Amount Paid:</span>
            <span className="text-xl font-mono text-emerald-600">${Number(order.grand_total).toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* Action CTA */}
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Link
          to="/products"
          className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-center shadow transition-all"
        >
          Continue Shopping
        </Link>
        <Link
          to="/"
          className="px-6 py-3 border border-slate-300 hover:bg-slate-50 text-slate-700 font-bold rounded-xl text-center transition-all"
        >
          Return to Home
        </Link>
      </div>
    </div>
  );
}
