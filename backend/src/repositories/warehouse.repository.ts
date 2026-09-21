import { query, SqlParams } from '../database/pool';
import { PaginationMeta } from '../types';
import { PaginationParams, paginate } from '../utils/pagination';

export interface WarehouseRow {
  id: number;
  name: string;
  code: string;
  address: string | null;
  city: string | null;
  state: string | null;
  pincode: string | null;
  country: string | null;
  is_active: number;
  created_at: string;
}

export interface WarehouseLocationRow {
  id: number;
  warehouse_id: number;
  name: string;
  code: string;
  location_type: string;
}

export interface WarehouseInput {
  name: string;
  code: string;
  address?: string | null;
  city?: string | null;
  state?: string | null;
  pincode?: string | null;
  country?: string | null;
  is_active?: boolean;
}

export const WarehouseRepository = {
  async list(opts: PaginationParams & { search?: string }): Promise<{ rows: WarehouseRow[]; meta: PaginationMeta }> {
    const conditions: string[] = ['1=1'];
    const params: SqlParams = [];
    if (opts.search) {
      conditions.push('(name LIKE ? OR code LIKE ? OR city LIKE ?)');
      params.push(`%${opts.search}%`, `%${opts.search}%`, `%${opts.search}%`);
    }
    return paginate<WarehouseRow>(`WHERE ${conditions.join(' AND ')}`, params, 'warehouses', opts);
  },

  async allActive(): Promise<WarehouseRow[]> {
    return query.rows<WarehouseRow>('SELECT * FROM warehouses WHERE is_active = 1 ORDER BY name ASC');
  },

  async findById(id: number): Promise<WarehouseRow | null> {
    return query.one<WarehouseRow>('SELECT * FROM warehouses WHERE id = ?', [id]);
  },

  async findByCode(code: string, excludeId?: number): Promise<boolean> {
    const row = await query.one<{ id: number }>(
      'SELECT id FROM warehouses WHERE code = ? AND id <> ?',
      [code, excludeId ?? 0]
    );
    return !!row;
  },

  async create(input: WarehouseInput): Promise<number> {
    const result = await query.run(
      `INSERT INTO warehouses (name, code, address, city, state, pincode, country, is_active)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        input.name,
        input.code,
        input.address ?? null,
        input.city ?? null,
        input.state ?? null,
        input.pincode ?? null,
        input.country ?? null,
        input.is_active === false ? 0 : 1,
      ]
    );
    return result.insertId;
  },

  async update(id: number, input: Partial<WarehouseInput>): Promise<void> {
    await query.run(
      `UPDATE warehouses SET
        name = COALESCE(?, name),
        code = COALESCE(?, code),
        address = COALESCE(?, address),
        city = COALESCE(?, city),
        state = COALESCE(?, state),
        pincode = COALESCE(?, pincode),
        country = COALESCE(?, country),
        is_active = COALESCE(?, is_active)
       WHERE id = ?`,
      [
        input.name ?? null,
        input.code ?? null,
        input.address ?? null,
        input.city ?? null,
        input.state ?? null,
        input.pincode ?? null,
        input.country ?? null,
        input.is_active === undefined ? null : input.is_active ? 1 : 0,
        id,
      ]
    );
  },

  async remove(id: number): Promise<void> {
    await query.run('DELETE FROM warehouses WHERE id = ?', [id]);
  },

  async locations(warehouseId: number): Promise<WarehouseLocationRow[]> {
    return query.rows<WarehouseLocationRow>(
      'SELECT * FROM warehouse_locations WHERE warehouse_id = ? ORDER BY name ASC',
      [warehouseId]
    );
  },

  async createLocation(warehouseId: number, name: string, code: string, locationType = 'RACK'): Promise<number> {
    const result = await query.run(
      'INSERT INTO warehouse_locations (warehouse_id, name, code, location_type) VALUES (?, ?, ?, ?)',
      [warehouseId, name, code, locationType]
    );
    return result.insertId;
  },
};