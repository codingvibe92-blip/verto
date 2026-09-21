import { Router } from 'express';
import { CartController } from '../controllers/cart.controller';
import { authenticate, authenticateOptional, authorizePermission } from '../middleware/auth';
import { validate } from '../middleware/validate';
import {
  cartItemAddSchema,
  cartItemUpdateSchema,
  couponApplySchema,
  couponCreateSchema,
} from '../validators/cart.validator';

const router = Router();

// Cart routes (support guest session or logged-in user)
router.get('/cart', authenticateOptional, CartController.getCart);
router.post('/cart/items', authenticateOptional, validate(cartItemAddSchema), CartController.addItem);
router.put('/cart/items/:itemId', authenticateOptional, validate(cartItemUpdateSchema), CartController.updateItem);
router.delete('/cart/items/:itemId', authenticateOptional, CartController.removeItem);
router.delete('/cart/clear', authenticateOptional, CartController.clearCart);
router.post('/cart/merge', authenticate, CartController.mergeCart);

// Coupons (public validation + admin management)
router.post('/cart/coupon/apply', validate(couponApplySchema), CartController.applyCoupon);
router.get('/coupons', authenticate, authorizePermission('coupons.view'), CartController.listCoupons);
router.post('/coupons', authenticate, authorizePermission('coupons.create'), validate(couponCreateSchema), CartController.createCoupon);
router.put('/coupons/:id/toggle', authenticate, authorizePermission('coupons.update'), CartController.toggleCoupon);

export default router;
