import React, { createContext, useState, useEffect, useContext } from 'react';
import * as SecureStore from 'expo-secure-store';
import { useQueryClient } from '@tanstack/react-query';
import { router } from 'expo-router';
import api, { registerUnauthorizedHandler } from '../services/api';
import { User, AuthResponse } from '../types';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (username: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const queryClient = useQueryClient();

  // Load persisted session on startup
  useEffect(() => {
    const restoreSession = async () => {
      try {
        const storedToken = await SecureStore.getItemAsync('token');
        const storedUser = await SecureStore.getItemAsync('user');

        if (storedToken && storedUser) {
          setToken(storedToken);
          setUser(JSON.parse(storedUser));
        }
      } catch (err) {
        console.error('Failed to restore authentication session:', err);
      } finally {
        setLoading(false);
      }
    };

    restoreSession();
  }, []);

  // Register unauthorized responder to clear auth states on 401 responses
  useEffect(() => {
    registerUnauthorizedHandler(() => {
      handleSessionCleanup();
    });
  }, []);

  const handleSessionCleanup = async () => {
    try {
      await SecureStore.deleteItemAsync('token');
      await SecureStore.deleteItemAsync('user');
    } catch (err) {
      console.error('Failed to delete store keys:', err);
    }
    setToken(null);
    setUser(null);
    queryClient.clear();
    // Redirect to login screen
    router.replace('/(auth)/login');
  };

  const login = async (email: string, password: string) => {
    try {
      setLoading(true);
      const response = await api.post<AuthResponse>('/auth/login', { email, password });
      const { token: receivedToken, _id, username, email: receivedEmail } = response.data;

      const newUser: User = {
        _id,
        username,
        email: receivedEmail,
        favorites: [],
        watchHistory: []
      };

      // Encrypt and store keys locally
      await SecureStore.setItemAsync('token', receivedToken);
      await SecureStore.setItemAsync('user', JSON.stringify(newUser));

      setToken(receivedToken);
      setUser(newUser);
      
      // Navigate to main tab stack
      router.replace('/(tabs)');
    } catch (err: any) {
      const msg = err.response?.data?.error?.message || 'Login failed. Please check credentials.';
      throw new Error(msg);
    } finally {
      setLoading(false);
    }
  };

  const register = async (username: string, email: string, password: string) => {
    try {
      setLoading(true);
      const response = await api.post<AuthResponse>('/auth/register', { username, email, password });
      const { token: receivedToken, _id, username: receivedUsername, email: receivedEmail } = response.data;

      const newUser: User = {
        _id,
        username: receivedUsername,
        email: receivedEmail,
        favorites: [],
        watchHistory: []
      };

      // Store credentials locally
      await SecureStore.setItemAsync('token', receivedToken);
      await SecureStore.setItemAsync('user', JSON.stringify(newUser));

      setToken(receivedToken);
      setUser(newUser);

      // Navigate to main tab stack
      router.replace('/(tabs)');
    } catch (err: any) {
      const msg = err.response?.data?.error?.message || 'Registration failed.';
      throw new Error(msg);
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    await handleSessionCleanup();
    setLoading(false);
  };

  const isAuthenticated = !!token;

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated,
        loading,
        login,
        register,
        logout
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
