import { useState } from 'react';
import {
  FiBell,
  FiAlertTriangle,
  FiPackage,
  FiCheckCircle,
  FiCheck,
  FiTrash2,
  FiClock,
} from 'react-icons/fi';

interface AlertNotice {
  id: number;
  type: 'STOCK' | 'ORDER' | 'QC' | 'SYSTEM';
  title: string;
  message: string;
  time: string;
  read: boolean;
}

export default function Notifications() {
  const [notices, setNotices] = useState<AlertNotice[]>([
    {
      id: 1,
      type: 'STOCK',
      title: 'Raw Material Below Reorder Threshold',
      message: 'Almond Flour batch in Central Warehouse has reached 45 KG (minimum threshold is 50 KG).',
      time: '10 minutes ago',
      read: false,
    },
    {
      id: 2,
      type: 'ORDER',
      title: 'High-Value Order Received',
      message: 'Order #CRX-ORD-9204 for ₹4,890 has been confirmed and queued for packing.',
      time: '25 minutes ago',
      read: false,
    },
    {
      id: 3,
      type: 'QC',
      title: 'Quality Check Passed for Batch #B-902',
      message: '500 units of Roasted Ragi Bites passed QC inspection and inwarded to finished goods inventory.',
      time: '1 hour ago',
      read: true,
    },
    {
      id: 4,
      type: 'SYSTEM',
      title: 'Automated Daily Stock Reconciliation Completed',
      message: 'Finished goods inventory balances synchronized across 4 active fulfillment warehouses.',
      time: '3 hours ago',
      read: true,
    },
  ]);

  const markAllRead = () => {
    setNotices((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const clearNotification = (id: number) => {
    setNotices((prev) => prev.filter((n) => n.id !== id));
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <FiBell className="text-emerald-600" /> Notifications & Alerts Center
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Real-time system events, inventory threshold alerts, and operations notices.
          </p>
        </div>

        <button
          onClick={markAllRead}
          className="inline-flex items-center gap-1.5 px-4 py-2 border border-gray-300 rounded-lg text-xs font-semibold text-gray-700 bg-white hover:bg-gray-50 transition-colors shadow-2xs"
        >
          <FiCheck className="text-emerald-600" /> Mark All as Read
        </button>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm divide-y divide-gray-100 overflow-hidden">
        {notices.length === 0 ? (
          <div className="p-16 text-center text-gray-400">
            <FiBell className="w-12 h-12 mx-auto text-gray-300 mb-3" />
            <p className="font-semibold text-gray-700">No active notifications</p>
            <p className="text-xs text-gray-500 mt-1">You're completely up to date.</p>
          </div>
        ) : (
          notices.map((notice) => (
            <div
              key={notice.id}
              className={`p-4 flex items-start justify-between gap-4 transition-colors ${
                notice.read ? 'bg-white' : 'bg-emerald-50/30'
              }`}
            >
              <div className="flex items-start gap-3.5">
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 text-sm ${
                    notice.type === 'STOCK'
                      ? 'bg-amber-100 text-amber-700'
                      : notice.type === 'ORDER'
                      ? 'bg-blue-100 text-blue-700'
                      : notice.type === 'QC'
                      ? 'bg-purple-100 text-purple-700'
                      : 'bg-emerald-100 text-emerald-700'
                  }`}
                >
                  {notice.type === 'STOCK' && <FiAlertTriangle className="w-4 h-4" />}
                  {notice.type === 'ORDER' && <FiPackage className="w-4 h-4" />}
                  {notice.type === 'QC' && <FiCheckCircle className="w-4 h-4" />}
                  {notice.type === 'SYSTEM' && <FiBell className="w-4 h-4" />}
                </div>

                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <h3
                      className={`text-sm ${
                        notice.read ? 'font-medium text-gray-800' : 'font-bold text-gray-900'
                      }`}
                    >
                      {notice.title}
                    </h3>
                    {!notice.read && (
                      <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                    )}
                  </div>
                  <p className="text-xs text-gray-600 leading-relaxed">{notice.message}</p>
                  <p className="text-[11px] text-gray-400 flex items-center gap-1 pt-1 font-mono">
                    <FiClock className="w-3 h-3" /> {notice.time}
                  </p>
                </div>
              </div>

              <button
                onClick={() => clearNotification(notice.id)}
                className="text-gray-400 hover:text-red-500 p-1.5 rounded transition-colors"
                title="Dismiss"
              >
                <FiTrash2 className="w-4 h-4" />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
