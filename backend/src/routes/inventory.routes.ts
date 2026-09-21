import { Router } from 'express';
import { InventoryController, RawMaterialController, WarehouseController } from '../controllers/inventory.controller';
import { authenticate, authorizePermission } from '../middleware/auth';
import { validate } from '../middleware/validate';
import {
  inventoryAdjustSchema,
  inventoryReceiveSchema,
  inventoryTransferSchema,
  rawMaterialCreateSchema,
  rawMaterialUpdateSchema,
  warehouseCreateSchema,
  warehouseLocationSchema,
  warehouseUpdateSchema,
} from '../validators/inventory.validator';

const router = Router();

// Warehouses
router.get('/warehouses/all', authenticate, authorizePermission('warehouses.view'), WarehouseController.all);
router.get('/warehouses', authenticate, authorizePermission('warehouses.view'), WarehouseController.list);
router.get('/warehouses/:id', authenticate, authorizePermission('warehouses.view'), WarehouseController.get);
router.post('/warehouses', authenticate, authorizePermission('warehouses.create'), validate(warehouseCreateSchema), WarehouseController.create);
router.put('/warehouses/:id', authenticate, authorizePermission('warehouses.update'), validate(warehouseUpdateSchema), WarehouseController.update);
router.delete('/warehouses/:id', authenticate, authorizePermission('warehouses.delete'), WarehouseController.remove);
router.post('/warehouses/:id/locations', authenticate, authorizePermission('warehouses.update'), validate(warehouseLocationSchema), WarehouseController.addLocation);

// Raw materials
router.get('/raw-materials', authenticate, authorizePermission('rawmaterials.view'), RawMaterialController.list);
router.get('/raw-materials/:id', authenticate, authorizePermission('rawmaterials.view'), RawMaterialController.get);
router.post('/raw-materials', authenticate, authorizePermission('rawmaterials.create'), validate(rawMaterialCreateSchema), RawMaterialController.create);
router.put('/raw-materials/:id', authenticate, authorizePermission('rawmaterials.update'), validate(rawMaterialUpdateSchema), RawMaterialController.update);
router.delete('/raw-materials/:id', authenticate, authorizePermission('rawmaterials.delete'), RawMaterialController.remove);

// Inventory
router.get('/inventory', authenticate, authorizePermission('inventory.view'), InventoryController.list);
router.get('/inventory/:id', authenticate, authorizePermission('inventory.view'), InventoryController.get);
router.get('/stock-history', authenticate, authorizePermission('inventory.view'), InventoryController.history);
router.post('/inventory/receive', authenticate, authorizePermission('inventory.receive'), validate(inventoryReceiveSchema), InventoryController.receive);
router.post('/inventory/adjust', authenticate, authorizePermission('inventory.adjust'), validate(inventoryAdjustSchema), InventoryController.adjust);
router.post('/inventory/transfer', authenticate, authorizePermission('inventory.transfer'), validate(inventoryTransferSchema), InventoryController.transfer);

export default router;