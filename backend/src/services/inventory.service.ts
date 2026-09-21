import { TxContext, txQuery, withTransaction } from '../database/pool';
import { InventoryRepository } from '../repositories/inventory.repository';
import { ApiError } from '../utils/errors';
import { PaginationParams } from '../utils/pagination';

export type StockItem = {
  product_id?: number | null;
  raw_material_id?: number | null;
};

export interface ReceiveInput extends StockItem {
  warehouse_id: number;
  quantity: number;
  unit_cost?: number;
  batch_no?: string | null;
  expiry_date?: string | null;
  location_id?: number | null;
  reference_type?: string;
  reference_id?: number | null;
  reason?: string;
  actorId?: number;
}

export interface AdjustInput extends StockItem {
  inventory_id: number;
  quantity: number;
  reason: string;
  actorId?: number;
}

export interface TransferInput {
  inventory_id: number;
  to_warehouse_id: number;
  quantity: number;
  to_location_id?: number | null;
  reason?: string;
  actorId?: number;
}

interface InventoryRowForLedger {
  id: number;
  warehouse_id: number;
  product_id: number | null;
  raw_material_id: number | null;
  location_id: number | null;
  quantity_on_hand: string;
  unit_cost: string;
  batch_no: string | null;
  expiry_date: string | null;
}

async function findOrCreate(
  ctx: TxContext,
  item: StockItem & {
    warehouse_id: number;
    location_id?: number | null;
    batch_no?: string | null;
    expiry_date?: string | null;
  }
): Promise<InventoryRowForLedger> {
  const existing = await txQuery.one<InventoryRowForLedger>(
    ctx.conn,
    `SELECT * FROM inventory
     WHERE warehouse_id = ? AND (product_id <=> ?) AND (raw_material_id <=> ?) AND (location_id <=> ?)`,
    [item.warehouse_id, item.product_id ?? null, item.raw_material_id ?? null, item.location_id ?? null]
  );
  if (existing) return existing;

  const result = await txQuery.run(
    ctx.conn,
    `INSERT INTO inventory (warehouse_id, location_id, product_id, raw_material_id, quantity_on_hand, reserved_quantity, unit_cost, batch_no, expiry_date)
     VALUES (?, ?, ?, ?, 0, 0, 0, ?, ?)`,
    [
      item.warehouse_id,
      item.location_id ?? null,
      item.product_id ?? null,
      item.raw_material_id ?? null,
      item.batch_no ?? null,
      item.expiry_date ?? null,
    ]
  );

  return {
    id: result.insertId,
    warehouse_id: item.warehouse_id,
    product_id: item.product_id ?? null,
    raw_material_id: item.raw_material_id ?? null,
    location_id: item.location_id ?? null,
    quantity_on_hand: '0',
    unit_cost: '0',
    batch_no: item.batch_no ?? null,
    expiry_date: item.expiry_date ?? null,
  };
}

async function applyLedger(
  ctx: TxContext,
  inventoryRow: InventoryRowForLedger,
  delta: number,
  transactionType: string,
  opts: {
    reason?: string;
    unitCost?: number;
    referenceType?: string;
    referenceId?: number | null;
    actorId?: number;
  }
): Promise<void> {
  const before = Number(inventoryRow.quantity_on_hand);
  const after = before + delta;
  if (after < 0) {
    throw ApiError.conflict('Insufficient stock for this operation');
  }

  const unitCost = opts.unitCost ?? Number(inventoryRow.unit_cost);
  const newCost = delta > 0 && transactionType === 'RECEIVE' && unitCost > 0 ? unitCost : Number(inventoryRow.unit_cost);

  await txQuery.run(
    ctx.conn,
    'UPDATE inventory SET quantity_on_hand = ?, unit_cost = ? WHERE id = ?',
    [after, newCost, inventoryRow.id]
  );

  await txQuery.run(
    ctx.conn,
    `INSERT INTO inventory_transactions
       (transaction_type, inventory_id, warehouse_id, product_id, raw_material_id, quantity, unit_cost,
        before_qty, after_qty, batch_no, reference_type, reference_id, reason, created_by)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      transactionType,
      inventoryRow.id,
      inventoryRow.warehouse_id,
      inventoryRow.product_id,
      inventoryRow.raw_material_id,
      delta,
      unitCost,
      before,
      after,
      inventoryRow.batch_no,
      opts.referenceType ?? null,
      opts.referenceId ?? null,
      opts.reason ?? null,
      opts.actorId ?? null,
    ]
  );
}

function validateItem(item: StockItem): void {
  const hasProduct = !!item.product_id;
  const hasRaw = !!item.raw_material_id;
  if (hasProduct === hasRaw) {
    throw ApiError.badRequest('Provide exactly one of product_id or raw_material_id');
  }
}

export const InventoryService = {
  list(opts: Parameters<typeof InventoryRepository.list>[0]) {
    return InventoryRepository.list(opts);
  },

  async get(id: number) {
    const row = await InventoryRepository.findById(id);
    if (!row) throw ApiError.notFound('Inventory record not found');
    return row;
  },

  history(opts: Parameters<typeof InventoryRepository.history>[0]) {
    return InventoryRepository.history(opts);
  },

  async receive(input: ReceiveInput) {
    validateItem(input);
    if (input.quantity <= 0) throw ApiError.badRequest('Quantity must be positive');

    return withTransaction(async (ctx) => {
      const item = await findOrCreate(ctx, input);
      await applyLedger(ctx, item, input.quantity, 'RECEIVE', {
        reason: input.reason,
        unitCost: input.unit_cost,
        referenceType: input.reference_type,
        referenceId: input.reference_id,
        actorId: input.actorId,
      });
      return InventoryRepository.findById(item.id);
    });
  },

  async adjust(input: AdjustInput) {
    if (input.quantity === 0) throw ApiError.badRequest('Quantity cannot be zero');
    if (!input.reason) throw ApiError.badRequest('Reason is required for stock adjustment');

    return withTransaction(async (ctx) => {
      const row = await txQuery.one<InventoryRowForLedger>(
        ctx.conn,
        'SELECT * FROM inventory WHERE id = ? FOR UPDATE',
        [input.inventory_id]
      );
      if (!row) throw ApiError.notFound('Inventory record not found');

      await applyLedger(ctx, row, input.quantity, 'ADJUSTMENT', {
        reason: input.reason,
        actorId: input.actorId,
      });
      return InventoryRepository.findById(row.id);
    });
  },

  async transfer(input: TransferInput) {
    if (input.quantity <= 0) throw ApiError.badRequest('Quantity must be positive');

    return withTransaction(async (ctx) => {
      const source = await txQuery.one<InventoryRowForLedger>(
        ctx.conn,
        'SELECT * FROM inventory WHERE id = ? FOR UPDATE',
        [input.inventory_id]
      );
      if (!source) throw ApiError.notFound('Source inventory record not found');

      const target = await findOrCreate(ctx, {
        warehouse_id: input.to_warehouse_id,
        product_id: source.product_id,
        raw_material_id: source.raw_material_id,
        location_id: input.to_location_id ?? null,
        batch_no: source.batch_no,
        expiry_date: source.expiry_date,
      });

      await applyLedger(ctx, source, -input.quantity, 'TRANSFER', {
        reason: input.reason ?? 'Stock transfer out',
        actorId: input.actorId,
      });
      await applyLedger(ctx, target, input.quantity, 'TRANSFER', {
        reason: input.reason ?? 'Stock transfer in',
        unitCost: Number(source.unit_cost),
        actorId: input.actorId,
      });

      return InventoryRepository.findById(target.id);
    });
  },
};

export type { PaginationParams };