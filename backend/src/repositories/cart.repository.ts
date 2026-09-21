import { query, txQuery, withTransaction } from '../database/pool';

export interface CartRow {
  id: number;
  user_id: number | null;
  customer_id: number | null;
  session_token: string | null;
  status: string;
}

export interface CartItemRow {
  id: number;
  cart_id: number;
  product_id: number;
  variant_id: number | null;
  quantity: number;
  unit_price: string;
  product_name: string;
  product_sku: string;
  product_slug: string;
  image_url: string | null;
  line_total?: number;
}

export interface CouponRow {
  id: number;
  code: string;
  type: string;
  value: string;
  max_discount: string | null;
  min_order_value: string;
  per_user_limit: number;
  usage_limit: number;
  used_count: number;
  starts_at: string | null;
  ends_at: string | null;
  is_active: number;
}

export const CartRepository = {
  async getOrCreateCart(opts: { userId?: number; customerId?: number; sessionToken?: string }): Promise<CartRow> {
    if (opts.userId) {
      const existing = await query.one<CartRow>(
        'SELECT * FROM carts WHERE user_id = ? AND status = "ACTIVE" ORDER BY id DESC LIMIT 1',
        [opts.userId]
      );
      if (existing) return existing;

      const res = await query.run(
        'INSERT INTO carts (user_id, customer_id, status) VALUES (?, ?, "ACTIVE")',
        [opts.userId, opts.customerId ?? null]
      );
      return { id: res.insertId, user_id: opts.userId, customer_id: opts.customerId ?? null, session_token: null, status: 'ACTIVE' };
    }

    if (opts.sessionToken) {
      const existing = await query.one<CartRow>(
        'SELECT * FROM carts WHERE session_token = ? AND status = "ACTIVE" ORDER BY id DESC LIMIT 1',
        [opts.sessionToken]
      );
      if (existing) return existing;

      const res = await query.run(
        'INSERT INTO carts (session_token, status) VALUES (?, "ACTIVE")',
        [opts.sessionToken]
      );
      return { id: res.insertId, user_id: null, customer_id: null, session_token: opts.sessionToken, status: 'ACTIVE' };
    }

    throw new Error('Either userId or sessionToken is required to retrieve a cart');
  },

  async getCartItems(cartId: number): Promise<CartItemRow[]> {
    return query.rows<CartItemRow>(
      `SELECT ci.*, p.name AS product_name, p.sku AS product_sku, p.slug AS product_slug,
              (SELECT url FROM product_images WHERE product_id = p.id ORDER BY is_primary DESC, sort_order ASC LIMIT 1) AS image_url
       FROM cart_items ci
       JOIN products p ON p.id = ci.product_id
       WHERE ci.cart_id = ?
       ORDER BY ci.created_at ASC`,
      [cartId]
    );
  },

  async addItem(cartId: number, productId: number, variantId: number | null, quantity: number): Promise<void> {
    const product = await query.one<{ price: string; selling_price: string }>(
      'SELECT price, selling_price FROM products WHERE id = ?',
      [productId]
    );
    if (!product) throw new Error('Product not found');

    const effectivePrice = Number(product.selling_price) > 0 ? Number(product.selling_price) : Number(product.price);

    const existing = await query.one<{ id: number; quantity: number }>(
      'SELECT id, quantity FROM cart_items WHERE cart_id = ? AND product_id = ? AND (variant_id = ? OR (variant_id IS NULL AND ? IS NULL))',
      [cartId, productId, variantId, variantId]
    );

    if (existing) {
      await query.run(
        'UPDATE cart_items SET quantity = quantity + ?, unit_price = ? WHERE id = ?',
        [quantity, effectivePrice, existing.id]
      );
    } else {
      await query.run(
        'INSERT INTO cart_items (cart_id, product_id, variant_id, quantity, unit_price) VALUES (?, ?, ?, ?, ?)',
        [cartId, productId, variantId ?? null, quantity, effectivePrice]
      );
    }
  },

  async updateItemQuantity(cartId: number, itemId: number, quantity: number): Promise<void> {
    if (quantity <= 0) {
      await query.run('DELETE FROM cart_items WHERE id = ? AND cart_id = ?', [itemId, cartId]);
    } else {
      await query.run('UPDATE cart_items SET quantity = ? WHERE id = ? AND cart_id = ?', [quantity, itemId, cartId]);
    }
  },

  async removeItem(cartId: number, itemId: number): Promise<void> {
    await query.run('DELETE FROM cart_items WHERE id = ? AND cart_id = ?', [itemId, cartId]);
  },

  async clearCart(cartId: number): Promise<void> {
    await query.run('DELETE FROM cart_items WHERE cart_id = ?', [cartId]);
  },

  async mergeSessionCart(sessionToken: string, userId: number, customerId?: number): Promise<void> {
    const sessionCart = await query.one<CartRow>(
      'SELECT * FROM carts WHERE session_token = ? AND status = "ACTIVE"',
      [sessionToken]
    );
    if (!sessionCart) return;

    const userCart = await this.getOrCreateCart({ userId, customerId });
    const sessionItems = await this.getCartItems(sessionCart.id);

    for (const item of sessionItems) {
      await this.addItem(userCart.id, item.product_id, item.variant_id, item.quantity);
    }

    // Mark session cart as merged
    await query.run('UPDATE carts SET status = "MERGED" WHERE id = ?', [sessionCart.id]);
  },

  // ==================== COUPONS ====================
  async findCouponByCode(code: string): Promise<CouponRow | null> {
    return query.one<CouponRow>(
      'SELECT * FROM coupons WHERE code = ? AND is_active = 1',
      [code.toUpperCase()]
    );
  },

  async listCoupons(): Promise<CouponRow[]> {
    return query.rows<CouponRow>('SELECT * FROM coupons ORDER BY created_at DESC');
  },

  async createCoupon(data: {
    code: string;
    type: string;
    value: number;
    max_discount?: number | null;
    min_order_value?: number;
    usage_limit?: number;
    starts_at?: string | null;
    ends_at?: string | null;
  }): Promise<number> {
    const res = await query.run(
      `INSERT INTO coupons (code, type, value, max_discount, min_order_value, usage_limit, starts_at, ends_at, is_active)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1)`,
      [
        data.code.toUpperCase(),
        data.type || 'PERCENT',
        data.value,
        data.max_discount ?? null,
        data.min_order_value ?? 0,
        data.usage_limit ?? 0,
        data.starts_at ?? null,
        data.ends_at ?? null,
      ]
    );
    return res.insertId;
  },

  async toggleCoupon(id: number, isActive: boolean): Promise<void> {
    await query.run('UPDATE coupons SET is_active = ? WHERE id = ?', [isActive ? 1 : 0, id]);
  },
};
