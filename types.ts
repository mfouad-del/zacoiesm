export type Language = 'en' | 'ar';

export enum UserRole {
  SUPER_ADMIN = 'super_admin',
  ADMIN = 'admin',
  PROJECT_MANAGER = 'project_manager',
  SITE_ENGINEER = 'site_engineer',
  TECHNICAL_OFFICE = 'technical_office',
  QUALITY_MANAGER = 'quality_manager',
  QA_MANAGER = 'qa_manager',
  HSE_OFFICER = 'hse_officer',
  SAFETY_OFFICER = 'safety_officer',
  CONTRACTS_MANAGER = 'contracts_manager',
  ACCOUNTANT = 'accountant',
  TOP_MANAGEMENT = 'top_management',
  CLIENT = 'client',
  VIEWER = 'viewer',
  USER = 'user'
}

export interface Project {
  id: string;
  name: string;
  code: string;
  status: 'active' | 'completed' | 'on-hold';
  budget: number;
  progress: number;
  startDate: string;
  endDate: string;
}

export interface Contract {
  id: string;
  projectId: string;
  title: string;
  client: string;
  value: number;
  currency: string;
  startDate: string;
  endDate: string;
  milestones: Milestone[];
}

export interface Milestone {
  id: string;
  name: string;
  date: string;
  status: 'pending' | 'completed';
}

export interface Task {
  id: string;
  projectId: string;
  name: string;
  startDate: string;
  endDate: string;
  progress: number;
  dependencies: string[];
}

export interface NCR {
  id: string;
  projectId: string;
  title: string;
  description: string;
  severity: 'low' | 'medium' | 'high';
  status: 'open' | 'closed' | 'in-progress';
  date: string;
}

export interface DailyReport {
  id: string;
  projectId: string;
  date: string;
  weather: string;
  laborCount: number;
  equipmentCount: number;
  activities: string;
  issues: string;
}
