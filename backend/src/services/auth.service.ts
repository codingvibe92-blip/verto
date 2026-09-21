import { UserModel, UserWithAccess } from '../models/user.model';
import { LoginBody, RegisterBody } from '../validators/auth.validator';
import { ApiError } from '../utils/errors';
import { hashPassword, verifyPassword } from '../utils/password';
import { signAccessToken, signRefreshToken, verifyRefreshToken } from '../utils/jwt';
import { query } from '../database/pool';

export interface AuthResult {
  accessToken: string;
  refreshToken: string;
  user: {
    id: number;
    name: string;
    email: string;
    roles: { slug: string; name: string }[];
    permissions: string[];
  };
}

export const AuthService = {
  async login(body: LoginBody): Promise<AuthResult> {
    const user = await UserModel.findByEmail(body.email);
    if (!user) throw ApiError.unauthorized('Invalid email or password');

    if (!user.is_active) throw ApiError.unauthorized('Account is deactivated');

    const valid = await verifyPassword(body.password, user.password_hash);
    if (!valid) throw ApiError.unauthorized('Invalid email or password');

    await UserModel.updateLastLogin(user.id);

    return this.buildAuthResult(user);
  },

  async register(body: RegisterBody): Promise<AuthResult> {
    const existing = await UserModel.findByEmail(body.email);
    if (existing) throw ApiError.conflict('Email is already registered');

    const passwordHash = await hashPassword(body.password);
    const userId = await UserModel.create({
      name: body.name,
      email: body.email,
      passwordHash,
      phone: body.phone ?? null,
    });

    const roleRow = await query.one<{ id: number }>(
      "SELECT id FROM roles WHERE slug = 'customer'"
    );
    if (roleRow) {
      await UserModel.assignRole(userId, roleRow.id);
    }

    const user = await UserModel.findById(userId);
    if (!user) throw ApiError.internal('Failed to create user');

    return this.buildAuthResult(user);
  },

  async refresh(refreshToken: string): Promise<{ accessToken: string; refreshToken: string }> {
    const payload = verifyRefreshToken(refreshToken);
    if (!payload) throw ApiError.unauthorized('Invalid refresh token');

    const user = await UserModel.findById(payload.sub);
    if (!user || !user.is_active) throw ApiError.unauthorized('Account is inactive');

    return {
      accessToken: signAccessToken(user.id),
      refreshToken: signRefreshToken(user.id),
    };
  },

  buildAuthResult(user: UserWithAccess): any {
    const accessToken = signAccessToken(user.id);
    const refreshToken = signRefreshToken(user.id);
    return {
      accessToken,
      refreshToken,
      tokens: {
        accessToken,
        refreshToken,
      },
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        roles: user.roles,
        permissions: user.permissions,
      },
    };
  },
};