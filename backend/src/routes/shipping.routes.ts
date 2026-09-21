import { Router } from 'express';
import { ShippingController } from '../controllers/shipping.controller';
import { authenticate, authorizePermission } from '../middleware/auth';

const router = Router();

// Public / Customer tracking
router.get('/shipping/track/:awb', ShippingController.trackByAWB);
router.get('/shipping/order/:orderId', authenticate, ShippingController.getByOrder);

// Admin logistics management
router.get('/shipments', authenticate, authorizePermission('shipments.view'), ShippingController.listShipments);
router.get('/shipments/:id', authenticate, authorizePermission('shipments.view'), ShippingController.getShipment);
router.post('/shipments', authenticate, authorizePermission('shipments.create'), ShippingController.createShipment);
router.post('/shipments/:id/checkpoints', authenticate, authorizePermission('shipments.update'), ShippingController.addCheckpoint);

export default router;
