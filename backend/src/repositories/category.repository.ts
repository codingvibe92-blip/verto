import { query, SqlParams } from '../database/pool';
import { PaginationMeta } from '../types';
import { PaginationParams, paginate } from '../utils/pagination';

export interface CategoryRow {
  id: number;
  parent_id: number | null;
  name: string;
  slug: string;
  description: string | null;
  image_url: string | null;
  status: string;
  sort_order: number;
  seo_title: string | null;
  seo_description: string | null;
  created_at: string;
  updated_at: string;
}

export interface CategoryInput {
  name: string;
  slug: string;
  parent_id?: number | null;
  description?: string | null;
  image_url?: string | null;
  status?: string;
  sort_order?: number;
  seo_title?: string | null;
  seo_description?: string | null;
}

export interface CategoryListOptions extends PaginationParams {
  search?: string;
  status?: string;
  onlyParents?: boolean;
}

export const CategoryRepository = {
  async list(opts: CategoryListOptions): Promise<{ rows: CategoryRow[]; meta: PaginationMeta }> {
    const conditions: string[] = ['1=1'];
    const params: SqlParams = [];

    if (opts.search) {
      conditions.push('(name LIKE ? OR slug LIKE ?)');
      params.push(`%${opts.search}%`, `%${opts.search}%`);
    }
    if (opts.status) {
      conditions.push('status = ?');
      params.push(opts.status);
    }
    if (opts.onlyParents) {
      conditions.push('parent_id IS NULL');
    }

    return paginate<CategoryRow>(`WHERE ${conditions.join(' AND ')}`, params, 'categories', opts, 'sort_order ASC');
  },

  async findById(id: number): Promise<CategoryRow | null> {
    return query.one<CategoryRow>('SELECT * FROM categories WHERE id = ?', [id]);
  },

  async findBySlug(slug: string): Promise<CategoryRow | null> {
    return query.one<CategoryRow>('SELECT * FROM categories WHERE slug = ?', [slug]);
  },

  async slugExists(slug: string, excludeId?: number): Promise<boolean> {
    const row = await query.one<{ id: number }>(
      'SELECT id FROM categories WHERE slug = ? AND id <> ?',
      [slug, excludeId ?? 0]
    );
    return !!row;
  },

  async create(data: CategoryInput): Promise<number> {
    const result = await query.run(
      `INSERT INTO categories (name, slug, parent_id, description, image_url, status, sort_order, seo_title, seo_description)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        data.name,
        data.slug,
        data.parent_id ?? null,
        data.description ?? null,
        data.image_url ?? null,
        data.status ?? 'ACTIVE',
        data.sort_order ?? 0,
        data.seo_title ?? null,
        data.seo_description ?? null,
      ]
    );
    return result.insertId;
  },

  async update(id: number, data: Partial<CategoryInput>): Promise<void> {
    await query.run(
      `UPDATE categories SET
        name = COALESCE(?, name),
        slug = COALESCE(?, slug),
        parent_id = ?,
        description = COALESCE(?, description),
        image_url = COALESCE(?, image_url),
        status = COALESCE(?, status),
        sort_order = COALESCE(?, sort_order),
        seo_title = COALESCE(?, seo_title),
        seo_description = COALESCE(?, seo_description)
       WHERE id = ?`,
      [
        data.name ?? null,
        data.slug ?? null,
        data.parent_id !== undefined ? data.parent_id : null,
        data.description !== undefined ? data.description : null,
        data.image_url !== undefined ? data.image_url : null,
        data.status ?? null,
        data.sort_order ?? null,
        data.seo_title !== undefined ? data.seo_title : null,
        data.seo_description !== undefined ? data.seo_description : null,
        id,
      ]
    );
  },

  async remove(id: number): Promise<void> {
    await query.run('DELETE FROM categories WHERE id = ?', [id]);
  },
};