import { Request, Response, NextFunction } from 'express';
import { CartService } from '../services/cart.service';

export const CartController = {
  async getCart(req: Request, res: Response, next: NextFunction) {
    try {
      const sessionToken = (req.headers['x-session-token'] as string) || (req.query.session_token as string);
      const cart = await CartService.getCart({
        userId: req.user?.id,
        sessionToken,
      });
      res.json({ success: true, data: cart });
    } catch (err) {
      next(err);
    }
  },

  async addItem(req: Request, res: Response, next: NextFunction) {
    try {
      const sessionToken = (req.headers['x-session-token'] as string) || req.body.session_token;
      const { product_id, variant_id, quantity } = req.body;
      const cart = await CartService.addItem(
        { userId: req.user?.id, sessionToken },
        product_id,
        variant_id,
        quantity || 1
      );
      res.json({ success: true, data: cart, message: 'Item added to cart' });
    } catch (err) {
      next(err);
    }
  },

  async updateItem(req: Request, res: Response, next: NextFunction) {
    try {
      const sessionToken = (req.headers['x-session-token'] as string) || req.body.session_token;
      const itemId = Number(req.params.itemId);
      const { quantity } = req.body;
      const cart = await CartService.updateItem(
        { userId: req.user?.id, sessionToken },
        itemId,
        quantity
      );
      res.json({ success: true, data: cart });
    } catch (err) {
      next(err);
    }
  },

  async removeItem(req: Request, res: Response, next: NextFunction) {
    try {
      const sessionToken = (req.headers['x-session-token'] as string) || (req.query.session_token as string);
      const itemId = Number(req.params.itemId);
      const cart = await CartService.removeItem(
        { userId: req.user?.id, sessionToken },
        itemId
      );
      res.json({ success: true, data: cart, message: 'Item removed from cart' });
    } catch (err) {
      next(err);
    }
  },

  async clearCart(req: Request, res: Response, next: NextFunction) {
    try {
      const sessionToken = (req.headers['x-session-token'] as string) || (req.query.session_token as string);
      const cart = await CartService.clearCart({
        userId: req.user?.id,
        sessionToken,
      });
      res.json({ success: true, data: cart, message: 'Cart cleared' });
    } catch (err) {
      next(err);
    }
  },

  async mergeCart(req: Request, res: Response, next: NextFunction) {
    try {
      const { session_token } = req.body;
      if (!session_token || !req.user) {
        return res.status(400).json({ success: false, message: 'Session token and logged-in user required' });
      }
      const cart = await CartService.mergeCart(session_token, req.user.id);
      res.json({ success: true, data: cart, message: 'Cart merged successfully' });
    } catch (err) {
      next(err);
    }
  },

  // Coupons
  async applyCoupon(req: Request, res: Response, next: NextFunction) {
    try {
      const { code, items_total } = req.body;
      const result = await CartService.validateCoupon(code, Number(items_total));
      res.json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  },

  async listCoupons(_req: Request, res: Response, next: NextFunction) {
    try {
      const coupons = await CartService.listCoupons();
      res.json({ success: true, data: coupons });
    } catch (err) {
      next(err);
    }
  },

  async createCoupon(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await CartService.createCoupon(req.body);
      res.status(201).json({ success: true, ...result });
    } catch (err) {
      next(err);
    }
  },

  async toggleCoupon(req: Request, res: Response, next: NextFunction) {
    try {
      const id = Number(req.params.id);
      const { is_active } = req.body;
      const result = await CartService.toggleCoupon(id, !!is_active);
      res.json(result);
    } catch (err) {
      next(err);
    }
  },
};
