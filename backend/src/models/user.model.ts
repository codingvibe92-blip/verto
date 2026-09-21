import { query } from '../database/pool';
import { RoleRow, UserRow } from '../types';

export interface UserWithAccess extends UserRow {
  roles: RoleRow[];
  permissions: string[];
}

export const UserModel = {
  async findById(id: number): Promise<UserWithAccess | null> {
    const user = await query.one<UserRow>(
      'SELECT id, name, email, password_hash, phone, avatar_url, is_active, is_email_verified, email_verified_at, last_login_at, created_at, updated_at, deleted_at FROM users WHERE id = ? AND deleted_at IS NULL',
      [id]
    );
    if (!user) return null;
    const roles = await this.getRoles(id);
    const permissions = await this.getPermissions(id);
    return { ...user, roles, permissions };
  },

  async findByEmail(email: string): Promise<UserWithAccess | null> {
    const user = await query.one<UserRow>(
      'SELECT id, name, email, password_hash, phone, avatar_url, is_active, is_email_verified, email_verified_at, last_login_at, created_at, updated_at, deleted_at FROM users WHERE email = ? AND deleted_at IS NULL',
      [email]
    );
    if (!user) return null;
    const roles = await this.getRoles(user.id);
    const permissions = await this.getPermissions(user.id);
    return { ...user, roles, permissions };
  },

  async getRoles(userId: number): Promise<RoleRow[]> {
    return query.rows<RoleRow>(
      `SELECT r.id, r.slug, r.name FROM roles r
       JOIN user_roles ur ON ur.role_id = r.id
       WHERE ur.user_id = ?`,
      [userId]
    );
  },

  async getPermissions(userId: number): Promise<string[]> {
    const rows = await query.rows<{ name: string }>(
      `SELECT DISTINCT p.name FROM permissions p
       JOIN role_permissions rp ON rp.permission_id = p.id
       JOIN user_roles ur ON ur.role_id = rp.role_id
       WHERE ur.user_id = ?`,
      [userId]
    );
    return rows.map((r) => r.name);
  },

  async create(data: {
    name: string;
    email: string;
    passwordHash: string;
    phone?: string | null;
    isEmailVerified?: boolean;
  }): Promise<number> {
    const result = await query.run(
      'INSERT INTO users (name, email, password_hash, phone, is_email_verified) VALUES (?, ?, ?, ?, ?)',
      [data.name, data.email, data.passwordHash, data.phone ?? null, data.isEmailVerified ? 1 : 0]
    );
    return result.insertId;
  },

  async assignRole(userId: number, roleId: number): Promise<void> {
    await query.run(
      'INSERT IGNORE INTO user_roles (user_id, role_id) VALUES (?, ?)',
      [userId, roleId]
    );
  },

  async updateLastLogin(userId: number): Promise<void> {
    await query.run('UPDATE users SET last_login_at = NOW() WHERE id = ?', [userId]);
  },
};