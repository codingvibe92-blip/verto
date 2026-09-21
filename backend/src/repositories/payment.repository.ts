import { query, txQuery, withTransaction, SqlParams } from '../database/pool';
import { PaginationMeta } from '../types';
import { PaginationParams } from '../utils/pagination';

export interface PaymentRow {
  id: number;
  order_id: number;
  order_number?: string;
  customer_name?: string;
  payment_reference: string | null;
  provider: string;
  amount: string;
  currency: string;
  status: string;
  method: string | null;
  paid_at: string | null;
  created_at: string;
}

export interface RefundRow {
  id: number;
  refund_reference: string | null;
  payment_id: number;
  order_id: number;
  order_number?: string;
  amount: string;
  currency: string;
  reason: string | null;
  status: string;
  created_at: string;
}

export const PaymentRepository = {
  async listPayments(
    opts: PaginationParams & { search?: string; status?: string }
  ): Promise<{ rows: PaymentRow[]; meta: PaginationMeta }> {
    const conditions: string[] = ['1=1'];
    const params: SqlParams = [];

    if (opts.search) {
      conditions.push('(p.payment_reference LIKE ? OR o.order_number LIKE ?)');
      params.push(`%${opts.search}%`, `%${opts.search}%`);
    }
    if (opts.status) {
      conditions.push('p.status = ?');
      params.push(opts.status);
    }

    const where = `WHERE ${conditions.join(' AND ')}`;
    const countRow = await query.one<{ n: number }>(
      `SELECT COUNT(*) AS n FROM payments p
       JOIN orders o ON o.id = p.order_id ${where}`,
      params
    );
    const total = countRow?.n ?? 0;
    const offset = (opts.page - 1) * opts.limit;

    const rows = await query.rows<PaymentRow>(
      `SELECT p.*, o.order_number, CONCAT(c.first_name, ' ', COALESCE(c.last_name, '')) AS customer_name
       FROM payments p
       JOIN orders o ON o.id = p.order_id
       JOIN customers c ON c.id = o.customer_id
       ${where}
       ORDER BY p.created_at DESC
       LIMIT ? OFFSET ?`,
      [...params, opts.limit, offset]
    );

    return { rows, meta: { page: opts.page, limit: opts.limit, total, pages: Math.ceil(total / opts.limit) } };
  },

  async listRefunds(opts: PaginationParams): Promise<{ rows: RefundRow[]; meta: PaginationMeta }> {
    const countRow = await query.one<{ n: number }>('SELECT COUNT(*) AS n FROM refunds');
    const total = countRow?.n ?? 0;
    const offset = (opts.page - 1) * opts.limit;

    const rows = await query.rows<RefundRow>(
      `SELECT r.*, o.order_number
       FROM refunds r
       JOIN orders o ON o.id = r.order_id
       ORDER BY r.created_at DESC
       LIMIT ? OFFSET ?`,
      [opts.limit, offset]
    );

    return { rows, meta: { page: opts.page, limit: opts.limit, total, pages: Math.ceil(total / opts.limit) } };
  },

  async processRefund(paymentId: number, amount: number, reason: string, processedBy?: number): Promise<number> {
    return withTransaction(async (ctx) => {
      const payment = await txQuery.one<PaymentRow>(
        ctx.conn,
        'SELECT * FROM payments WHERE id = ? FOR UPDATE',
        [paymentId]
      );
      if (!payment) throw new Error('Payment not found');

      const refundRef = `RFD-${Date.now().toString(36).toUpperCase()}`;

      const res = await txQuery.run(
        ctx.conn,
        `INSERT INTO refunds (refund_reference, payment_id, order_id, amount, currency, reason, status, processed_by)
         VALUES (?, ?, ?, ?, 'USD', ?, 'COMPLETED', ?)`,
        [refundRef, paymentId, payment.order_id, amount, reason, processedBy ?? null]
      );
      const refundId = res.insertId;

      await txQuery.run(
        ctx.conn,
        'UPDATE payments SET status = "REFUNDED" WHERE id = ?',
        [paymentId]
      );

      await txQuery.run(
        ctx.conn,
        'UPDATE orders SET status = "REFUNDED", payment_status = "REFUNDED" WHERE id = ?',
        [payment.order_id]
      );

      await txQuery.run(
        ctx.conn,
        `INSERT INTO order_status_history (order_id, from_status, to_status, reason, changed_by)
         VALUES (?, NULL, 'REFUNDED', ?, ?)`,
        [payment.order_id, `Refund processed: ${reason}`, processedBy ?? null]
      );

      return refundId;
    });
  },
};
