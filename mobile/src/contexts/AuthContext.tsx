import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';
import { authApi, userApi } from '../services/api';
import { storage } from '../services/storage';

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (college_email: string, password: string) => Promise<User>;
  register: (data: {
    college_email: string;
    password: string;
    first_name: string;
    last_name: string;
    college: string;
    department: string;
    year: string;
  }) => Promise<User>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  isAdmin: boolean;
  isVerified: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const savedToken = await storage.getToken();
        const savedUser = await storage.getUser();

        if (savedToken) {
          setToken(savedToken);
          if (savedUser) {
            setUser(savedUser);
          }
          try {
            const me = await authApi.getMe();
            setUser(me);
            await storage.setUser(me);
          } catch {
            // Token may be invalid or server unreachable
          }
        }
      } catch (err) {
        console.error('Failed to restore auth session:', err);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const login = async (college_email: string, password: string): Promise<User> => {
    const res = await authApi.login({ college_email, password });
    setToken(res.access_token);
    setUser(res.user);
    await storage.setToken(res.access_token);
    await storage.setUser(res.user);
    return res.user;
  };

  const register = async (data: {
    college_email: string;
    password: string;
    first_name: string;
    last_name: string;
    college: string;
    department: string;
    year: string;
  }): Promise<User> => {
    const res = await authApi.register(data);
    setToken(res.access_token);
    setUser(res.user);
    await storage.setToken(res.access_token);
    await storage.setUser(res.user);
    return res.user;
  };

  const logout = async (): Promise<void> => {
    setToken(null);
    setUser(null);
    await storage.clearAll();
  };

  const refreshUser = async (): Promise<void> => {
    try {
      const me = await authApi.getMe();
      setUser(me);
      await storage.setUser(me);
    } catch (err) {
      console.error('Failed to refresh user:', err);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        register,
        logout,
        refreshUser,
        isAdmin: user?.role === 'admin',
        isVerified: user?.verification_status === 'verified',
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
