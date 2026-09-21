import client, { apiErrorMessage } from '../api/client';
import { Paginated } from './types';

export interface AdminUser {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  avatar_url: string | null;
  is_active: number | boolean;
  is_email_verified: number | boolean;
  last_login_at: string | null;
  created_at: string;
  roles: { id: number; name: string; slug: string }[];
}

export interface Role {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  is_system: number;
  permissions: {
    id: number;
    name: string;
    permission_group: string | null;
    description: string | null;
  }[];
}

export interface Permission {
  id: number;
  name: string;
  permission_group: string | null;
  description: string | null;
}

export const AdminUserService = {
  async listUsers(params: Record<string, unknown> = {}): Promise<Paginated<AdminUser>> {
    const res = await client.get('/users', { params });
    return {
      rows: res.data.data,
      meta: res.data.pagination || { total: res.data.data.length, page: 1, limit: 20, totalPages: 1 },
    };
  },

  async getUser(id: number): Promise<AdminUser> {
    const res = await client.get(`/users/${id}`);
    return res.data.data;
  },

  async createUser(data: {
    name: string;
    email: string;
    password: string;
    phone?: string;
    is_active?: boolean;
    role_ids?: number[];
  }): Promise<AdminUser> {
    const res = await client.post('/users', data);
    return res.data.data;
  },

  async updateUser(
    id: number,
    data: {
      name?: string;
      email?: string;
      phone?: string;
      password?: string;
      is_active?: boolean;
      role_ids?: number[];
    }
  ): Promise<AdminUser> {
    const res = await client.put(`/users/${id}`, data);
    return res.data.data;
  },

  async deleteUser(id: number): Promise<void> {
    await client.delete(`/users/${id}`);
  },

  async listRoles(): Promise<Role[]> {
    const res = await client.get('/roles');
    return res.data.data;
  },

  async listPermissions(): Promise<Permission[]> {
    const res = await client.get('/permissions');
    return res.data.data;
  },

  async updateRolePermissions(roleId: number, permissionIds: number[]): Promise<Role> {
    const res = await client.put(`/roles/${roleId}/permissions`, { permission_ids: permissionIds });
    return res.data.data;
  },

  async createRole(data: { name: string; slug: string; description?: string; permission_ids?: number[] }): Promise<Role> {
    const res = await client.post('/roles', data);
    return res.data.data;
  },

  errorMessage(err: unknown) {
    return apiErrorMessage(err);
  },
};
