import { Router } from 'express';
import { AdminUserController } from '../controllers/admin-user.controller';
import { authenticate, authorizePermission } from '../middleware/auth';

const router = Router();

// Staff User management
router.get('/users', authenticate, authorizePermission('users.view'), AdminUserController.listUsers);
router.get('/users/:id', authenticate, authorizePermission('users.view'), AdminUserController.getUser);
router.post('/users', authenticate, authorizePermission('users.create'), AdminUserController.createUser);
router.put('/users/:id', authenticate, authorizePermission('users.update'), AdminUserController.updateUser);
router.delete('/users/:id', authenticate, authorizePermission('users.delete'), AdminUserController.deleteUser);

// Roles & Permissions management
router.get('/roles', authenticate, authorizePermission('roles.view'), AdminUserController.listRoles);
router.post('/roles', authenticate, authorizePermission('roles.create'), AdminUserController.createRole);
router.get('/permissions', authenticate, authorizePermission('roles.view'), AdminUserController.listPermissions);
router.put('/roles/:id/permissions', authenticate, authorizePermission('roles.update'), AdminUserController.updateRolePermissions);

export default router;
