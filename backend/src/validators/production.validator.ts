import { z } from 'zod';

export const bomCreateSchema = z.object({
  product_id: z.number().int().positive(),
  name: z.string().min(2).max(180),
  description: z.string().optional().nullable(),
  yield_quantity: z.number().positive().default(1),
  wastage_percent: z.number().min(0).max(100).default(0),
  items: z.array(
    z.object({
      raw_material_id: z.number().int().positive(),
      quantity: z.number().positive(),
      unit: z.string().min(1).max(20).default('KG'),
    })
  ).min(1, 'At least one raw material item is required'),
});

export const bomUpdateSchema = z.object({
  name: z.string().min(2).max(180).optional(),
  description: z.string().optional().nullable(),
  yield_quantity: z.number().positive().optional(),
  wastage_percent: z.number().min(0).max(100).optional(),
  status: z.enum(['ACTIVE', 'INACTIVE']).optional(),
  items: z.array(
    z.object({
      raw_material_id: z.number().int().positive(),
      quantity: z.number().positive(),
      unit: z.string().min(1).max(20).default('KG'),
    })
  ).optional(),
});

export const productionOrderCreateSchema = z.object({
  product_id: z.number().int().positive(),
  bom_id: z.number().int().positive().optional().nullable(),
  quantity: z.number().int().positive(),
  planned_start: z.string().optional().nullable(),
  planned_end: z.string().optional().nullable(),
});

export const qualityCheckCreateSchema = z.object({
  production_order_id: z.number().int().positive(),
  product_id: z.number().int().positive(),
  quantity_checked: z.number().int().positive(),
  passed_qty: z.number().int().min(0),
  failed_qty: z.number().int().min(0),
  remarks: z.string().max(500).optional().nullable(),
  warehouse_id: z.number().int().positive().optional(),
});
