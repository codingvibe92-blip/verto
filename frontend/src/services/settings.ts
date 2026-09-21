import client, { apiErrorMessage } from '../api/client';

export interface StoreSettings {
  store_name?: string;
  store_email?: string;
  store_phone?: string;
  currency?: string;
  currency_symbol?: string;
  tax_rate?: number;
  free_shipping_threshold?: number;
  flat_shipping_rate?: number;
  low_stock_threshold_default?: number;
  enable_guest_checkout?: boolean;
  order_prefix?: string;
  [key: string]: any;
}

export const SettingsService = {
  async getSettings(): Promise<StoreSettings> {
    const res = await client.get('/settings');
    return res.data.data;
  },

  async updateSettings(settings: StoreSettings, group: string = 'general'): Promise<StoreSettings> {
    const res = await client.put('/settings', { settings, group });
    return res.data.data;
  },

  errorMessage(err: unknown) {
    return apiErrorMessage(err);
  },
};
