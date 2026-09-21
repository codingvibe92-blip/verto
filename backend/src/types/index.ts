export interface RoleRow {
  id: number;
  slug: string;
  name: string;
}

export interface AuthUser {
  id: number;
  name: string;
  email: string;
  roles: RoleRow[];
  permissions: string[];
}

export interface UserRow {
  id: number;
  name: string;
  email: string;
  password_hash: string;
  phone: string | null;
  avatar_url: string | null;
  is_active: number;
  is_email_verified: number;
  email_verified_at: string | null;
  last_login_at: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface TokenPayload {
  sub: number;
  type: 'access' | 'refresh';
  iat: number;
  exp: number;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

export interface ListResponse<T> {
  rows: T[];
  meta: PaginationMeta;
}