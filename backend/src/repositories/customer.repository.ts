import { query, txQuery, withTransaction, SqlParams } from '../database/pool';
import { PaginationMeta } from '../types';
import { PaginationParams } from '../utils/pagination';

export interface CustomerRow {
  id: number;
  user_id: number | null;
  first_name: string;
  last_name: string | null;
  email: string;
  phone: string | null;
  status: string;
  is_verified: number;
  notes: string | null;
  created_at: string;
  orders_count?: number;
  total_spent?: string;
  addresses?: CustomerAddressRow[];
}

export interface CustomerAddressRow {
  id: number;
  customer_id: number;
  type: string;
  address_line1: string;
  address_line2?: string | null;
  city: string;
  state: string;
  postal_code: string;
  country: string;
  is_default: number;
}

export const CustomerRepository = {
  async listCustomers(
    opts: PaginationParams & { search?: string; status?: string }
  ): Promise<{ rows: CustomerRow[]; meta: PaginationMeta }> {
    const conditions: string[] = ['c.deleted_at IS NULL'];
    const params: SqlParams = [];

    if (opts.search) {
      conditions.push('(c.first_name LIKE ? OR c.last_name LIKE ? OR c.email LIKE ? OR c.phone LIKE ?)');
      params.push(`%${opts.search}%`, `%${opts.search}%`, `%${opts.search}%`, `%${opts.search}%`);
    }
    if (opts.status) {
      conditions.push('c.status = ?');
      params.push(opts.status);
    }

    const where = `WHERE ${conditions.join(' AND ')}`;
    const countRow = await query.one<{ n: number }>(
      `SELECT COUNT(*) AS n FROM customers c ${where}`,
      params
    );
    const total = countRow?.n ?? 0;
    const offset = (opts.page - 1) * opts.limit;

    const rows = await query.rows<CustomerRow>(
      `SELECT c.*,
              COUNT(o.id) AS orders_count,
              COALESCE(SUM(CASE WHEN o.payment_status = 'PAID' THEN o.grand_total ELSE 0 END), 0) AS total_spent
       FROM customers c
       LEFT JOIN orders o ON o.customer_id = c.id
       ${where}
       GROUP BY c.id
       ORDER BY c.created_at DESC
       LIMIT ? OFFSET ?`,
      [...params, opts.limit, offset]
    );

    return { rows, meta: { page: opts.page, limit: opts.limit, total, pages: Math.ceil(total / opts.limit) } };
  },

  async findById(id: number): Promise<CustomerRow | null> {
    const customer = await query.one<CustomerRow>(
      'SELECT * FROM customers WHERE id = ? AND deleted_at IS NULL',
      [id]
    );
    if (!customer) return null;

    customer.addresses = await query.rows<CustomerAddressRow>(
      'SELECT * FROM customer_addresses WHERE customer_id = ? ORDER BY is_default DESC, id DESC',
      [id]
    );
    return customer;
  },

  async findByUserId(userId: number): Promise<CustomerRow | null> {
    const customer = await query.one<CustomerRow>(
      'SELECT * FROM customers WHERE user_id = ? AND deleted_at IS NULL',
      [userId]
    );
    if (!customer) return null;

    customer.addresses = await query.rows<CustomerAddressRow>(
      'SELECT * FROM customer_addresses WHERE customer_id = ? ORDER BY is_default DESC, id DESC',
      [customer.id]
    );
    return customer;
  },

  async addAddress(
    customerId: number,
    data: {
      type?: string;
      address_line1: string;
      address_line2?: string | null;
      city: string;
      state: string;
      postal_code: string;
      country?: string;
      is_default?: boolean;
    }
  ): Promise<number> {
    if (data.is_default) {
      await query.run('UPDATE customer_addresses SET is_default = 0 WHERE customer_id = ?', [customerId]);
    }

    const res = await query.run(
      `INSERT INTO customer_addresses (customer_id, type, address_line1, address_line2, city, state, postal_code, country, is_default)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        customerId,
        data.type || 'SHIPPING',
        data.address_line1,
        data.address_line2 ?? null,
        data.city,
        data.state,
        data.postal_code,
        data.country || 'USA',
        data.is_default ? 1 : 0,
      ]
    );
    return res.insertId;
  },

  async deleteAddress(addressId: number, customerId: number): Promise<void> {
    await query.run('DELETE FROM customer_addresses WHERE id = ? AND customer_id = ?', [addressId, customerId]);
  },
};
