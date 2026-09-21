import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { OrderService, CartData } from '../../services/orders';
import Spinner from '../../components/Spinner';

export default function Cart() {
  const navigate = useNavigate();
  const [cart, setCart] = useState<CartData | null>(null);
  const [loading, setLoading] = useState(true);
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<{ code: string; discount: number } | null>(null);
  const [couponError, setCouponError] = useState('');
  const [couponSuccess, setCouponSuccess] = useState('');

  const getSessionToken = () => {
    let token = localStorage.getItem('crunchx_session_token');
    if (!token) {
      token = `sess_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 9)}`;
      localStorage.setItem('crunchx_session_token', token);
    }
    return token;
  };

  const loadCart = async () => {
    setLoading(true);
    try {
      const data = await OrderService.getCart(getSessionToken());
      setCart(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCart();
  }, []);

  const handleUpdateQty = async (itemId: number, newQty: number) => {
    try {
      const updated = await OrderService.updateCartItem(itemId, newQty, getSessionToken());
      setCart(updated);
    } catch (err) {
      alert(OrderService.errorMessage(err));
    }
  };

  const handleRemove = async (itemId: number) => {
    try {
      const updated = await OrderService.removeCartItem(itemId, getSessionToken());
      setCart(updated);
    } catch (err) {
      alert(OrderService.errorMessage(err));
    }
  };

  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cart || !couponCode.trim()) return;
    setCouponError('');
    setCouponSuccess('');
    try {
      const res = await OrderService.applyCoupon(couponCode.trim(), cart.items_total);
      setAppliedCoupon({ code: res.code, discount: res.discount_amount });
      setCouponSuccess(res.message);
    } catch (err) {
      setAppliedCoupon(null);
      setCouponError(OrderService.errorMessage(err));
    }
  };

  const subtotal = cart?.items_total ?? 0;
  const discount = appliedCoupon?.discount ?? 0;
  const shipping = subtotal > 50 ? 0 : subtotal > 0 ? 5 : 0;
  const tax = Math.round(subtotal * 0.05 * 100) / 100;
  const grandTotal = Math.max(0, subtotal - discount + shipping + tax);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 flex justify-center">
        <Spinner />
      </div>
    );
  }

  if (!cart || cart.items.length === 0) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center space-y-6">
        <div className="w-20 h-20 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto text-3xl">
          🛒
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900">Your Cart is Empty</h1>
        <p className="text-slate-600 max-w-md mx-auto">
          Explore our artisan crunchy chips, roasted legume snacks, and healthy treats crafted with organic ingredients.
        </p>
        <Link
          to="/products"
          className="inline-block px-8 py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-md hover:shadow-lg transition-all"
        >
          Explore All Snacks
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Shopping Cart</h1>
        <p className="text-slate-500 text-sm mt-1">Review your wholesome snacks and prepare for delivery</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Cart Item List */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm divide-y divide-slate-100 overflow-hidden">
            {cart.items.map((item) => (
              <div key={item.id} className="p-4 sm:p-6 flex flex-col sm:flex-row gap-4 items-center sm:items-start">
                <div className="w-20 h-20 bg-slate-100 rounded-xl overflow-hidden flex-shrink-0 flex items-center justify-center">
                  {item.image_url ? (
                    <img src={item.image_url} alt={item.product_name} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-3xl">🍿</span>
                  )}
                </div>

                <div className="flex-1 min-w-0 space-y-1 text-center sm:text-left">
                  <Link
                    to={`/products/${item.product_slug}`}
                    className="font-bold text-slate-900 hover:text-emerald-600 transition-colors block text-base"
                  >
                    {item.product_name}
                  </Link>
                  <p className="text-xs text-slate-500 font-mono">SKU: {item.product_sku}</p>
                  <p className="text-sm font-semibold text-emerald-600 font-mono">
                    ${Number(item.unit_price).toFixed(2)} each
                  </p>
                </div>

                {/* Quantity Controls */}
                <div className="flex items-center gap-3">
                  <div className="flex items-center border border-slate-300 rounded-lg overflow-hidden bg-slate-50">
                    <button
                      onClick={() => handleUpdateQty(item.id, item.quantity - 1)}
                      className="w-8 h-8 flex items-center justify-center text-slate-600 hover:bg-slate-200 font-bold transition-colors"
                    >
                      -
                    </button>
                    <span className="w-10 text-center font-bold text-sm text-slate-800">{item.quantity}</span>
                    <button
                      onClick={() => handleUpdateQty(item.id, item.quantity + 1)}
                      className="w-8 h-8 flex items-center justify-center text-slate-600 hover:bg-slate-200 font-bold transition-colors"
                    >
                      +
                    </button>
                  </div>

                  <div className="text-right font-mono font-bold text-slate-900 w-24">
                    ${Number(item.line_total).toFixed(2)}
                  </div>

                  <button
                    onClick={() => handleRemove(item.id)}
                    className="text-slate-400 hover:text-red-500 p-1 transition-colors"
                    title="Remove item"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-between items-center pt-2">
            <Link to="/products" className="text-sm font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1">
              ← Continue Shopping
            </Link>
          </div>
        </div>

        {/* Order Summary & Checkout Card */}
        <div className="space-y-4">
          {/* Coupon Form */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Promotional Discount</h3>
            <form onSubmit={handleApplyCoupon} className="flex gap-2">
              <input
                type="text"
                placeholder="Enter coupon code"
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                className="flex-1 px-3 py-2 border border-slate-300 rounded-lg text-sm font-mono uppercase focus:ring-2 focus:ring-emerald-500 outline-none"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-bold transition-colors"
              >
                Apply
              </button>
            </form>
            {couponError && <p className="text-xs text-red-600 font-medium">{couponError}</p>}
            {couponSuccess && <p className="text-xs text-emerald-600 font-medium">{couponSuccess}</p>}
          </div>

          {/* Cost Summary */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <h2 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3">Order Summary</h2>

            <div className="space-y-2.5 text-sm text-slate-600">
              <div className="flex justify-between">
                <span>Items Subtotal:</span>
                <span className="font-mono font-semibold text-slate-900">${subtotal.toFixed(2)}</span>
              </div>

              {discount > 0 && (
                <div className="flex justify-between text-emerald-600 font-semibold">
                  <span>Coupon Discount ({appliedCoupon?.code}):</span>
                  <span className="font-mono">-${discount.toFixed(2)}</span>
                </div>
              )}

              <div className="flex justify-between">
                <span>Estimated Tax (5%):</span>
                <span className="font-mono">${tax.toFixed(2)}</span>
              </div>

              <div className="flex justify-between items-center">
                <div>
                  <span>Shipping:</span>
                  {subtotal > 50 && (
                    <span className="ml-2 text-[10px] bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.5 rounded">
                      Free Shipping
                    </span>
                  )}
                </div>
                <span className="font-mono">{shipping === 0 ? 'FREE' : `$${shipping.toFixed(2)}`}</span>
              </div>

              <div className="border-t border-slate-200 pt-3 flex justify-between items-baseline text-base font-bold text-slate-900">
                <span>Grand Total:</span>
                <span className="text-2xl font-mono text-emerald-600">${grandTotal.toFixed(2)}</span>
              </div>
            </div>

            <button
              onClick={() => navigate('/checkout', { state: { appliedCoupon, discount } })}
              className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold shadow-md hover:shadow-lg transition-all text-center flex items-center justify-center gap-2"
            >
              <span>Proceed to Checkout</span>
              <span>→</span>
            </button>

            <p className="text-[11px] text-slate-400 text-center">
              🔒 256-bit SSL encrypted checkout with real-time stock reservation
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
