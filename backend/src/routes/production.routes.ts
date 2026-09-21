import { Router } from 'express';
import { ProductionController } from '../controllers/production.controller';
import { authenticate, authorizePermission } from '../middleware/auth';
import { validate } from '../middleware/validate';
import {
  bomCreateSchema,
  bomUpdateSchema,
  productionOrderCreateSchema,
  qualityCheckCreateSchema,
} from '../validators/production.validator';

const router = Router();

// BOM routes
router.get(
  '/boms',
  authenticate,
  authorizePermission('bom.view'),
  ProductionController.listBOMs
);
router.get(
  '/boms/:id',
  authenticate,
  authorizePermission('bom.view'),
  ProductionController.getBOM
);
router.post(
  '/boms',
  authenticate,
  authorizePermission('bom.create'),
  validate(bomCreateSchema),
  ProductionController.createBOM
);
router.put(
  '/boms/:id',
  authenticate,
  authorizePermission('bom.update'),
  validate(bomUpdateSchema),
  ProductionController.updateBOM
);
router.delete(
  '/boms/:id',
  authenticate,
  authorizePermission('bom.delete'),
  ProductionController.deleteBOM
);

// Production Order routes
router.get(
  '/production/orders',
  authenticate,
  authorizePermission('production.view'),
  ProductionController.listOrders
);
router.get(
  '/production/orders/:id',
  authenticate,
  authorizePermission('production.view'),
  ProductionController.getOrder
);
router.post(
  '/production/orders',
  authenticate,
  authorizePermission('production.create'),
  validate(productionOrderCreateSchema),
  ProductionController.createOrder
);
router.post(
  '/production/orders/:id/start',
  authenticate,
  authorizePermission('production.update'),
  ProductionController.startOrder
);
router.post(
  '/production/orders/:id/complete',
  authenticate,
  authorizePermission('production.update'),
  ProductionController.completeOrder
);
router.post(
  '/production/orders/:id/cancel',
  authenticate,
  authorizePermission('production.cancel'),
  ProductionController.cancelOrder
);

// Quality Checks
router.get(
  '/production/quality-checks',
  authenticate,
  authorizePermission('quality.view'),
  ProductionController.listQualityChecks
);
router.post(
  '/production/quality-checks',
  authenticate,
  authorizePermission('quality.check'),
  validate(qualityCheckCreateSchema),
  ProductionController.createQualityCheck
);

export default router;
