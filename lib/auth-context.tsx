'use client';

/**
 * Lion School Authentication Context
 * Manages user authentication state globally
 */

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import Cookies from 'js-cookie';
import { authAPI } from './api-client';

interface User {
  id: number;
  email: string;
  username: string;
  first_name: string;
  last_name: string;
  avatar_url?: string;
  role: 'student' | 'lecturer' | 'admin';
  bio?: string;
  phone_number?: string;
  date_of_birth?: string;
  is_email_verified: boolean;
  created_at: string;
  updated_at: string;
}

export const getDashboardPath = (role?: User['role']) => {
  if (role === 'lecturer') return '/lecturer/dashboard';
  return '/dashboard';
};

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  register: (data: any) => Promise<any>;
  login: (email: string, password: string) => Promise<any>;
  logout: () => Promise<void>;
  updateProfile: (data: any) => Promise<any>;
  fetchProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const persistAuth = (token?: string, refresh?: string, userData?: User) => {
  if (token) {
    Cookies.set('auth_token', token, { expires: 7 });
  }
  if (refresh) {
    Cookies.set('refresh_token', refresh, { expires: 7 });
  }
  if (userData) {
    Cookies.set('user_data', JSON.stringify(userData), { expires: 7 });
  }
};

const clearAuth = () => {
  Cookies.remove('auth_token');
  Cookies.remove('refresh_token');
  Cookies.remove('user_data');
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize auth from cookies
  useEffect(() => {
    const initAuth = async () => {
      try {
        const token = Cookies.get('auth_token');
        if (token) {
          const response = await authAPI.profile();
          setUser(response.data);
        }
      } catch (error) {
        console.error('Failed to fetch profile:', error);
        clearAuth();
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, []);

  const register = async (data: any) => {
    try {
      const registerResponse = await authAPI.register(data);

      // Register endpoint may not return tokens; exchange credentials via login.
      const loginResponse = await authAPI.login(data.email, data.password);
      const authPayload = loginResponse.data;
      const newUser = authPayload.user || registerResponse.data?.user;
      const token = authPayload.access || authPayload.token;
      const refresh = authPayload.refresh;

      persistAuth(token, refresh, newUser);
      setUser(newUser);
      return { ...registerResponse.data, ...authPayload };
    } catch (error) {
      throw error;
    }
  };

  const login = async (email: string, password: string) => {
    try {
      const response = await authAPI.login(email, password);
      const { user: loggedInUser, token, access, refresh } = response.data;
      persistAuth(access || token, refresh, loggedInUser);
      setUser(loggedInUser);
      return response.data;
    } catch (error) {
      throw error;
    }
  };

  const logout = async () => {
    try {
      await authAPI.logout();
      setUser(null);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const updateProfile = async (data: any) => {
    try {
      const response = await authAPI.updateProfile(data);
      setUser(response.data);
      Cookies.set('user_data', JSON.stringify(response.data), { expires: 7 });
      return response.data;
    } catch (error) {
      throw error;
    }
  };

  const fetchProfile = async () => {
    try {
      const response = await authAPI.profile();
      setUser(response.data);
    } catch (error) {
      console.error('Failed to fetch profile:', error);
      clearAuth();
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        register,
        login,
        logout,
        updateProfile,
        fetchProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
