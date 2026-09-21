import { Router } from 'express';
import { PaymentController } from '../controllers/payment.controller';
import { authenticate, authorizePermission } from '../middleware/auth';

const router = Router();

router.get('/payments', authenticate, authorizePermission('payments.view'), PaymentController.listPayments);
router.get('/refunds', authenticate, authorizePermission('refunds.view'), PaymentController.listRefunds);
router.post('/refunds', authenticate, authorizePermission('payments.refund'), PaymentController.processRefund);

export default router;
