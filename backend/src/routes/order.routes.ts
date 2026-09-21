import { Router } from 'express';
import { OrderController } from '../controllers/order.controller';
import { authenticate, authenticateOptional, authorizePermission } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { checkoutSchema, orderStatusUpdateSchema } from '../validators/order.validator';

const router = Router();

// Storefront checkout (guest or authenticated)
router.post('/orders/checkout', authenticateOptional, validate(checkoutSchema), OrderController.checkout);
router.get('/orders/lookup/:orderNumber', OrderController.getOrderByNumber);

// Admin / Staff order management
router.get('/orders', authenticate, authorizePermission('orders.view'), OrderController.listOrders);
router.get('/orders/:id', authenticate, authorizePermission('orders.view'), OrderController.getOrder);
router.put('/orders/:id/status', authenticate, authorizePermission('orders.update'), validate(orderStatusUpdateSchema), OrderController.updateStatus);

export default router;
