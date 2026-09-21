import mysql from 'mysql2/promise';
import { env } from '../config/env';
import logger from '../utils/logger';

export type SqlParams = any[];

export const pool = mysql.createPool({
  host: env.db.host,
  port: env.db.port,
  user: env.db.user,
  password: env.db.password,
  database: env.db.database,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  dateStrings: true,
  namedPlaceholders: true,
});

export async function checkConnection(): Promise<void> {
  const conn = await pool.getConnection();
  try {
    await conn.ping();
    logger.info('MySQL connection OK');
  } finally {
    conn.release();
  }
}

export interface TxContext {
  conn: mysql.PoolConnection;
}

export async function withTransaction<T>(
  fn: (ctx: TxContext) => Promise<T>
): Promise<T> {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    const result = await fn({ conn });
    await conn.commit();
    return result;
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
}

export const query = {
  async run(sql: string, params: SqlParams = []): Promise<mysql.ResultSetHeader> {
    const [result] = await pool.execute(sql, params);
    return result as mysql.ResultSetHeader;
  },
  async rows<T>(sql: string, params: SqlParams = []): Promise<T[]> {
    const [rows] = await pool.execute(sql, params);
    return rows as T[];
  },
  async one<T>(sql: string, params: SqlParams = []): Promise<T | null> {
    const [rows] = await pool.execute(sql, params);
    const arr = rows as T[];
    return arr[0] ?? null;
  },
};

export const txQuery = {
  async run(conn: mysql.PoolConnection, sql: string, params: SqlParams = []): Promise<mysql.ResultSetHeader> {
    const [result] = await conn.execute(sql, params);
    return result as mysql.ResultSetHeader;
  },
  async rows<T>(conn: mysql.PoolConnection, sql: string, params: SqlParams = []): Promise<T[]> {
    const [rows] = await conn.execute(sql, params);
    return rows as T[];
  },
  async one<T>(conn: mysql.PoolConnection, sql: string, params: SqlParams = []): Promise<T | null> {
    const rows = await txQuery.rows<T>(conn, sql, params);
    return rows[0] ?? null;
  },
};