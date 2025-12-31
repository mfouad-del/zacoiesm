import { Project, NCR, Incident, Document, Expense, Resource, Timesheet } from '../types';

export const MOCK_PROJECTS: Project[] = [
  {
    id: '1',
    name: 'برج الرياض المالي',
    code: 'RYD-001',
    budget: 50000000,
    startDate: '2024-01-01',
    endDate: '2025-12-31',
    status: 'active',
    progress: 35,
    location: 'الرياض',
    manager: 'م. أحمد علي'
  },
  {
    id: '2',
    name: 'مجمع جدة السكني',
    code: 'JED-002',
    budget: 12000000,
    startDate: '2024-03-15',
    endDate: '2025-06-30',
    status: 'active',
    progress: 15,
    location: 'جدة',
    manager: 'م. خالد عمر'
  }
];

export const MOCK_CONTRACTS = [
  {
    id: '1',
    projectId: '1',
    contractorName: 'شركة البناء الحديث',
    value: 45000000,
    startDate: '2024-01-01',
    endDate: '2025-12-31',
    status: 'Active',
    type: 'Main Contract'
  }
];

export const MOCK_VARIATIONS = [
  {
    id: '1',
    contractId: '1',
    description: 'تغيير نوع الأرضيات في الدور الأرضي',
    amount: 150000,
    status: 'Approved',
    date: '2024-05-20'
  }
];

export const MOCK_ACTIVITIES = [
  {
    id: '1',
    projectId: '1',
    name: 'أعمال الحفر',
    startDate: '2024-01-10',
    endDate: '2024-02-28',
    progress: 100,
    status: 'Completed'
  },
  {
    id: '2',
    projectId: '1',
    name: 'أعمال الأساسات',
    startDate: '2024-03-01',
    endDate: '2024-05-30',
    progress: 80,
    status: 'In Progress'
  }
];

export const MOCK_REPORTS = [
  {
    id: '1',
    projectId: 'RYD-001',
    date: '2024-06-01',
    activities: 'صب الخرسانة للدور الأول\nتركيب حديد التسليح للأعمدة',
    laborCount: 142,
    equipmentCount: 12,
    weather: {
      temp: 38,
      condition: 'Sunny',
      humidity: 45,
      windSpeed: 15
    },
    safetyObservations: ['عدم ارتداء خوذة السلامة لبعض العمال في المنطقة ب'],
    delays: ['تأخر وصول شاحنات الأسمنت لمدة ساعتين'],
    manpower: [
      { trade: 'Carpenter', count: 40, hours: 8 },
      { trade: 'Steel Fixer', count: 35, hours: 8 },
      { trade: 'Labor', count: 67, hours: 8 }
    ]
  },
  {
    id: '2',
    projectId: 'JED-002',
    date: '2024-06-02',
    activities: 'أعمال الحفر للمرحلة الثانية\nتسوية الموقع',
    laborCount: 85,
    equipmentCount: 18,
    weather: {
      temp: 35,
      condition: 'Windy',
      humidity: 60,
      windSpeed: 25
    },
    safetyObservations: [],
    delays: [],
    manpower: [
      { trade: 'Operator', count: 15, hours: 9 },
      { trade: 'Labor', count: 70, hours: 9 }
    ]
  }
];



export const MOCK_DOCUMENTS: Document[] = [
  {
    id: 'DOC-001',
    code: 'DWG-AR-101',
    title: 'Ground Floor Architectural Plan',
    category: 'Drawing',
    type: 'DWG',
    version: 'A0',
    status: 'Approved',
    date: '2024-01-15',
    size: '4.5 MB',
    uploadedBy: 'Arch. Sarah Jones',
    description: 'Issued for construction.',
    tags: ['Architecture', 'Ground Floor'],
    projectId: '1'
  },
  {
    id: 'DOC-002',
    code: 'RFI-STR-005',
    title: 'Clarification on Column C5 Reinforcement',
    category: 'RFI',
    type: 'PDF',
    version: '1',
    status: 'Approved',
    date: '2024-02-10',
    size: '1.2 MB',
    uploadedBy: 'Eng. Ahmed Ali',
    description: 'Requesting details for additional stirrups.',
    tags: ['Structural', 'RFI'],
    projectId: '1'
  },
  {
    id: 'DOC-003',
    code: 'SUB-MAT-012',
    title: 'Ceramic Tiles Sample Submission',
    category: 'Submittal',
    type: 'PDF',
    version: 'B',
    status: 'Pending',
    date: '2024-03-01',
    size: '8.5 MB',
    uploadedBy: 'Contractor X',
    description: 'Proposed ceramic tiles for wet areas.',
    tags: ['Finishing', 'Material'],
    projectId: '1'
  }
];



export const MOCK_NCRS: NCR[] = [
  {
    id: 'NCR-2024-001',
    title: 'Incorrect Concrete Mix Ratio',
    description: 'The concrete mix used for column C-12 did not meet the specified strength requirements (C35). Test results showed C30.',
    severity: 'high',
    status: 'open',
    date: '2024-06-10',
    location: 'Zone A - Ground Floor',
    rootCause: 'Supplier error in batching plant configuration.',
    correctiveAction: 'Demolish and recast column C-12 with approved mix design.',
    preventiveAction: 'Request batching plant calibration records before next pour.',
    inspector: 'Eng. Sameh Hassan',
    dueDate: '2024-06-20',
    images: []
  },
  {
    id: 'NCR-2024-002',
    title: 'Missing Rebar Spacers',
    description: 'Insufficient cover for bottom reinforcement in slab S-05 due to missing spacers.',
    severity: 'medium',
    status: 'closed',
    date: '2024-06-05',
    location: 'Zone B - First Floor',
    rootCause: 'Worker negligence and lack of supervision.',
    correctiveAction: 'Install appropriate spacers to ensure 25mm cover.',
    preventiveAction: 'Toolbox talk on importance of concrete cover.',
    inspector: 'Eng. Ahmed Ali',
    dueDate: '2024-06-06',
    closureDate: '2024-06-06',
    images: []
  },
  {
    id: 'NCR-2024-003',
    title: 'Damaged Door Frame',
    description: 'Door frame D-102 scratched during material handling.',
    severity: 'low',
    status: 'open',
    date: '2024-06-12',
    location: 'Zone C - Second Floor',
    rootCause: 'Improper handling of materials in narrow corridor.',
    correctiveAction: 'Repair and repaint the damaged area.',
    preventiveAction: 'Use protective padding when moving materials.',
    inspector: 'Eng. Khalid Omar',
    dueDate: '2024-06-15',
    images: []
  }
];

export const MOCK_INCIDENTS: Incident[] = [
  {
    id: 'INC-2024-001',
    date: '2024-06-15',
    type: 'Near Miss',
    severity: 'High',
    description: 'Scaffolding plank slipped while worker was climbing. No injury occurred but potential for fall was high.',
    location: 'Zone B - External Facade',
    involvedPersons: 'Ali Ahmed (Scaffolder)',
    witnesses: 'John Doe (Foreman)',
    rootCause: 'Improper securing of scaffolding planks and lack of inspection.',
    immediateAction: 'Work stopped immediately. Area cordoned off.',
    correctiveAction: 'All scaffolding re-inspected and tagged. Refresher training for scaffolders.',
    status: 'Closed',
    lostTimeHours: 0
  },
  {
    id: 'INC-2024-002',
    date: '2024-06-10',
    type: 'Injury',
    severity: 'Low',
    description: 'Worker cut finger while handling steel rebar.',
    location: 'Steel Yard',
    involvedPersons: 'Kumar Singh (Steel Fixer)',
    witnesses: 'N/A',
    rootCause: 'Not wearing cut-resistant gloves.',
    immediateAction: 'First aid applied on site.',
    correctiveAction: 'Enforce mandatory use of cut-resistant gloves for all steel handlers.',
    status: 'Closed',
    lostTimeHours: 2
  },
  {
    id: 'INC-2024-003',
    date: '2024-06-18',
    type: 'Property Damage',
    severity: 'Medium',
    description: 'Excavator bucket hit a water pipe causing a leak.',
    location: 'Zone A - Excavation Area',
    involvedPersons: 'Operator Mike',
    witnesses: 'Site Engineer',
    rootCause: 'Inaccurate utility mapping and lack of spotter.',
    immediateAction: 'Water supply shut off. Repair crew mobilized.',
    correctiveAction: 'Update utility maps and ensure spotter is present for all excavation works.',
    status: 'Investigating',
    lostTimeHours: 4
  }
];

export const MOCK_EXPENSES: Expense[] = [
  {
    id: 'EXP-001',
    projectId: '1',
    category: 'Material',
    description: 'Concrete Supply - Batch 45',
    amount: 150000,
    date: '2024-06-01',
    status: 'Approved',
    invoiceNumber: 'INV-2024-889',
    vendor: 'Saudi Concrete Co.'
  },
  {
    id: 'EXP-002',
    projectId: '1',
    category: 'Labor',
    description: 'May 2024 Payroll - Site Staff',
    amount: 320000,
    date: '2024-06-02',
    status: 'Paid',
    invoiceNumber: 'PAY-MAY-24'
  },
  {
    id: 'EXP-003',
    projectId: '1',
    category: 'Equipment',
    description: 'Tower Crane Rental - June',
    amount: 45000,
    date: '2024-06-05',
    status: 'Pending',
    vendor: 'Heavy Lift Equipment'
  },
  {
    id: 'EXP-004',
    projectId: '1',
    category: 'Subcontractor',
    description: 'MEP First Payment',
    amount: 500000,
    date: '2024-06-10',
    status: 'Approved',
    vendor: 'Advanced MEP Solutions'
  }
];

export const MOCK_RESOURCES: Resource[] = [
  {
    id: 'RES-001',
    name: 'Cement (Type I)',
    type: 'Material',
    unit: 'Ton',
    costPerUnit: 350,
    totalQuantity: 5000,
    usedQuantity: 1200,
    projectId: '1'
  },
  {
    id: 'RES-002',
    name: 'Steel Rebar (16mm)',
    type: 'Material',
    unit: 'Ton',
    costPerUnit: 2800,
    totalQuantity: 2000,
    usedQuantity: 450,
    projectId: '1'
  },
  {
    id: 'RES-003',
    name: 'Excavator (CAT 320)',
    type: 'Equipment',
    unit: 'Hour',
    costPerUnit: 250,
    totalQuantity: 1000,
    usedQuantity: 320,
    projectId: '1'
  },
  {
    id: 'RES-004',
    name: 'General Labor',
    type: 'Labor',
    unit: 'Man-Day',
    costPerUnit: 150,
    totalQuantity: 10000,
    usedQuantity: 2500,
    projectId: '1'
  }
];

export const MOCK_TIMESHEETS: Timesheet[] = [
  { 
    id: 'TS-001', 
    employee: 'Ahmed Ali', 
    role: 'Site Engineer',
    project: 'RYD-001', 
    date: '2024-06-01',
    hours: 8, 
    overtime: 2,
    activity: 'Supervising concrete pour',
    status: 'Approved' 
  },
  { 
    id: 'TS-002', 
    employee: 'Sarah Khan', 
    role: 'Architect',
    project: 'RYD-001', 
    date: '2024-06-01',
    hours: 8, 
    overtime: 0,
    activity: 'Design review meeting',
    status: 'Approved' 
  },
  { 
    id: 'TS-003', 
    employee: 'Mohammed Sami', 
    role: 'Foreman',
    project: 'JED-002', 
    date: '2024-06-02',
    hours: 9, 
    overtime: 1,
    activity: 'Site preparation',
    status: 'Pending' 
  },
  { 
    id: 'TS-004', 
    employee: 'John Doe', 
    role: 'Safety Officer',
    project: 'RYD-001', 
    date: '2024-06-02',
    hours: 8, 
    overtime: 0,
    activity: 'Safety inspection',
    status: 'Approved' 
  },
  { 
    id: 'TS-005', 
    employee: 'Fatima Noor', 
    role: 'Civil Engineer',
    project: 'JED-002', 
    date: '2024-06-03',
    hours: 8, 
    overtime: 0,
    activity: 'Quality check',
    status: 'Pending' 
  },
  { 
    id: 'TS-006', 
    employee: 'Ali Hassan', 
    role: 'Labor',
    project: 'RYD-001', 
    date: '2024-06-03',
    hours: 10, 
    overtime: 2,
    activity: 'Excavation work',
    status: 'Rejected' 
  }
];


export const MOCK_AUDIT_LOGS = [
  {
    id: 'LOG-001',
    user_id: 'USR-001',
    action: 'LOGIN',
    entity_type: 'user',
    entity_name: 'Ahmed Ali',
    ip_address: '192.168.1.1',
    created_at: '2024-06-01T08:00:00Z',
    user: { id: 'USR-001', email: 'ahmed@example.com', full_name: 'Ahmed Ali' }
  },
  {
    id: 'LOG-002',
    user_id: 'USR-001',
    action: 'CREATE',
    entity_type: 'project',
    entity_id: 'RYD-001',
    entity_name: 'Riyadh Financial Tower',
    new_values: { budget: 50000000, location: 'Riyadh' },
    created_at: '2024-06-01T09:30:00Z',
    user: { id: 'USR-001', email: 'ahmed@example.com', full_name: 'Ahmed Ali' }
  },
  {
    id: 'LOG-003',
    user_id: 'USR-002',
    action: 'UPDATE',
    entity_type: 'task',
    entity_id: 'TSK-101',
    entity_name: 'Excavation Phase 1',
    old_values: { progress: 50 },
    new_values: { progress: 75 },
    created_at: '2024-06-01T14:15:00Z',
    user: { id: 'USR-002', email: 'sarah@example.com', full_name: 'Sarah Khan' }
  },
  {
    id: 'LOG-004',
    user_id: 'USR-003',
    action: 'APPROVE',
    entity_type: 'timesheet',
    entity_id: 'TS-001',
    entity_name: 'Ahmed Ali - June 1',
    created_at: '2024-06-02T10:00:00Z',
    user: { id: 'USR-003', email: 'manager@example.com', full_name: 'Project Manager' }
  },
  {
    id: 'LOG-005',
    user_id: 'USR-001',
    action: 'CREATE',
    entity_type: 'ncr',
    entity_id: 'NCR-001',
    entity_name: 'Concrete Crack',
    new_values: { severity: 'High', location: 'Zone A' },
    created_at: '2024-06-03T11:20:00Z',
    user: { id: 'USR-001', email: 'ahmed@example.com', full_name: 'Ahmed Ali' }
  },
  {
    id: 'LOG-006',
    user_id: 'USR-004',
    action: 'DELETE',
    entity_type: 'document',
    entity_id: 'DOC-999',
    entity_name: 'Old Draft Plan',
    created_at: '2024-06-04T16:45:00Z',
    user: { id: 'USR-004', email: 'admin@example.com', full_name: 'System Admin' }
  },
  {
    id: 'LOG-007',
    user_id: 'USR-002',
    action: 'EXPORT',
    entity_type: 'report',
    entity_name: 'Monthly Progress Report',
    created_at: '2024-06-05T09:00:00Z',
    user: { id: 'USR-002', email: 'sarah@example.com', full_name: 'Sarah Khan' }
  }
];

