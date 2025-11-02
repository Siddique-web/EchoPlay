import { getCurrentUser, loginUser as loginUserService, logout as logoutService, registerUser as registerUserService } from '@/utils/db/database';
import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react';

interface User {
  id: number;
  email: string;
  name: string;
  profile_image: string | null;
  created_at: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is already logged in
    try {
      const currentUser = getCurrentUser();
      if (currentUser) {
        setUser(currentUser);
      }
    } catch (error) {
      console.log('Error getting current user:', error);
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const userData = await loginUserService(email, password);
      if (userData) {
        setUser(userData);
      } else {
        throw new Error('Invalid credentials');
      }
    } catch (error) {
      // Error is already logged in the service, just rethrow
      throw error;
    }
  };

  const register = async (name: string, email: string, password: string) => {
    try {
      await registerUserService(email, password, name);
      // After registration, login the user
      const userData = await loginUserService(email, password);
      setUser(userData);
    } catch (error) {
      // Error is already logged in the service, just rethrow
      throw error;
    }
  };

  const logout = async () => {
    try {
      await logoutService();
      setUser(null);
    } catch (error) {
      // Error is already logged in the service, just rethrow
      throw error;
    }
  };

  const refreshUser = async () => {
    try {
      const currentUser = getCurrentUser();
      if (currentUser) {
        setUser(currentUser);
      }
    } catch (error) {
      console.log('Error refreshing user:', error);
    }
  };

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}