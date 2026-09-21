import { Router } from 'express';
import authRoutes from './auth.routes';
import dashboardRoutes from './dashboard.routes';
import catalogRoutes from './catalog.routes';
import inventoryRoutes from './inventory.routes';
import productionRoutes from './production.routes';
import cartRoutes from './cart.routes';
import orderRoutes from './order.routes';
import shippingRoutes from './shipping.routes';
import paymentRoutes from './payment.routes';
import customerRoutes from './customer.routes';
import adminUserRoutes from './admin-user.routes';
import reportRoutes from './report.routes';
import auditLogRoutes from './audit-log.routes';
import settingsRoutes from './settings.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/dashboard', dashboardRoutes);
router.use('/', catalogRoutes);
router.use('/', inventoryRoutes);
router.use('/', productionRoutes);
router.use('/', cartRoutes);
router.use('/', orderRoutes);
router.use('/', shippingRoutes);
router.use('/', paymentRoutes);
router.use('/', customerRoutes);
router.use('/', adminUserRoutes);
router.use('/', reportRoutes);
router.use('/', auditLogRoutes);
router.use('/', settingsRoutes);

router.get('/health', (_req, res) => {
  res.json({ success: true, status: 'ok', time: new Date().toISOString() });
});

export default router;