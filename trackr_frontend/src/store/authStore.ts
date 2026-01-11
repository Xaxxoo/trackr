// src/store/authStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User, Permission } from '@/types/auth.types';

interface AuthState {
  user: User | null;
  permissions: Permission[];
  isAuthenticated: boolean;
  
  // Actions
  setUser: (user: User | null) => void;
  setPermissions: (permissions: Permission[]) => void;
  logout: () => void;
  hasPermission: (resource: string, action: string) => boolean;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      permissions: [],
      isAuthenticated: false,

      setUser: (user) =>
        set({ user, isAuthenticated: !!user }),

      setPermissions: (permissions) =>
        set({ permissions }),

      logout: () =>
        set({ user: null, permissions: [], isAuthenticated: false }),

      hasPermission: (resource, action) => {
        const { permissions } = get();
        return permissions.some(
          (p) => p.resource === resource && p.action === action
        );
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        permissions: state.permissions,
      }),
    }
  )
);