import { query } from '../database/pool';

export interface AuditLogItem {
  id: number;
  user_id: number | null;
  user_name?: string | null;
  user_email?: string | null;
  action: string;
  entity: string;
  entity_id: number | null;
  old_value: any;
  new_value: any;
  ip_address: string | null;
  user_agent: string | null;
  created_at: string;
}

export const AuditLogRepository = {
  async list(params: {
    page?: number;
    limit?: number;
    action?: string;
    entity?: string;
    userId?: number;
    search?: string;
  }): Promise<{ logs: AuditLogItem[]; total: number; page: number; limit: number }> {
    const page = Math.max(1, params.page || 1);
    const limit = Math.min(100, Math.max(1, params.limit || 25));
    const offset = (page - 1) * limit;

    const where: string[] = [];
    const sqlParams: any[] = [];

    if (params.action) {
      where.push('al.action = ?');
      sqlParams.push(params.action);
    }
    if (params.entity) {
      where.push('al.entity = ?');
      sqlParams.push(params.entity);
    }
    if (params.userId) {
      where.push('al.user_id = ?');
      sqlParams.push(params.userId);
    }
    if (params.search) {
      where.push('(al.action LIKE ? OR al.entity LIKE ? OR u.name LIKE ? OR u.email LIKE ?)');
      const term = `%${params.search}%`;
      sqlParams.push(term, term, term, term);
    }

    const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';

    const countRow = await query.one<{ n: number }>(
      `SELECT COUNT(*) AS n 
       FROM audit_logs al
       LEFT JOIN users u ON u.id = al.user_id
       ${whereSql}`,
      sqlParams
    );
    const total = countRow?.n ?? 0;

    const logs = await query.rows<AuditLogItem>(
      `SELECT al.id, al.user_id, u.name AS user_name, u.email AS user_email,
              al.action, al.entity, al.entity_id, al.old_value, al.new_value,
              al.ip_address, al.user_agent, al.created_at
       FROM audit_logs al
       LEFT JOIN users u ON u.id = al.user_id
       ${whereSql}
       ORDER BY al.created_at DESC
       LIMIT ? OFFSET ?`,
      [...sqlParams, limit, offset]
    );

    return { logs, total, page, limit };
  },

  async log(data: {
    userId?: number | null;
    action: string;
    entity: string;
    entityId?: number | null;
    oldValue?: any;
    newValue?: any;
    ipAddress?: string | null;
    userAgent?: string | null;
  }): Promise<void> {
    await query.run(
      `INSERT INTO audit_logs (user_id, action, entity, entity_id, old_value, new_value, ip_address, user_agent)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        data.userId ?? null,
        data.action,
        data.entity,
        data.entityId ?? null,
        data.oldValue ? JSON.stringify(data.oldValue) : null,
        data.newValue ? JSON.stringify(data.newValue) : null,
        data.ipAddress ?? null,
        data.userAgent ?? null,
      ]
    );
  },
};
