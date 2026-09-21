import client, { apiErrorMessage } from '../api/client';
import { Paginated } from './types';

export interface AuditLog {
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

export const AuditLogService = {
  async list(params: Record<string, unknown> = {}): Promise<Paginated<AuditLog>> {
    const res = await client.get('/audit-logs', { params });
    return {
      rows: res.data.data,
      meta: res.data.pagination || { total: res.data.data.length, page: 1, limit: 25, totalPages: 1 },
    };
  },

  errorMessage(err: unknown) {
    return apiErrorMessage(err);
  },
};
