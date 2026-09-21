import { query, SqlParams } from '../database/pool';
import { PaginationMeta } from '../types';
import { PaginationParams } from '../utils/pagination';

export interface InventoryRow {
  id: number;
  warehouse_id: number;
  location_id: number | null;
  product_id: number | null;
  raw_material_id: number | null;
  quantity_on_hand: string;
  reserved_quantity: string;
  unit_cost: string;
  batch_no: string | null;
  expiry_date: string | null;
  product_sku?: string | null;
  product_name?: string | null;
  material_sku?: string | null;
  material_name?: string | null;
  warehouse_name?: string | null;
  warehouse_code?: string | null;
  location_name?: string | null;
  low_stock_alert_sent?: number;
}

export interface InventoryTransactionRow {
  id: number;
  transaction_type: string;
  product_name?: string | null;
  material_name?: string | null;
  warehouse_name?: string | null;
  quantity: string;
  unit_cost: string;
  before_qty: string;
  after_qty: string;
  reason: string | null;
  reference_type: string | null;
  created_by_name?: string | null;
  created_at: string;
}

export interface InventoryListOptions extends PaginationParams {
  search?: string;
  item_type?: 'PRODUCT' | 'RAW_MATERIAL';
  warehouse_id?: number;
  lowStock?: boolean;
}

export const InventoryRepository = {
  async list(opts: InventoryListOptions): Promise<{ rows: InventoryRow[]; meta: PaginationMeta }> {
    const conditions: string[] = ['1=1'];
    const params: SqlParams = [];

    if (opts.search) {
      conditions.push('(p.name LIKE ? OR p.sku LIKE ? OR rm.name LIKE ? OR rm.sku LIKE ?)');
      params.push(`%${opts.search}%`, `%${opts.search}%`, `%${opts.search}%`, `%${opts.search}%`);
    }
    if (opts.item_type === 'PRODUCT') {
      conditions.push('i.product_id IS NOT NULL');
    } else if (opts.item_type === 'RAW_MATERIAL') {
      conditions.push('i.raw_material_id IS NOT NULL');
    }
    if (opts.warehouse_id) {
      conditions.push('i.warehouse_id = ?');
      params.push(opts.warehouse_id);
    }
    if (opts.lowStock) {
      conditions.push(`(
        (i.product_id IS NOT NULL AND i.quantity_on_hand <= COALESCE((SELECT min_stock FROM products WHERE id = i.product_id), 0))
        OR
        (i.raw_material_id IS NOT NULL AND i.quantity_on_hand <= COALESCE((SELECT reorder_level FROM raw_materials WHERE id = i.raw_material_id), 0))
      )`);
    }

    const where = `WHERE ${conditions.join(' AND ')}`;
    const [countRow] = await Promise.all([
      query.one<{ n: number }>(
        `SELECT COUNT(*) AS n FROM inventory i ${where}`,
        params
      ),
    ]);
    const total = countRow?.n ?? 0;
    const offset = (opts.page - 1) * opts.limit;

    const rows = await query.rows<InventoryRow>(
      `SELECT i.*, p.name AS product_name, p.sku AS product_sku, rm.name AS material_name, rm.sku AS material_sku,
              w.name AS warehouse_name, w.code AS warehouse_code, l.name AS location_name
       FROM inventory i
       LEFT JOIN products p ON p.id = i.product_id
       LEFT JOIN raw_materials rm ON rm.id = i.raw_material_id
       LEFT JOIN warehouses w ON w.id = i.warehouse_id
       LEFT JOIN warehouse_locations l ON l.id = i.location_id
       ${where}
       ORDER BY i.updated_at DESC LIMIT ? OFFSET ?`,
      [...params, opts.limit, offset]
    );

    return { rows, meta: { page: opts.page, limit: opts.limit, total, pages: Math.ceil(total / opts.limit) } };
  },

  async findById(id: number): Promise<InventoryRow | null> {
    return query.one<InventoryRow>(
      `SELECT i.*, p.name AS product_name, p.sku AS product_sku, rm.name AS material_name, rm.sku AS material_sku,
              w.name AS warehouse_name, w.code AS warehouse_code, l.name AS location_name
       FROM inventory i
       LEFT JOIN products p ON p.id = i.product_id
       LEFT JOIN raw_materials rm ON rm.id = i.raw_material_id
       LEFT JOIN warehouses w ON w.id = i.warehouse_id
       LEFT JOIN warehouse_locations l ON l.id = i.location_id
       WHERE i.id = ?`,
      [id]
    );
  },

  async findByItemKey(params: {
    warehouseId: number;
    productId?: number | null;
    rawMaterialId?: number | null;
    locationId?: number | null;
  }): Promise<InventoryRow | null> {
    return query.one<InventoryRow>(
      `SELECT * FROM inventory
       WHERE warehouse_id = ? AND (product_id <=> ?) AND (raw_material_id <=> ?) AND (location_id <=> ?)`,
      [
        params.warehouseId,
        params.productId ?? null,
        params.rawMaterialId ?? null,
        params.locationId ?? null,
      ]
    );
  },

  async history(
    opts: PaginationParams & { product_id?: number; raw_material_id?: number; warehouse_id?: number; type?: string }
  ): Promise<{ rows: InventoryTransactionRow[]; meta: PaginationMeta }> {
    const conditions: string[] = ['1=1'];
    const params: SqlParams = [];
    if (opts.product_id) {
      conditions.push('t.product_id = ?');
      params.push(opts.product_id);
    }
    if (opts.raw_material_id) {
      conditions.push('t.raw_material_id = ?');
      params.push(opts.raw_material_id);
    }
    if (opts.warehouse_id) {
      conditions.push('t.warehouse_id = ?');
      params.push(opts.warehouse_id);
    }
    if (opts.type) {
      conditions.push('t.transaction_type = ?');
      params.push(opts.type);
    }

    const where = `WHERE ${conditions.join(' AND ')}`;
    const [countRow] = await Promise.all([
      query.one<{ n: number }>(`SELECT COUNT(*) AS n FROM inventory_transactions t ${where}`, params),
    ]);
    const total = countRow?.n ?? 0;
    const offset = (opts.page - 1) * opts.limit;

    const rows = await query.rows<InventoryTransactionRow>(
      `SELECT t.*, p.name AS product_name, rm.name AS material_name, w.name AS warehouse_name, u.name AS created_by_name
       FROM inventory_transactions t
       LEFT JOIN products p ON p.id = t.product_id
       LEFT JOIN raw_materials rm ON rm.id = t.raw_material_id
       LEFT JOIN warehouses w ON w.id = t.warehouse_id
       LEFT JOIN users u ON u.id = t.created_by
       ${where} ORDER BY t.id DESC LIMIT ? OFFSET ?`,
      [...params, opts.limit, offset]
    );

    return { rows, meta: { page: opts.page, limit: opts.limit, total, pages: Math.ceil(total / opts.limit) } };
  },
};