'use client';

import { useAuth } from '@/lib/hooks/useAuth';
import { UserRole } from '@/types';

type Module = 
  | 'projects'
  | 'users'
  | 'tasks'
  | 'documents'
  | 'ncr'
  | 'safety'
  | 'costs'
  | 'reports'
  | 'equipment'
  | 'resources'
  | 'settings';

type Action = 'create' | 'read' | 'update' | 'delete' | 'approve';

type PermissionScope = 
  | 'all'           // جميع البيانات
  | 'assigned'      // المشاريع المعينة فقط
  | 'project'       // المشروع الحالي فقط
  | 'own'           // البيانات الخاصة فقط
  | 'none';         // لا شيء

interface RolePermission {
  canCreate: boolean;
  canRead: boolean;
  canUpdate: boolean;
  canDelete: boolean;
  canApprove: boolean;
  scope: PermissionScope;
}

// مصفوفة الصلاحيات الكاملة
const ROLE_PERMISSIONS: Record<UserRole, Record<Module, RolePermission>> = {
  [UserRole.SUPER_ADMIN]: {
    projects: { canCreate: true, canRead: true, canUpdate: true, canDelete: true, canApprove: true, scope: 'all' },
    users: { canCreate: true, canRead: true, canUpdate: true, canDelete: true, canApprove: true, scope: 'all' },
    tasks: { canCreate: true, canRead: true, canUpdate: true, canDelete: true, canApprove: true, scope: 'all' },
    documents: { canCreate: true, canRead: true, canUpdate: true, canDelete: true, canApprove: true, scope: 'all' },
    ncr: { canCreate: true, canRead: true, canUpdate: true, canDelete: true, canApprove: true, scope: 'all' },
    safety: { canCreate: true, canRead: true, canUpdate: true, canDelete: true, canApprove: true, scope: 'all' },
    costs: { canCreate: true, canRead: true, canUpdate: true, canDelete: true, canApprove: true, scope: 'all' },
    reports: { canCreate: true, canRead: true, canUpdate: true, canDelete: true, canApprove: true, scope: 'all' },
    equipment: { canCreate: true, canRead: true, canUpdate: true, canDelete: true, canApprove: true, scope: 'all' },
    resources: { canCreate: true, canRead: true, canUpdate: true, canDelete: true, canApprove: true, scope: 'all' },
    settings: { canCreate: true, canRead: true, canUpdate: true, canDelete: true, canApprove: true, scope: 'all' },
  },
  
  [UserRole.ADMIN]: {
    projects: { canCreate: true, canRead: true, canUpdate: true, canDelete: true, canApprove: true, scope: 'all' },
    users: { canCreate: true, canRead: true, canUpdate: true, canDelete: false, canApprove: false, scope: 'all' },
    tasks: { canCreate: true, canRead: true, canUpdate: true, canDelete: true, canApprove: false, scope: 'all' },
    documents: { canCreate: true, canRead: true, canUpdate: true, canDelete: true, canApprove: true, scope: 'all' },
    ncr: { canCreate: true, canRead: true, canUpdate: true, canDelete: true, canApprove: true, scope: 'all' },
    safety: { canCreate: true, canRead: true, canUpdate: true, canDelete: true, canApprove: true, scope: 'all' },
    costs: { canCreate: true, canRead: true, canUpdate: true, canDelete: false, canApprove: true, scope: 'all' },
    reports: { canCreate: true, canRead: true, canUpdate: true, canDelete: false, canApprove: false, scope: 'all' },
    equipment: { canCreate: true, canRead: true, canUpdate: true, canDelete: true, canApprove: false, scope: 'all' },
    resources: { canCreate: true, canRead: true, canUpdate: true, canDelete: true, canApprove: false, scope: 'all' },
    settings: { canCreate: false, canRead: true, canUpdate: true, canDelete: false, canApprove: false, scope: 'all' },
  },
  
  [UserRole.PROJECT_MANAGER]: {
    projects: { canCreate: true, canRead: true, canUpdate: true, canDelete: false, canApprove: false, scope: 'assigned' },
    users: { canCreate: false, canRead: true, canUpdate: false, canDelete: false, canApprove: false, scope: 'project' },
    tasks: { canCreate: true, canRead: true, canUpdate: true, canDelete: true, canApprove: true, scope: 'project' },
    documents: { canCreate: true, canRead: true, canUpdate: true, canDelete: false, canApprove: true, scope: 'project' },
    ncr: { canCreate: true, canRead: true, canUpdate: true, canDelete: false, canApprove: true, scope: 'project' },
    safety: { canCreate: true, canRead: true, canUpdate: true, canDelete: false, canApprove: true, scope: 'project' },
    costs: { canCreate: true, canRead: true, canUpdate: true, canDelete: false, canApprove: true, scope: 'project' },
    reports: { canCreate: true, canRead: true, canUpdate: false, canDelete: false, canApprove: false, scope: 'project' },
    equipment: { canCreate: false, canRead: true, canUpdate: true, canDelete: false, canApprove: false, scope: 'project' },
    resources: { canCreate: true, canRead: true, canUpdate: true, canDelete: false, canApprove: false, scope: 'project' },
    settings: { canCreate: false, canRead: true, canUpdate: false, canDelete: false, canApprove: false, scope: 'none' },
  },
  
  [UserRole.SITE_ENGINEER]: {
    projects: { canCreate: false, canRead: true, canUpdate: false, canDelete: false, canApprove: false, scope: 'assigned' },
    users: { canCreate: false, canRead: true, canUpdate: false, canDelete: false, canApprove: false, scope: 'project' },
    tasks: { canCreate: true, canRead: true, canUpdate: true, canDelete: false, canApprove: false, scope: 'assigned' },
    documents: { canCreate: true, canRead: true, canUpdate: true, canDelete: false, canApprove: false, scope: 'project' },
    ncr: { canCreate: true, canRead: true, canUpdate: true, canDelete: false, canApprove: false, scope: 'project' },
    safety: { canCreate: true, canRead: true, canUpdate: true, canDelete: false, canApprove: false, scope: 'project' },
    costs: { canCreate: false, canRead: true, canUpdate: false, canDelete: false, canApprove: false, scope: 'project' },
    reports: { canCreate: true, canRead: true, canUpdate: false, canDelete: false, canApprove: false, scope: 'own' },
    equipment: { canCreate: false, canRead: true, canUpdate: true, canDelete: false, canApprove: false, scope: 'assigned' },
    resources: { canCreate: false, canRead: true, canUpdate: true, canDelete: false, canApprove: false, scope: 'project' },
    settings: { canCreate: false, canRead: false, canUpdate: false, canDelete: false, canApprove: false, scope: 'none' },
  },
  
  [UserRole.QA_MANAGER]: {
    projects: { canCreate: false, canRead: true, canUpdate: false, canDelete: false, canApprove: false, scope: 'all' },
    users: { canCreate: false, canRead: true, canUpdate: false, canDelete: false, canApprove: false, scope: 'all' },
    tasks: { canCreate: false, canRead: true, canUpdate: false, canDelete: false, canApprove: false, scope: 'all' },
    documents: { canCreate: true, canRead: true, canUpdate: true, canDelete: false, canApprove: true, scope: 'all' },
    ncr: { canCreate: true, canRead: true, canUpdate: true, canDelete: true, canApprove: true, scope: 'all' },
    safety: { canCreate: false, canRead: true, canUpdate: false, canDelete: false, canApprove: false, scope: 'all' },
    costs: { canCreate: false, canRead: true, canUpdate: false, canDelete: false, canApprove: false, scope: 'all' },
    reports: { canCreate: true, canRead: true, canUpdate: false, canDelete: false, canApprove: false, scope: 'project' },
    equipment: { canCreate: false, canRead: true, canUpdate: false, canDelete: false, canApprove: false, scope: 'all' },
    resources: { canCreate: false, canRead: true, canUpdate: false, canDelete: false, canApprove: false, scope: 'all' },
    settings: { canCreate: false, canRead: false, canUpdate: false, canDelete: false, canApprove: false, scope: 'none' },
  },
  
  [UserRole.HSE_OFFICER]: {
    projects: { canCreate: false, canRead: true, canUpdate: false, canDelete: false, canApprove: false, scope: 'all' },
    users: { canCreate: false, canRead: true, canUpdate: false, canDelete: false, canApprove: false, scope: 'all' },
    tasks: { canCreate: false, canRead: true, canUpdate: false, canDelete: false, canApprove: false, scope: 'all' },
    documents: { canCreate: true, canRead: true, canUpdate: true, canDelete: false, canApprove: false, scope: 'project' },
    ncr: { canCreate: false, canRead: true, canUpdate: false, canDelete: false, canApprove: false, scope: 'all' },
    safety: { canCreate: true, canRead: true, canUpdate: true, canDelete: true, canApprove: true, scope: 'all' },
    costs: { canCreate: false, canRead: false, canUpdate: false, canDelete: false, canApprove: false, scope: 'none' },
    reports: { canCreate: true, canRead: true, canUpdate: false, canDelete: false, canApprove: false, scope: 'project' },
    equipment: { canCreate: false, canRead: true, canUpdate: false, canDelete: false, canApprove: false, scope: 'all' },
    resources: { canCreate: false, canRead: true, canUpdate: false, canDelete: false, canApprove: false, scope: 'project' },
    settings: { canCreate: false, canRead: false, canUpdate: false, canDelete: false, canApprove: false, scope: 'none' },
  },
  
  [UserRole.ACCOUNTANT]: {
    projects: { canCreate: false, canRead: true, canUpdate: false, canDelete: false, canApprove: false, scope: 'all' },
    users: { canCreate: false, canRead: true, canUpdate: false, canDelete: false, canApprove: false, scope: 'all' },
    tasks: { canCreate: false, canRead: true, canUpdate: false, canDelete: false, canApprove: false, scope: 'all' },
    documents: { canCreate: false, canRead: true, canUpdate: false, canDelete: false, canApprove: false, scope: 'project' },
    ncr: { canCreate: false, canRead: true, canUpdate: false, canDelete: false, canApprove: false, scope: 'all' },
    safety: { canCreate: false, canRead: true, canUpdate: false, canDelete: false, canApprove: false, scope: 'all' },
    costs: { canCreate: true, canRead: true, canUpdate: true, canDelete: false, canApprove: true, scope: 'all' },
    reports: { canCreate: true, canRead: true, canUpdate: false, canDelete: false, canApprove: false, scope: 'project' },
    equipment: { canCreate: false, canRead: true, canUpdate: false, canDelete: false, canApprove: false, scope: 'all' },
    resources: { canCreate: false, canRead: true, canUpdate: true, canDelete: false, canApprove: false, scope: 'all' },
    settings: { canCreate: false, canRead: false, canUpdate: false, canDelete: false, canApprove: false, scope: 'none' },
  },
  
  [UserRole.CLIENT]: {
    projects: { canCreate: false, canRead: true, canUpdate: false, canDelete: false, canApprove: false, scope: 'assigned' },
    users: { canCreate: false, canRead: false, canUpdate: false, canDelete: false, canApprove: false, scope: 'none' },
    tasks: { canCreate: false, canRead: true, canUpdate: false, canDelete: false, canApprove: false, scope: 'project' },
    documents: { canCreate: false, canRead: true, canUpdate: false, canDelete: false, canApprove: false, scope: 'project' },
    ncr: { canCreate: false, canRead: true, canUpdate: false, canDelete: false, canApprove: false, scope: 'project' },
    safety: { canCreate: false, canRead: true, canUpdate: false, canDelete: false, canApprove: false, scope: 'project' },
    costs: { canCreate: false, canRead: true, canUpdate: false, canDelete: false, canApprove: false, scope: 'project' },
    reports: { canCreate: false, canRead: true, canUpdate: false, canDelete: false, canApprove: false, scope: 'project' },
    equipment: { canCreate: false, canRead: true, canUpdate: false, canDelete: false, canApprove: false, scope: 'project' },
    resources: { canCreate: false, canRead: true, canUpdate: false, canDelete: false, canApprove: false, scope: 'project' },
    settings: { canCreate: false, canRead: false, canUpdate: false, canDelete: false, canApprove: false, scope: 'none' },
  },
  
  [UserRole.VIEWER]: {
    projects: { canCreate: false, canRead: true, canUpdate: false, canDelete: false, canApprove: false, scope: 'all' },
    users: { canCreate: false, canRead: true, canUpdate: false, canDelete: false, canApprove: false, scope: 'all' },
    tasks: { canCreate: false, canRead: true, canUpdate: false, canDelete: false, canApprove: false, scope: 'all' },
    documents: { canCreate: false, canRead: true, canUpdate: false, canDelete: false, canApprove: false, scope: 'all' },
    ncr: { canCreate: false, canRead: true, canUpdate: false, canDelete: false, canApprove: false, scope: 'all' },
    safety: { canCreate: false, canRead: true, canUpdate: false, canDelete: false, canApprove: false, scope: 'all' },
    costs: { canCreate: false, canRead: true, canUpdate: false, canDelete: false, canApprove: false, scope: 'project' },
    reports: { canCreate: false, canRead: true, canUpdate: false, canDelete: false, canApprove: false, scope: 'all' },
    equipment: { canCreate: false, canRead: true, canUpdate: false, canDelete: false, canApprove: false, scope: 'all' },
    resources: { canCreate: false, canRead: true, canUpdate: false, canDelete: false, canApprove: false, scope: 'all' },
    settings: { canCreate: false, canRead: false, canUpdate: false, canDelete: false, canApprove: false, scope: 'none' },
  },
};

export function usePermissions() {
  const { user } = useAuth();

  const can = (module: Module, action: Action): boolean => {
    if (!user) return false;
    
    const role = user.role as UserRole;
    const permissions = ROLE_PERMISSIONS[role]?.[module];
    
    if (!permissions) return false;
    
    switch (action) {
      case 'create':
        return permissions.canCreate;
      case 'read':
        return permissions.canRead;
      case 'update':
        return permissions.canUpdate;
      case 'delete':
        return permissions.canDelete;
      case 'approve':
        return permissions.canApprove;
      default:
        return false;
    }
  };

  const canAccess = (module: Module): boolean => {
    return can(module, 'read');
  };

  const canEdit = (module: Module): boolean => {
    return can(module, 'update');
  };

  const canCreate = (module: Module): boolean => {
    return can(module, 'create');
  };

  const canDelete = (module: Module): boolean => {
    return can(module, 'delete');
  };

  const canApprove = (module: Module): boolean => {
    return can(module, 'approve');
  };

  const getScope = (module: Module): PermissionScope => {
    if (!user) return 'none';
    
    const role = user.role as UserRole;
    const permissions = ROLE_PERMISSIONS[role]?.[module];
    
    return permissions?.scope || 'none';
  };

  const getAccessibleModules = (): Module[] => {
    if (!user) return [];
    
    const role = user.role as UserRole;
    const permissions = ROLE_PERMISSIONS[role];
    
    return Object.entries(permissions)
      .filter(([_, perm]) => perm.canRead)
      .map(([module]) => module as Module);
  };

  const getRoleLabel = (role: UserRole, lang: 'ar' | 'en' = 'ar'): string => {
    const labels: Record<UserRole, { ar: string; en: string }> = {
      [UserRole.SUPER_ADMIN]: { ar: 'مدير النظام', en: 'Super Admin' },
      [UserRole.ADMIN]: { ar: 'مدير', en: 'Admin' },
      [UserRole.PROJECT_MANAGER]: { ar: 'مدير مشروع', en: 'Project Manager' },
      [UserRole.SITE_ENGINEER]: { ar: 'مهندس موقع', en: 'Site Engineer' },
      [UserRole.QA_MANAGER]: { ar: 'مدير الجودة', en: 'QA Manager' },
      [UserRole.HSE_OFFICER]: { ar: 'مسؤول السلامة', en: 'HSE Officer' },
      [UserRole.ACCOUNTANT]: { ar: 'محاسب', en: 'Accountant' },
      [UserRole.CLIENT]: { ar: 'عميل', en: 'Client' },
      [UserRole.VIEWER]: { ar: 'مشاهد', en: 'Viewer' },
    };
    
    return labels[role][lang];
  };

  const isSuperAdmin = (): boolean => {
    return user?.role === UserRole.SUPER_ADMIN;
  };

  const isAdmin = (): boolean => {
    return user?.role === UserRole.ADMIN || isSuperAdmin();
  };

  return {
    can,
    canAccess,
    canEdit,
    canCreate,
    canDelete,
    canApprove,
    getScope,
    getAccessibleModules,
    getRoleLabel,
    isSuperAdmin,
    isAdmin,
  };
}

// Helper للتحقق من الصلاحيات في server actions
export function hasPermission(
  userRole: UserRole,
  module: Module,
  action: Action
): boolean {
  const permissions = ROLE_PERMISSIONS[userRole]?.[module];
  if (!permissions) return false;
  
  switch (action) {
    case 'create':
      return permissions.canCreate;
    case 'read':
      return permissions.canRead;
    case 'update':
      return permissions.canUpdate;
    case 'delete':
      return permissions.canDelete;
    case 'approve':
      return permissions.canApprove;
    default:
      return false;
  }
}

export function getPermissionScope(
  userRole: UserRole,
  module: Module
): PermissionScope {
  const permissions = ROLE_PERMISSIONS[userRole]?.[module];
  return permissions?.scope || 'none';
}
