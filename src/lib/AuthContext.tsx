import { createContext, useContext, useEffect, useState } from 'react';
import { salonsApi } from '@/api/salons';
import { clearAdminKey, getAdminKey, onUnauthorized, setAdminKey } from './adminKey';
import { ApiError } from './apiClient';

type AuthStatus = 'checking' | 'authed' | 'unauthed';

type AuthContextValue = {
  status: AuthStatus;
  login: (key: string) => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [status, setStatus] = useState<AuthStatus>('checking');

  useEffect(() => {
    onUnauthorized(() => setStatus('unauthed'));

    const existingKey = getAdminKey();
    if (!existingKey) {
      setStatus('unauthed');
      return;
    }
    salonsApi
      .list()
      .then(() => setStatus('authed'))
      .catch(() => setStatus('unauthed'));
  }, []);

  const login = async (key: string) => {
    setAdminKey(key);
    try {
      await salonsApi.list();
      setStatus('authed');
    } catch (error) {
      clearAdminKey();
      if (error instanceof ApiError && error.status === 401) {
        throw new Error('관리자 키가 올바르지 않아요.');
      }
      throw new Error('서버에 연결하지 못했어요. 주소를 확인해 주세요.');
    }
  };

  const logout = () => {
    clearAdminKey();
    setStatus('unauthed');
  };

  return (
    <AuthContext.Provider value={{ status, login, logout }}>{children}</AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return ctx;
}
