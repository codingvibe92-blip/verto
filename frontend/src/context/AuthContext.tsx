import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  ReactNode,
} from 'react';
import { AuthService } from '../services/auth';
import { AuthUserDto } from '../services/types';

interface AuthContextValue {
  user: AuthUserDto | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string, phone?: string) => Promise<void>;
  logout: () => void;
  hasPermission: (permission: string) => boolean;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUserDto | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const access = localStorage.getItem('crunchx_access');
    if (!access) {
      setLoading(false);
      return;
    }
    AuthService.me()
      .then(setUser)
      .catch(() => {
        localStorage.removeItem('crunchx_access');
        localStorage.removeItem('crunchx_refresh');
      })
      .finally(() => setLoading(false));
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const { tokens, user: u } = await AuthService.login({ email, password });
    localStorage.setItem('crunchx_access', tokens.accessToken);
    localStorage.setItem('crunchx_refresh', tokens.refreshToken);
    setUser(u);
  }, []);

  const register = useCallback(
    async (name: string, email: string, password: string, phone?: string) => {
      const { tokens, user: u } = await AuthService.register({ name, email, password, phone });
      localStorage.setItem('crunchx_access', tokens.accessToken);
      localStorage.setItem('crunchx_refresh', tokens.refreshToken);
      setUser(u);
    },
    []
  );

  const logout = useCallback(() => {
    localStorage.removeItem('crunchx_access');
    localStorage.removeItem('crunchx_refresh');
    setUser(null);
  }, []);

  const hasPermission = useCallback(
    (permission: string) => {
      if (!user) return false;
      if (user.roles.some((r) => r.slug === 'super-admin')) return true;
      return user.permissions.includes(permission);
    },
    [user]
  );

  const value = useMemo(
    () => ({ user, loading, login, register, logout, hasPermission }),
    [user, loading, login, register, logout, hasPermission]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}