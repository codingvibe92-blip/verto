import { ProductRepository, ProductInput } from '../repositories/product.repository';
import { SubcategoryRepository } from '../repositories/subcategory.repository';
import { CategoryRepository } from '../repositories/category.repository';
import { withTransaction } from '../database/pool';
import { slugify, randomToken } from '../utils/generate';
import { ApiError } from '../utils/errors';
import { PaginationParams } from '../utils/pagination';
import { toCsv, parseCsv } from '../utils/csv';

export interface ProductDetailResult {
  product: NonNullable<Awaited<ReturnType<typeof ProductRepository.findById>>>;
  images: Awaited<ReturnType<typeof ProductRepository.images>>;
  variants: Awaited<ReturnType<typeof ProductRepository.variants>>;
  attributes: Awaited<ReturnType<typeof ProductRepository.attributes>>;
}

export interface ProductExportOptions {
  status?: string;
  category_id?: number;
  subcategory_id?: number;
}

export interface ImportRowResult {
  row: number;
  sku?: string;
  error?: string;
}

export interface ProductImportResult {
  created: number;
  updated: number;
  skipped: number;
  errors: ImportRowResult[];
}

const EXPORT_HEADERS = [
  'id',
  'sku',
  'name',
  'slug',
  'category_name',
  'subcategory_name',
  'brand',
  'price',
  'mrp',
  'cost_price',
  'tax_percent',
  'discount_percent',
  'selling_price',
  'weight',
  'length',
  'width',
  'height',
  'min_stock',
  'max_stock',
  'status',
  'tags',
  'short_description',
  'description',
  'seo_title',
  'seo_description',
];

function num(value: unknown): number | null {
  if (value === null || value === undefined || value === '') return null;
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

export const ProductService = {
  list(opts: PaginationParams & { search?: string; status?: string; category_id?: number; subcategory_id?: number; publicOnly?: boolean; sort?: string; order?: 'asc' | 'desc' }) {
    return ProductRepository.list(opts);
  },

  async exportCsv(opts: ProductExportOptions): Promise<string> {
    const rows = await ProductRepository.findAllRaw({
      status: opts.status,
      category_id: opts.category_id,
      subcategory_id: opts.subcategory_id,
    });
    const body = rows.map((p) => [
      p.id,
      p.sku,
      p.name,
      p.slug,
      p.category_name,
      p.subcategory_name,
      p.brand,
      p.price,
      p.mrp,
      p.cost_price,
      p.tax_percent,
      p.discount_percent,
      p.selling_price,
      p.weight,
      p.length,
      p.width,
      p.height,
      p.min_stock,
      p.max_stock,
      p.status,
      p.tags,
      p.short_description,
      p.description,
      p.seo_title,
      p.seo_description,
    ]);
    return toCsv(EXPORT_HEADERS, body);
  },

  async importCsv(text: string): Promise<ProductImportResult> {
    const rows = parseCsv(text);
    if (rows.length === 0) throw ApiError.badRequest('CSV file is empty');
    if (rows.length === 1) throw ApiError.badRequest('CSV file has headers but no data rows');

    const headers = rows[0].map((h) => h.trim().toLowerCase());
    const required = ['sku', 'name', 'price'];
    const missing = required.filter((r) => !headers.includes(r));
    if (missing.length > 0) {
      throw ApiError.badRequest(`CSV headers missing required columns: ${missing.join(', ')}`);
    }

    const result: ProductImportResult = { created: 0, updated: 0, skipped: 0, errors: [] };
    const createdSlugs = new Map<string, number>();
    const get = (cells: string[], key: string): string => {
      const idx = headers.indexOf(key);
      return idx >= 0 ? cells[idx] ?? '' : '';
    };

    await withTransaction(async () => {
      for (let i = 1; i < rows.length; i += 1) {
        const lineNo = i + 1;
        const cells = rows[i].map((cell) => cell.trim());

        try {
          const sku = get(cells, 'sku').trim();
          const name = get(cells, 'name').trim();
          const price = num(get(cells, 'price'));

          if (!sku) throw new Error('SKU is required');
          if (!name) throw new Error('Name is required');
          if (price === null) throw new Error('Price must be a number');

          const slugBase = get(cells, 'slug').trim() || slugify(name) || randomToken(8).toLowerCase();
          let slug = slugBase;
          let n = 1;
          while (createdSlugs.has(slug)) {
            n += 1;
            slug = `${slugBase}-${n}`;
          }
          createdSlugs.set(slug, 1);

          let categoryId: number | null = null;
          const categoryName = get(cells, 'category_name').trim();
          if (categoryName) {
            const category = await CategoryRepository.findBySlug(slugify(categoryName));
            if (category) categoryId = category.id;
          }

          let subcategoryId: number | null = null;
          const subcategoryName = get(cells, 'subcategory_name').trim();
          if (subcategoryName && categoryId) {
            const subcategory = await SubcategoryRepository.findBySlug(slugify(subcategoryName));
            if (subcategory) subcategoryId = subcategory.id;
          }

          const statusRaw = get(cells, 'status').trim().toUpperCase();
          const status = ['DRAFT', 'ACTIVE', 'INACTIVE', 'OUT_OF_STOCK', 'ARCHIVED'].includes(statusRaw)
            ? statusRaw
            : 'DRAFT';

          const data: ProductInput = {
            sku,
            name,
            slug,
            price,
            selling_price: num(get(cells, 'selling_price')) ?? undefined,
            mrp: num(get(cells, 'mrp')),
            cost_price: num(get(cells, 'cost_price')) ?? undefined,
            tax_percent: num(get(cells, 'tax_percent')) ?? undefined,
            discount_percent: num(get(cells, 'discount_percent')) ?? undefined,
            category_id: categoryId,
            subcategory_id: subcategoryId,
            brand: get(cells, 'brand').trim() || null,
            weight: num(get(cells, 'weight')),
            length: num(get(cells, 'length')),
            width: num(get(cells, 'width')),
            height: num(get(cells, 'height')),
            min_stock: num(get(cells, 'min_stock')) ?? undefined,
            max_stock: num(get(cells, 'max_stock')),
            status,
            tags: get(cells, 'tags').trim() || null,
            short_description: get(cells, 'short_description').trim() || null,
            description: get(cells, 'description').trim() || null,
            seo_title: get(cells, 'seo_title').trim() || null,
            seo_description: get(cells, 'seo_description').trim() || null,
          };

          const existing = await ProductRepository.findBySku(sku);
          if (existing) {
            await ProductRepository.update(existing.id, data);
            result.updated += 1;
          } else {
            const uniqueSlug = await ProductRepository.ensureSlugUnique(data.slug);
            await ProductRepository.create({ ...data, slug: uniqueSlug });
            result.created += 1;
          }
        } catch (err) {
          result.skipped += 1;
          result.errors.push({
            row: lineNo,
            sku: get(cells, 'sku').trim(),
            error: err instanceof Error ? err.message : 'Invalid row',
          });
        }
      }
    });

    return result;
  },

  async getDetail(id: number): Promise<ProductDetailResult> {
    const product = await ProductRepository.findById(id);
    if (!product) throw ApiError.notFound('Product not found');
    const [images, variants, attributes] = await Promise.all([
      ProductRepository.images(id),
      ProductRepository.variants(id),
      ProductRepository.attributes(id),
    ]);
    return { product, images, variants, attributes };
  },

  async getBySlug(slug: string): Promise<ProductDetailResult> {
    const product = await ProductRepository.findBySlug(slug);
    if (!product) throw ApiError.notFound('Product not found');
    const [images, variants, attributes] = await Promise.all([
      ProductRepository.images(product.id),
      ProductRepository.variants(product.id),
      ProductRepository.attributes(product.id),
    ]);
    return { product, images, variants, attributes };
  },

  async create(input: ProductInput) {
    const slug = await ProductRepository.ensureSlugUnique(input.slug || slugify(input.name) || randomToken(8).toLowerCase());
    const id = await ProductRepository.create({ ...input, slug });

    if (input.images && input.images.length > 0) {
      await ProductRepository.replaceImages(id, input.images);
    }
    if (input.variants && input.variants.length > 0) {
      await ProductRepository.replaceVariants(id, input.variants);
    }
    if (input.attributes && input.attributes.length > 0) {
      await ProductRepository.replaceAttributes(id, input.attributes);
    }

    return this.getDetail(id);
  },

  async update(id: number, input: Partial<ProductInput>) {
    const existing = await ProductRepository.findById(id);
    if (!existing) throw ApiError.notFound('Product not found');

    let slug = input.slug ? slugify(input.slug) : undefined;
    if (!input.slug && input.name && input.name !== existing.name) {
      slug = slugify(input.name);
    }
    if (slug) {
      const uniqueSlug = await ProductRepository.ensureSlugUnique(slug, id);
      slug = uniqueSlug;
    }

    await ProductRepository.update(id, { ...input, slug: slug ?? undefined });

    if (input.images) {
      await ProductRepository.replaceImages(id, input.images);
    }
    if (input.variants) {
      await ProductRepository.replaceVariants(id, input.variants);
    }
    if (input.attributes) {
      await ProductRepository.replaceAttributes(id, input.attributes);
    }

    return this.getDetail(id);
  },

  async remove(id: number) {
    const existing = await ProductRepository.findById(id);
    if (!existing) throw ApiError.notFound('Product not found');
    await ProductRepository.softDelete(id);
  },
};