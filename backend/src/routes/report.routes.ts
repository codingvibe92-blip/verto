import { Router } from 'express';
import { ReportController } from '../controllers/report.controller';
import { authenticate, authorizePermission } from '../middleware/auth';

const router = Router();

router.get('/reports/overview', authenticate, authorizePermission('reports.view'), ReportController.overview);
router.get('/reports/sales', authenticate, authorizePermission('reports.view'), ReportController.sales);
router.get('/reports/inventory', authenticate, authorizePermission('reports.view'), ReportController.inventory);
router.get('/reports/production', authenticate, authorizePermission('reports.view'), ReportController.production);
router.get('/reports/customers', authenticate, authorizePermission('reports.view'), ReportController.customers);

export default router;
