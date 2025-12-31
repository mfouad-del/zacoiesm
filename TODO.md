# قائمة المهام - IEMS
# TODO List

## 🚨 عاجل جداً (Priority 1)

### 1. تشغيل SQL Scripts في Supabase
**الحالة:** ⚠️ لم يتم بعد  
**الأهمية:** ⭐⭐⭐⭐⭐ (حرج)  
**الوقت المتوقع:** 30 دقيقة

**الخطوات:**
1. [ ] فتح Supabase Dashboard → SQL Editor
2. [ ] نسخ محتوى `scripts/013_complete_rbac_system.sql`
3. [ ] لصقه في SQL Editor وتشغيله
4. [ ] التحقق من نجاح العملية:
   ```sql
   SELECT * FROM public.role_permissions LIMIT 10;
   SELECT * FROM public.role_hierarchy;
   ```
5. [ ] التحقق من CHECK constraint:
   ```sql
   SELECT constraint_name, check_clause 
   FROM information_schema.check_constraints 
   WHERE constraint_name = 'users_role_check';
   ```

**لماذا عاجل:**
- بدونه، لن تعمل الأدوار التسعة في قاعدة البيانات
- ضروري لاختبار نظام الصلاحيات
- يؤثر على جميع المهام الأخرى

---

### 2. تطبيق usePermissions في المكونات الرئيسية
**الحالة:** ⚠️ Hook جاهز، لكن لم يُطبق  
**الأهمية:** ⭐⭐⭐⭐⭐ (حرج)  
**الوقت المتوقع:** 3-4 ساعات

#### 2.1 ProjectsView.tsx
- [ ] Import usePermissions
- [ ] إضافة canAccess check في بداية Component
- [ ] إخفاء زر "إنشاء مشروع" إذا لم يكن لديه can('projects', 'create')
- [ ] إخفاء زر "تعديل" إذا لم يكن لديه can('projects', 'update')
- [ ] إخفاء زر "حذف" إذا لم يكن لديه can('projects', 'delete')
- [ ] تطبيق scope filtering على القوائم

#### 2.2 PlanningView.tsx (المهام)
- [ ] Import usePermissions
- [ ] إضافة canAccess('tasks') check
- [ ] إخفاء زر "إنشاء مهمة" حسب الصلاحية
- [ ] إخفاء أزرار التعديل/الحذف حسب الصلاحية
- [ ] إظهار زر "موافقة" فقط لمن لديه can('tasks', 'approve')

#### 2.3 SettingsView.tsx
- [ ] Import usePermissions
- [ ] إخفاء تبويب "المستخدمين" إذا لم يكن لديه canAccess('users')
- [ ] إخفاء زر "إضافة مستخدم" إذا لم يكن لديه can('users', 'create')
- [ ] إخفاء زر "حذف مستخدم" إذا لم يكن لديه can('users', 'delete')
- [ ] إظهار badge "Super Admin فقط" للخيارات المحظورة

---

### 3. إضافة Permission Checks في Server Actions
**الحالة:** ⚠️ Actions موجودة بدون تحقق  
**الأهمية:** ⭐⭐⭐⭐⭐ (حرج - أمان)  
**الوقت المتوقع:** 3-4 ساعات

#### 3.1 lib/actions/projects.ts
- [ ] Import `requireAuth`, `hasPermission`, `getPermissionScope`
- [ ] في `getProjects()`:
  ```typescript
  const user = await requireAuth();
  if (!hasPermission(user.role, 'projects', 'read')) {
    throw new Error('Unauthorized');
  }
  const scope = getPermissionScope(user.role, 'projects');
  // تطبيق filtering حسب scope
  ```
- [ ] في `createProject()`:
  ```typescript
  const user = await requireAuth();
  if (!hasPermission(user.role, 'projects', 'create')) {
    throw new Error('Unauthorized');
  }
  ```
- [ ] في `updateProject()`: تحقق من can('projects', 'update')
- [ ] في `deleteProject()`: تحقق من can('projects', 'delete')

#### 3.2 lib/actions/tasks.ts
- [ ] نفس النمط في getProjects
- [ ] إضافة scope filtering (assigned vs project vs all)
- [ ] التحقق من approval permission

#### 3.3 lib/actions/users.ts
- [ ] التحقق من can('users', 'create') في createUser
- [ ] منع VIEWER من الوصول نهائياً
- [ ] منع حذف المستخدمين إلا لـ SUPER_ADMIN

---

## ⚡ مهم (Priority 2)

### 4. تحديث Sidebar مع Access Control
**الحالة:** ❌ لم يتم  
**الأهمية:** ⭐⭐⭐⭐  
**الوقت المتوقع:** 1-2 ساعة

- [ ] Import usePermissions في `components/Sidebar.tsx`
- [ ] إنشاء array من menuItems مع property `requiredModule`
- [ ] Filter menuItems حسب canAccess
- [ ] إضافة badge للخيارات المحظورة (optional)

**مثال:**
```typescript
const menuItems = [
  { id: 'dashboard', label: 'الرئيسية', icon: Home, module: null },
  { id: 'projects', label: 'المشاريع', icon: Folder, module: 'projects' },
  { id: 'tasks', label: 'المهام', icon: CheckSquare, module: 'tasks' },
  // ...
].filter(item => !item.module || canAccess(item.module));
```

---

### 5. إكمال NCR UI (Quality View)
**الحالة:** ⚠️ UI بسيط جداً  
**الأهمية:** ⭐⭐⭐⭐  
**الوقت المتوقع:** 4-6 ساعات

#### 5.1 إنشاء NCR
- [ ] نموذج كامل مع:
  - [ ] رقم NCR (تلقائي)
  - [ ] المشروع
  - [ ] النوع (design, construction, material, etc.)
  - [ ] الوصف
  - [ ] الخطورة
  - [ ] الصور (رفع)
  - [ ] المسؤول

#### 5.2 جدول NCRs
- [ ] عرض جميع NCRs
- [ ] Filtering (حسب المشروع، الحالة، النوع)
- [ ] Sorting
- [ ] Pagination
- [ ] Status badges (open, in-progress, closed)

#### 5.3 تفاصيل NCR
- [ ] صفحة منفصلة أو modal
- [ ] عرض جميع المعلومات
- [ ] Timeline للتعليقات والإجراءات
- [ ] زر "إغلاق NCR" (للمصرح لهم)
- [ ] Approval workflow

#### 5.4 Permissions
- [ ] QA_MANAGER: كل الصلاحيات
- [ ] PROJECT_MANAGER: موافقة فقط
- [ ] SITE_ENGINEER: إنشاء وتعديل فقط
- [ ] الباقي: قراءة فقط

---

### 6. إكمال Safety UI (Safety View)
**الحالة:** ⚠️ UI بسيط جداً  
**الأهمية:** ⭐⭐⭐⭐  
**الوقت المتوقع:** 4-6 ساعات

#### 6.1 تسجيل حادث
- [ ] نموذج كامل مع:
  - [ ] رقم الحادث (تلقائي)
  - [ ] التاريخ والوقت
  - [ ] الموقع
  - [ ] نوع الحادث
  - [ ] الخطورة
  - [ ] الوصف
  - [ ] المصابين (إن وجد)
  - [ ] الصور
  - [ ] الإجراءات المتخذة

#### 6.2 جدول الحوادث
- [ ] عرض جميع الحوادث
- [ ] Filtering (حسب المشروع، النوع، الخطورة)
- [ ] Sorting
- [ ] Status indicators

#### 6.3 Safety Inspections
- [ ] نموذج تفتيش سلامة
- [ ] Checklist items
- [ ] النتيجة (pass/fail)
- [ ] الملاحظات

#### 6.4 Statistics
- [ ] عدد الحوادث هذا الشهر
- [ ] الحوادث حسب النوع (pie chart)
- [ ] الاتجاه (trend line)
- [ ] Days since last incident

#### 6.5 Permissions
- [ ] HSE_OFFICER: كل الصلاحيات
- [ ] PROJECT_MANAGER: موافقة فقط
- [ ] SITE_ENGINEER: إنشاء وتعديل
- [ ] الباقي: قراءة فقط

---

## 📝 متوسط (Priority 3)

### 7. تحسين Costs UI
**الحالة:** ⚠️ موجود لكن بسيط  
**الأهمية:** ⭐⭐⭐  
**الوقت المتوقع:** 4-6 ساعات

#### 7.1 Budget Dashboard
- [ ] نظرة عامة على الميزانية
- [ ] Budget vs Actual (progress bar)
- [ ] Breakdown حسب الفئة (pie chart)
- [ ] Forecast

#### 7.2 Cost Tracking
- [ ] إضافة مصروف
- [ ] جدول المصروفات
- [ ] Filtering & Sorting
- [ ] Export to Excel

#### 7.3 Invoices
- [ ] إنشاء فاتورة
- [ ] جدول الفواتير
- [ ] الحالة (pending, paid, overdue)
- [ ] تذكير بالدفع

#### 7.4 Financial Reports
- [ ] تقرير شهري
- [ ] تقرير سنوي
- [ ] Profit & Loss
- [ ] Cash flow

#### 7.5 Permissions
- [ ] ACCOUNTANT: كل الصلاحيات
- [ ] ADMIN/SUPER_ADMIN: عرض وموافقة
- [ ] PROJECT_MANAGER: عرض مشاريعه فقط
- [ ] CLIENT: ملخص فقط
- [ ] الباقي: ممنوع

---

### 8. تحسين UX في جميع المكونات
**الحالة:** ⚠️ يحتاج تحسين  
**الأهمية:** ⭐⭐⭐  
**الوقت المتوقع:** 6-8 ساعات

#### 8.1 Loading States
- [ ] Spinner أثناء جلب البيانات
- [ ] Skeleton loaders للجداول
- [ ] Progress bar للعمليات الطويلة

#### 8.2 Error Handling
- [ ] Error boundary لكل route
- [ ] Toast للأخطاء
- [ ] Retry button
- [ ] رسائل خطأ واضحة بالعربي

#### 8.3 Success Feedback
- [ ] Toast للنجاح
- [ ] Animation للإضافة/التعديل
- [ ] Confetti للإنجازات

#### 8.4 Confirmation Dialogs
- [ ] تأكيد قبل الحذف
- [ ] تأكيد قبل الموافقة
- [ ] تأكيد قبل الإلغاء

#### 8.5 Tooltips
- [ ] شرح للأزرار
- [ ] توضيح للأيقونات
- [ ] سبب منع الوصول (للأزرار الممنوعة)

#### 8.6 Empty States
- [ ] رسالة عند عدم وجود بيانات
- [ ] اقتراحات لبدء العمل
- [ ] Illustration

---

### 9. إضافة Testing
**الحالة:** ⚠️ Unit tests فقط (72%)  
**الأهمية:** ⭐⭐⭐  
**الوقت المتوقع:** 8-10 ساعات

#### 9.1 Unit Tests
- [ ] usePermissions hook
- [ ] useAuth hook
- [ ] Utility functions

#### 9.2 Integration Tests
- [ ] Projects CRUD
- [ ] Tasks CRUD
- [ ] Users CRUD
- [ ] Permissions logic

#### 9.3 E2E Tests (Playwright)
- [ ] تسجيل الدخول
- [ ] إنشاء مشروع
- [ ] إنشاء مهمة
- [ ] رفع مستند
- [ ] Workflow approval

#### 9.4 Security Tests
- [ ] RLS policies
- [ ] Permission bypass attempts
- [ ] SQL injection
- [ ] XSS

---

## 🎯 لاحقاً (Priority 4)

### 10. Mobile Optimization
- [ ] تحسين responsive design
- [ ] Touch gestures
- [ ] Mobile navigation
- [ ] PWA support

### 11. Advanced Analytics
- [ ] Dashboard متقدم
- [ ] Custom reports
- [ ] Data visualization
- [ ] Predictive analytics

### 12. Multi-language Files
- [ ] فصل الترجمات لملفات منفصلة
- [ ] استخدام i18n library
- [ ] إضافة لغات أخرى (فرنسي؟)

### 13. Deployment
- [ ] Environment variables
- [ ] CI/CD pipeline
- [ ] Monitoring (Sentry)
- [ ] Backups
- [ ] SSL certificate
- [ ] CDN setup

### 14. Documentation للمستخدمين
- [ ] دليل المستخدم
- [ ] فيديوهات تعليمية
- [ ] FAQ
- [ ] دليل استكشاف الأخطاء

---

## 📊 ملخص الحالة

### عاجل جداً (يجب الآن)
- [⚠️] تشغيل SQL Scripts
- [⚠️] تطبيق Permissions في UI (3 مكونات)
- [⚠️] إضافة Permission Checks في Actions (3 ملفات)

### مهم (هذا الأسبوع)
- [❌] تحديث Sidebar
- [⚠️] إكمال NCR UI
- [⚠️] إكمال Safety UI

### متوسط (الأسبوع القادم)
- [⚠️] تحسين Costs UI
- [⚠️] تحسين UX
- [⚠️] إضافة Testing

### لاحقاً (الشهر القادم)
- [❌] Mobile Optimization
- [❌] Advanced Analytics
- [❌] Multi-language Files
- [❌] Deployment

---

## 🎯 التقدم الكلي

```
████████████████████░░░░░░░░░░ 67%

✅ مكتمل:   13 مهمة
⚠️  قيد التنفيذ: 8 مهام
❌ لم يبدأ:  21 مهمة
```

---

**آخر تحديث:** يناير 2025  
**الحالة:** 🚧 قيد التطوير النشط  
**الأولوية الحالية:** نظام الصلاحيات + UI للجودة والسلامة
