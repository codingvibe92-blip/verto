import { query, SqlParams } from '../database/pool';
import { PaginationMeta } from '../types';
import { PaginationParams, paginate } from '../utils/pagination';

export interface ProductRow {
  id: number;
  sku: string;
  slug: string;
  name: string;
  description: string | null;
  short_description: string | null;
  category_id: number | null;
  subcategory_id: number | null;
  brand: string | null;
  price: string;
  mrp: string | null;
  cost_price: string;
  tax_percent: string;
  discount_percent: string;
  selling_price: string;
  weight: string | null;
  length: string | null;
  width: string | null;
  height: string | null;
  min_stock: number;
  max_stock: number | null;
  status: string;
  tags: string | null;
  seo_title: string | null;
  seo_description: string | null;
  created_at: string;
  updated_at: string;
}

export interface ProductImageRow {
  id: number;
  product_id: number;
  url: string;
  alt_text: string | null;
  sort_order: number;
  is_primary: number;
}

export interface ProductVariantRow {
  id: number;
  product_id: number;
  sku: string;
  name: string | null;
  attributes: unknown;
  price: string;
  selling_price: string;
  is_active: number;
}

export interface ProductAttributeRow {
  id: number;
  product_id: number;
  attribute_key: string;
  attribute_value: string;
  sort_order: number;
}

export interface ProductDetailRow extends ProductRow {
  category_name: string | null;
  subcategory_name: string | null;
}

export interface ProductInput {
  sku: string;
  slug: string;
  name: string;
  description?: string | null;
  short_description?: string | null;
  category_id?: number | null;
  subcategory_id?: number | null;
  brand?: string | null;
  price: number;
  mrp?: number | null;
  cost_price?: number;
  tax_percent?: number;
  discount_percent?: number;
  selling_price?: number;
  weight?: number | null;
  length?: number | null;
  width?: number | null;
  height?: number | null;
  min_stock?: number;
  max_stock?: number | null;
  status?: string;
  tags?: string | null;
  seo_title?: string | null;
  seo_description?: string | null;
  images?: { url: string; alt_text?: string | null; is_primary?: boolean; sort_order?: number }[];
  variants?: { sku: string; name?: string | null; attributes?: unknown; price?: number; selling_price?: number }[];
  attributes?: { attribute_key: string; attribute_value: string; sort_order?: number }[];
}

export interface ProductListOptions extends PaginationParams {
  search?: string;
  status?: string;
  category_id?: number;
  subcategory_id?: number;
  inStockOnly?: boolean;
  publicOnly?: boolean;
  sort?: string;
  order?: 'asc' | 'desc';
}

const SORTABLE_COLUMNS: Record<string, string> = {
  name: 'p.name',
  sku: 'p.sku',
  price: 'p.price',
  selling_price: 'p.selling_price',
  created_at: 'p.created_at',
  updated_at: 'p.updated_at',
  status: 'p.status',
};

export const ProductRepository = {
  async list(opts: ProductListOptions): Promise<{ rows: ProductDetailRow[]; meta: PaginationMeta }> {
    const conditions: string[] = ['p.deleted_at IS NULL'];
    const params: SqlParams = [];

    if (opts.search) {
      conditions.push('(p.name LIKE ? OR p.sku LIKE ? OR p.tags LIKE ?)');
      params.push(`%${opts.search}%`, `%${opts.search}%`, `%${opts.search}%`);
    }
    if (opts.status) {
      conditions.push('p.status = ?');
      params.push(opts.status);
    }
    if (opts.category_id) {
      conditions.push('p.category_id = ?');
      params.push(opts.category_id);
    }
    if (opts.subcategory_id) {
      conditions.push('p.subcategory_id = ?');
      params.push(opts.subcategory_id);
    }
    if (opts.publicOnly) {
      conditions.push("p.status = 'ACTIVE'");
    }

    const where = `WHERE ${conditions.join(' AND ')}`;

    const sortColumn = SORTABLE_COLUMNS[opts.sort ?? ''] ?? 'p.created_at';
    const sortOrder = opts.order === 'asc' ? 'ASC' : 'DESC';

    const [countRow] = await Promise.all([
      query.one<{ n: number }>(`SELECT COUNT(*) AS n FROM products p ${where}`, params),
    ]);
    const total = countRow?.n ?? 0;
    const offset = (opts.page - 1) * opts.limit;

    const selectColumns = opts.publicOnly
      ? 'p.id, p.sku, p.slug, p.name, p.description, p.short_description, p.category_id, p.subcategory_id, p.brand, p.price, p.mrp, p.tax_percent, p.discount_percent, p.selling_price, p.weight, p.length, p.width, p.height, p.status, p.tags, p.created_at, p.updated_at, NULL AS cost_price, NULL AS min_stock, NULL AS max_stock, c.name AS category_name, s.name AS subcategory_name'
      : 'p.*, c.name AS category_name, s.name AS subcategory_name';

    const rows = await query.rows<ProductDetailRow>(
      `SELECT ${selectColumns}
       FROM products p
       LEFT JOIN categories c ON c.id = p.category_id
       LEFT JOIN subcategories s ON s.id = p.subcategory_id
       ${where}
       ORDER BY ${sortColumn} ${sortOrder} LIMIT ? OFFSET ?`,
      [...params, opts.limit, offset]
    );

    return { rows, meta: { page: opts.page, limit: opts.limit, total, pages: Math.ceil(total / opts.limit) } };
  },

  async findById(id: number): Promise<ProductDetailRow | null> {
    return query.one<ProductDetailRow>(
      `SELECT p.*, c.name AS category_name, s.name AS subcategory_name
       FROM products p
       LEFT JOIN categories c ON c.id = p.category_id
       LEFT JOIN subcategories s ON s.id = p.subcategory_id
       WHERE p.id = ? AND p.deleted_at IS NULL`,
      [id]
    );
  },

  async findBySlug(slug: string): Promise<ProductDetailRow | null> {
    return query.one<ProductDetailRow>(
      `SELECT p.*, c.name AS category_name, s.name AS subcategory_name
       FROM products p
       LEFT JOIN categories c ON c.id = p.category_id
       LEFT JOIN subcategories s ON s.id = p.subcategory_id
       WHERE p.slug = ? AND p.deleted_at IS NULL`,
      [slug]
    );
  },

  async findBySku(sku: string): Promise<{ id: number } | null> {
    return query.one<{ id: number }>(
      'SELECT id FROM products WHERE sku = ? AND deleted_at IS NULL',
      [sku]
    );
  },

  async images(productId: number): Promise<ProductImageRow[]> {
    return query.rows<ProductImageRow>(
      'SELECT * FROM product_images WHERE product_id = ? ORDER BY sort_order ASC',
      [productId]
    );
  },

  async variants(productId: number): Promise<ProductVariantRow[]> {
    return query.rows<ProductVariantRow>(
      'SELECT * FROM product_variants WHERE product_id = ? ORDER BY id ASC',
      [productId]
    );
  },

  async attributes(productId: number): Promise<ProductAttributeRow[]> {
    return query.rows<ProductAttributeRow>(
      'SELECT * FROM product_attributes WHERE product_id = ? ORDER BY sort_order ASC, id ASC',
      [productId]
    );
  },

  async ensureSlugUnique(slug: string, excludeId?: number): Promise<string> {
    let candidate = slug;
    let i = 1;
    // eslint-disable-next-line no-constant-condition
    while (true) {
      const exists = await query.one<{ id: number }>(
        'SELECT id FROM products WHERE slug = ? AND id <> ? AND deleted_at IS NULL',
        [candidate, excludeId ?? 0]
      );
      if (!exists) return candidate;
      candidate = `${slug}-${i}`;
      i += 1;
    }
  },

  async create(data: ProductInput): Promise<number> {
    const selling = data.selling_price ?? data.price;
    const result = await query.run(
      `INSERT INTO products
        (sku, slug, name, description, short_description, category_id, subcategory_id, brand,
         price, mrp, cost_price, tax_percent, discount_percent, selling_price,
         weight, length, width, height, min_stock, max_stock, status, tags, seo_title, seo_description, created_by)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        data.sku,
        data.slug,
        data.name,
        data.description ?? null,
        data.short_description ?? null,
        data.category_id ?? null,
        data.subcategory_id ?? null,
        data.brand ?? null,
        data.price,
        data.mrp ?? null,
        data.cost_price ?? 0,
        data.tax_percent ?? 0,
        data.discount_percent ?? 0,
        selling,
        data.weight ?? null,
        data.length ?? null,
        data.width ?? null,
        data.height ?? null,
        data.min_stock ?? 0,
        data.max_stock ?? null,
        data.status ?? 'DRAFT',
        data.tags ?? null,
        data.seo_title ?? null,
        data.seo_description ?? null,
        null,
      ]
    );
    return result.insertId;
  },

  async update(id: number, data: Partial<ProductInput>): Promise<void> {
    const current = await this.findById(id);
    if (!current) return;

    const selling =
      data.selling_price ?? Number(current.selling_price);

    await query.run(
      `UPDATE products SET
        sku = COALESCE(?, sku),
        slug = COALESCE(?, slug),
        name = COALESCE(?, name),
        description = COALESCE(?, description),
        short_description = COALESCE(?, short_description),
        category_id = ?,
        subcategory_id = ?,
        brand = COALESCE(?, brand),
        price = COALESCE(?, price),
        mrp = COALESCE(?, mrp),
        cost_price = COALESCE(?, cost_price),
        tax_percent = COALESCE(?, tax_percent),
        discount_percent = COALESCE(?, discount_percent),
        selling_price = COALESCE(?, selling_price),
        weight = COALESCE(?, weight),
        length = COALESCE(?, length),
        width = COALESCE(?, width),
        height = COALESCE(?, height),
        min_stock = COALESCE(?, min_stock),
        max_stock = ?,
        status = COALESCE(?, status),
        tags = COALESCE(?, tags),
        seo_title = COALESCE(?, seo_title),
        seo_description = COALESCE(?, seo_description)
       WHERE id = ?`,
      [
        data.sku ?? null,
        data.slug ?? null,
        data.name ?? null,
        data.description ?? null,
        data.short_description ?? null,
        data.category_id !== undefined ? data.category_id : null,
        data.subcategory_id !== undefined ? data.subcategory_id : null,
        data.brand ?? null,
        data.price ?? null,
        data.mrp ?? null,
        data.cost_price ?? null,
        data.tax_percent ?? null,
        data.discount_percent ?? null,
        selling,
        data.weight ?? null,
        data.length ?? null,
        data.width ?? null,
        data.height ?? null,
        data.min_stock ?? null,
        data.max_stock !== undefined ? data.max_stock : null,
        data.status ?? null,
        data.tags ?? null,
        data.seo_title ?? null,
        data.seo_description ?? null,
        id,
      ]
    );
  },

  async softDelete(id: number): Promise<void> {
    await query.run('UPDATE products SET deleted_at = NOW(), status = ? WHERE id = ?', ['ARCHIVED', id]);
  },

  async replaceImages(productId: number, images: NonNullable<ProductInput['images']>): Promise<void> {
    await query.run('DELETE FROM product_images WHERE product_id = ?', [productId]);
    for (const img of images) {
      await query.run(
        'INSERT INTO product_images (product_id, url, alt_text, sort_order, is_primary) VALUES (?, ?, ?, ?, ?)',
        [productId, img.url, img.alt_text ?? null, img.sort_order ?? 0, img.is_primary ? 1 : 0]
      );
    }
  },

  async replaceVariants(productId: number, variants: NonNullable<ProductInput['variants']>): Promise<void> {
    await query.run('DELETE FROM product_variants WHERE product_id = ?', [productId]);
    for (const v of variants) {
      await query.run(
        'INSERT INTO product_variants (product_id, sku, name, attributes, price, selling_price, is_active) VALUES (?, ?, ?, ?, ?, ?, 1)',
        [productId, v.sku, v.name ?? null, JSON.stringify(v.attributes ?? null), v.price ?? 0, v.selling_price ?? v.price ?? 0]
      );
    }
  },

  async replaceAttributes(productId: number, attrs: NonNullable<ProductInput['attributes']>): Promise<void> {
    await query.run('DELETE FROM product_attributes WHERE product_id = ?', [productId]);
    let sort = 0;
    for (const a of attrs) {
      await query.run(
        'INSERT INTO product_attributes (product_id, attribute_key, attribute_value, sort_order) VALUES (?, ?, ?, ?)',
        [productId, a.attribute_key, a.attribute_value, a.sort_order ?? sort]
      );
      sort += 1;
    }
  },

  async countByCategory(categoryId: number): Promise<number> {
    const row = await query.one<{ n: number }>(
      'SELECT COUNT(*) AS n FROM products WHERE category_id = ? AND deleted_at IS NULL',
      [categoryId]
    );
    return row?.n ?? 0;
  },

  async countBySubcategory(subcategoryId: number): Promise<number> {
    const row = await query.one<{ n: number }>(
      'SELECT COUNT(*) AS n FROM products WHERE subcategory_id = ? AND deleted_at IS NULL',
      [subcategoryId]
    );
    return row?.n ?? 0;
  },

  async findAllRaw(opts: { status?: string; category_id?: number; subcategory_id?: number } = {}, limit = 10000): Promise<ProductDetailRow[]> {
    const conditions: string[] = ['p.deleted_at IS NULL'];
    const params: SqlParams = [];
    if (opts.status) {
      conditions.push('p.status = ?');
      params.push(opts.status);
    }
    if (opts.category_id) {
      conditions.push('p.category_id = ?');
      params.push(opts.category_id);
    }
    if (opts.subcategory_id) {
      conditions.push('p.subcategory_id = ?');
      params.push(opts.subcategory_id);
    }
    params.push(limit);
    return query.rows<ProductDetailRow>(
      `SELECT p.*, c.name AS category_name, s.name AS subcategory_name
       FROM products p
       LEFT JOIN categories c ON c.id = p.category_id
       LEFT JOIN subcategories s ON s.id = p.subcategory_id
       WHERE ${conditions.join(' AND ')} LIMIT ?`,
      params
    );
  },
};