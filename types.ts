export type Language = 'en' | 'ar';

export enum UserRole {
  SUPER_ADMIN = 'super_admin',
  ADMIN = 'admin',
  PROJECT_MANAGER = 'project_manager',
  SITE_ENGINEER = 'site_engineer',
  QA_MANAGER = 'qa_manager',
  HSE_OFFICER = 'hse_officer',
  ACCOUNTANT = 'accountant',
  CLIENT = 'client',
  VIEWER = 'viewer'
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  allowedProjects?: string[]; // For Client Viewer
}

export interface ProcurementOrder {
  id: string;
  orderNumber: string;
  projectId: string;
  supplierId: string;
  items: ProcurementItem[];
  totalAmount: number;
  status: 'draft' | 'pending_approval' | 'approved' | 'rejected' | 'ordered' | 'delivered';
  requestDate: string;
  deliveryDate?: string;
  requestedBy: string;
  approvedBy?: string;
  notes?: string;
}

export interface ProcurementItem {
  id: string;
  description: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  totalPrice: number;
}

export interface Supplier {
  id: string;
  name: string;
  contactPerson: string;
  email: string;
  phone: string;
  address: string;
  rating?: number;
  status: 'active' | 'inactive';
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
  client?: string;
  manager?: string;
  location?: string;
  priority?: 'high' | 'medium' | 'low';
  description?: string;
}

export interface Contract {
  id: string;
  projectId: string;
  title: string;
  vendor?: string;
  client?: string;
  value: number;
  currency: string;
  startDate: string;
  endDate: string;
  status: 'active' | 'completed' | 'pending' | 'terminated';
  milestones: Milestone[];
}

export interface Milestone {
  id: string;
  name: string;
  date: string;
  status: 'pending' | 'completed';
}

export interface Variation {
  id: string;
  title: string;
  value: number | string;
  status: string;
  color?: string;
  description?: string;
  scheduleImpact?: number;
}

export interface PlanningTask {
  id: string;
  name: string;
  progress: number;
  critical: boolean;
  startDate: string;
  endDate: string;
  duration: number;
  status: 'not_started' | 'in_progress' | 'completed' | 'delayed';
  budget?: number;
  assignee?: string;
  dependencies?: string[];
  projectId?: string;
}

export interface Report {
  id: string;
  projectId: string;
  date: string;
  activities: string;
  laborCount: number;
  equipmentCount: number;
  weather?: {
    temp: number;
    condition: string;
    humidity?: number;
    windSpeed?: number;
  };
  manpower?: {
    trade: string;
    count: number;
    hours: number;
  }[];
  equipment?: {
    type: string;
    count: number;
    status: 'active' | 'idle' | 'maintenance';
  }[];
  materials?: {
    item: string;
    quantity: number;
    unit: string;
    supplier?: string;
  }[];
  safetyObservations?: string[];
  delays?: string[];
  photos?: string[];
  supervisor?: string;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  read: boolean;
  date: string;
  link?: string;
}

export interface NCR {
  id: string;
  title: string;
  severity: 'high' | 'medium' | 'low';
  status: 'open' | 'closed' | 'pending_review';
  date: string;
  location?: string;
  description?: string;
  rootCause?: string;
  correctiveAction?: string;
  preventiveAction?: string;
  inspector?: string;
  dueDate?: string;
  closureDate?: string;
  images?: string[];
  projectId?: string;
}

export interface Document {
  id: string;
  code: string;
  title: string;
  category: 'Drawing' | 'RFI' | 'Submittal' | 'Contract' | 'Report' | 'Specification' | 'Other';
  type: 'PDF' | 'DWG' | 'XLSX' | 'DOCX' | 'JPG';
  version: string;
  status: 'Approved' | 'Pending' | 'Rejected' | 'Superseded';
  date: string;
  size: string;
  uploadedBy: string;
  description?: string;
  tags?: string[];
  projectId?: string;
}

export interface Expense {
  id: string;
  projectId: string;
  category: 'Material' | 'Labor' | 'Equipment' | 'Subcontractor' | 'Overhead' | 'Other';
  description: string;
  amount: number;
  date: string;
  status: 'Pending' | 'Approved' | 'Paid' | 'Rejected';
  invoiceNumber?: string;
  vendor?: string;
}

export interface Resource {
  id: string;
  name: string;
  type: 'Labor' | 'Equipment' | 'Material';
  unit: string;
  costPerUnit: number;
  totalQuantity: number;
  usedQuantity: number;
  projectId?: string;
}

export interface Timesheet {
  id: string;
  employee: string;
  role?: string;
  project: string;
  date: string;
  hours: number;
  overtime?: number;
  activity?: string;
  status: 'Approved' | 'Pending' | 'Rejected';
}

export interface Incident {
  id: string;
  date: string;
  type: 'Injury' | 'Near Miss' | 'Property Damage' | 'Environmental' | 'Hazard';
  severity: 'Critical' | 'High' | 'Medium' | 'Low';
  description: string;
  location: string;
  involvedPersons?: string;
  witnesses?: string;
  rootCause?: string;
  immediateAction?: string;
  correctiveAction?: string;
  status: 'Open' | 'Investigating' | 'Closed';
  lostTimeHours?: number;
  images?: string[];
  projectId?: string;
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

// Inventory
export interface InventoryItem {
  id: string;
  name: string;
  sku: string;
  category: string;
  quantity: number;
  unit: string;
  minLevel: number;
  location: string;
  lastUpdated: string;
}

export interface StockTransaction {
  id: string;
  itemId: string;
  type: 'in' | 'out' | 'adjustment';
  quantity: number;
  date: string;
  reference: string; // PO number or Project ID
  performedBy: string;
}

// Correspondence
export interface Transmittal {
  id: string;
  code: string;
  subject: string;
  sender: string;
  recipient: string;
  date: string;
  status: 'Draft' | 'Sent' | 'Received' | 'Acknowledged';
  type: 'Drawing' | 'Material' | 'Document' | 'Sample';
  projectId: string;
  attachments: string[];
}

export interface RFI {
  id: string;
  code: string;
  subject: string;
  question: string;
  answer?: string;
  requestedBy: string;
  assignedTo: string;
  date: string;
  dueDate: string;
  status: 'Open' | 'Answered' | 'Closed' | 'Overdue';
  priority: 'High' | 'Medium' | 'Low';
  projectId: string;
  discipline: 'Civil' | 'Arch' | 'MEP' | 'Structural';
}

// BIM
export interface BIMModel {
  id: string;
  name: string;
  version: string;
  uploadDate: string;
  size: string;
  url: string; // Path to .ifc file
  projectId: string;
  description?: string;
  status?: 'active' | 'archived' | 'deprecated';
  uploadedBy?: string;
}

export interface Correspondence {
  id: string;
  projectId: string;
  referenceNumber?: string;
  type: 'incoming' | 'outgoing' | 'internal';
  subject: string;
  sender: string;
  recipient: string;
  date: string;
  status: 'pending' | 'replied' | 'closed' | 'archived';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  content?: string;
  attachments?: any[];
}

export interface AuditLog {
  id: string;
  user_id?: string;
  action: string;
  entity_type: string;
  entity_id?: string;
  details?: any;
  created_at: string;
  user?: {
    full_name: string;
  };
}
