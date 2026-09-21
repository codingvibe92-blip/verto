import { z } from 'zod';

export const checkoutSchema = z.object({
  customer: z.object({
    first_name: z.string().min(2).max(100),
    last_name: z.string().max(100).optional().nullable(),
    email: z.string().email(),
    phone: z.string().min(6).max(30),
  }),
  shipping_address: z.object({
    address_line1: z.string().min(3).max(255),
    city: z.string().min(2).max(100),
    state: z.string().min(2).max(100),
    postal_code: z.string().min(2).max(20),
    country: z.string().default('USA'),
  }),
  items: z.array(
    z.object({
      product_id: z.number().int().positive(),
      variant_id: z.number().int().positive().optional().nullable(),
      quantity: z.number().int().positive(),
      unit_price: z.number().positive(),
    })
  ).min(1, 'Cart cannot be empty'),
  coupon_id: z.number().int().positive().optional().nullable(),
  coupon_code: z.string().optional().nullable(),
  discount_amount: z.number().min(0).default(0),
  payment_method: z.string().default('mock_card'),
  notes: z.string().max(500).optional().nullable(),
});

export const orderStatusUpdateSchema = z.object({
  status: z.enum([
    'PENDING_PAYMENT',
    'CONFIRMED',
    'PROCESSING',
    'SHIPPED',
    'DELIVERED',
    'CANCELLED',
    'REFUNDED',
  ]),
  reason: z.string().max(255).optional(),
});
