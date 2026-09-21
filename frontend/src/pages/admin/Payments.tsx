import { useEffect, useState } from 'react';
import client, { apiErrorMessage } from '../../api/client';
import Spinner from '../../components/Spinner';

export interface PaymentItem {
  id: number;
  order_id: number;
  order_number: string;
  customer_name?: string;
  payment_reference: string;
  provider: string;
  amount: string;
  currency: string;
  status: string;
  paid_at: string;
  created_at: string;
}

export default function Payments() {
  const [payments, setPayments] = useState<PaymentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [refundModalOpen, setRefundModalOpen] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<PaymentItem | null>(null);
  const [refundAmount, setRefundAmount] = useState(0);
  const [refundReason, setRefundReason] = useState('Customer dissatisfaction / damaged goods');

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await client.get('/payments');
      setPayments(res.data.data);
    } catch (err) {
      setError(apiErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const openRefundModal = (p: PaymentItem) => {
    setSelectedPayment(p);
    setRefundAmount(Number(p.amount));
    setRefundReason('Customer returned batch / refund requested');
    setRefundModalOpen(true);
  };

  const handleProcessRefund = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPayment) return;

    try {
      await client.post('/refunds', {
        payment_id: selectedPayment.id,
        amount: refundAmount,
        reason: refundReason,
      });
      setRefundModalOpen(false);
      load();
      alert(`Refund of $${refundAmount.toFixed(2)} processed successfully!`);
    } catch (err) {
      alert(apiErrorMessage(err));
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Payments & Transactions</h1>
        <p className="text-slate-500 text-sm">
          Audit customer payment receipts, gateway verification logs, and process refunds
        </p>
      </div>

      {error && <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">{error}</div>}

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 flex justify-center">
            <Spinner />
          </div>
        ) : payments.length === 0 ? (
          <div className="p-12 text-center text-slate-500">No payment transactions recorded yet.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-700">
              <thead className="bg-slate-50 border-b border-slate-200 text-xs uppercase font-semibold text-slate-500">
                <tr>
                  <th className="px-6 py-3">Transaction Reference</th>
                  <th className="px-6 py-3">Order Number</th>
                  <th className="px-6 py-3">Customer</th>
                  <th className="px-6 py-3">Amount</th>
                  <th className="px-6 py-3">Provider</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3">Payment Timestamp</th>
                  <th className="px-6 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {payments.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-6 py-4 font-mono font-bold text-slate-900 text-xs">
                      {p.payment_reference || `PAY-${p.id}`}
                    </td>
                    <td className="px-6 py-4 font-mono text-slate-700">{p.order_number}</td>
                    <td className="px-6 py-4 font-medium text-slate-800">{p.customer_name || 'Customer'}</td>
                    <td className="px-6 py-4 font-bold text-slate-900 font-mono">
                      ${Number(p.amount).toFixed(2)}
                    </td>
                    <td className="px-6 py-4 text-xs font-mono uppercase text-slate-600">{p.provider}</td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-2.5 py-1 text-xs font-bold rounded-full ${
                          p.status === 'COMPLETED' || p.status === 'PAID'
                            ? 'bg-emerald-100 text-emerald-800'
                            : p.status === 'REFUNDED'
                            ? 'bg-slate-100 text-slate-700'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {p.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-500">
                      {new Date(p.created_at).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      {p.status !== 'REFUNDED' && (
                        <button
                          onClick={() => openRefundModal(p)}
                          className="text-xs font-semibold text-red-600 hover:text-red-800 transition-colors"
                        >
                          Process Refund
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

      {/* Refund Modal */}
      {refundModalOpen && selectedPayment && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl space-y-4">
            <h2 className="text-xl font-bold text-slate-900">Process Refund</h2>
            <div className="bg-slate-50 p-3 rounded-lg text-xs space-y-1">
              <div><strong>Order:</strong> {selectedPayment.order_number}</div>
              <div><strong>Customer:</strong> {selectedPayment.customer_name}</div>
              <div><strong>Original Paid:</strong> ${Number(selectedPayment.amount).toFixed(2)}</div>
            </div>

            <form onSubmit={handleProcessRefund} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Refund Amount ($)</label>
                <input
                  type="number"
                  step="0.01"
                  min={0.01}
                  max={Number(selectedPayment.amount)}
                  required
                  value={refundAmount}
                  onChange={(e) => setRefundAmount(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm font-mono focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Reason for Refund</label>
                <input
                  type="text"
                  required
                  value={refundReason}
                  onChange={(e) => setRefundReason(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setRefundModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium"
                >
                  Confirm Refund
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
