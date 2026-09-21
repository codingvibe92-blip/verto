import { useEffect, useState } from 'react';
import { SettingsService, StoreSettings } from '../../services/settings';
import Spinner from '../../components/Spinner';
import {
  FiSettings,
  FiSave,
  FiCheck,
  FiX,
  FiShoppingBag,
  FiDollarSign,
  FiTruck,
  FiLayers,
} from 'react-icons/fi';

export default function Settings() {
  const [settings, setSettings] = useState<StoreSettings>({
    store_name: 'CRUNCHX Enterprise',
    store_email: 'support@crunchx.com',
    store_phone: '+91 98765 43210',
    currency: 'INR',
    currency_symbol: '₹',
    tax_rate: 18,
    free_shipping_threshold: 500,
    flat_shipping_rate: 50,
    low_stock_threshold_default: 10,
    enable_guest_checkout: true,
    order_prefix: 'CRX-',
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await SettingsService.getSettings();
      if (data && Object.keys(data).length > 0) {
        setSettings((prev) => ({ ...prev, ...data }));
      }
    } catch (err) {
      setError(SettingsService.errorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      await SettingsService.updateSettings(settings);
      setSuccessMsg('Store settings saved successfully.');
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      setError(SettingsService.errorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <FiSettings className="text-emerald-600" /> System & Store Settings
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Global business parameters, taxes, shipping defaults, and ERP system preferences.
          </p>
        </div>

        <button
          onClick={handleSubmit}
          disabled={saving || loading}
          className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-lg text-sm font-medium shadow-sm transition-colors disabled:opacity-50"
        >
          <FiSave className="w-4 h-4" />
          {saving ? 'Saving...' : 'Save All Settings'}
        </button>
      </div>

      {/* Alerts */}
      {error && (
        <div className="p-4 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm flex items-center justify-between">
          <span>{error}</span>
          <button onClick={() => setError('')} className="text-red-500 hover:text-red-700">
            <FiX />
          </button>
        </div>
      )}
      {successMsg && (
        <div className="p-4 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm flex items-center justify-between">
          <span className="flex items-center gap-2">
            <FiCheck className="text-emerald-600" /> {successMsg}
          </span>
          <button onClick={() => setSuccessMsg('')} className="text-emerald-500 hover:text-emerald-700">
            <FiX />
          </button>
        </div>
      )}

      {loading ? (
        <div className="bg-white rounded-xl border border-gray-200 p-16 text-center shadow-sm">
          <Spinner />
          <p className="text-gray-500 text-sm mt-3">Loading system configuration...</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* SECTION 1: STORE PROFILE */}
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-4">
            <h3 className="text-base font-bold text-gray-900 flex items-center gap-2 pb-3 border-b border-gray-100">
              <FiShoppingBag className="text-emerald-600" /> Store Profile & Branding
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                  Store Legal Name
                </label>
                <input
                  type="text"
                  value={settings.store_name || ''}
                  onChange={(e) => setSettings({ ...settings, store_name: e.target.value })}
                  className="w-full px-3.5 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                  Support Email
                </label>
                <input
                  type="email"
                  value={settings.store_email || ''}
                  onChange={(e) => setSettings({ ...settings, store_email: e.target.value })}
                  className="w-full px-3.5 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                  Support Phone
                </label>
                <input
                  type="text"
                  value={settings.store_phone || ''}
                  onChange={(e) => setSettings({ ...settings, store_phone: e.target.value })}
                  className="w-full px-3.5 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>
          </div>

          {/* SECTION 2: CURRENCY & TAXATION */}
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-4">
            <h3 className="text-base font-bold text-gray-900 flex items-center gap-2 pb-3 border-b border-gray-100">
              <FiDollarSign className="text-emerald-600" /> Financial & Taxation Defaults
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                  Currency Code
                </label>
                <select
                  value={settings.currency || 'INR'}
                  onChange={(e) => setSettings({ ...settings, currency: e.target.value })}
                  className="w-full px-3.5 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="INR">INR (Indian Rupee)</option>
                  <option value="USD">USD (US Dollar)</option>
                  <option value="EUR">EUR (Euro)</option>
                  <option value="GBP">GBP (British Pound)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                  Currency Symbol
                </label>
                <input
                  type="text"
                  value={settings.currency_symbol || '₹'}
                  onChange={(e) => setSettings({ ...settings, currency_symbol: e.target.value })}
                  className="w-full px-3.5 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                  Default Tax / GST Rate (%)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={settings.tax_rate ?? 18}
                  onChange={(e) => setSettings({ ...settings, tax_rate: parseFloat(e.target.value) || 0 })}
                  className="w-full px-3.5 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>
          </div>

          {/* SECTION 3: SHIPPING & CHECKOUT */}
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-4">
            <h3 className="text-base font-bold text-gray-900 flex items-center gap-2 pb-3 border-b border-gray-100">
              <FiTruck className="text-emerald-600" /> Shipping & Fulfillment
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                  Free Shipping Threshold (₹)
                </label>
                <input
                  type="number"
                  value={settings.free_shipping_threshold ?? 500}
                  onChange={(e) => setSettings({ ...settings, free_shipping_threshold: parseFloat(e.target.value) || 0 })}
                  className="w-full px-3.5 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
                <p className="text-[11px] text-gray-400 mt-1">Orders above this qualify for free delivery.</p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                  Flat Standard Shipping Rate (₹)
                </label>
                <input
                  type="number"
                  value={settings.flat_shipping_rate ?? 50}
                  onChange={(e) => setSettings({ ...settings, flat_shipping_rate: parseFloat(e.target.value) || 0 })}
                  className="w-full px-3.5 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                  Order Number Prefix
                </label>
                <input
                  type="text"
                  value={settings.order_prefix || 'CRX-'}
                  onChange={(e) => setSettings({ ...settings, order_prefix: e.target.value })}
                  className="w-full px-3.5 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
                />
              </div>
            </div>

            <div className="pt-2">
              <label className="flex items-center gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={Boolean(settings.enable_guest_checkout)}
                  onChange={(e) => setSettings({ ...settings, enable_guest_checkout: e.target.checked })}
                  className="rounded text-emerald-600 focus:ring-emerald-500 h-4 w-4"
                />
                <div>
                  <span className="text-xs font-semibold text-gray-800">Enable Guest Checkout</span>
                  <p className="text-[11px] text-gray-400">Allow customers to purchase without mandatory account registration.</p>
                </div>
              </label>
            </div>
          </div>

          {/* SECTION 4: IMS & INVENTORY ALERTS */}
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-4">
            <h3 className="text-base font-bold text-gray-900 flex items-center gap-2 pb-3 border-b border-gray-100">
              <FiLayers className="text-emerald-600" /> IMS & Low Stock Alert Rules
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                  Default Low Stock Alert Threshold (Units)
                </label>
                <input
                  type="number"
                  value={settings.low_stock_threshold_default ?? 10}
                  onChange={(e) => setSettings({ ...settings, low_stock_threshold_default: parseInt(e.target.value, 10) || 10 })}
                  className="w-full px-3.5 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
                <p className="text-[11px] text-gray-400 mt-1">
                  Flag products on reports when on-hand quantity drops below this limit.
                </p>
              </div>
            </div>
          </div>

          {/* Bottom Save Action */}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2.5 rounded-lg text-sm font-medium shadow-sm transition-colors disabled:opacity-50"
            >
              <FiSave className="w-4 h-4" />
              {saving ? 'Saving...' : 'Save All Settings'}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
