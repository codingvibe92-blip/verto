import axios, { AxiosError } from 'axios';

export interface ApiErrorBody {
  success: false;
  message: string;
  errors?: { path: string; message: string }[];
}

const client = axios.create({
  baseURL: '/api/v1',
  headers: { 'Content-Type': 'application/json' },
});

client.interceptors.request.use((config) => {
  const token = localStorage.getItem('crunchx_access');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

let refreshing: Promise<string | null> | null = null;

async function refreshAccess(): Promise<string | null> {
  const refreshToken = localStorage.getItem('crunchx_refresh');
  if (!refreshToken) return null;
  try {
    const res = await axios.post('/api/v1/auth/refresh', { refreshToken });
    const tokens = res.data.data;
    localStorage.setItem('crunchx_access', tokens.accessToken);
    localStorage.setItem('crunchx_refresh', tokens.refreshToken);
    return tokens.accessToken as string;
  } catch {
    localStorage.removeItem('crunchx_access');
    localStorage.removeItem('crunchx_refresh');
    return null;
  }
}

client.interceptors.response.use(
  (res) => res,
  async (error: AxiosError) => {
    const original = error.config as (typeof error.config & { _retry?: boolean }) | undefined;
    if (error.response?.status === 401 && original && !original._retry && original.url !== '/auth/login') {
      original._retry = true;
      refreshing = refreshing ?? refreshAccess();
      const token = await refreshing;
      refreshing = null;
      if (token) {
        original.headers.Authorization = `Bearer ${token}`;
        return client(original);
      }
    }
    return Promise.reject(error);
  }
);

export function apiErrorMessage(err: unknown): string {
  if (axios.isAxiosError(err)) {
    const body = err.response?.data as ApiErrorBody | undefined;
    if (body?.message) return body.message;
  }
  return 'Something went wrong';
}

export default client;