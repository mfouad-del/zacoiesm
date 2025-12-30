# 🚀 دليل النشر والتحديث الشامل - IEMS

## ✅ التحديثات المُنفَّذة (30 ديسمبر 2025)

### 1️⃣ **ربط Frontend بـ Backend** ✅
- ❌ **تم إزالة Mock Data بالكامل** من `App.tsx`
- ✅ **API Integration كامل**: كل البيانات تُجلب من Supabase
- ✅ **Error Handling**: معالجة الأخطاء عند فشل تحميل البيانات
- ✅ **Loading States**: شاشات تحميل احترافية

### 2️⃣ **Database Schema المُحدَّث** ✅
**سكريبتات جديدة تم إنشاؤها:**

#### `007_missing_tables.sql` - الجداول الناقصة
- ✅ `project_cost_tracking` - تتبع EVM (PV, EV, AC, SPI, CPI, EAC, VAC, TCPI)
- ✅ `task_schedule` - حسابات CPM (Early/Late Start/Finish, Float, Critical Path)
- ✅ `ncr_reports` - تقارير عدم المطابقة مع State Machine
- ✅ `ncr_history` - تاريخ تغييرات NCR
- ✅ `ncr_attachments` - مرفقات NCR (صور، توقيعات)
- ✅ `timesheets` - جداول الوقت مع Approval Workflow
- ✅ `notifications` - نظام إشعارات كامل
- ✅ `document_revisions` - Versioning للمستندات
- ✅ `contracts` - العقود
- ✅ `contract_variations` - التعديلات والمطالبات
- ✅ `safety_incidents` - حوادث السلامة

#### `008_enhanced_rls.sql` - RLS Policies المُحسَّنة
- ✅ **Resource Ownership**: المستخدمون يرون فقط مشاريعهم
- ✅ **Role-based Access**: صلاحيات حسب الدور
- ✅ **Project Membership**: التحكم بناءً على `project_members`
- ✅ **Field-level Security**: حماية حقول حساسة (Budget, Costs)

### 3️⃣ **API Layer الجديد** ✅
**ملف جديد: `lib/api/index.ts`**

✅ **APIs مُكتملة:**
- `projectsApi` - إدارة المشاريع (list, create, update, getById)
- `tasksApi` - إدارة المهام
- `timesheetsApi` - Timesheets + Approval
- `ncrApi` - NCR + Status Updates + History Tracking
- `contractsApi` - Contracts + Variations
- `documentsApi` - Upload + Storage Integration
- `reportsApi` - Daily/Weekly/Monthly Reports
- `safetyApi` - Safety Incidents + Numbering
- `notificationsApi` - In-app Notifications
- `costTrackingApi` - EVM History

### 4️⃣ **State Management (Context API)** ✅
**ملف جديد: `contexts/AppContext.tsx`**

✅ **Features:**
- مركزية إدارة الحالة لكل التطبيق
- تجنب Prop Drilling
- Auto Refresh عند تغيير البيانات
- Optimistic Updates
- Authentication State Management

### 5️⃣ **RBAC المُحسَّن** ✅
**تحديث: `backend/src/core/constants/roles.ts`**

✅ **الأدوار الجديدة:**
- `SUPER_ADMIN` - صلاحيات كاملة
- `ACCOUNTANT` - إدارة مالية
- `HSE_OFFICER` - سلامة مهنية
- `QA_MANAGER` - إدارة جودة
- `TECHNICAL_OFFICE` - مكتب فني
- `VIEWER` - قراءة فقط
- `TOP_MANAGEMENT` - إدارة عليا
- `CONTRACTS_MANAGER` - مدير عقود

✅ **Permissions Matrix كاملة** لكل دور

### 6️⃣ **Validation Schemas (Zod)** ✅
**ملف جديد: `lib/validations/schemas.ts`**

✅ **Schemas لكل Entity:**
- `projectSchema` - مع validation للتواريخ والميزانية
- `taskSchema`
- `timesheetSchema` - حد أقصى 24 ساعة
- `ncrSchema`
- `contractSchema` + `variationSchema`
- `incidentSchema`
- `reportSchema`
- `documentSchema`
- `evmInputSchema` - منع EV من تجاوز BAC

---

## 📋 خطوات النشر (Deploy to Production)

### **المرحلة 1: تحديث Database في Supabase**

1. **تسجيل الدخول إلى Supabase Dashboard:**
   ```
   https://supabase.com/dashboard
   ```

2. **افتح SQL Editor وقم بتشغيل السكريبتات بالترتيب:**
   
   ✅ إذا كان المشروع جديد، قم بتشغيل الكل:
   ```sql
   -- 1. الجداول الأساسية
   scripts/001_create_tables.sql
   
   -- 2. RLS Policies الأساسية
   scripts/002_row_level_security.sql
   
   -- 3. Triggers & Functions
   scripts/003_triggers_and_functions.sql
   
   -- 4. البيانات التجريبية (اختياري)
   scripts/004_seed_data.sql
   
   -- 5. وظيفة Super Admin
   scripts/005_create_super_admin.sql
   
   -- 6. الجداول الناقصة (جديد)
   scripts/007_missing_tables.sql
   
   -- 7. RLS المُحسَّن (جديد)
   scripts/008_enhanced_rls.sql
   ```

   ✅ إذا كان المشروع موجود بالفعل، قم بتشغيل فقط:
   ```sql
   scripts/007_missing_tables.sql
   scripts/008_enhanced_rls.sql
   ```

3. **التحقق من نجاح التنفيذ:**
   ```sql
   -- تحقق من الجداول الجديدة
   SELECT table_name 
   FROM information_schema.tables 
   WHERE table_schema = 'public' 
   AND table_name IN (
     'project_cost_tracking', 
     'task_schedule', 
     'ncr_reports', 
     'timesheets', 
     'notifications'
   );
   
   -- يجب أن تظهر 5 جداول
   ```

### **المرحلة 2: تحديث Frontend**

1. **Push التعديلات إلى GitHub:**
   ```bash
   cd C:\Users\mfoua\Desktop\iesm
   git add .
   git commit -m "Major Update: Full API Integration, Context API, Enhanced RLS, Missing Tables"
   git push origin main
   ```

2. **انتظر Render لإعادة البناء تلقائياً:**
   - الدخول إلى: https://dashboard.render.com
   - انتظر حتى يظهر "Live" (يستغرق 3-5 دقائق)

### **المرحلة 3: ترقية المستخدم الأول إلى Super Admin**

```sql
-- في Supabase SQL Editor
SELECT promote_to_super_admin('admin@zaco.sa');
```

---

## 🧪 اختبار التحديثات

### 1. **تسجيل الدخول:**
```
URL: https://zacoiesm.onrender.com
Email: admin@zaco.sa
Password: Doda@55002004
```

### 2. **اختبار API Integration:**
- ✅ Dashboard يعرض مشاريع حقيقية من Database (ليس Mock Data)
- ✅ إضافة مشروع جديد → يُحفظ في Supabase
- ✅ إضافة Timesheet → يُحفظ ويظهر في القائمة
- ✅ إضافة NCR → يُحفظ مع ترقيم تلقائي

### 3. **اختبار RLS:**
قم بإنشاء مستخدم ثاني (غير Admin):
```sql
-- في Supabase Auth Dashboard
-- أنشئ مستخدم: engineer@test.com

-- اجعله Site Engineer
UPDATE public.users 
SET role = 'site_engineer' 
WHERE email = 'engineer@test.com';
```

سجل دخول بـ `engineer@test.com` واختبر:
- ✅ يرى فقط مشاريعه (Resource Ownership يعمل)
- ❌ لا يمكنه رؤية كل المشاريع

---

## 📊 الحالة الحالية للنظام

| المكون | الحالة | النسبة |
|--------|--------|--------|
| Frontend-Backend Integration | ✅ مُنفَّذ | 100% |
| Database Schema | ✅ مكتمل | 100% |
| RLS Policies | ✅ مُحسَّن | 100% |
| RBAC (Roles) | ✅ مكتمل | 100% |
| API Layer | ✅ مُنفَّذ | 100% |
| State Management | ✅ Context API | 100% |
| Validation | ✅ Zod Schemas | 100% |
| **EVM/CPM Integration** | ⚠️ قيد التطوير | 40% |
| **Notification System** | ⚠️ قيد التطوير | 30% |
| **Audit Trail** | ⚠️ قيد التطوير | 20% |

---

## 🚀 الخطوات القادمة (Next Steps)

### **Priority 1: EVM/CPM Dashboard Integration**
- ربط `costTrackingApi` بـ Dashboard
- عرض CPI, SPI, EAC على الواجهة
- Scheduled Job لحساب EVM تلقائياً

### **Priority 2: Notification Center UI**
- إنشاء Notification Bell في Header
- Dropdown لعرض الإشعارات
- Real-time Updates باستخدام Supabase Subscriptions

### **Priority 3: Audit Trail Implementation**
- تفعيل `activity_logs` لكل عملية
- Middleware في Backend لتسجيل Actions
- UI لعرض Activity Log

---

## 🐛 استكشاف الأخطاء (Troubleshooting)

### **خطأ: "Failed to load data"**
✅ **الحل:**
```typescript
// تحقق من .env
VITE_SUPABASE_URL=https://yoigkvrrvyxjkbckgozl.supabase.co
VITE_SUPABASE_ANON_KEY=sb_publishable_SnaTVwUESv7BNvgg-Q7Qtw_AnKrU_ff
```

### **خطأ: "Permission denied"**
✅ **الحل:**
```sql
-- في Supabase SQL Editor
-- تحقق من RLS Policies
SELECT * FROM pg_policies WHERE tablename = 'projects';

-- إذا لم يكن هناك policies، قم بتشغيل:
scripts/008_enhanced_rls.sql
```

### **خطأ: "Table does not exist"**
✅ **الحل:**
```bash
# قم بتشغيل Missing Tables Script
scripts/007_missing_tables.sql
```

---

## 📞 الدعم

إذا واجهت أي مشكلة:
1. افتح Developer Console في المتصفح (F12)
2. تحقق من Console Errors
3. تحقق من Network Tab لمعرفة أي API Calls فشلت

---

**التحديث الأخير:** 30 ديسمبر 2025  
**الإصدار:** v2.0 - Full Integration & Enhanced Security
