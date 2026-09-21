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
    return res.data.data;
  },

  async register(payload: RegisterPayload): Promise<{ tokens: AuthTokens; user: AuthUserDto }> {
    const res = await client.post('/auth/register', payload);
    return res.data.data;
  },

  async me(): Promise<AuthUserDto> {
    const res = await client.get('/auth/me');
    return res.data.data;
  },

  errorMessage(err: unknown): string {
    return apiErrorMessage(err);
  },
};