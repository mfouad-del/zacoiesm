export enum UserRole {
  SUPER_ADMIN = 'SUPER_ADMIN',
  ADMIN = 'ADMIN',
  PROJECT_MANAGER = 'PROJECT_MANAGER',
  SITE_ENGINEER = 'SITE_ENGINEER',
  TECHNICAL_OFFICE = 'TECHNICAL_OFFICE',
  QUALITY_MANAGER = 'QUALITY_MANAGER',
  QA_MANAGER = 'QA_MANAGER',
  HSE_OFFICER = 'HSE_OFFICER',
  SAFETY_OFFICER = 'SAFETY_OFFICER',
  CONTRACTS_MANAGER = 'CONTRACTS_MANAGER',
  ACCOUNTANT = 'ACCOUNTANT',
  TOP_MANAGEMENT = 'TOP_MANAGEMENT',
  CLIENT = 'CLIENT',
  VIEWER = 'VIEWER'
}

export const PERMISSIONS = {
  [UserRole.SUPER_ADMIN]: ['*'],
  [UserRole.ADMIN]: ['*'],
  [UserRole.PROJECT_MANAGER]: [
    'read:projects', 'write:projects', 
    'read:costs', 'write:costs', 
    'read:schedule', 'write:schedule',
    'read:tasks', 'write:tasks',
    'read:timesheets', 'approve:timesheets',
    'read:documents', 'write:documents',
    'read:reports', 'write:reports',
    'read:ncr', 'write:ncr'
  ],
  [UserRole.SITE_ENGINEER]: [
    'read:projects', 'read:schedule', 
    'write:daily-reports', 'read:documents',
    'write:timesheets', 'read:tasks',
    'write:ncr', 'read:ncr'
  ],
  [UserRole.TECHNICAL_OFFICE]: [
    'read:projects', 'read:schedule',
    'write:schedule', 'read:documents',
    'write:documents', 'read:tasks',
    'write:tasks'
  ],
  [UserRole.QUALITY_MANAGER]: [
    'read:projects', 'write:quality', 
    'read:quality', 'read:ncr',
    'write:ncr', 'approve:ncr',
    'read:documents'
  ],
  [UserRole.QA_MANAGER]: [
    'read:projects', 'write:quality', 
    'read:quality', 'read:ncr',
    'write:ncr', 'approve:ncr',
    'read:documents'
  ],
  [UserRole.HSE_OFFICER]: [
    'read:projects', 'write:safety', 
    'read:safety', 'write:incidents',
    'read:incidents', 'approve:incidents'
  ],
  [UserRole.SAFETY_OFFICER]: [
    'read:projects', 'write:safety', 
    'read:safety', 'write:incidents',
    'read:incidents'
  ],
  [UserRole.CONTRACTS_MANAGER]: [
    'read:projects', 'read:contracts',
    'write:contracts', 'read:costs',
    'write:variations', 'approve:variations'
  ],
  [UserRole.ACCOUNTANT]: [
    'read:projects', 'read:costs',
    'write:costs', 'read:timesheets',
    'read:contracts', 'read:invoices',
    'write:invoices'
  ],
  [UserRole.TOP_MANAGEMENT]: [
    'read:projects', 'read:dashboard',
    'read:costs', 'read:reports',
    'read:analytics', 'read:all'
  ],
  [UserRole.CLIENT]: [
    'read:projects', 'read:dashboard', 
    'read:documents', 'read:reports'
  ],
  [UserRole.VIEWER]: [
    'read:projects', 'read:dashboard',
    'read:documents'
  ]
};
