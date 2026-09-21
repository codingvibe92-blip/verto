import { query, SqlParams } from '../database/pool';
import { PaginationMeta } from '../types';
import { PaginationParams, paginate } from '../utils/pagination';

export interface RawMaterialRow {
  id: number;
  name: string;
  sku: string;
  description: string | null;
  category_id: number | null;
  unit: string;
  supplier_id: number | null;
  cost: string;
  quantity_on_hand: string;
  reserved_quantity: string;
  min_quantity: string;
  max_quantity: string | null;
  reorder_level: string | null;
  storage_location: string | null;
  batch_no: string | null;
  expiry_date: string | null;
  status: string;
  category_name?: string | null;
  supplier_name?: string | null;
}

export interface RawMaterialInput {
  name: string;
  sku: string;
  description?: string | null;
  category_id?: number | null;
  unit?: string;
  supplier_id?: number | null;
  cost?: number;
  min_quantity?: number;
  max_quantity?: number | null;
  reorder_level?: number | null;
  storage_location?: string | null;
  batch_no?: string | null;
  expiry_date?: string | null;
  status?: string;
}

export const RawMaterialRepository = {
  async list(
    opts: PaginationParams & { search?: string; status?: string; category_id?: number }
  ): Promise<{ rows: RawMaterialRow[]; meta: PaginationMeta }> {
    const conditions: string[] = ['rm.deleted_at IS NULL'];
    const params: SqlParams = [];

    if (opts.search) {
      conditions.push('(rm.name LIKE ? OR rm.sku LIKE ?)');
      params.push(`%${opts.search}%`, `%${opts.search}%`);
    }
    if (opts.status) {
      conditions.push('rm.status = ?');
      params.push(opts.status);
    }
    if (opts.category_id) {
      conditions.push('rm.category_id = ?');
      params.push(opts.category_id);
    }

    const where = `WHERE ${conditions.join(' AND ')}`;
    const [countRow] = await Promise.all([
      query.one<{ n: number }>(`SELECT COUNT(*) AS n FROM raw_materials rm ${where}`, params),
    ]);
    const total = countRow?.n ?? 0;
    const offset = (opts.page - 1) * opts.limit;

    const rows = await query.rows<RawMaterialRow>(
      `SELECT rm.*, c.name AS category_name, s.name AS supplier_name
       FROM raw_materials rm
       LEFT JOIN raw_material_categories c ON c.id = rm.category_id
       LEFT JOIN suppliers s ON s.id = rm.supplier_id
       ${where} ORDER BY rm.created_at DESC LIMIT ? OFFSET ?`,
      [...params, opts.limit, offset]
    );

    return { rows, meta: { page: opts.page, limit: opts.limit, total, pages: Math.ceil(total / opts.limit) } };
  },

  async findById(id: number): Promise<RawMaterialRow | null> {
    return query.one<RawMaterialRow>(
      `SELECT rm.*, c.name AS category_name, s.name AS supplier_name
       FROM raw_materials rm
       LEFT JOIN raw_material_categories c ON c.id = rm.category_id
       LEFT JOIN suppliers s ON s.id = rm.supplier_id
       WHERE rm.id = ? AND rm.deleted_at IS NULL`,
      [id]
    );
  },

  async skuExists(sku: string, excludeId?: number): Promise<boolean> {
    const row = await query.one<{ id: number }>(
      'SELECT id FROM raw_materials WHERE sku = ? AND id <> ?',
      [sku, excludeId ?? 0]
    );
    return !!row;
  },

  async create(input: RawMaterialInput): Promise<number> {
    const result = await query.run(
      `INSERT INTO raw_materials
        (name, sku, description, category_id, unit, supplier_id, cost,
         min_quantity, max_quantity, reorder_level, storage_location, batch_no, expiry_date, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        input.name,
        input.sku,
        input.description ?? null,
        input.category_id ?? null,
        input.unit ?? 'KG',
        input.supplier_id ?? null,
        input.cost ?? 0,
        input.min_quantity ?? 0,
        input.max_quantity ?? null,
        input.reorder_level ?? null,
        input.storage_location ?? null,
        input.batch_no ?? null,
        input.expiry_date ?? null,
        input.status ?? 'ACTIVE',
      ]
    );
    return result.insertId;
  },

  async update(id: number, input: Partial<RawMaterialInput>): Promise<void> {
    await query.run(
      `UPDATE raw_materials SET
        name = COALESCE(?, name),
        sku = COALESCE(?, sku),
        description = COALESCE(?, description),
        category_id = ?,
        unit = COALESCE(?, unit),
        supplier_id = ?,
        cost = COALESCE(?, cost),
        min_quantity = COALESCE(?, min_quantity),
        max_quantity = ?,
        reorder_level = ?,
        storage_location = COALESCE(?, storage_location),
        batch_no = COALESCE(?, batch_no),
        expiry_date = COALESCE(?, expiry_date),
        status = COALESCE(?, status)
       WHERE id = ?`,
      [
        input.name ?? null,
        input.sku ?? null,
        input.description ?? null,
        input.category_id !== undefined ? input.category_id : null,
        input.unit ?? null,
        input.supplier_id !== undefined ? input.supplier_id : null,
        input.cost ?? null,
        input.min_quantity ?? null,
        input.max_quantity !== undefined ? input.max_quantity : null,
        input.reorder_level !== undefined ? input.reorder_level : null,
        input.storage_location ?? null,
        input.batch_no ?? null,
        input.expiry_date ?? null,
        input.status ?? null,
        id,
      ]
    );
  },

  async softDelete(id: number): Promise<void> {
    await query.run('UPDATE raw_materials SET deleted_at = NOW(), status = ? WHERE id = ?', ['INACTIVE', id]);
  },
};