export type Language = 'en' | 'ar';

export enum UserRole {
  ADMIN = 'ADMIN',
  PROJECT_MANAGER = 'PROJECT_MANAGER',
  SITE_ENGINEER = 'SITE_ENGINEER',
  TECHNICAL_OFFICE = 'TECHNICAL_OFFICE',
  QUALITY_MANAGER = 'QUALITY_MANAGER',
  HSE_OFFICER = 'HSE_OFFICER',
  CONTRACTS_MANAGER = 'CONTRACTS_MANAGER',
  TOP_MANAGEMENT = 'TOP_MANAGEMENT'
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
