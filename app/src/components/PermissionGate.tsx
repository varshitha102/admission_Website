import { ReactNode } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { UserRole } from '@/types';

interface PermissionGateProps {
  children: ReactNode;
  allowedRoles?: UserRole[];
  fallback?: ReactNode;
  requireAdmin?: boolean;
  requireManager?: boolean;
  requireEdit?: boolean;
  leadAssignedTo?: number;
}

export function PermissionGate({
  children,
  allowedRoles,
  fallback = null,
  requireAdmin = false,
  requireManager = false,
  requireEdit = false,
  leadAssignedTo,
}: PermissionGateProps) {
  const { user, role, isAdmin, isManager } = useAuth();

  if (!user || !role) {
    return <>{fallback}</>;
  }

  // Check admin requirement
  if (requireAdmin && !isAdmin) {
    return <>{fallback}</>;
  }

  // Check manager requirement
  if (requireManager && !isManager) {
    return <>{fallback}</>;
  }

  // Check allowed roles
  if (allowedRoles && !allowedRoles.includes(role)) {
    return <>{fallback}</>;
  }

  // Check edit permission for leads
  if (requireEdit && leadAssignedTo !== undefined) {
    // Admin and Team Lead can edit all
    if (isAdmin || role === 'Team Lead') {
      return <>{children}</>;
    }
    // Others can only edit their assigned leads
    if (leadAssignedTo !== user.id) {
      return <>{fallback}</>;
    }
  }

  return <>{children}</>;
}

// Hook for permission checks
export function usePermission() {
  const { user, role, isAdmin, isTeamLead, isManager } = useAuth();

  const hasRole = (roles: UserRole[]): boolean => {
    return role ? roles.includes(role) : false;
  };

  const canAccessLead = (leadAssignedTo?: number): boolean => {
    if (!user || !role) return false;
    if (isAdmin) return true;
    if (role === 'Team Lead') return true;
    if (role === 'Executive') return leadAssignedTo === user.id;
    if (role === 'Consultant') return leadAssignedTo === user.id;
    return false;
  };

  const canEditLead = (leadAssignedTo?: number): boolean => {
    if (!user || !role) return false;
    if (isAdmin || role === 'Team Lead') return true;
    return leadAssignedTo === user.id;
  };

  const canDeleteLead = (): boolean => {
    return isAdmin;
  };

  const canAccessApplication = (leadAssignedTo?: number): boolean => {
    return canAccessLead(leadAssignedTo);
  };

  const canManageUsers = (): boolean => {
    return isAdmin;
  };

  const canManageSettings = (): boolean => {
    return isAdmin || isTeamLead;
  };

  const canViewReports = (): boolean => {
    return isAdmin || isTeamLead || role === 'Digital Manager';
  };

  const canManageAutomation = (): boolean => {
    return isAdmin;
  };

  return {
    hasRole,
    canAccessLead,
    canEditLead,
    canDeleteLead,
    canAccessApplication,
    canManageUsers,
    canManageSettings,
    canViewReports,
    canManageAutomation,
    isAdmin,
    isTeamLead,
    isManager,
    role,
    user,
  };
}
