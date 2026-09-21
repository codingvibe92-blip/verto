import { query, SqlParams } from '../database/pool';
import { PaginationMeta } from '../types';
import { PaginationParams, paginate } from '../utils/pagination';

export interface SubcategoryRow {
  id: number;
  category_id: number;
  name: string;
  slug: string;
  description: string | null;
  image_url: string | null;
  status: string;
  seo_title: string | null;
  seo_description: string | null;
  created_at: string;
  updated_at: string;
}

export interface SubcategoryInput {
  category_id: number;
  name: string;
  slug: string;
  description?: string | null;
  image_url?: string | null;
  status?: string;
  seo_title?: string | null;
  seo_description?: string | null;
}

export interface SubcategoryListOptions extends PaginationParams {
  category_id?: number;
  search?: string;
  status?: string;
}

export const SubcategoryRepository = {
  async list(opts: SubcategoryListOptions): Promise<{ rows: SubcategoryRow[]; meta: PaginationMeta }> {
    const conditions: string[] = ['1=1'];
    const params: SqlParams = [];

    if (opts.category_id) {
      conditions.push('category_id = ?');
      params.push(opts.category_id);
    }
    if (opts.search) {
      conditions.push('(name LIKE ? OR slug LIKE ?)');
      params.push(`%${opts.search}%`, `%${opts.search}%`);
    }
    if (opts.status) {
      conditions.push('status = ?');
      params.push(opts.status);
    }

    return paginate<SubcategoryRow>(
      `WHERE ${conditions.join(' AND ')}`,
      params,
      'subcategories',
      opts,
      'name ASC'
    );
  },

  async findAllByCategory(categoryId: number, status?: string): Promise<SubcategoryRow[]> {
    const params: SqlParams = [categoryId];
    let statusClause = '';
    if (status) {
      statusClause = ' AND status = ?';
      params.push(status);
    }
    return query.rows<SubcategoryRow>(
      `SELECT * FROM subcategories WHERE category_id = ?${statusClause} ORDER BY name ASC`,
      params
    );
  },

  async findById(id: number): Promise<SubcategoryRow | null> {
    return query.one<SubcategoryRow>('SELECT * FROM subcategories WHERE id = ?', [id]);
  },

  async findBySlug(slug: string): Promise<SubcategoryRow | null> {
    return query.one<SubcategoryRow>('SELECT * FROM subcategories WHERE slug = ?', [slug]);
  },

  async slugExists(slug: string, excludeId?: number): Promise<boolean> {
    const row = await query.one<{ id: number }>(
      'SELECT id FROM subcategories WHERE slug = ? AND id <> ?',
      [slug, excludeId ?? 0]
    );
    return !!row;
  },

  async create(data: SubcategoryInput): Promise<number> {
    const result = await query.run(
      `INSERT INTO subcategories (category_id, name, slug, description, image_url, status, seo_title, seo_description)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        data.category_id,
        data.name,
        data.slug,
        data.description ?? null,
        data.image_url ?? null,
        data.status ?? 'ACTIVE',
        data.seo_title ?? null,
        data.seo_description ?? null,
      ]
    );
    return result.insertId;
  },

  async update(id: number, data: Partial<SubcategoryInput>): Promise<void> {
    await query.run(
      `UPDATE subcategories SET
        category_id = COALESCE(?, category_id),
        name = COALESCE(?, name),
        slug = COALESCE(?, slug),
        description = COALESCE(?, description),
        image_url = COALESCE(?, image_url),
        status = COALESCE(?, status),
        seo_title = COALESCE(?, seo_title),
        seo_description = COALESCE(?, seo_description)
       WHERE id = ?`,
      [
        data.category_id ?? null,
        data.name ?? null,
        data.slug ?? null,
        data.description !== undefined ? data.description : null,
        data.image_url !== undefined ? data.image_url : null,
        data.status ?? null,
        data.seo_title !== undefined ? data.seo_title : null,
        data.seo_description !== undefined ? data.seo_description : null,
        id,
      ]
    );
  },

  async remove(id: number): Promise<void> {
    await query.run('DELETE FROM subcategories WHERE id = ?', [id]);
  },
};