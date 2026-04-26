import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';
import { AuthContextType, User } from '../types';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      if (token) {
        try {
          const userData = await api.getCurrentUser();
          setUser(userData);
        } catch (error) {
          console.error('Failed to fetch user:', error);
          localStorage.removeItem('token');
          setToken(null);
        }
      }
      setIsLoading(false);
    };

    initAuth();
  }, [token]);

  const login = async (email: string, password: string) => {
    try {
      const data = await api.login(email, password);
      setToken(data.token);
      setUser(data.user);
      localStorage.setItem('token', data.token);
    } catch (error) {
      throw error;
    }
  };

  const register = async (email: string, password: string, name: string) => {
    try {
      const data = await api.register(email, password, name);
      setToken(data.token);
      setUser(data.user);
      localStorage.setItem('token', data.token);
    } catch (error) {
      throw error;
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
  };

  return (
    <AuthContext.Provider value={{ user, token, login, register, logout, isLoading }}>
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
