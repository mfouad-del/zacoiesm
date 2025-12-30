import { z } from 'zod';

// ============================================
// PROJECT SCHEMAS
// ============================================
export const projectSchema = z.object({
  name: z.string().min(3, 'اسم المشروع يجب أن يكون 3 أحرف على الأقل'),
  description: z.string().optional(),
  status: z.enum(['planning', 'in_progress', 'on_hold', 'completed', 'cancelled']).default('planning'),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).default('medium'),
  start_date: z.string().refine((date) => !isNaN(Date.parse(date)), 'تاريخ غير صحيح'),
  end_date: z.string().refine((date) => !isNaN(Date.parse(date)), 'تاريخ غير صحيح'),
  budget: z.number().nonnegative('الميزانية يجب أن تكون موجبة').optional(),
  client_name: z.string().optional(),
  location: z.string().optional(),
  project_manager_id: z.string().uuid().optional()
}).refine((data) => new Date(data.end_date) >= new Date(data.start_date), {
  message: 'تاريخ الانتهاء يجب أن يكون بعد تاريخ البداية',
  path: ['end_date']
});

// ============================================
// TASK SCHEMAS
// ============================================
export const taskSchema = z.object({
  project_id: z.string().uuid('معرف المشروع غير صحيح'),
  title: z.string().min(3, 'عنوان المهمة يجب أن يكون 3 أحرف على الأقل'),
  description: z.string().optional(),
  status: z.enum(['todo', 'in_progress', 'review', 'completed']).default('todo'),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).default('medium'),
  assigned_to: z.string().uuid().optional(),
  due_date: z.string().refine((date) => !isNaN(Date.parse(date)), 'تاريخ غير صحيح').optional()
});

// ============================================
// TIMESHEET SCHEMAS
// ============================================
export const timesheetSchema = z.object({
  project_id: z.string().uuid('معرف المشروع غير صحيح'),
  task_id: z.string().uuid().optional(),
  work_date: z.string().refine((date) => !isNaN(Date.parse(date)), 'تاريخ غير صحيح'),
  hours_worked: z.number()
    .min(0, 'الساعات يجب أن تكون موجبة')
    .max(24, 'الساعات يجب ألا تتجاوز 24 ساعة'),
  overtime_hours: z.number()
    .min(0, 'ساعات الإضافي يجب أن تكون موجبة')
    .max(12, 'ساعات الإضافي يجب ألا تتجاوز 12 ساعة')
    .default(0),
  description: z.string().optional()
});

// ============================================
// NCR SCHEMAS
// ============================================
export const ncrSchema = z.object({
  project_id: z.string().uuid('معرف المشروع غير صحيح'),
  title: z.string().min(5, 'عنوان NCR يجب أن يكون 5 أحرف على الأقل'),
  description: z.string().min(10, 'الوصف يجب أن يكون 10 أحرف على الأقل'),
  severity: z.enum(['low', 'medium', 'high', 'critical']),
  assigned_to: z.string().uuid().optional(),
  due_date: z.string().refine((date) => !isNaN(Date.parse(date)), 'تاريخ غير صحيح').optional()
});

// ============================================
// CONTRACT SCHEMAS
// ============================================
export const contractSchema = z.object({
  project_id: z.string().uuid('معرف المشروع غير صحيح'),
  contract_number: z.string().min(3, 'رقم العقد يجب أن يكون 3 أحرف على الأقل'),
  title: z.string().min(5, 'عنوان العقد يجب أن يكون 5 أحرف على الأقل'),
  client_name: z.string().min(3, 'اسم العميل يجب أن يكون 3 أحرف على الأقل'),
  contractor_name: z.string().optional(),
  contract_value: z.number().positive('قيمة العقد يجب أن تكون موجبة'),
  currency: z.string().default('SAR'),
  start_date: z.string().refine((date) => !isNaN(Date.parse(date)), 'تاريخ غير صحيح'),
  end_date: z.string().refine((date) => !isNaN(Date.parse(date)), 'تاريخ غير صحيح'),
  status: z.enum(['draft', 'active', 'completed', 'terminated']).default('draft')
}).refine((data) => new Date(data.end_date) >= new Date(data.start_date), {
  message: 'تاريخ الانتهاء يجب أن يكون بعد تاريخ البداية',
  path: ['end_date']
});

export const variationSchema = z.object({
  contract_id: z.string().uuid('معرف العقد غير صحيح'),
  variation_number: z.string().min(2, 'رقم التعديل يجب أن يكون حرفين على الأقل'),
  description: z.string().min(10, 'الوصف يجب أن يكون 10 أحرف على الأقل'),
  amount: z.number(),
  submitted_date: z.string().refine((date) => !isNaN(Date.parse(date)), 'تاريخ غير صحيح')
});

// ============================================
// SAFETY INCIDENT SCHEMAS
// ============================================
export const incidentSchema = z.object({
  project_id: z.string().uuid('معرف المشروع غير صحيح'),
  site_id: z.string().uuid().optional(),
  incident_type: z.enum(['near_miss', 'first_aid', 'medical_treatment', 'lost_time', 'fatality']),
  severity: z.enum(['low', 'medium', 'high', 'critical']),
  description: z.string().min(10, 'الوصف يجب أن يكون 10 أحرف على الأقل'),
  incident_date: z.string().refine((date) => !isNaN(Date.parse(date)), 'تاريخ غير صحيح'),
  location: z.string().optional(),
  injured_person: z.string().optional(),
  witnesses: z.string().optional(),
  immediate_action: z.string().optional()
});

// ============================================
// REPORT SCHEMAS
// ============================================
export const reportSchema = z.object({
  project_id: z.string().uuid('معرف المشروع غير صحيح'),
  site_id: z.string().uuid().optional(),
  title: z.string().min(5, 'عنوان التقرير يجب أن يكون 5 أحرف على الأقل'),
  type: z.enum(['daily', 'weekly', 'monthly', 'incident', 'safety', 'progress', 'financial']),
  content: z.record(z.any()),
  report_date: z.string().refine((date) => !isNaN(Date.parse(date)), 'تاريخ غير صحيح')
});

// ============================================
// DOCUMENT SCHEMAS
// ============================================
export const documentSchema = z.object({
  name: z.string().min(3, 'اسم المستند يجب أن يكون 3 أحرف على الأقل'),
  project_id: z.string().uuid().optional(),
  site_id: z.string().uuid().optional()
});

// ============================================
// EVM INPUT SCHEMA
// ============================================
export const evmInputSchema = z.object({
  budgetAtCompletion: z.number().positive('الميزانية عند الانتهاء يجب أن تكون موجبة'),
  plannedValue: z.number().nonnegative('القيمة المخططة يجب أن تكون موجبة أو صفر'),
  earnedValue: z.number().nonnegative('القيمة المكتسبة يجب أن تكون موجبة أو صفر'),
  actualCost: z.number().nonnegative('التكلفة الفعلية يجب أن تكون موجبة أو صفر')
}).refine((data) => data.earnedValue <= data.budgetAtCompletion, {
  message: 'القيمة المكتسبة لا يجب أن تتجاوز الميزانية عند الانتهاء',
  path: ['earnedValue']
}).refine((data) => data.plannedValue <= data.budgetAtCompletion, {
  message: 'القيمة المخططة لا يجب أن تتجاوز الميزانية عند الانتهاء',
  path: ['plannedValue']
});

// ============================================
// COST TRACKING SCHEMA
// ============================================
export const costTrackingSchema = z.object({
  project_id: z.string().uuid('معرف المشروع غير صحيح'),
  period_date: z.string().refine((date) => !isNaN(Date.parse(date)), 'تاريخ غير صحيح'),
  planned_value: z.number().nonnegative('القيمة المخططة يجب أن تكون موجبة أو صفر'),
  earned_value: z.number().nonnegative('القيمة المكتسبة يجب أن تكون موجبة أو صفر'),
  actual_cost: z.number().nonnegative('التكلفة الفعلية يجب أن تكون موجبة أو صفر'),
  budget_at_completion: z.number().positive('الميزانية عند الانتهاء يجب أن تكون موجبة')
});

// Type exports
export type ProjectInput = z.infer<typeof projectSchema>;
export type TaskInput = z.infer<typeof taskSchema>;
export type TimesheetInput = z.infer<typeof timesheetSchema>;
export type NCRInput = z.infer<typeof ncrSchema>;
export type ContractInput = z.infer<typeof contractSchema>;
export type VariationInput = z.infer<typeof variationSchema>;
export type IncidentInput = z.infer<typeof incidentSchema>;
export type ReportInput = z.infer<typeof reportSchema>;
export type DocumentInput = z.infer<typeof documentSchema>;
export type EVMInput = z.infer<typeof evmInputSchema>;
export type CostTrackingInput = z.infer<typeof costTrackingSchema>;
