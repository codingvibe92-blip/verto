import type { Request, Response } from 'express';
import { asyncHandler } from '../middleware/validate';
import { AdminUserRepository } from '../repositories/admin-user.repository';

export const AdminUserController = {
  listUsers: asyncHandler(async (req: Request, res: Response) => {
    const page = req.query.page ? parseInt(String(req.query.page), 10) : 1;
    const limit = req.query.limit ? parseInt(String(req.query.limit), 10) : 20;
    const search = req.query.search ? String(req.query.search) : undefined;
    const roleId = req.query.role_id ? parseInt(String(req.query.role_id), 10) : undefined;
    const isActive = req.query.is_active !== undefined ? req.query.is_active === 'true' || req.query.is_active === '1' : undefined;

    const result = await AdminUserRepository.listUsers({ page, limit, search, roleId, isActive });
    res.json({
      success: true,
      message: 'Users retrieved',
      data: result.users,
      pagination: {
        page: result.page,
        limit: result.limit,
        total: result.total,
        totalPages: Math.ceil(result.total / result.limit),
      },
    });
  }),

  getUser: asyncHandler(async (req: Request, res: Response) => {
    const id = parseInt(req.params.id, 10);
    const user = await AdminUserRepository.getUserById(id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    res.json({ success: true, message: 'User retrieved', data: user });
  }),

  createUser: asyncHandler(async (req: Request, res: Response) => {
    const { name, email, password, phone, is_active, role_ids } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Name, email, and password are required' });
    }
    const user = await AdminUserRepository.createUser({
      name,
      email,
      password,
      phone,
      isActive: is_active,
      roleIds: role_ids,
    });
    res.status(201).json({ success: true, message: 'User created successfully', data: user });
  }),

  updateUser: asyncHandler(async (req: Request, res: Response) => {
    const id = parseInt(req.params.id, 10);
    const { name, email, phone, password, is_active, role_ids } = req.body;
    const user = await AdminUserRepository.updateUser(id, {
      name,
      email,
      phone,
      password: password || undefined,
      isActive: is_active,
      roleIds: role_ids,
    });
    res.json({ success: true, message: 'User updated successfully', data: user });
  }),

  deleteUser: asyncHandler(async (req: Request, res: Response) => {
    const id = parseInt(req.params.id, 10);
    await AdminUserRepository.deleteUser(id);
    res.json({ success: true, message: 'User deactivated successfully' });
  }),

  listRoles: asyncHandler(async (_req: Request, res: Response) => {
    const roles = await AdminUserRepository.listRoles();
    res.json({ success: true, message: 'Roles retrieved', data: roles });
  }),

  listPermissions: asyncHandler(async (_req: Request, res: Response) => {
    const permissions = await AdminUserRepository.listPermissions();
    res.json({ success: true, message: 'Permissions retrieved', data: permissions });
  }),

  updateRolePermissions: asyncHandler(async (req: Request, res: Response) => {
    const roleId = parseInt(req.params.id, 10);
    const { permission_ids } = req.body;
    if (!Array.isArray(permission_ids)) {
      return res.status(400).json({ success: false, message: 'permission_ids must be an array of IDs' });
    }
    const role = await AdminUserRepository.updateRolePermissions(roleId, permission_ids);
    res.json({ success: true, message: 'Role permissions updated successfully', data: role });
  }),

  createRole: asyncHandler(async (req: Request, res: Response) => {
    const { name, slug, description, permission_ids } = req.body;
    if (!name || !slug) {
      return res.status(400).json({ success: false, message: 'Role name and slug are required' });
    }
    const role = await AdminUserRepository.createRole({
      name,
      slug,
      description,
      permissionIds: permission_ids,
    });
    res.status(201).json({ success: true, message: 'Role created successfully', data: role });
  }),
};
