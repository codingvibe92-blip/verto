import { query, txQuery, withTransaction, SqlParams } from '../database/pool';
import { PaginationMeta } from '../types';
import { PaginationParams } from '../utils/pagination';

export interface OrderRow {
  id: number;
  order_number: string;
  customer_id: number;
  customer_name?: string;
  customer_email?: string;
  customer_phone?: string;
  user_id: number | null;
  status: string;
  payment_status: string;
  items_total: string;
  discount_amount: string;
  tax_amount: string;
  shipping_amount: string;
  grand_total: string;
  coupon_code: string | null;
  shipping_address_id: number | null;
  billing_address_id: number | null;
  notes: string | null;
  placed_at: string;
  created_at: string;
  items?: OrderItemRow[];
  history?: OrderHistoryRow[];
  shipping_address?: any;
}

export interface OrderItemRow {
  id: number;
  order_id: number;
  product_id: number;
  variant_id: number | null;
  product_name: string;
  sku: string | null;
  quantity: number;
  unit_price: string;
  discount_amount: string;
  tax_amount: string;
  line_total: string;
}

export interface OrderHistoryRow {
  id: number;
  order_id: number;
  from_status: string | null;
  to_status: string;
  reason: string | null;
  changed_by: number | null;
  changed_by_name?: string;
  created_at: string;
}

export const OrderRepository = {
  async listOrders(
    opts: PaginationParams & { search?: string; status?: string; payment_status?: string; customer_id?: number }
  ): Promise<{ rows: OrderRow[]; meta: PaginationMeta }> {
    const conditions: string[] = ['1=1'];
    const params: SqlParams = [];

    if (opts.search) {
      conditions.push('(o.order_number LIKE ? OR c.first_name LIKE ? OR c.email LIKE ?)');
      params.push(`%${opts.search}%`, `%${opts.search}%`, `%${opts.search}%`);
    }
    if (opts.status) {
      conditions.push('o.status = ?');
      params.push(opts.status);
    }
    if (opts.payment_status) {
      conditions.push('o.payment_status = ?');
      params.push(opts.payment_status);
    }
    if (opts.customer_id) {
      conditions.push('o.customer_id = ?');
      params.push(opts.customer_id);
    }

    const where = `WHERE ${conditions.join(' AND ')}`;
    const countRow = await query.one<{ n: number }>(
      `SELECT COUNT(*) AS n FROM orders o JOIN customers c ON c.id = o.customer_id ${where}`,
      params
    );
    const total = countRow?.n ?? 0;
    const offset = (opts.page - 1) * opts.limit;

    const rows = await query.rows<OrderRow>(
      `SELECT o.*, CONCAT(c.first_name, ' ', COALESCE(c.last_name, '')) AS customer_name, c.email AS customer_email, c.phone AS customer_phone
       FROM orders o
       JOIN customers c ON c.id = o.customer_id
       ${where}
       ORDER BY o.created_at DESC
       LIMIT ? OFFSET ?`,
      [...params, opts.limit, offset]
    );

    return { rows, meta: { page: opts.page, limit: opts.limit, total, pages: Math.ceil(total / opts.limit) } };
  },

  async findOrderById(id: number): Promise<OrderRow | null> {
    const order = await query.one<OrderRow>(
      `SELECT o.*, CONCAT(c.first_name, ' ', COALESCE(c.last_name, '')) AS customer_name, c.email AS customer_email, c.phone AS customer_phone
       FROM orders o
       JOIN customers c ON c.id = o.customer_id
       WHERE o.id = ?`,
      [id]
    );
    if (!order) return null;

    order.items = await query.rows<OrderItemRow>(
      'SELECT * FROM order_items WHERE order_id = ?',
      [id]
    );

    order.history = await query.rows<OrderHistoryRow>(
      `SELECT osh.*, u.name AS changed_by_name
       FROM order_status_history osh
       LEFT JOIN users u ON u.id = osh.changed_by
       WHERE osh.order_id = ?
       ORDER BY osh.created_at ASC`,
      [id]
    );

    if (order.shipping_address_id) {
      order.shipping_address = await query.one(
        'SELECT * FROM customer_addresses WHERE id = ?',
        [order.shipping_address_id]
      );
    }

    return order;
  },

  async findOrderByNumber(orderNumber: string): Promise<OrderRow | null> {
    const order = await query.one<OrderRow>(
      `SELECT o.*, CONCAT(c.first_name, ' ', COALESCE(c.last_name, '')) AS customer_name, c.email AS customer_email, c.phone AS customer_phone
       FROM orders o
       JOIN customers c ON c.id = o.customer_id
       WHERE o.order_number = ?`,
      [orderNumber]
    );
    if (!order) return null;

    order.items = await query.rows<OrderItemRow>('SELECT * FROM order_items WHERE order_id = ?', [order.id]);
    order.history = await query.rows<OrderHistoryRow>('SELECT * FROM order_status_history WHERE order_id = ? ORDER BY created_at ASC', [order.id]);
    return order;
  },

  async createCheckoutOrder(data: {
    customerId: number;
    userId?: number | null;
    items: Array<{ productId: number; variantId?: number | null; quantity: number; unitPrice: number }>;
    shippingAddressId?: number | null;
    billingAddressId?: number | null;
    couponId?: number | null;
    couponCode?: string | null;
    discountAmount?: number;
    shippingAmount?: number;
    taxAmount?: number;
    notes?: string | null;
  }): Promise<OrderRow> {
    return withTransaction(async (ctx) => {
      // 1. Calculate items total and verify stock availability
      let itemsTotal = 0;
      for (const it of data.items) {
        itemsTotal += it.unitPrice * it.quantity;

        // Check stock availability
        const stockRow = await txQuery.one<{ available: number }>(
          ctx.conn,
          `SELECT COALESCE(SUM(quantity - reserved_quantity), 0) AS available
           FROM inventory WHERE product_id = ? FOR UPDATE`,
          [it.productId]
        );

        const available = stockRow ? Number(stockRow.available) : 0;
        // If inventory row exists, reserve stock; if none exists, allow backorder or seed initial stock
        if (stockRow && available < it.quantity) {
          throw new Error(`Insufficient stock for product #${it.productId}. Available: ${available}, Requested: ${it.quantity}`);
        }

        // Soft-reserve stock in the first available warehouse
        const inv = await txQuery.one<{ id: number; quantity: number; reserved_quantity: number }>(
          ctx.conn,
          'SELECT id, quantity, reserved_quantity FROM inventory WHERE product_id = ? LIMIT 1 FOR UPDATE',
          [it.productId]
        );
        if (inv) {
          await txQuery.run(
            ctx.conn,
            'UPDATE inventory SET reserved_quantity = reserved_quantity + ? WHERE id = ?',
            [it.quantity, inv.id]
          );
        }
      }

      const discount = data.discountAmount ?? 0;
      const tax = data.taxAmount ?? Math.round(itemsTotal * 0.05 * 100) / 100; // 5% default tax
      const shipping = data.shippingAmount ?? (itemsTotal > 50 ? 0 : 5); // free shipping over $50
      const grandTotal = Math.max(0, itemsTotal - discount + tax + shipping);

      const orderNumber = `CRX-${Date.now().toString(36).toUpperCase()}-${Math.floor(100 + Math.random() * 900)}`;

      // 2. Insert order
      const orderRes = await txQuery.run(
        ctx.conn,
        `INSERT INTO orders
          (order_number, customer_id, user_id, status, payment_status, items_total, discount_amount,
           tax_amount, shipping_amount, grand_total, coupon_id, coupon_code, shipping_address_id, billing_address_id, notes)
         VALUES (?, ?, ?, 'CONFIRMED', 'PAID', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          orderNumber,
          data.customerId,
          data.userId ?? null,
          itemsTotal,
          discount,
          tax,
          shipping,
          grandTotal,
          data.couponId ?? null,
          data.couponCode ?? null,
          data.shippingAddressId ?? null,
          data.billingAddressId ?? null,
          data.notes ?? null,
        ]
      );
      const orderId = orderRes.insertId;

      // 3. Insert order items
      for (const it of data.items) {
        const prod = await txQuery.one<{ name: string; sku: string }>(
          ctx.conn,
          'SELECT name, sku FROM products WHERE id = ?',
          [it.productId]
        );
        const lineTotal = it.unitPrice * it.quantity;

        await txQuery.run(
          ctx.conn,
          `INSERT INTO order_items (order_id, product_id, variant_id, product_name, sku, quantity, unit_price, line_total)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            orderId,
            it.productId,
            it.variantId ?? null,
            prod?.name ?? `Product #${it.productId}`,
            prod?.sku ?? null,
            it.quantity,
            it.unitPrice,
            lineTotal,
          ]
        );
      }

      // 4. Initial status history
      await txQuery.run(
        ctx.conn,
        `INSERT INTO order_status_history (order_id, from_status, to_status, reason, changed_by)
         VALUES (?, NULL, 'CONFIRMED', 'Order placed and paid successfully', ?)`,
        [orderId, data.userId ?? null]
      );

      // 5. If coupon used, increment coupon usage
      if (data.couponId) {
        await txQuery.run(
          ctx.conn,
          'UPDATE coupons SET used_count = used_count + 1 WHERE id = ?',
          [data.couponId]
        );
        await txQuery.run(
          ctx.conn,
          'INSERT INTO coupon_usage (coupon_id, order_id, customer_id, discount_amount) VALUES (?, ?, ?, ?)',
          [data.couponId, orderId, data.customerId, discount]
        );
      }

      const created = await txQuery.one<OrderRow>(
        ctx.conn,
        'SELECT * FROM orders WHERE id = ?',
        [orderId]
      );
      return created!;
    });
  },

  async updateOrderStatus(orderId: number, toStatus: string, reason?: string, changedBy?: number): Promise<void> {
    return withTransaction(async (ctx) => {
      const order = await txQuery.one<OrderRow>(
        ctx.conn,
        'SELECT * FROM orders WHERE id = ? FOR UPDATE',
        [orderId]
      );
      if (!order) throw new Error('Order not found');

      const fromStatus = order.status;

      // Update order status
      await txQuery.run(
        ctx.conn,
        'UPDATE orders SET status = ? WHERE id = ?',
        [toStatus, orderId]
      );

      // Record in history
      await txQuery.run(
        ctx.conn,
        `INSERT INTO order_status_history (order_id, from_status, to_status, reason, changed_by)
         VALUES (?, ?, ?, ?, ?)`,
        [orderId, fromStatus, toStatus, reason ?? null, changedBy ?? null]
      );

      // If cancelled, release any reserved stock back
      if (toStatus === 'CANCELLED') {
        const items = await txQuery.rows<{ product_id: number; quantity: number }>(
          ctx.conn,
          'SELECT product_id, quantity FROM order_items WHERE order_id = ?',
          [orderId]
        );
        for (const item of items) {
          await txQuery.run(
            ctx.conn,
            'UPDATE inventory SET reserved_quantity = GREATEST(0, reserved_quantity - ?) WHERE product_id = ?',
            [item.quantity, item.product_id]
          );
        }
      }
    });
  },
};
