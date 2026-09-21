import mysql from 'mysql2/promise';
import { Pool as PgPool, PoolClient } from 'pg';
import { env } from '../config/env';
import logger from '../utils/logger';

export type SqlParams = any[];

export const isPostgres =
  env.db.port === 5432 ||
  env.db.port === 6543 ||
  env.db.host.includes('supabase') ||
  env.db.host.includes('pooler') ||
  Boolean(process.env.DATABASE_URL?.startsWith('postgres'));

export let mysqlPool: mysql.Pool | null = null;
export let pgPool: PgPool | null = null;

if (isPostgres) {
  logger.info(`Initializing PostgreSQL connection pool for ${env.db.host}:${env.db.port}`);
  const poolConfig = process.env.DATABASE_URL
    ? {
        connectionString: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false },
        max: 10,
      }
    : {
        host: env.db.host,
        port: env.db.port,
        user: env.db.user,
        password: env.db.password,
        database: env.db.database,
        ssl: env.db.host !== '127.0.0.1' && env.db.host !== 'localhost' ? { rejectUnauthorized: false } : undefined,
        max: 10,
      };
  pgPool = new PgPool(poolConfig);
} else {
  logger.info(`Initializing MySQL connection pool for ${env.db.host}:${env.db.port}`);
  mysqlPool = mysql.createPool({
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
}

// Keep export of pool for backward compatibility
export const pool = mysqlPool as any;

function transformSqlForPg(sql: string): { sql: string; isInsert: boolean } {
  let s = sql;
  // Convert INSERT IGNORE to ON CONFLICT DO NOTHING
  if (/insert\s+ignore\s+into/i.test(s)) {
    s = s.replace(/insert\s+ignore\s+into/i, 'INSERT INTO');
    if (!/on conflict/i.test(s)) {
      s += ' ON CONFLICT DO NOTHING';
    }
  }
  // Convert ON DUPLICATE KEY UPDATE in settings
  if (/on\s+duplicate\s+key\s+update/i.test(s)) {
    s = s.replace(
      /on\s+duplicate\s+key\s+update\s+setting_value\s*=\s*values\(setting_value\),\s*setting_group\s*=\s*values\(setting_group\),\s*updated_at\s*=\s*now\(\)/i,
      'ON CONFLICT (setting_key) DO UPDATE SET setting_value = EXCLUDED.setting_value, setting_group = EXCLUDED.setting_group, updated_at = NOW()'
    );
  }
  // Append RETURNING id for inserts if not present and not ignoring conflicts
  const isInsert = /^\s*insert\s+into/i.test(s) && !/returning/i.test(s);
  if (isInsert && !/on conflict do nothing/i.test(s)) {
    s = s.trim().replace(/;?$/, ' RETURNING id;');
  }

  // Convert ? to $1, $2, $3
  let idx = 1;
  s = s.replace(/\?/g, () => `$${idx++}`);
  return { sql: s, isInsert };
}

export async function checkConnection(): Promise<void> {
  if (isPostgres && pgPool) {
    const client = await pgPool.connect();
    try {
      await client.query('SELECT 1');
      logger.info(`PostgreSQL (Supabase) connection OK on ${env.db.host}:${env.db.port}`);
    } finally {
      client.release();
    }
  } else if (mysqlPool) {
    const conn = await mysqlPool.getConnection();
    try {
      await conn.ping();
      logger.info(`MySQL connection OK on ${env.db.host}:${env.db.port}`);
    } finally {
      conn.release();
    }
  }
}

export interface TxContext {
  conn: any;
}

export async function withTransaction<T>(
  fn: (ctx: TxContext) => Promise<T>
): Promise<T> {
  if (isPostgres && pgPool) {
    const client = await pgPool.connect();
    try {
      await client.query('BEGIN');
      // Create a compatibility adapter for conn.execute(sql, params)
      const connAdapter = {
        async execute(sql: string, params: SqlParams = []) {
          const { sql: pgSql, isInsert } = transformSqlForPg(sql);
          const res = await client.query(pgSql, params);
          const insertId = isInsert && res.rows[0]?.id ? Number(res.rows[0].id) : 0;
          return [{ insertId, affectedRows: res.rowCount ?? 0 }, []] as any;
        },
        async query(sql: string, params: SqlParams = []) {
          return this.execute(sql, params);
        },
        rawClient: client,
      };
      const result = await fn({ conn: connAdapter });
      await client.query('COMMIT');
      return result;
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  } else if (mysqlPool) {
    const conn = await mysqlPool.getConnection();
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
  throw new Error('Database pool not initialized');
}

export const query = {
  async run(sql: string, params: SqlParams = []): Promise<mysql.ResultSetHeader> {
    if (isPostgres && pgPool) {
      const { sql: pgSql, isInsert } = transformSqlForPg(sql);
      const res = await pgPool.query(pgSql, params);
      const insertId = isInsert && res.rows[0]?.id ? Number(res.rows[0].id) : 0;
      return { insertId, affectedRows: res.rowCount ?? 0 } as any;
    }
    const [result] = await mysqlPool!.execute(sql, params);
    return result as mysql.ResultSetHeader;
  },
  async rows<T>(sql: string, params: SqlParams = []): Promise<T[]> {
    if (isPostgres && pgPool) {
      const { sql: pgSql } = transformSqlForPg(sql);
      const res = await pgPool.query(pgSql, params);
      return res.rows as T[];
    }
    const [rows] = await mysqlPool!.execute(sql, params);
    return rows as T[];
  },
  async one<T>(sql: string, params: SqlParams = []): Promise<T | null> {
    if (isPostgres && pgPool) {
      const { sql: pgSql } = transformSqlForPg(sql);
      const res = await pgPool.query(pgSql, params);
      return (res.rows[0] as T) ?? null;
    }
    const [rows] = await mysqlPool!.execute(sql, params);
    const arr = rows as T[];
    return arr[0] ?? null;
  },
};

export const txQuery = {
  async run(conn: any, sql: string, params: SqlParams = []): Promise<mysql.ResultSetHeader> {
    if (isPostgres && conn.rawClient) {
      const { sql: pgSql, isInsert } = transformSqlForPg(sql);
      const res = await (conn.rawClient as PoolClient).query(pgSql, params);
      const insertId = isInsert && res.rows[0]?.id ? Number(res.rows[0].id) : 0;
      return { insertId, affectedRows: res.rowCount ?? 0 } as any;
    }
    const [result] = await conn.execute(sql, params);
    return result as mysql.ResultSetHeader;
  },
  async rows<T>(conn: any, sql: string, params: SqlParams = []): Promise<T[]> {
    if (isPostgres && conn.rawClient) {
      const { sql: pgSql } = transformSqlForPg(sql);
      const res = await (conn.rawClient as PoolClient).query(pgSql, params);
      return res.rows as T[];
    }
    const [rows] = await conn.execute(sql, params);
    return rows as T[];
  },
  async one<T>(conn: any, sql: string, params: SqlParams = []): Promise<T | null> {
    const rows = await txQuery.rows<T>(conn, sql, params);
    return rows[0] ?? null;
  },
};