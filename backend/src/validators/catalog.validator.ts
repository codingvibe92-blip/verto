import { z } from 'zod';

export const categoryCreateSchema = z.object({
  body: z.object({
    name: z.string().min(2).max(120),
    slug: z.string().min(1).max(120).optional(),
    parent_id: z.number().int().positive().nullable().optional(),
    description: z.string().nullable().optional(),
    image_url: z.string().max(500).nullable().optional(),
    status: z.enum(['ACTIVE', 'INACTIVE']).default('ACTIVE'),
    sort_order: z.number().int().default(0),
    seo_title: z.string().max(255).nullable().optional(),
    seo_description: z.string().max(500).nullable().optional(),
  }),
});

export const categoryUpdateSchema = z.object({
  body: z.object({
    name: z.string().min(2).max(120).optional(),
    slug: z.string().min(1).max(120).optional(),
    parent_id: z.number().int().positive().nullable().optional(),
    description: z.string().nullable().optional(),
    image_url: z.string().max(500).nullable().optional(),
    status: z.enum(['ACTIVE', 'INACTIVE']).optional(),
    sort_order: z.number().int().optional(),
    seo_title: z.string().max(255).nullable().optional(),
    seo_description: z.string().max(500).nullable().optional(),
  }),
});

const subcategoryBaseSchema = z.object({
  category_id: z.number().int().positive(),
  name: z.string().min(2).max(120),
  slug: z.string().min(1).max(120).optional(),
  description: z.string().nullable().optional(),
  image_url: z.string().max(500).nullable().optional(),
  status: z.enum(['ACTIVE', 'INACTIVE']).default('ACTIVE'),
  seo_title: z.string().max(255).nullable().optional(),
  seo_description: z.string().max(500).nullable().optional(),
});

export const subcategoryCreateSchema = z.object({
  body: subcategoryBaseSchema,
});

export const subcategoryUpdateSchema = z.object({
  body: subcategoryBaseSchema.partial().extend({ category_id: z.number().int().positive().optional() }),
});

const imageSchema = z.object({
  url: z.string().min(1).max(500),
  alt_text: z.string().max(255).nullable().optional(),
  is_primary: z.boolean().optional(),
  sort_order: z.number().int().optional(),
});

const variantSchema = z.object({
  sku: z.string().min(1).max(100),
  name: z.string().max(180).nullable().optional(),
  attributes: z.record(z.string(), z.unknown()).nullable().optional(),
  price: z.number().nonnegative().optional(),
  selling_price: z.number().nonnegative().optional(),
});

const attributeSchema = z.object({
  attribute_key: z.string().min(1).max(80),
  attribute_value: z.string().min(1).max(255),
  sort_order: z.number().int().optional(),
});

export const productCreateSchema = z.object({
  body: z.object({
    sku: z.string().min(3).max(100),
    name: z.string().min(2).max(180),
    slug: z.string().max(120).optional(),
    description: z.string().nullable().optional(),
    short_description: z.string().max(500).nullable().optional(),
    category_id: z.number().int().positive().nullable().optional(),
    subcategory_id: z.number().int().positive().nullable().optional(),
    brand: z.string().max(120).nullable().optional(),
    price: z.number().nonnegative(),
    mrp: z.number().nonnegative().nullable().optional(),
    cost_price: z.number().nonnegative().optional(),
    tax_percent: z.number().nonnegative().optional(),
    discount_percent: z.number().nonnegative().optional(),
    selling_price: z.number().nonnegative().optional(),
    weight: z.number().nonnegative().nullable().optional(),
    length: z.number().nonnegative().nullable().optional(),
    width: z.number().nonnegative().nullable().optional(),
    height: z.number().nonnegative().nullable().optional(),
    min_stock: z.number().int().nonnegative().optional(),
    max_stock: z.number().int().nonnegative().nullable().optional(),
    status: z.enum(['DRAFT', 'ACTIVE', 'INACTIVE', 'OUT_OF_STOCK', 'ARCHIVED']).default('DRAFT'),
    tags: z.string().max(500).nullable().optional(),
    seo_title: z.string().max(255).nullable().optional(),
    seo_description: z.string().max(500).nullable().optional(),
    images: z.array(imageSchema).optional(),
    variants: z.array(variantSchema).optional(),
    attributes: z.array(attributeSchema).optional(),
  }),
});

export const productUpdateSchema = productCreateSchema.shape.body.partial().extend({}).optional();
export const productUpdateBodySchema = z.object({ body: productUpdateSchema });