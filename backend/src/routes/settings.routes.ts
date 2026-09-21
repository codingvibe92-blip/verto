import { Router } from 'express';
import { SettingsController } from '../controllers/settings.controller';
import { authenticate, authorizePermission } from '../middleware/auth';

const router = Router();

router.get('/settings', authenticate, authorizePermission('settings.manage'), SettingsController.getSettings);
router.put('/settings', authenticate, authorizePermission('settings.manage'), SettingsController.updateSettings);

export default router;
