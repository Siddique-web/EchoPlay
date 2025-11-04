import { apiService } from '@/services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react';

interface User {
  id: number;
  email: string;
  name: string;
  profile_image: string | null;
  created_at: string;
  is_admin?: boolean;
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
    const checkAuthStatus = async () => {
      try {
        // First check if there's a stored token
        const token = await apiService.getStoredToken();
        if (token) {
          // If there's a token, try to get the current user profile
          const result = await apiService.getProfile();
          if (result.success) {
            setUser(result.user);
          }
        }
      } catch (error) {
        console.log('Error checking auth status:', error);
      }
      setLoading(false);
    };

    checkAuthStatus();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const result = await apiService.login(email, password);
      if (result.success) {
        setUser(result.user);
      } else {
        throw new Error(result.error || 'Invalid credentials');
      }
    } catch (error) {
      // Error is already logged in the service, just rethrow
      throw error;
    }
  };

  const register = async (name: string, email: string, password: string) => {
    try {
      const result = await apiService.register(email, password, name);
      if (result.success) {
        setUser(result.user);
      } else {
        throw new Error(result.error || 'Registration failed');
      }
    } catch (error) {
      // Error is already logged in the service, just rethrow
      throw error;
    }
  };

  const logout = async () => {
    try {
      await apiService.logout();
      setUser(null);
      
      // Remove biometric credentials on logout
      await AsyncStorage.removeItem('biometricCredentials');
    } catch (error) {
      // Error is already logged in the service, just rethrow
      throw error;
    }
  };

  const refreshUser = async () => {
    try {
      const result = await apiService.getProfile();
      if (result.success) {
        setUser(result.user);
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