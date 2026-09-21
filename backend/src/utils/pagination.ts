import { query, SqlParams } from '../database/pool';
import { PaginationMeta } from '../types';

export interface PaginationParams {
  page: number;
  limit: number;
}

export function parsePagination(query: Record<string, unknown>): PaginationParams {
  const page = Math.max(1, Number(query.page) || 1);
  const limit = Math.min(100, Math.max(1, Number(query.limit) || 20));
  return { page, limit };
}

export async function paginate<T>(
  baseWhere: string,
  params: SqlParams,
  table: string,
  { page, limit }: PaginationParams,
  orderBy = 'created_at DESC'
): Promise<{ rows: T[]; meta: PaginationMeta }> {
  const [countRow] = await Promise.all([
    query.one<{ n: number }>(`SELECT COUNT(*) AS n FROM ${table} ${baseWhere}`, params),
  ]);
  const total = countRow?.n ?? 0;
  const offset = (page - 1) * limit;
  const rows = await query.rows<T>(
    `SELECT * FROM ${table} ${baseWhere} ORDER BY ${orderBy} LIMIT ? OFFSET ?`,
    [...params, limit, offset]
  );
  return {
    rows,
    meta: { page, limit, total, pages: Math.ceil(total / limit) },
  };
}