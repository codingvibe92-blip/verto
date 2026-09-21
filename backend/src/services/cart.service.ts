import { CartRepository } from '../repositories/cart.repository';

export const CartService = {
  async getCart(opts: { userId?: number; customerId?: number; sessionToken?: string }) {
    const cart = await CartRepository.getOrCreateCart(opts);
    const items = await CartRepository.getCartItems(cart.id);

    let itemsTotal = 0;
    const formattedItems = items.map((it) => {
      const lineTotal = Number(it.unit_price) * it.quantity;
      itemsTotal += lineTotal;
      return {
        ...it,
        line_total: lineTotal,
      };
    });

    return {
      cart_id: cart.id,
      items: formattedItems,
      items_total: Math.round(itemsTotal * 100) / 100,
      item_count: formattedItems.reduce((acc, curr) => acc + curr.quantity, 0),
    };
  },

  async addItem(
    opts: { userId?: number; customerId?: number; sessionToken?: string },
    productId: number,
    variantId: number | null,
    quantity: number
  ) {
    const cart = await CartRepository.getOrCreateCart(opts);
    await CartRepository.addItem(cart.id, productId, variantId, quantity);
    return this.getCart(opts);
  },

  async updateItem(
    opts: { userId?: number; customerId?: number; sessionToken?: string },
    itemId: number,
    quantity: number
  ) {
    const cart = await CartRepository.getOrCreateCart(opts);
    await CartRepository.updateItemQuantity(cart.id, itemId, quantity);
    return this.getCart(opts);
  },

  async removeItem(
    opts: { userId?: number; customerId?: number; sessionToken?: string },
    itemId: number
  ) {
    const cart = await CartRepository.getOrCreateCart(opts);
    await CartRepository.removeItem(cart.id, itemId);
    return this.getCart(opts);
  },

  async clearCart(opts: { userId?: number; customerId?: number; sessionToken?: string }) {
    const cart = await CartRepository.getOrCreateCart(opts);
    await CartRepository.clearCart(cart.id);
    return { cart_id: cart.id, items: [], items_total: 0, item_count: 0 };
  },

  async mergeCart(sessionToken: string, userId: number, customerId?: number) {
    await CartRepository.mergeSessionCart(sessionToken, userId, customerId);
    return this.getCart({ userId, customerId });
  },

  // Coupon
  async validateCoupon(code: string, itemsTotal: number) {
    const coupon = await CartRepository.findCouponByCode(code);
    if (!coupon) throw new Error('Invalid or inactive coupon code');

    const now = new Date();
    if (coupon.starts_at && new Date(coupon.starts_at) > now) {
      throw new Error('This coupon is not active yet');
    }
    if (coupon.ends_at && new Date(coupon.ends_at) < now) {
      throw new Error('This coupon has expired');
    }
    if (coupon.usage_limit > 0 && coupon.used_count >= coupon.usage_limit) {
      throw new Error('This coupon has reached its maximum usage limit');
    }

    const minOrder = Number(coupon.min_order_value);
    if (itemsTotal < minOrder) {
      throw new Error(`Minimum order of $${minOrder.toFixed(2)} required for this coupon`);
    }

    let discount = 0;
    if (coupon.type === 'PERCENT') {
      discount = (itemsTotal * Number(coupon.value)) / 100;
      if (coupon.max_discount && discount > Number(coupon.max_discount)) {
        discount = Number(coupon.max_discount);
      }
    } else {
      discount = Math.min(itemsTotal, Number(coupon.value));
    }

    discount = Math.round(discount * 100) / 100;

    return {
      valid: true,
      coupon_id: coupon.id,
      code: coupon.code,
      discount_amount: discount,
      message: `Coupon applied: saved $${discount.toFixed(2)}`,
    };
  },

  async listCoupons() {
    return CartRepository.listCoupons();
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
  }) {
    const id = await CartRepository.createCoupon(data);
    return { id, message: 'Coupon created successfully' };
  },

  async toggleCoupon(id: number, isActive: boolean) {
    await CartRepository.toggleCoupon(id, isActive);
    return { success: true, message: `Coupon ${isActive ? 'activated' : 'deactivated'}` };
  },
};
