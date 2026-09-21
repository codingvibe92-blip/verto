import { Router } from 'express';
import { DashboardController } from '../controllers/dashboard.controller';
import { authenticate, authorizePermission } from '../middleware/auth';

const router = Router();

router.get('/stats', authenticate, authorizePermission('reports.view'), DashboardController.stats);

export default router;