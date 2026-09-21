import { z } from 'zod';

export const warehouseCreateSchema = z.object({
  body: z.object({
    name: z.string().min(2).max(180),
    code: z.string().min(2).max(40),
    address: z.string().max(1000).nullable().optional(),
    city: z.string().max(100).nullable().optional(),
    state: z.string().max(100).nullable().optional(),
    pincode: z.string().max(20).nullable().optional(),
    country: z.string().max(80).nullable().optional(),
    is_active: z.boolean().optional(),
  }),
});

export const warehouseUpdateSchema = warehouseCreateSchema.shape.body.partial();

export const warehouseLocationSchema = z.object({
  body: z.object({
    name: z.string().min(1).max(120),
    code: z.string().min(1).max(60),
    location_type: z.string().max(30).default('RACK'),
  }),
});

export const rawMaterialCreateSchema = z.object({
  body: z.object({
    name: z.string().min(2).max(180),
    sku: z.string().min(3).max(100),
    description: z.string().nullable().optional(),
    category_id: z.number().int().positive().nullable().optional(),
    unit: z.string().max(20).default('KG'),
    supplier_id: z.number().int().positive().nullable().optional(),
    cost: z.number().nonnegative().optional(),
    min_quantity: z.number().nonnegative().optional(),
    max_quantity: z.number().nonnegative().nullable().optional(),
    reorder_level: z.number().nonnegative().nullable().optional(),
    storage_location: z.string().max(120).nullable().optional(),
    batch_no: z.string().max(80).nullable().optional(),
    expiry_date: z.string().nullable().optional(),
    status: z.string().max(30).default('ACTIVE'),
  }),
});

export const rawMaterialUpdateSchema = rawMaterialCreateSchema.shape.body.partial();

export const inventoryReceiveSchema = z.object({
  body: z.object({
    warehouse_id: z.number().int().positive(),
    location_id: z.number().int().positive().nullable().optional(),
    product_id: z.number().int().positive().nullable().optional(),
    raw_material_id: z.number().int().positive().nullable().optional(),
    quantity: z.number().positive(),
    unit_cost: z.number().nonnegative().optional(),
    batch_no: z.string().max(80).nullable().optional(),
    expiry_date: z.string().nullable().optional(),
    reference_type: z.string().max(40).optional(),
    reference_id: z.number().int().optional(),
    reason: z.string().max(255).nullable().optional(),
  }),
});

export const inventoryAdjustSchema = z.object({
  body: z.object({
    inventory_id: z.number().int().positive(),
    quantity: z.number(),
    reason: z.string().min(2).max(255),
  }),
});

export const inventoryTransferSchema = z.object({
  body: z.object({
    inventory_id: z.number().int().positive(),
    to_warehouse_id: z.number().int().positive(),
    to_location_id: z.number().int().positive().nullable().optional(),
    quantity: z.number().positive(),
    reason: z.string().max(500).nullable().optional(),
  }),
});