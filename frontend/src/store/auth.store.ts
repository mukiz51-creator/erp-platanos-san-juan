'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import * as types from '@/types/api';
import { apiService } from '@/services/api.service';

interface AuthStore {
  usuario: types.Usuario | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  clearError: () => void;
}

export const useAuthStore = create<AuthStore>(
  persist(
    (set) => ({
      usuario: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      login: async (email: string, password: string) => {
        set({ isLoading: true, error: null });
        try {
          await apiService.login(email, password);
          const usuario = await apiService.getMe();
          set({ usuario, isAuthenticated: true, isLoading: false });
        } catch (error: any) {
          set({ error: error.message || 'Error', isLoading: false });
          throw error;
        }
      },

      logout: () => {
        apiService.logout();
        set({ usuario: null, isAuthenticated: false });
      },

      clearError: () => set({ error: null }),
    }),
    { name: 'auth-store' }
  )
);