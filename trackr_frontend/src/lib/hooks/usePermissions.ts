// src/lib/hooks/usePermissions.ts
'use client';

import { useSession } from 'next-auth/react';
import { useMemo } from 'react';

export function usePermissions() {
  const { data: session } = useSession();

  const hasPermission = useMemo(
    () => (resource: string, action: string) => {
      if (!session?.user?.permissions) return false;

      return session.user.permissions.some(
        (p) => p.resource === resource && p.action === action
      );
    },
    [session]
  );

  const hasRole = useMemo(
    () => (role: string) => {
      if (!session?.user?.role) return false;
      return session.user.role.name === role;
    },
    [session]
  );

  const canAccess = useMemo(
    () => (requirements: { resource?: string; action?: string; role?: string }) => {
      if (requirements.role && !hasRole(requirements.role)) {
        return false;
      }

      if (requirements.resource && requirements.action) {
        return hasPermission(requirements.resource, requirements.action);
      }

      return true;
    },
    [hasPermission, hasRole]
  );

  return {
    hasPermission,
    hasRole,
    canAccess,
    permissions: session?.user?.permissions || [],
    role: session?.user?.role,
  };
}