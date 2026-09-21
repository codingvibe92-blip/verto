import { z } from 'zod';

export const cartItemAddSchema = z.object({
  product_id: z.number().int().positive(),
  variant_id: z.number().int().positive().optional().nullable(),
  quantity: z.number().int().positive().default(1),
  session_token: z.string().optional(),
});

export const cartItemUpdateSchema = z.object({
  quantity: z.number().int().min(0),
  session_token: z.string().optional(),
});

export const couponApplySchema = z.object({
  code: z.string().min(2).max(60),
  items_total: z.number().min(0),
});

export const couponCreateSchema = z.object({
  code: z.string().min(2).max(60),
  type: z.enum(['PERCENT', 'FIXED']).default('PERCENT'),
  value: z.number().positive(),
  max_discount: z.number().positive().optional().nullable(),
  min_order_value: z.number().min(0).default(0),
  usage_limit: z.number().int().min(0).default(0),
  starts_at: z.string().optional().nullable(),
  ends_at: z.string().optional().nullable(),
});
