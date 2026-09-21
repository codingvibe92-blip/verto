import type { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { TokenPayload } from '../types';
import { ApiError } from '../utils/errors';
import { UserModel } from '../models/user.model';

function extractToken(req: Request): string | null {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) return null;
  return header.slice(7).trim();
}

export async function authenticate(req: Request, _res: Response, next: NextFunction): Promise<void> {
  try {
    const token = extractToken(req);
    if (!token) throw ApiError.unauthorized('Access token missing');

    let payload: TokenPayload;
    try {
      const decoded = jwt.verify(token, env.jwt.secret);
      if (typeof decoded === 'string') throw new Error('invalid payload');
      if (decoded.type !== 'access' || typeof decoded.sub !== 'number') {
        throw new Error('invalid token type');
      }
      payload = { sub: decoded.sub, type: decoded.type, iat: decoded.iat ?? 0, exp: decoded.exp ?? 0 };
    } catch {
      throw ApiError.unauthorized('Invalid or expired access token');
    }

    const user = await UserModel.findById(payload.sub);
    if (!user || !user.is_active || user.deleted_at) {
      throw ApiError.unauthorized('Account is inactive or does not exist');
    }

    const authUser = {
      id: user.id,
      name: user.name,
      email: user.email,
      roles: user.roles,
      permissions: user.permissions,
    };
    req.user = authUser;
    next();
  } catch (err) {
    next(err);
  }
}

export async function authenticateOptional(req: Request, _res: Response, next: NextFunction): Promise<void> {
  try {
    const token = extractToken(req);
    if (!token) return next();

    const decoded = jwt.verify(token, env.jwt.secret);
    if (typeof decoded !== 'string' && decoded.type === 'access' && typeof decoded.sub === 'number') {
      const user = await UserModel.findById(decoded.sub);
      if (user && user.is_active && !user.deleted_at) {
        req.user = {
          id: user.id,
          name: user.name,
          email: user.email,
          roles: user.roles,
          permissions: user.permissions,
        };
      }
    }
  } catch {
    // Ignore invalid optional tokens
  }
  next();
}

export function authorizeRole(...slugs: string[]) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const user = req.user;
    if (!user) throw ApiError.unauthorized();
    const has = user.roles.some((role) => slugs.includes(role.slug));
    if (!has) throw ApiError.forbidden('You do not have permission to access this resource');
    next();
  };
}

export function authorizePermission(permission: string) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const user = req.user;
    if (!user) throw ApiError.unauthorized();
    if (user.permissions.includes(permission) || user.roles.some((r) => r.slug === 'super-admin')) {
      next();
      return;
    }
    throw ApiError.forbidden(`Permission required: ${permission}`);
  };
}