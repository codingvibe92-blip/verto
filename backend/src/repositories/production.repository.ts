import { query, txQuery, withTransaction, SqlParams } from '../database/pool';
import { PaginationMeta } from '../types';
import { PaginationParams } from '../utils/pagination';

export interface BOMRow {
  id: number;
  product_id: number;
  product_name?: string;
  product_sku?: string;
  name: string;
  description: string | null;
  yield_quantity: string;
  wastage_percent: string;
  status: string;
  version: number;
  created_by: number | null;
  created_at: string;
  updated_at: string;
  items?: BOMItemRow[];
}

export interface BOMItemRow {
  id: number;
  bom_id: number;
  raw_material_id: number;
  raw_material_name?: string;
  raw_material_sku?: string;
  quantity: string;
  unit: string;
  cost?: string;
}

export interface ProductionOrderRow {
  id: number;
  order_number: string;
  product_id: number;
  product_name?: string;
  product_sku?: string;
  bom_id: number | null;
  bom_name?: string;
  quantity: number;
  status: string;
  planned_start: string | null;
  planned_end: string | null;
  started_at: string | null;
  completed_at: string | null;
  approved_by: number | null;
  approved_at: string | null;
  override_reason: string | null;
  cancellation_reason: string | null;
  created_by: number | null;
  created_at: string;
  updated_at: string;
  items?: any[];
  materials?: any[];
  quality_checks?: any[];
}

export interface QualityCheckRow {
  id: number;
  production_order_id: number;
  order_number?: string;
  product_id: number;
  product_name?: string;
  quantity_checked: number;
  passed_qty: number;
  failed_qty: number;
  remarks: string | null;
  checked_by: number | null;
  checked_by_name?: string;
  checked_at: string;
  created_at: string;
}

export const ProductionRepository = {
  // ==================== BOM ====================
  async listBOMs(
    opts: PaginationParams & { search?: string; status?: string; product_id?: number }
  ): Promise<{ rows: BOMRow[]; meta: PaginationMeta }> {
    const conditions: string[] = ['1=1'];
    const params: SqlParams = [];

    if (opts.search) {
      conditions.push('(b.name LIKE ? OR p.name LIKE ? OR p.sku LIKE ?)');
      params.push(`%${opts.search}%`, `%${opts.search}%`, `%${opts.search}%`);
    }
    if (opts.status) {
      conditions.push('b.status = ?');
      params.push(opts.status);
    }
    if (opts.product_id) {
      conditions.push('b.product_id = ?');
      params.push(opts.product_id);
    }

    const where = `WHERE ${conditions.join(' AND ')}`;
    const countRow = await query.one<{ n: number }>(
      `SELECT COUNT(*) AS n FROM boms b JOIN products p ON p.id = b.product_id ${where}`,
      params
    );
    const total = countRow?.n ?? 0;
    const offset = (opts.page - 1) * opts.limit;

    const rows = await query.rows<BOMRow>(
      `SELECT b.*, p.name AS product_name, p.sku AS product_sku
       FROM boms b
       JOIN products p ON p.id = b.product_id
       ${where}
       ORDER BY b.created_at DESC
       LIMIT ? OFFSET ?`,
      [...params, opts.limit, offset]
    );

    return { rows, meta: { page: opts.page, limit: opts.limit, total, pages: Math.ceil(total / opts.limit) } };
  },

  async findBOMById(id: number): Promise<BOMRow | null> {
    const bom = await query.one<BOMRow>(
      `SELECT b.*, p.name AS product_name, p.sku AS product_sku
       FROM boms b
       JOIN products p ON p.id = b.product_id
       WHERE b.id = ?`,
      [id]
    );
    if (!bom) return null;

    const items = await query.rows<BOMItemRow>(
      `SELECT bi.*, rm.name AS raw_material_name, rm.sku AS raw_material_sku, rm.cost
       FROM bom_items bi
       JOIN raw_materials rm ON rm.id = bi.raw_material_id
       WHERE bi.bom_id = ?`,
      [id]
    );
    bom.items = items;
    return bom;
  },

  async createBOM(
    bomData: {
      product_id: number;
      name: string;
      description?: string | null;
      yield_quantity?: number;
      wastage_percent?: number;
      created_by?: number;
    },
    items: Array<{ raw_material_id: number; quantity: number; unit?: string }>
  ): Promise<number> {
    return withTransaction(async (ctx) => {
      const res = await txQuery.run(
        ctx.conn,
        `INSERT INTO boms (product_id, name, description, yield_quantity, wastage_percent, status, version, created_by)
         VALUES (?, ?, ?, ?, ?, 'ACTIVE', 1, ?)`,
        [
          bomData.product_id,
          bomData.name,
          bomData.description ?? null,
          bomData.yield_quantity ?? 1,
          bomData.wastage_percent ?? 0,
          bomData.created_by ?? null,
        ]
      );
      const bomId = res.insertId;

      for (const item of items) {
        await txQuery.run(
          ctx.conn,
          `INSERT INTO bom_items (bom_id, raw_material_id, quantity, unit)
           VALUES (?, ?, ?, ?)`,
          [bomId, item.raw_material_id, item.quantity, item.unit ?? 'KG']
        );
      }

      return bomId;
    });
  },

  async updateBOM(
    id: number,
    bomData: {
      name?: string;
      description?: string | null;
      yield_quantity?: number;
      wastage_percent?: number;
      status?: string;
    },
    items?: Array<{ raw_material_id: number; quantity: number; unit?: string }>
  ): Promise<void> {
    await withTransaction(async (ctx) => {
      await txQuery.run(
        ctx.conn,
        `UPDATE boms SET
           name = COALESCE(?, name),
           description = COALESCE(?, description),
           yield_quantity = COALESCE(?, yield_quantity),
           wastage_percent = COALESCE(?, wastage_percent),
           status = COALESCE(?, status),
           version = version + 1
         WHERE id = ?`,
        [
          bomData.name ?? null,
          bomData.description ?? null,
          bomData.yield_quantity ?? null,
          bomData.wastage_percent ?? null,
          bomData.status ?? null,
          id,
        ]
      );

      if (items && items.length > 0) {
        await txQuery.run(ctx.conn, 'DELETE FROM bom_items WHERE bom_id = ?', [id]);
        for (const item of items) {
          await txQuery.run(
            ctx.conn,
            `INSERT INTO bom_items (bom_id, raw_material_id, quantity, unit)
             VALUES (?, ?, ?, ?)`,
            [id, item.raw_material_id, item.quantity, item.unit ?? 'KG']
          );
        }
      }
    });
  },

  async deleteBOM(id: number): Promise<void> {
    await query.run('DELETE FROM boms WHERE id = ?', [id]);
  },

  // ==================== PRODUCTION ORDERS ====================
  async listOrders(
    opts: PaginationParams & { search?: string; status?: string; product_id?: number }
  ): Promise<{ rows: ProductionOrderRow[]; meta: PaginationMeta }> {
    const conditions: string[] = ['1=1'];
    const params: SqlParams = [];

    if (opts.search) {
      conditions.push('(po.order_number LIKE ? OR p.name LIKE ? OR p.sku LIKE ?)');
      params.push(`%${opts.search}%`, `%${opts.search}%`, `%${opts.search}%`);
    }
    if (opts.status) {
      conditions.push('po.status = ?');
      params.push(opts.status);
    }
    if (opts.product_id) {
      conditions.push('po.product_id = ?');
      params.push(opts.product_id);
    }

    const where = `WHERE ${conditions.join(' AND ')}`;
    const countRow = await query.one<{ n: number }>(
      `SELECT COUNT(*) AS n FROM production_orders po
       JOIN products p ON p.id = po.product_id ${where}`,
      params
    );
    const total = countRow?.n ?? 0;
    const offset = (opts.page - 1) * opts.limit;

    const rows = await query.rows<ProductionOrderRow>(
      `SELECT po.*, p.name AS product_name, p.sku AS product_sku, b.name AS bom_name
       FROM production_orders po
       JOIN products p ON p.id = po.product_id
       LEFT JOIN boms b ON b.id = po.bom_id
       ${where}
       ORDER BY po.created_at DESC
       LIMIT ? OFFSET ?`,
      [...params, opts.limit, offset]
    );

    return { rows, meta: { page: opts.page, limit: opts.limit, total, pages: Math.ceil(total / opts.limit) } };
  },

  async findOrderById(id: number): Promise<ProductionOrderRow | null> {
    const order = await query.one<ProductionOrderRow>(
      `SELECT po.*, p.name AS product_name, p.sku AS product_sku, b.name AS bom_name
       FROM production_orders po
       JOIN products p ON p.id = po.product_id
       LEFT JOIN boms b ON b.id = po.bom_id
       WHERE po.id = ?`,
      [id]
    );
    if (!order) return null;

    order.items = await query.rows(
      `SELECT pi.*, rm.name AS raw_material_name, rm.sku AS raw_material_sku
       FROM production_items pi
       JOIN raw_materials rm ON rm.id = pi.raw_material_id
       WHERE pi.production_order_id = ?`,
      [id]
    );

    order.materials = await query.rows(
      `SELECT pm.*, rm.name AS raw_material_name, rm.sku AS raw_material_sku
       FROM production_materials pm
       JOIN raw_materials rm ON rm.id = pm.raw_material_id
       WHERE pm.production_order_id = ?`,
      [id]
    );

    order.quality_checks = await query.rows(
      `SELECT qc.*, u.name AS checked_by_name
       FROM quality_checks qc
       LEFT JOIN users u ON u.id = qc.checked_by
       WHERE qc.production_order_id = ?`,
      [id]
    );

    return order;
  },

  async createOrder(data: {
    product_id: number;
    bom_id?: number | null;
    quantity: number;
    planned_start?: string | null;
    planned_end?: string | null;
    created_by?: number;
  }): Promise<number> {
    return withTransaction(async (ctx) => {
      const orderNumber = `PO-${Date.now().toString(36).toUpperCase()}-${Math.floor(100 + Math.random() * 900)}`;

      const res = await txQuery.run(
        ctx.conn,
        `INSERT INTO production_orders (order_number, product_id, bom_id, quantity, status, planned_start, planned_end, created_by)
         VALUES (?, ?, ?, ?, 'PLANNED', ?, ?, ?)`,
        [
          orderNumber,
          data.product_id,
          data.bom_id ?? null,
          data.quantity,
          data.planned_start ?? null,
          data.planned_end ?? null,
          data.created_by ?? null,
        ]
      );
      const orderId = res.insertId;

      // If BOM is provided, populate planned materials in production_items
      if (data.bom_id) {
        const bomItems = await txQuery.rows<BOMItemRow>(
          ctx.conn,
          'SELECT * FROM bom_items WHERE bom_id = ?',
          [data.bom_id]
        );
        for (const item of bomItems) {
          const plannedQty = Number(item.quantity) * data.quantity;
          await txQuery.run(
            ctx.conn,
            `INSERT INTO production_items (production_order_id, raw_material_id, planned_quantity, consumed_quantity, unit)
             VALUES (?, ?, ?, 0, ?)`,
            [orderId, item.raw_material_id, plannedQty, item.unit]
          );
        }
      }

      return orderId;
    });
  },

  async startOrder(id: number, userId: number): Promise<void> {
    return withTransaction(async (ctx) => {
      const order = await txQuery.one<ProductionOrderRow>(
        ctx.conn,
        'SELECT * FROM production_orders WHERE id = ? FOR UPDATE',
        [id]
      );
      if (!order) throw new Error('Production order not found');
      if (order.status !== 'PLANNED' && order.status !== 'DRAFT') {
        throw new Error(`Cannot start production order in '${order.status}' status`);
      }

      // Check planned materials and deduct from raw_materials stock
      const plannedItems = await txQuery.rows<{
        raw_material_id: number;
        planned_quantity: string;
        unit: string;
      }>(
        ctx.conn,
        'SELECT raw_material_id, planned_quantity, unit FROM production_items WHERE production_order_id = ?',
        [id]
      );

      for (const item of plannedItems) {
        const rm = await txQuery.one<{ id: number; name: string; quantity_on_hand: string; cost: string }>(
          ctx.conn,
          'SELECT id, name, quantity_on_hand, cost FROM raw_materials WHERE id = ? FOR UPDATE',
          [item.raw_material_id]
        );
        if (!rm) throw new Error(`Raw material #${item.raw_material_id} not found`);

        const plannedQty = Number(item.planned_quantity);
        const onHand = Number(rm.quantity_on_hand);
        if (onHand < plannedQty) {
          throw new Error(
            `Insufficient stock for raw material "${rm.name}". Required: ${plannedQty}, Available: ${onHand}`
          );
        }

        // Deduct raw material stock
        await txQuery.run(
          ctx.conn,
          'UPDATE raw_materials SET quantity_on_hand = quantity_on_hand - ? WHERE id = ?',
          [plannedQty, item.raw_material_id]
        );

        // Update consumed quantity in production_items
        await txQuery.run(
          ctx.conn,
          'UPDATE production_items SET consumed_quantity = ? WHERE production_order_id = ? AND raw_material_id = ?',
          [plannedQty, id, item.raw_material_id]
        );

        // Record in production_materials ledger
        await txQuery.run(
          ctx.conn,
          `INSERT INTO production_materials (production_order_id, raw_material_id, quantity, unit_cost, created_by)
           VALUES (?, ?, ?, ?, ?)`,
          [id, item.raw_material_id, plannedQty, Number(rm.cost), userId]
        );
      }

      await txQuery.run(
        ctx.conn,
        `UPDATE production_orders SET
           status = 'IN_PROGRESS',
           started_at = NOW(),
           approved_by = COALESCE(approved_by, ?),
           approved_at = COALESCE(approved_at, NOW())
         WHERE id = ?`,
        [userId, id]
      );
    });
  },

  async completeOrder(id: number): Promise<void> {
    const order = await query.one<ProductionOrderRow>(
      'SELECT * FROM production_orders WHERE id = ?',
      [id]
    );
    if (!order) throw new Error('Production order not found');
    if (order.status !== 'IN_PROGRESS') {
      throw new Error(`Cannot complete production order in '${order.status}' status`);
    }

    await query.run(
      `UPDATE production_orders SET status = 'COMPLETED', completed_at = NOW() WHERE id = ?`,
      [id]
    );
  },

  async cancelOrder(id: number, reason: string): Promise<void> {
    const order = await query.one<ProductionOrderRow>(
      'SELECT * FROM production_orders WHERE id = ?',
      [id]
    );
    if (!order) throw new Error('Production order not found');
    if (order.status === 'COMPLETED') {
      throw new Error('Cannot cancel a completed production order');
    }

    await query.run(
      `UPDATE production_orders SET status = 'CANCELLED', cancellation_reason = ? WHERE id = ?`,
      [reason, id]
    );
  },

  // ==================== QUALITY CHECK ====================
  async listQualityChecks(
    opts: PaginationParams & { search?: string; product_id?: number }
  ): Promise<{ rows: QualityCheckRow[]; meta: PaginationMeta }> {
    const conditions: string[] = ['1=1'];
    const params: SqlParams = [];

    if (opts.search) {
      conditions.push('(po.order_number LIKE ? OR p.name LIKE ?)');
      params.push(`%${opts.search}%`, `%${opts.search}%`);
    }
    if (opts.product_id) {
      conditions.push('qc.product_id = ?');
      params.push(opts.product_id);
    }

    const where = `WHERE ${conditions.join(' AND ')}`;
    const countRow = await query.one<{ n: number }>(
      `SELECT COUNT(*) AS n FROM quality_checks qc
       JOIN production_orders po ON po.id = qc.production_order_id
       JOIN products p ON p.id = qc.product_id ${where}`,
      params
    );
    const total = countRow?.n ?? 0;
    const offset = (opts.page - 1) * opts.limit;

    const rows = await query.rows<QualityCheckRow>(
      `SELECT qc.*, po.order_number, p.name AS product_name, u.name AS checked_by_name
       FROM quality_checks qc
       JOIN production_orders po ON po.id = qc.production_order_id
       JOIN products p ON p.id = qc.product_id
       LEFT JOIN users u ON u.id = qc.checked_by
       ${where}
       ORDER BY qc.created_at DESC
       LIMIT ? OFFSET ?`,
      [...params, opts.limit, offset]
    );

    return { rows, meta: { page: opts.page, limit: opts.limit, total, pages: Math.ceil(total / opts.limit) } };
  },

  async createQualityCheck(data: {
    production_order_id: number;
    product_id: number;
    quantity_checked: number;
    passed_qty: number;
    failed_qty: number;
    remarks?: string | null;
    warehouse_id?: number;
    checked_by?: number;
  }): Promise<number> {
    return withTransaction(async (ctx) => {
      // 1. Record QC
      const qcRes = await txQuery.run(
        ctx.conn,
        `INSERT INTO quality_checks (production_order_id, product_id, quantity_checked, passed_qty, failed_qty, remarks, checked_by, checked_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, NOW())`,
        [
          data.production_order_id,
          data.product_id,
          data.quantity_checked,
          data.passed_qty,
          data.failed_qty,
          data.remarks ?? null,
          data.checked_by ?? null,
        ]
      );
      const qcId = qcRes.insertId;

      // 2. If passed quantity > 0, inward finished goods directly to warehouse inventory!
      if (data.passed_qty > 0) {
        let warehouseId = data.warehouse_id;
        if (!warehouseId) {
          const defaultWh = await txQuery.one<{ id: number }>(
            ctx.conn,
            'SELECT id FROM warehouses WHERE is_active = 1 ORDER BY id ASC LIMIT 1'
          );
          warehouseId = defaultWh?.id ?? 1;
        }

        // Upsert inventory
        const existingInv = await txQuery.one<{ id: number; quantity: number }>(
          ctx.conn,
          'SELECT id, quantity FROM inventory WHERE product_id = ? AND warehouse_id = ? FOR UPDATE',
          [data.product_id, warehouseId]
        );

        let invId: number;
        if (existingInv) {
          await txQuery.run(
            ctx.conn,
            'UPDATE inventory SET quantity = quantity + ? WHERE id = ?',
            [data.passed_qty, existingInv.id]
          );
          invId = existingInv.id;
        } else {
          const invRes = await txQuery.run(
            ctx.conn,
            'INSERT INTO inventory (product_id, warehouse_id, quantity, reserved_quantity) VALUES (?, ?, ?, 0)',
            [data.product_id, warehouseId, data.passed_qty]
          );
          invId = invRes.insertId;
        }

        // Record inventory transaction
        await txQuery.run(
          ctx.conn,
          `INSERT INTO inventory_transactions (inventory_id, type, quantity, reference_id, reference_type, notes, created_by)
           VALUES (?, 'PRODUCTION_IN', ?, ?, 'production_orders', ?, ?)`,
          [
            invId,
            data.passed_qty,
            data.production_order_id,
            `QC Passed Batch Inward: ${data.passed_qty} units`,
            data.checked_by ?? null,
          ]
        );
      }

      return qcId;
    });
  },
};
