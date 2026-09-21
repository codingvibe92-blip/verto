import { useEffect, useState } from 'react';
import { SettingsService, StoreSettings } from '../../services/settings';
import Spinner from '../../components/Spinner';
import {
  FiSave,
  FiShoppingBag,
  FiDollarSign,
  FiTruck,
  FiLayers,
  FiCheckCircle,
} from 'react-icons/fi';

const tabs = [
  { id: 'general', label: 'Store Profile', icon: FiShoppingBag },
  { id: 'finance', label: 'Currency & Tax', icon: FiDollarSign },
  { id: 'shipping', label: 'Shipping & Delivery', icon: FiTruck },
  { id: 'inventory', label: 'Inventory Rules', icon: FiLayers },
];

export default function Settings() {
  const [activeTab, setActiveTab] = useState('general');
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

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setSaving(true);
    setError('');
    try {
      await SettingsService.updateSettings(settings);
      setSuccessMsg('Enterprise settings saved and propagated successfully.');
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      setError(SettingsService.errorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 font-heading">
              System & Store Settings
            </h1>
            <span className="rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-semibold text-blue-700 border border-blue-200">
              Live Config
            </span>
          </div>
          <p className="mt-1 text-xs text-slate-500">
            Global corporate identity, legal taxation parameters, fulfillment policies, and ERP buffer rules.
          </p>
        </div>

        <button
          onClick={() => handleSubmit()}
          disabled={saving || loading}
          className="btn-primary btn-sm inline-flex items-center gap-2"
        >
          <FiSave className="h-4 w-4" />
          <span>{saving ? 'Saving Changes…' : 'Save Changes'}</span>
        </button>
      </div>

      {/* Alerts */}
      {error && (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-xs font-medium text-rose-800 flex items-center justify-between shadow-2xs">
          <span>{error}</span>
          <button onClick={() => setError('')} className="text-rose-700 font-bold">
            ✕
          </button>
        </div>
      )}

      {successMsg && (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-xs font-medium text-emerald-800 flex items-center justify-between shadow-2xs">
          <div className="flex items-center gap-2">
            <FiCheckCircle className="h-4 w-4 text-emerald-600 shrink-0" />
            <span>{successMsg}</span>
          </div>
          <button onClick={() => setSuccessMsg('')} className="text-emerald-700 font-bold">
            ✕
          </button>
        </div>
      )}

      {/* Category Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold transition-all ${
                isActive
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-sm shadow-blue-500/25'
                  : 'bg-white text-slate-600 hover:bg-slate-100/80 border border-slate-200/80'
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {loading ? (
        <div className="card p-16 text-center">
          <Spinner />
          <p className="text-slate-500 text-xs mt-3">Loading enterprise configuration…</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* TAB 1: STORE PROFILE */}
          {activeTab === 'general' && (
            <div className="card p-6 space-y-5">
              <div className="border-b border-slate-100 pb-3">
                <h3 className="text-base font-bold text-slate-900 font-heading">
                  Corporate Profile & Store Branding
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Identifiers displayed on customer invoices, order dispatch receipts, and email communications.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="label">Store Brand Name</label>
                  <input
                    type="text"
                    value={settings.store_name || ''}
                    onChange={(e) => setSettings({ ...settings, store_name: e.target.value })}
                    className="input"
                    placeholder="CRUNCHX Enterprise"
                  />
                </div>

                <div>
                  <label className="label">Support Email</label>
                  <input
                    type="email"
                    value={settings.store_email || ''}
                    onChange={(e) => setSettings({ ...settings, store_email: e.target.value })}
                    className="input"
                    placeholder="support@crunchx.com"
                  />
                </div>

                <div>
                  <label className="label">Support Helpline</label>
                  <input
                    type="text"
                    value={settings.store_phone || ''}
                    onChange={(e) => setSettings({ ...settings, store_phone: e.target.value })}
                    className="input"
                    placeholder="+91 98765 43210"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: CURRENCY & TAXATION */}
          {activeTab === 'finance' && (
            <div className="card p-6 space-y-5">
              <div className="border-b border-slate-100 pb-3">
                <h3 className="text-base font-bold text-slate-900 font-heading">
                  Financial & Taxation Defaults
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Currency symbols, ISO currency codes, and standard Goods & Services Tax (GST) percentages.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="label">Base Currency</label>
                  <select
                    value={settings.currency || 'INR'}
                    onChange={(e) => setSettings({ ...settings, currency: e.target.value })}
                    className="input cursor-pointer"
                  >
                    <option value="INR">INR (Indian Rupee - ₹)</option>
                    <option value="USD">USD (US Dollar - $)</option>
                    <option value="EUR">EUR (Euro - €)</option>
                    <option value="GBP">GBP (British Pound - £)</option>
                  </select>
                </div>

                <div>
                  <label className="label">Currency Symbol</label>
                  <input
                    type="text"
                    value={settings.currency_symbol || '₹'}
                    onChange={(e) => setSettings({ ...settings, currency_symbol: e.target.value })}
                    className="input font-mono"
                  />
                </div>

                <div>
                  <label className="label">Default GST / Tax Rate (%)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={settings.tax_rate ?? 18}
                    onChange={(e) =>
                      setSettings({ ...settings, tax_rate: parseFloat(e.target.value) || 0 })
                    }
                    className="input font-mono"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: SHIPPING & CHECKOUT */}
          {activeTab === 'shipping' && (
            <div className="card p-6 space-y-5">
              <div className="border-b border-slate-100 pb-3">
                <h3 className="text-base font-bold text-slate-900 font-heading">
                  Shipping & Checkout Rules
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Thresholds for automated free freight delivery, flat rate fallbacks, and guest access.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="label">Free Shipping Minimum (₹)</label>
                  <input
                    type="number"
                    value={settings.free_shipping_threshold ?? 500}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        free_shipping_threshold: parseFloat(e.target.value) || 0,
                      })
                    }
                    className="input font-mono"
                  />
                  <p className="mt-1 text-[11px] text-slate-400">
                    Orders at or above this value qualify for free delivery.
                  </p>
                </div>

                <div>
                  <label className="label">Flat Standard Shipping (₹)</label>
                  <input
                    type="number"
                    value={settings.flat_shipping_rate ?? 50}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        flat_shipping_rate: parseFloat(e.target.value) || 0,
                      })
                    }
                    className="input font-mono"
                  />
                </div>

                <div>
                  <label className="label">Order Number Prefix</label>
                  <input
                    type="text"
                    value={settings.order_prefix || 'CRX-'}
                    onChange={(e) => setSettings({ ...settings, order_prefix: e.target.value })}
                    className="input font-mono uppercase"
                  />
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100">
                <label className="flex items-start gap-3 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={Boolean(settings.enable_guest_checkout)}
                    onChange={(e) =>
                      setSettings({ ...settings, enable_guest_checkout: e.target.checked })
                    }
                    className="mt-0.5 rounded text-blue-600 focus:ring-blue-500 h-4 w-4 cursor-pointer"
                  />
                  <div>
                    <span className="text-xs font-semibold text-slate-800">
                      Allow Guest Customer Checkout
                    </span>
                    <p className="text-[11px] text-slate-500">
                      Permits storefront shoppers to complete purchases without mandatory account password registration.
                    </p>
                  </div>
                </label>
              </div>
            </div>
          )}

          {/* TAB 4: INVENTORY RULES */}
          {activeTab === 'inventory' && (
            <div className="card p-6 space-y-5">
              <div className="border-b border-slate-100 pb-3">
                <h3 className="text-base font-bold text-slate-900 font-heading">
                  Inventory Buffers & Alert Limits
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Threshold triggers for automated low stock alerts and manufacturing replenishment.
                </p>
              </div>

              <div className="max-w-md">
                <label className="label">Global Default Low Stock Threshold (Units)</label>
                <input
                  type="number"
                  value={settings.low_stock_threshold_default ?? 10}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      low_stock_threshold_default: parseInt(e.target.value, 10) || 10,
                    })
                  }
                  className="input font-mono"
                />
                <p className="mt-1 text-[11px] text-slate-400">
                  Products with fewer available units will trigger warning badges across ERP dashboards.
                </p>
              </div>
            </div>
          )}

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={saving}
              className="btn-primary btn-sm inline-flex items-center gap-2"
            >
              <FiSave className="h-4 w-4" />
              <span>{saving ? 'Saving…' : 'Save All Settings'}</span>
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
