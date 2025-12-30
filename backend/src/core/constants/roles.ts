export enum UserRole {
  ADMIN = 'ADMIN',
  PROJECT_MANAGER = 'PROJECT_MANAGER',
  SITE_ENGINEER = 'SITE_ENGINEER',
  CLIENT = 'CLIENT',
  SAFETY_OFFICER = 'SAFETY_OFFICER',
  QUALITY_CONTROL = 'QUALITY_CONTROL'
}

export const PERMISSIONS = {
  [UserRole.ADMIN]: ['*'],
  [UserRole.PROJECT_MANAGER]: ['read:projects', 'write:projects', 'read:costs', 'write:costs', 'read:schedule', 'write:schedule'],
  [UserRole.SITE_ENGINEER]: ['read:projects', 'read:schedule', 'write:daily-reports', 'read:documents'],
  [UserRole.CLIENT]: ['read:projects', 'read:dashboard', 'read:documents'],
  [UserRole.SAFETY_OFFICER]: ['read:projects', 'write:safety', 'read:safety'],
  [UserRole.QUALITY_CONTROL]: ['read:projects', 'write:quality', 'read:quality']
};
