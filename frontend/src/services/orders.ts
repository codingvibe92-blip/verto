import client, { apiErrorMessage } from '../api/client';
import { Paginated } from './types';

export interface OrderItem {
  id: number;
  product_id: number;
  product_name: string;
  sku: string | null;
  quantity: number;
  unit_price: string;
  discount_amount: string;
  tax_amount: string;
  line_total: string;
}

export interface OrderHistory {
  id: number;
  from_status: string | null;
  to_status: string;
  reason: string | null;
  changed_by_name?: string;
  created_at: string;
}

export interface Order {
  id: number;
  order_number: string;
  customer_id: number;
  customer_name?: string;
  customer_email?: string;
  customer_phone?: string;
  status: string;
  payment_status: string;
  items_total: string;
  discount_amount: string;
  tax_amount: string;
  shipping_amount: string;
  grand_total: string;
  coupon_code: string | null;
  notes: string | null;
  placed_at: string;
  created_at: string;
  items?: OrderItem[];
  history?: OrderHistory[];
  shipping_address?: {
    address_line1: string;
    city: string;
    state: string;
    postal_code: string;
    country: string;
  };
}

export interface Coupon {
  id: number;
  code: string;
  type: string;
  value: string | number;
  max_discount: string | number | null;
  min_order_value: string | number;
  usage_limit: number;
  used_count: number;
  starts_at: string | null;
  ends_at: string | null;
  is_active: number;
  created_at: string;
}

export interface CartItem {
  id: number;
  product_id: number;
  variant_id: number | null;
  quantity: number;
  unit_price: string;
  product_name: string;
  product_sku: string;
  product_slug: string;
  image_url: string | null;
  line_total: number;
}

export interface CartData {
  cart_id: number;
  items: CartItem[];
  items_total: number;
  item_count: number;
}

export const OrderService = {
  errorMessage: apiErrorMessage,

  // Orders
  async listOrders(params?: Record<string, unknown>): Promise<Paginated<Order>> {
    const res = await client.get('/orders', { params });
    return { rows: res.data.data, meta: res.data.meta };
  },

  async getOrder(id: number): Promise<Order> {
    const res = await client.get(`/orders/${id}`);
    return res.data.data;
  },

  async getOrderByNumber(orderNumber: string): Promise<Order> {
    const res = await client.get(`/orders/lookup/${orderNumber}`);
    return res.data.data;
  },

  async updateStatus(id: number, status: string, reason?: string): Promise<Order> {
    const res = await client.put(`/orders/${id}/status`, { status, reason });
    return res.data.data;
  },

  // Checkout
  async checkout(data: {
    customer: { first_name: string; last_name?: string; email: string; phone: string };
    shipping_address: { address_line1: string; city: string; state: string; postal_code: string; country?: string };
    items: Array<{ product_id: number; variant_id?: number | null; quantity: number; unit_price: number }>;
    coupon_id?: number | null;
    coupon_code?: string | null;
    discount_amount?: number;
    payment_method?: string;
    notes?: string;
  }): Promise<Order> {
    const res = await client.post('/orders/checkout', data);
    return res.data.data;
  },

  // Cart
  async getCart(sessionToken?: string): Promise<CartData> {
    const headers: Record<string, string> = {};
    if (sessionToken) headers['x-session-token'] = sessionToken;
    const res = await client.get('/cart', { headers });
    return res.data.data;
  },

  async addToCart(productId: number, quantity = 1, variantId?: number | null, sessionToken?: string): Promise<CartData> {
    const headers: Record<string, string> = {};
    if (sessionToken) headers['x-session-token'] = sessionToken;
    const res = await client.post('/cart/items', { product_id: productId, variant_id: variantId, quantity }, { headers });
    return res.data.data;
  },

  async updateCartItem(itemId: number, quantity: number, sessionToken?: string): Promise<CartData> {
    const headers: Record<string, string> = {};
    if (sessionToken) headers['x-session-token'] = sessionToken;
    const res = await client.put(`/cart/items/${itemId}`, { quantity }, { headers });
    return res.data.data;
  },

  async removeCartItem(itemId: number, sessionToken?: string): Promise<CartData> {
    const headers: Record<string, string> = {};
    if (sessionToken) headers['x-session-token'] = sessionToken;
    const res = await client.delete(`/cart/items/${itemId}`, { headers });
    return res.data.data;
  },

  async clearCart(sessionToken?: string): Promise<CartData> {
    const headers: Record<string, string> = {};
    if (sessionToken) headers['x-session-token'] = sessionToken;
    const res = await client.delete('/cart/clear', { headers });
    return res.data.data;
  },

  // Coupons
  async applyCoupon(code: string, itemsTotal: number): Promise<{ valid: boolean; coupon_id: number; code: string; discount_amount: number; message: string }> {
    const res = await client.post('/cart/coupon/apply', { code, items_total: itemsTotal });
    return res.data.data;
  },

  async listCoupons(): Promise<Coupon[]> {
    const res = await client.get('/coupons');
    return res.data.data;
  },

  async createCoupon(data: Partial<Coupon>): Promise<void> {
    await client.post('/coupons', data);
  },

  async toggleCoupon(id: number, isActive: boolean): Promise<void> {
    await client.put(`/coupons/${id}/toggle`, { is_active: isActive });
  },
};
