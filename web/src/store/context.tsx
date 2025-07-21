import {
  createContext,
  useState,
  ReactNode,
  FC,
} from 'react';
import { AuthContextType, User } from '../types';
import useApi from '../hooks/useApi';

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const { request } = useApi();

  const login = async (id: string) => {
    try {
      const response = await request({
        resource: '/auth/login',
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: {id}
      })

      if (response.error || !response.user) {
        throw new Error(response.error || 'Login failed');
      }
      setToken(response?.token)
      setUser(response?.user)

    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
