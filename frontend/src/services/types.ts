export interface RoleDto {
  id: number;
  slug: string;
  name: string;
}

export interface AuthUserDto {
  id: number;
  name: string;
  email: string;
  roles: RoleDto[];
  permissions: string[];
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
  phone?: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  pages?: number;
  totalPages?: number;
}

export interface Paginated<T> {
  rows: T[];
  meta: PaginationMeta;
}