import type { Request, Response } from 'express';
import { asyncHandler } from '../middleware/validate';
import { WarehouseService, RawMaterialService } from '../services/warehouse.service';
import { InventoryService } from '../services/inventory.service';
import { parsePagination } from '../utils/pagination';

function actorId(req: Request): number | undefined {
  return req.user?.id;
}

export const WarehouseController = {
  list: asyncHandler(async (req: Request, res: Response) => {
    const p = parsePagination(req.query);
    const data = await WarehouseService.list({ ...p, search: typeof req.query.search === 'string' ? req.query.search : undefined });
    res.json({ success: true, message: 'Warehouses fetched', data: data.rows, meta: data.meta });
  }),
  all: asyncHandler(async (_req: Request, res: Response) => {
    const data = await WarehouseService.allActive();
    res.json({ success: true, message: 'Warehouses fetched', data });
  }),
  get: asyncHandler(async (req: Request, res: Response) => {
    const data = await WarehouseService.get(Number(req.params.id));
    res.json({ success: true, message: 'Warehouse fetched', data });
  }),
  create: asyncHandler(async (req: Request, res: Response) => {
    const data = await WarehouseService.create(req.body);
    res.status(201).json({ success: true, message: 'Warehouse created', data });
  }),
  update: asyncHandler(async (req: Request, res: Response) => {
    const data = await WarehouseService.update(Number(req.params.id), req.body);
    res.json({ success: true, message: 'Warehouse updated', data });
  }),
  remove: asyncHandler(async (req: Request, res: Response) => {
    await WarehouseService.remove(Number(req.params.id));
    res.json({ success: true, message: 'Warehouse deleted' });
  }),
  addLocation: asyncHandler(async (req: Request, res: Response) => {
    const data = await WarehouseService.addLocation(Number(req.params.id), req.body.name, req.body.code);
    res.json({ success: true, message: 'Location added', data });
  }),
};

export const RawMaterialController = {
  list: asyncHandler(async (req: Request, res: Response) => {
    const p = parsePagination(req.query);
    const data = await RawMaterialService.list({
      ...p,
      search: typeof req.query.search === 'string' ? req.query.search : undefined,
      status: typeof req.query.status === 'string' ? req.query.status : undefined,
      category_id: req.query.category_id ? Number(req.query.category_id) : undefined,
    });
    res.json({ success: true, message: 'Raw materials fetched', data: data.rows, meta: data.meta });
  }),
  get: asyncHandler(async (req: Request, res: Response) => {
    const data = await RawMaterialService.get(Number(req.params.id));
    res.json({ success: true, message: 'Raw material fetched', data });
  }),
  create: asyncHandler(async (req: Request, res: Response) => {
    const data = await RawMaterialService.create(req.body);
    res.status(201).json({ success: true, message: 'Raw material created', data });
  }),
  update: asyncHandler(async (req: Request, res: Response) => {
    const data = await RawMaterialService.update(Number(req.params.id), req.body);
    res.json({ success: true, message: 'Raw material updated', data });
  }),
  remove: asyncHandler(async (req: Request, res: Response) => {
    await RawMaterialService.remove(Number(req.params.id));
    res.json({ success: true, message: 'Raw material deactivated' });
  }),
};

export const InventoryController = {
  list: asyncHandler(async (req: Request, res: Response) => {
    const p = parsePagination(req.query);
    const data = await InventoryService.list({
      ...p,
      search: typeof req.query.search === 'string' ? req.query.search : undefined,
      item_type: req.query.item_type as 'PRODUCT' | 'RAW_MATERIAL' | undefined,
      warehouse_id: req.query.warehouse_id ? Number(req.query.warehouse_id) : undefined,
      lowStock: req.query.lowStock === 'true',
    });
    res.json({ success: true, message: 'Inventory fetched', data: data.rows, meta: data.meta });
  }),
  get: asyncHandler(async (req: Request, res: Response) => {
    const data = await InventoryService.get(Number(req.params.id));
    res.json({ success: true, message: 'Inventory fetched', data });
  }),
  history: asyncHandler(async (req: Request, res: Response) => {
    const p = parsePagination(req.query);
    const data = await InventoryService.history({
      ...p,
      product_id: req.query.product_id ? Number(req.query.product_id) : undefined,
      raw_material_id: req.query.raw_material_id ? Number(req.query.raw_material_id) : undefined,
      warehouse_id: req.query.warehouse_id ? Number(req.query.warehouse_id) : undefined,
      type: typeof req.query.type === 'string' ? req.query.type : undefined,
    });
    res.json({ success: true, message: 'Stock history fetched', data: data.rows, meta: data.meta });
  }),
  receive: asyncHandler(async (req: Request, res: Response) => {
    const data = await InventoryService.receive({ ...req.body, actorId: actorId(req) });
    res.status(201).json({ success: true, message: 'Stock received', data });
  }),
  adjust: asyncHandler(async (req: Request, res: Response) => {
    const data = await InventoryService.adjust({ ...req.body, actorId: actorId(req) });
    res.json({ success: true, message: 'Stock adjusted', data });
  }),
  transfer: asyncHandler(async (req: Request, res: Response) => {
    const data = await InventoryService.transfer({ ...req.body, actorId: actorId(req) });
    res.json({ success: true, message: 'Stock transferred', data });
  }),
};