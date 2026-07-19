import { create } from 'zustand';
import { axios } from '@/shared/utils/axios';

interface User {
  id: string;
  username: string;
  role: 'Admin' | 'Teacher' | 'Student';
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  setUser: (user: User | null) => void;
  fetchUser: () => Promise<User | null>;
  logout: () => Promise<void>;
}

export const useAuth = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  setUser: (user) => set({ user, isAuthenticated: !!user, isLoading: false }),
  fetchUser: async () => {
    set({ isLoading: true });
    try {
      const response = await axios.get('/user');
      const user = response.data.data;
      set({ user, isAuthenticated: true, isLoading: false });
      return user;
    } catch {
      set({ user: null, isAuthenticated: false, isLoading: false });
      return null;
    }
  },
  logout: async () => {
    try {
      await axios.post('/auth/logout');
    } catch (e) {
      console.error('Logout error:', e);
    } finally {
      set({ user: null, isAuthenticated: false, isLoading: false });
      window.location.href = '/login';
    }
  },
}));
