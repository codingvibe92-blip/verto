import { query } from '../database/pool';
import { OrderRepository } from '../repositories/order.repository';
import { PaginationParams } from '../utils/pagination';

export const OrderService = {
  async listOrders(
    opts: PaginationParams & { search?: string; status?: string; payment_status?: string; customer_id?: number }
  ) {
    return OrderRepository.listOrders(opts);
  },

  async getOrder(id: number) {
    const order = await OrderRepository.findOrderById(id);
    if (!order) throw new Error('Order not found');
    return order;
  },

  async getOrderByNumber(orderNumber: string) {
    const order = await OrderRepository.findOrderByNumber(orderNumber);
    if (!order) throw new Error('Order not found');
    return order;
  },

  async checkout(
    payload: {
      customer: { first_name: string; last_name?: string | null; email: string; phone: string };
      shipping_address: { address_line1: string; city: string; state: string; postal_code: string; country?: string };
      items: Array<{ product_id: number; variant_id?: number | null; quantity: number; unit_price: number }>;
      coupon_id?: number | null;
      coupon_code?: string | null;
      discount_amount?: number;
      payment_method?: string;
      notes?: string | null;
    },
    userId?: number | null
  ) {
    // 1. Find or create customer
    let customer = await query.one<{ id: number }>(
      'SELECT id FROM customers WHERE email = ?',
      [payload.customer.email.toLowerCase()]
    );

    let customerId: number;
    if (customer) {
      customerId = customer.id;
      // Update phone or user_id link if logged in
      if (userId) {
        await query.run('UPDATE customers SET user_id = ? WHERE id = ?', [userId, customerId]);
      }
    } else {
      const custRes = await query.run(
        'INSERT INTO customers (user_id, first_name, last_name, email, phone, status) VALUES (?, ?, ?, ?, ?, "ACTIVE")',
        [
          userId ?? null,
          payload.customer.first_name,
          payload.customer.last_name ?? null,
          payload.customer.email.toLowerCase(),
          payload.customer.phone,
        ]
      );
      customerId = custRes.insertId;
    }

    // 2. Save shipping address
    const addrRes = await query.run(
      `INSERT INTO customer_addresses (customer_id, type, address_line1, city, state, postal_code, country, is_default)
       VALUES (?, 'SHIPPING', ?, ?, ?, ?, ?, 1)`,
      [
        customerId,
        payload.shipping_address.address_line1,
        payload.shipping_address.city,
        payload.shipping_address.state,
        payload.shipping_address.postal_code,
        payload.shipping_address.country || 'USA',
      ]
    );
    const shippingAddressId = addrRes.insertId;

    // 3. Create checkout order with atomic transaction & reservation
    const order = await OrderRepository.createCheckoutOrder({
      customerId,
      userId: userId ?? null,
      items: payload.items.map((it) => ({
        productId: it.product_id,
        variantId: it.variant_id ?? null,
        quantity: it.quantity,
        unitPrice: it.unit_price,
      })),
      shippingAddressId,
      billingAddressId: shippingAddressId,
      couponId: payload.coupon_id ?? null,
      couponCode: payload.coupon_code ?? null,
      discountAmount: payload.discount_amount ?? 0,
      notes: payload.notes ?? null,
    });

    // 4. Create payment record
    await query.run(
      `INSERT INTO payments (order_id, payment_method, status, amount, currency, transaction_ref)
       VALUES (?, ?, 'COMPLETED', ?, 'USD', ?)`,
      [
        order.id,
        payload.payment_method || 'MOCK_CARD',
        order.grand_total,
        `TXN-${Date.now().toString(36).toUpperCase()}`,
      ]
    );

    return order;
  },

  async updateStatus(orderId: number, status: string, reason?: string, userId?: number) {
    await OrderRepository.updateOrderStatus(orderId, status, reason, userId);
    return OrderRepository.findOrderById(orderId);
  },
};
