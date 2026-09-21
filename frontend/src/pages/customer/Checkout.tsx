import { useEffect, useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { OrderService, CartData } from '../../services/orders';
import { useAuth } from '../../context/AuthContext';
import Spinner from '../../components/Spinner';

export default function Checkout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  const [cart, setCart] = useState<CartData | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Coupon state passed from Cart if available
  const passedCoupon = (location.state as any)?.appliedCoupon;
  const passedDiscount = (location.state as any)?.discount || 0;

  // Checkout Form State
  const [formData, setFormData] = useState({
    firstName: user?.name.split(' ')[0] || '',
    lastName: user?.name.split(' ').slice(1).join(' ') || '',
    email: user?.email || '',
    phone: '',
    addressLine1: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'USA',
    paymentMethod: 'MOCK_CARD',
    cardNumber: '4242 •••• •••• 4242',
    notes: '',
  });

  const getSessionToken = () => {
    return localStorage.getItem('crunchx_session_token') || undefined;
  };

  useEffect(() => {
    const fetchCart = async () => {
      setLoading(true);
      try {
        const data = await OrderService.getCart(getSessionToken());
        if (!data || data.items.length === 0) {
          navigate('/cart');
          return;
        }
        setCart(data);
      } catch (err) {
        setError(OrderService.errorMessage(err));
      } finally {
        setLoading(false);
      }
    };
    fetchCart();
  }, [navigate]);

  const subtotal = cart?.items_total ?? 0;
  const discount = passedDiscount;
  const shipping = subtotal > 50 ? 0 : 5;
  const tax = Math.round(subtotal * 0.05 * 100) / 100;
  const grandTotal = Math.max(0, subtotal - discount + shipping + tax);

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cart || cart.items.length === 0) return;

    setSubmitting(true);
    setError('');

    try {
      const order = await OrderService.checkout({
        customer: {
          first_name: formData.firstName,
          last_name: formData.lastName,
          email: formData.email,
          phone: formData.phone,
        },
        shipping_address: {
          address_line1: formData.addressLine1,
          city: formData.city,
          state: formData.state,
          postal_code: formData.postalCode,
          country: formData.country,
        },
        items: cart.items.map((it) => ({
          product_id: it.product_id,
          variant_id: it.variant_id,
          quantity: it.quantity,
          unit_price: Number(it.unit_price),
        })),
        coupon_id: passedCoupon?.coupon_id,
        coupon_code: passedCoupon?.code,
        discount_amount: discount,
        payment_method: formData.paymentMethod,
        notes: formData.notes,
      });

      // Clear cart
      await OrderService.clearCart(getSessionToken());

      navigate(`/order-success/${order.order_number}`);
    } catch (err) {
      setError(OrderService.errorMessage(err));
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 flex justify-center">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Checkout</h1>
        <p className="text-slate-500 text-sm mt-1">Provide your delivery details and choose a payment method</p>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm font-medium">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmitOrder} className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Left Column: Delivery & Payment Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Step 1: Contact Information */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <h2 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-emerald-600 text-white text-xs flex items-center justify-center font-bold">
                1
              </span>
              Contact & Recipient Details
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">First Name</label>
                <input
                  type="text"
                  required
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Last Name</label>
                <input
                  type="text"
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="order-updates@domain.com"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Phone Number</label>
                <input
                  type="tel"
                  required
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="+1 (555) 000-0000"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>
            </div>
          </div>

          {/* Step 2: Shipping Destination */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <h2 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-emerald-600 text-white text-xs flex items-center justify-center font-bold">
                2
              </span>
              Shipping Address
            </h2>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Street Address</label>
              <input
                type="text"
                required
                value={formData.addressLine1}
                onChange={(e) => setFormData({ ...formData, addressLine1: e.target.value })}
                placeholder="123 Snack Avenue, Suite 400"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">City</label>
                <input
                  type="text"
                  required
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">State / Province</label>
                <input
                  type="text"
                  required
                  value={formData.state}
                  onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Postal Code</label>
                <input
                  type="text"
                  required
                  value={formData.postalCode}
                  onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>
            </div>
          </div>

          {/* Step 3: Payment Method */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <h2 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-emerald-600 text-white text-xs flex items-center justify-center font-bold">
                3
              </span>
              Payment Method
            </h2>

            <div className="space-y-3">
              <label
                className={`flex items-center p-4 border rounded-xl cursor-pointer transition-all ${
                  formData.paymentMethod === 'MOCK_CARD'
                    ? 'border-emerald-600 bg-emerald-50/50'
                    : 'border-slate-200 hover:bg-slate-50'
                }`}
              >
                <input
                  type="radio"
                  name="paymentMethod"
                  value="MOCK_CARD"
                  checked={formData.paymentMethod === 'MOCK_CARD'}
                  onChange={() => setFormData({ ...formData, paymentMethod: 'MOCK_CARD' })}
                  className="text-emerald-600 focus:ring-emerald-500"
                />
                <div className="ml-3 flex-1">
                  <div className="font-bold text-slate-900 text-sm">Credit or Debit Card (Mock Gateway)</div>
                  <div className="text-xs text-slate-500">Instant test card payment (Auto-verified)</div>
                </div>
                <span className="text-xl">💳</span>
              </label>

              <label
                className={`flex items-center p-4 border rounded-xl cursor-pointer transition-all ${
                  formData.paymentMethod === 'UPI_NETBANKING'
                    ? 'border-emerald-600 bg-emerald-50/50'
                    : 'border-slate-200 hover:bg-slate-50'
                }`}
              >
                <input
                  type="radio"
                  name="paymentMethod"
                  value="UPI_NETBANKING"
                  checked={formData.paymentMethod === 'UPI_NETBANKING'}
                  onChange={() => setFormData({ ...formData, paymentMethod: 'UPI_NETBANKING' })}
                  className="text-emerald-600 focus:ring-emerald-500"
                />
                <div className="ml-3 flex-1">
                  <div className="font-bold text-slate-900 text-sm">UPI / Instant Netbanking</div>
                  <div className="text-xs text-slate-500">Scan QR or direct bank transfer</div>
                </div>
                <span className="text-xl">🏦</span>
              </label>
            </div>
          </div>
        </div>

        {/* Right Column: Order Review */}
        <div className="space-y-4">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <h2 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3">Order Items</h2>

            <div className="divide-y divide-slate-100 max-h-56 overflow-y-auto">
              {cart?.items.map((it) => (
                <div key={it.id} className="py-2.5 flex justify-between items-center text-xs">
                  <div>
                    <div className="font-bold text-slate-900">{it.product_name}</div>
                    <div className="text-slate-500 font-mono">Qty: {it.quantity}</div>
                  </div>
                  <div className="font-mono font-bold text-slate-900">
                    ${Number(it.line_total).toFixed(2)}
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t border-slate-200 pt-3 space-y-2 text-xs text-slate-600">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span className="font-mono font-semibold">${subtotal.toFixed(2)}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-emerald-600 font-semibold">
                  <span>Discount ({passedCoupon?.code}):</span>
                  <span className="font-mono">-${discount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Tax (5%):</span>
                <span className="font-mono">${tax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Shipping:</span>
                <span className="font-mono">{shipping === 0 ? 'FREE' : `$${shipping.toFixed(2)}`}</span>
              </div>
              <div className="border-t border-slate-200 pt-2 flex justify-between items-baseline text-sm font-bold text-slate-900">
                <span>Total Due:</span>
                <span className="text-xl font-mono text-emerald-600">${grandTotal.toFixed(2)}</span>
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-xl font-bold shadow-md hover:shadow-lg transition-all text-center flex items-center justify-center gap-2 text-base"
            >
              {submitting ? 'Processing Payment...' : `Pay $${grandTotal.toFixed(2)} & Place Order`}
            </button>

            <Link to="/cart" className="block text-center text-xs text-slate-500 hover:text-slate-700">
              ← Edit Cart Items
            </Link>
          </div>
        </div>
      </form>
    </div>
  );
}
