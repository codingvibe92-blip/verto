import { Router } from 'express';
import { AuditLogController } from '../controllers/audit-log.controller';
import { authenticate, authorizePermission } from '../middleware/auth';

const router = Router();

router.get('/audit-logs', authenticate, authorizePermission('audit.view'), AuditLogController.list);

export default router;
