import client, { apiErrorMessage } from '../api/client';
import {
  AuthTokens,
  AuthUserDto,
  LoginPayload,
  RegisterPayload,
} from './types';

export const AuthService = {
  async login(payload: LoginPayload): Promise<{ tokens: AuthTokens; user: AuthUserDto }> {
    const res = await client.post('/auth/login', payload);
    const data = res.data?.data ?? res.data ?? {};
    const tokens: AuthTokens = data.tokens ?? {
      accessToken: data.accessToken ?? '',
      refreshToken: data.refreshToken ?? '',
    };
    return { tokens, user: data.user };
  },

  async register(payload: RegisterPayload): Promise<{ tokens: AuthTokens; user: AuthUserDto }> {
    const res = await client.post('/auth/register', payload);
    const data = res.data?.data ?? res.data ?? {};
    const tokens: AuthTokens = data.tokens ?? {
      accessToken: data.accessToken ?? '',
      refreshToken: data.refreshToken ?? '',
    };
    return { tokens, user: data.user };
  },

  async me(): Promise<AuthUserDto> {
    const res = await client.get('/auth/me');
    return res.data?.data ?? res.data;
  },

  errorMessage(err: unknown): string {
    return apiErrorMessage(err);
  },
};