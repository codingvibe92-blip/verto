import jwt, { SignOptions } from 'jsonwebtoken';
import { env } from '../config/env';
import { TokenPayload } from '../types';

type MaybePayload = Partial<TokenPayload>;

export function signAccessToken(userId: number): string {
  return jwt.sign({ type: 'access', sub: userId } as MaybePayload, env.jwt.secret, {
    expiresIn: env.jwt.expiresIn as unknown as SignOptions['expiresIn'],
  } as SignOptions);
}

export function signRefreshToken(userId: number): string {
  return jwt.sign({ type: 'refresh', sub: userId } as MaybePayload, env.jwt.refreshSecret, {
    expiresIn: env.jwt.refreshExpiresIn as unknown as SignOptions['expiresIn'],
  } as SignOptions);
}

function parsePayload(raw: string | jwt.JwtPayload): TokenPayload | null {
  if (typeof raw === 'string') return null;
  if (typeof raw.sub !== 'number' || (raw.type !== 'access' && raw.type !== 'refresh')) return null;
  return {
    sub: raw.sub,
    type: raw.type,
    iat: raw.iat ?? 0,
    exp: raw.exp ?? 0,
  };
}

export function verifyRefreshToken(token: string): TokenPayload | null {
  try {
    const payload = jwt.verify(token, env.jwt.refreshSecret);
    const parsed = parsePayload(payload);
    if (!parsed || parsed.type !== 'refresh') return null;
    return parsed;
  } catch {
    return null;
  }
}

export function verifyAccessToken(token: string): TokenPayload | null {
  try {
    const payload = jwt.verify(token, env.jwt.secret);
    const parsed = parsePayload(payload);
    if (!parsed || parsed.type !== 'access') return null;
    return parsed;
  } catch {
    return null;
  }
}