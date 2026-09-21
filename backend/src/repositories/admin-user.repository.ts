import { query, withTransaction } from '../database/pool';
import { RoleRow, UserRow } from '../types';
import { hashPassword } from '../utils/password';
import { ApiError } from '../utils/errors';

export interface AdminUserListItem extends Omit<UserRow, 'password_hash'> {
  roles: { id: number; name: string; slug: string }[];
}

export interface RoleDetail extends RoleRow {
  description?: string | null;
  is_system: number;
  permissions: { id: number; name: string; permission_group: string | null; description: string | null }[];
}

export interface PermissionItem {
  id: number;
  name: string;
  permission_group: string | null;
  description: string | null;
}

export const AdminUserRepository = {
  async listUsers(params: {
    page?: number;
    limit?: number;
    search?: string;
    roleId?: number;
    isActive?: boolean;
  }): Promise<{ users: AdminUserListItem[]; total: number; page: number; limit: number }> {
    const page = Math.max(1, params.page || 1);
    const limit = Math.min(100, Math.max(1, params.limit || 20));
    const offset = (page - 1) * limit;

    const where: string[] = ['u.deleted_at IS NULL'];
    const sqlParams: any[] = [];

    if (params.search) {
      where.push('(u.name LIKE ? OR u.email LIKE ? OR u.phone LIKE ?)');
      const term = `%${params.search}%`;
      sqlParams.push(term, term, term);
    }

    if (params.isActive !== undefined) {
      where.push('u.is_active = ?');
      sqlParams.push(params.isActive ? 1 : 0);
    }

    if (params.roleId) {
      where.push('EXISTS (SELECT 1 FROM user_roles ur WHERE ur.user_id = u.id AND ur.role_id = ?)');
      sqlParams.push(params.roleId);
    }

    const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';

    const countRow = await query.one<{ n: number }>(
      `SELECT COUNT(*) AS n FROM users u ${whereSql}`,
      sqlParams
    );
    const total = countRow?.n ?? 0;

    const users = await query.rows<Omit<UserRow, 'password_hash'>>(
      `SELECT u.id, u.name, u.email, u.phone, u.avatar_url, u.is_active, u.is_email_verified, 
              u.email_verified_at, u.last_login_at, u.created_at, u.updated_at, u.deleted_at
       FROM users u
       ${whereSql}
       ORDER BY u.created_at DESC
       LIMIT ? OFFSET ?`,
      [...sqlParams, limit, offset]
    );

    // Fetch roles for each user
    const userIds = users.map((u) => u.id);
    const userRolesMap = new Map<number, { id: number; name: string; slug: string }[]>();

    if (userIds.length > 0) {
      const placeholders = userIds.map(() => '?').join(',');
      const roleRows = await query.rows<{ user_id: number; id: number; name: string; slug: string }>(
        `SELECT ur.user_id, r.id, r.name, r.slug
         FROM roles r
         JOIN user_roles ur ON ur.role_id = r.id
         WHERE ur.user_id IN (${placeholders})`,
        userIds
      );

      for (const r of roleRows) {
        if (!userRolesMap.has(r.user_id)) {
          userRolesMap.set(r.user_id, []);
        }
        userRolesMap.get(r.user_id)!.push({ id: r.id, name: r.name, slug: r.slug });
      }
    }

    const enrichedUsers: AdminUserListItem[] = users.map((u) => ({
      ...u,
      roles: userRolesMap.get(u.id) || [],
    }));

    return { users: enrichedUsers, total, page, limit };
  },

  async getUserById(id: number): Promise<AdminUserListItem | null> {
    const user = await query.one<Omit<UserRow, 'password_hash'>>(
      `SELECT id, name, email, phone, avatar_url, is_active, is_email_verified, 
              email_verified_at, last_login_at, created_at, updated_at, deleted_at
       FROM users
       WHERE id = ? AND deleted_at IS NULL`,
      [id]
    );
    if (!user) return null;

    const roles = await query.rows<{ id: number; name: string; slug: string }>(
      `SELECT r.id, r.name, r.slug
       FROM roles r
       JOIN user_roles ur ON ur.role_id = r.id
       WHERE ur.user_id = ?`,
      [id]
    );

    return { ...user, roles };
  },

  async createUser(data: {
    name: string;
    email: string;
    password: string;
    phone?: string | null;
    isActive?: boolean;
    roleIds?: number[];
  }): Promise<AdminUserListItem> {
    const existing = await query.one<{ id: number }>('SELECT id FROM users WHERE email = ?', [data.email]);
    if (existing) {
      throw ApiError.conflict('Email is already in use');
    }

    const passwordHash = await hashPassword(data.password);

    return withTransaction(async ({ conn }) => {
      const [res] = await conn.execute(
        `INSERT INTO users (name, email, password_hash, phone, is_active, is_email_verified)
         VALUES (?, ?, ?, ?, ?, 1)`,
        [data.name, data.email, passwordHash, data.phone || null, data.isActive !== false ? 1 : 0]
      );
      const userId = (res as any).insertId;

      if (data.roleIds && data.roleIds.length > 0) {
        for (const roleId of data.roleIds) {
          await conn.execute(
            'INSERT IGNORE INTO user_roles (user_id, role_id) VALUES (?, ?)',
            [userId, roleId]
          );
        }
      }

      const created = await AdminUserRepository.getUserById(userId);
      if (!created) throw ApiError.internal('Failed to retrieve newly created user');
      return created;
    });
  },

  async updateUser(
    id: number,
    data: {
      name?: string;
      email?: string;
      phone?: string | null;
      password?: string;
      isActive?: boolean;
      roleIds?: number[];
    }
  ): Promise<AdminUserListItem> {
    const user = await AdminUserRepository.getUserById(id);
    if (!user) throw ApiError.notFound('User not found');

    if (data.email && data.email !== user.email) {
      const conflict = await query.one<{ id: number }>('SELECT id FROM users WHERE email = ? AND id != ?', [data.email, id]);
      if (conflict) throw ApiError.conflict('Email is already registered to another user');
    }

    return withTransaction(async ({ conn }) => {
      const updates: string[] = [];
      const sqlParams: any[] = [];

      if (data.name !== undefined) {
        updates.push('name = ?');
        sqlParams.push(data.name);
      }
      if (data.email !== undefined) {
        updates.push('email = ?');
        sqlParams.push(data.email);
      }
      if (data.phone !== undefined) {
        updates.push('phone = ?');
        sqlParams.push(data.phone);
      }
      if (data.isActive !== undefined) {
        updates.push('is_active = ?');
        sqlParams.push(data.isActive ? 1 : 0);
      }
      if (data.password) {
        const hash = await hashPassword(data.password);
        updates.push('password_hash = ?');
        sqlParams.push(hash);
      }

      if (updates.length > 0) {
        sqlParams.push(id);
        await conn.execute(`UPDATE users SET ${updates.join(', ')} WHERE id = ?`, sqlParams);
      }

      if (data.roleIds !== undefined) {
        await conn.execute('DELETE FROM user_roles WHERE user_id = ?', [id]);
        for (const roleId of data.roleIds) {
          await conn.execute('INSERT INTO user_roles (user_id, role_id) VALUES (?, ?)', [id, roleId]);
        }
      }

      const updated = await AdminUserRepository.getUserById(id);
      if (!updated) throw ApiError.internal('Failed to retrieve updated user');
      return updated;
    });
  },

  async deleteUser(id: number): Promise<void> {
    const user = await AdminUserRepository.getUserById(id);
    if (!user) throw ApiError.notFound('User not found');
    await query.run('UPDATE users SET deleted_at = NOW(), is_active = 0 WHERE id = ?', [id]);
  },

  // Roles & Permissions
  async listRoles(): Promise<RoleDetail[]> {
    const roles = await query.rows<RoleRow & { description?: string | null; is_system: number }>(
      'SELECT id, name, slug, description, is_system, created_at, updated_at FROM roles ORDER BY id ASC'
    );

    const rolePerms = await query.rows<{
      role_id: number;
      id: number;
      name: string;
      permission_group: string | null;
      description: string | null;
    }>(
      `SELECT rp.role_id, p.id, p.name, p.permission_group, p.description
       FROM permissions p
       JOIN role_permissions rp ON rp.permission_id = p.id
       ORDER BY p.permission_group, p.name`
    );

    const map = new Map<number, { id: number; name: string; permission_group: string | null; description: string | null }[]>();
    for (const rp of rolePerms) {
      if (!map.has(rp.role_id)) {
        map.set(rp.role_id, []);
      }
      map.get(rp.role_id)!.push({
        id: rp.id,
        name: rp.name,
        permission_group: rp.permission_group,
        description: rp.description,
      });
    }

    return roles.map((r) => ({
      ...r,
      permissions: map.get(r.id) || [],
    }));
  },

  async listPermissions(): Promise<PermissionItem[]> {
    return query.rows<PermissionItem>(
      'SELECT id, name, permission_group, description FROM permissions ORDER BY permission_group, name'
    );
  },

  async updateRolePermissions(roleId: number, permissionIds: number[]): Promise<RoleDetail> {
    const role = await query.one<RoleRow>('SELECT id, name, slug FROM roles WHERE id = ?', [roleId]);
    if (!role) throw ApiError.notFound('Role not found');

    return withTransaction(async ({ conn }) => {
      await conn.execute('DELETE FROM role_permissions WHERE role_id = ?', [roleId]);
      for (const pId of permissionIds) {
        await conn.execute('INSERT IGNORE INTO role_permissions (role_id, permission_id) VALUES (?, ?)', [
          roleId,
          pId,
        ]);
      }

      const roles = await AdminUserRepository.listRoles();
      const updated = roles.find((r) => r.id === roleId);
      if (!updated) throw ApiError.internal('Role not found after update');
      return updated;
    });
  },

  async createRole(data: { name: string; slug: string; description?: string; permissionIds?: number[] }): Promise<RoleDetail> {
    const existing = await query.one<{ id: number }>('SELECT id FROM roles WHERE slug = ?', [data.slug]);
    if (existing) throw ApiError.conflict('Role slug already exists');

    return withTransaction(async ({ conn }) => {
      const [res] = await conn.execute(
        'INSERT INTO roles (name, slug, description, is_system) VALUES (?, ?, ?, 0)',
        [data.name, data.slug, data.description || null]
      );
      const roleId = (res as any).insertId;

      if (data.permissionIds && data.permissionIds.length > 0) {
        for (const pId of data.permissionIds) {
          await conn.execute('INSERT INTO role_permissions (role_id, permission_id) VALUES (?, ?)', [
            roleId,
            pId,
          ]);
        }
      }

      const roles = await AdminUserRepository.listRoles();
      const created = roles.find((r) => r.id === roleId);
      if (!created) throw ApiError.internal('Failed to retrieve newly created role');
      return created;
    });
  },
};
