import { query, txQuery, withTransaction, SqlParams } from '../database/pool';
import { PaginationMeta } from '../types';
import { PaginationParams } from '../utils/pagination';

export interface ShipmentRow {
  id: number;
  order_id: number;
  order_number?: string;
  customer_name?: string;
  provider: string;
  awb: string | null;
  courier: string | null;
  status: string;
  tracking_url: string | null;
  label_url: string | null;
  estimated_delivery: string | null;
  shipped_at: string | null;
  delivered_at: string | null;
  created_at: string;
  tracking?: ShipmentTrackingRow[];
}

export interface ShipmentTrackingRow {
  id: number;
  shipment_id: number;
  status: string | null;
  location: string | null;
  description: string | null;
  tracked_at: string;
}

export const ShippingRepository = {
  async listShipments(
    opts: PaginationParams & { search?: string; status?: string }
  ): Promise<{ rows: ShipmentRow[]; meta: PaginationMeta }> {
    const conditions: string[] = ['1=1'];
    const params: SqlParams = [];

    if (opts.search) {
      conditions.push('(s.awb LIKE ? OR o.order_number LIKE ? OR s.courier LIKE ?)');
      params.push(`%${opts.search}%`, `%${opts.search}%`, `%${opts.search}%`);
    }
    if (opts.status) {
      conditions.push('s.status = ?');
      params.push(opts.status);
    }

    const where = `WHERE ${conditions.join(' AND ')}`;
    const countRow = await query.one<{ n: number }>(
      `SELECT COUNT(*) AS n FROM shipments s
       JOIN orders o ON o.id = s.order_id ${where}`,
      params
    );
    const total = countRow?.n ?? 0;
    const offset = (opts.page - 1) * opts.limit;

    const rows = await query.rows<ShipmentRow>(
      `SELECT s.*, o.order_number, CONCAT(c.first_name, ' ', COALESCE(c.last_name, '')) AS customer_name
       FROM shipments s
       JOIN orders o ON o.id = s.order_id
       JOIN customers c ON c.id = o.customer_id
       ${where}
       ORDER BY s.created_at DESC
       LIMIT ? OFFSET ?`,
      [...params, opts.limit, offset]
    );

    return { rows, meta: { page: opts.page, limit: opts.limit, total, pages: Math.ceil(total / opts.limit) } };
  },

  async findShipmentById(id: number): Promise<ShipmentRow | null> {
    const shipment = await query.one<ShipmentRow>(
      `SELECT s.*, o.order_number, CONCAT(c.first_name, ' ', COALESCE(c.last_name, '')) AS customer_name
       FROM shipments s
       JOIN orders o ON o.id = s.order_id
       JOIN customers c ON c.id = o.customer_id
       WHERE s.id = ?`,
      [id]
    );
    if (!shipment) return null;

    shipment.tracking = await query.rows<ShipmentTrackingRow>(
      'SELECT * FROM shipment_tracking WHERE shipment_id = ? ORDER BY tracked_at ASC',
      [id]
    );
    return shipment;
  },

  async findShipmentByAWB(awb: string): Promise<ShipmentRow | null> {
    const shipment = await query.one<ShipmentRow>(
      `SELECT s.*, o.order_number, CONCAT(c.first_name, ' ', COALESCE(c.last_name, '')) AS customer_name
       FROM shipments s
       JOIN orders o ON o.id = s.order_id
       JOIN customers c ON c.id = o.customer_id
       WHERE s.awb = ?`,
      [awb]
    );
    if (!shipment) return null;

    shipment.tracking = await query.rows<ShipmentTrackingRow>(
      'SELECT * FROM shipment_tracking WHERE shipment_id = ? ORDER BY tracked_at ASC',
      [shipment.id]
    );
    return shipment;
  },

  async findShipmentByOrderId(orderId: number): Promise<ShipmentRow | null> {
    const shipment = await query.one<ShipmentRow>(
      'SELECT * FROM shipments WHERE order_id = ? ORDER BY id DESC LIMIT 1',
      [orderId]
    );
    if (!shipment) return null;

    shipment.tracking = await query.rows<ShipmentTrackingRow>(
      'SELECT * FROM shipment_tracking WHERE shipment_id = ? ORDER BY tracked_at ASC',
      [shipment.id]
    );
    return shipment;
  },

  async createShipment(data: {
    orderId: number;
    courier: string;
    totalWeight?: number;
    awb?: string;
  }): Promise<number> {
    return withTransaction(async (ctx) => {
      const awb = data.awb || `CRX-EXP-${Date.now().toString(36).toUpperCase()}`;

      const res = await txQuery.run(
        ctx.conn,
        `INSERT INTO shipments (order_id, provider, awb, courier, status, shipped_at)
         VALUES (?, 'mock', ?, ?, 'SHIPPED', NOW())`,
        [data.orderId, awb, data.courier]
      );
      const shipmentId = res.insertId;

      // Add initial tracking waypoint
      await txQuery.run(
        ctx.conn,
        `INSERT INTO shipment_tracking (shipment_id, status, location, description)
         VALUES (?, 'PICKED_UP', 'Central Warehouse Fulfillment Hub', 'Package picked up by carrier and scanned into sorting facility')`,
        [shipmentId]
      );

      // Advance order status to SHIPPED
      await txQuery.run(
        ctx.conn,
        'UPDATE orders SET status = "SHIPPED" WHERE id = ?',
        [data.orderId]
      );

      await txQuery.run(
        ctx.conn,
        `INSERT INTO order_status_history (order_id, from_status, to_status, reason)
         VALUES (?, 'PROCESSING', 'SHIPPED', ?)`,
        [data.orderId, `Dispatched via ${data.courier} (AWB: ${awb})`]
      );

      return shipmentId;
    });
  },

  async addTrackingCheckpoint(shipmentId: number, status: string, location: string, description: string): Promise<void> {
    return withTransaction(async (ctx) => {
      await txQuery.run(
        ctx.conn,
        `INSERT INTO shipment_tracking (shipment_id, status, location, description)
         VALUES (?, ?, ?, ?)`,
        [shipmentId, status, location, description]
      );

      await txQuery.run(
        ctx.conn,
        'UPDATE shipments SET status = ? WHERE id = ?',
        [status, shipmentId]
      );

      if (status === 'DELIVERED') {
        await txQuery.run(
          ctx.conn,
          'UPDATE shipments SET delivered_at = NOW() WHERE id = ?',
          [shipmentId]
        );

        const shipment = await txQuery.one<{ order_id: number }>(
          ctx.conn,
          'SELECT order_id FROM shipments WHERE id = ?',
          [shipmentId]
        );

        if (shipment) {
          await txQuery.run(
            ctx.conn,
            'UPDATE orders SET status = "DELIVERED" WHERE id = ?',
            [shipment.order_id]
          );

          await txQuery.run(
            ctx.conn,
            `INSERT INTO order_status_history (order_id, from_status, to_status, reason)
             VALUES (?, 'SHIPPED', 'DELIVERED', 'Package successfully delivered to customer')`,
            [shipment.order_id]
          );
        }
      }
    });
  },
};
