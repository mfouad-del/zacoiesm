import { Project } from '../types';

export const MOCK_PROJECTS: Project[] = [
  {
    id: '1',
    name: 'برج الرياض المالي',
    code: 'RYD-001',
    budget: 50000000,
    startDate: '2024-01-01',
    endDate: '2025-12-31',
    status: 'Active',
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
    status: 'Active',
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
    projectId: '1',
    date: '2024-06-01',
    weather: 'Sunny',
    temperature: 38,
    manpower: 150,
    activities: 'صب الخرسانة للدور الأول',
    issues: 'تأخر وصول شاحنات الأسمنت'
  }
];

export const MOCK_NCRS = [
  {
    id: '1',
    projectId: '1',
    description: 'عدم مطابقة عينات الخرسانة للمواصفات',
    severity: 'High',
    status: 'Open',
    issuedDate: '2024-05-25',
    dueDate: '2024-06-01'
  }
];

export const MOCK_INCIDENTS = [
  {
    id: '1',
    projectId: '1',
    type: 'Near Miss',
    description: 'سقوط مطرقة من السقالة',
    date: '2024-04-15',
    status: 'Closed',
    actionTaken: 'تم إعادة توجيه العمال بإجراءات السلامة'
  }
];

export const MOCK_DOCUMENTS = [
  {
    id: '1',
    projectId: '1',
    name: 'المخططات المعمارية - الدور الأول',
    type: 'Drawing',
    version: 'A0',
    uploadDate: '2024-01-05',
    status: 'Approved'
  }
];

export const MOCK_TIMESHEETS = [
  {
    id: '1',
    employeeName: 'محمد حسن',
    role: 'مهندس موقع',
    date: '2024-06-01',
    hours: 8,
    projectId: '1',
    status: 'Approved'
  }
];
