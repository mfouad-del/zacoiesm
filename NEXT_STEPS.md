# الخطوات التالية المباشرة
# Immediate Next Steps

## 🎯 ما تم الآن (في هذه الجلسة)

### ✅ 1. إصلاح مشكلة الأدوار
- **المشكلة:** كان يظهر 4 أدوار فقط بدلاً من 9
- **الحل:** 
  - ✅ تحديث `SettingsView.tsx` dropdown ليعرض 9 أدوار
  - ✅ تحديث `consolidated_schema.sql` CHECK constraint
  - ✅ إنشاء `types.ts` مع UserRole enum الصحيح

### ✅ 2. إنشاء نظام RBAC متكامل
- ✅ `scripts/013_complete_rbac_system.sql` - 380 سطر
  - جدول role_permissions
  - دوال SQL للتحقق
  - RLS policies
  - Audit log

### ✅ 3. إنشاء Permissions Hook
- ✅ `hooks/usePermissions.ts` - 300+ سطر
  - مصفوفة الصلاحيات الكاملة
  - دوال مساعدة
  - TypeScript types

### ✅ 4. إنشاء Auth Hook
- ✅ `lib/hooks/useAuth.ts` - 150+ سطر
  - useAuth للكومبوننتات
  - getCurrentUser للـ actions
  - requireAuth & requireRole

### ✅ 5. إنشاء الوثائق
- ✅ `docs/RBAC_MATRIX.md` - مصفوفة الصلاحيات الكاملة
- ✅ `docs/IMPLEMENTATION_GUIDE.md` - دليل التطبيق
- ✅ `docs/PROJECT_REVIEW.md` - مراجعة شاملة
- ✅ `TODO.md` - قائمة المهام المحدثة

---

## 🚨 ما يجب فعله الآن (بالترتيب)

### الخطوة 1: تشغيل SQL Script (5 دقائق)
```bash
# 1. افتح Supabase Dashboard
# 2. اذهب لـ SQL Editor
# 3. افتح ملف: scripts/013_complete_rbac_system.sql
# 4. انسخ المحتوى كاملاً
# 5. الصقه في SQL Editor
# 6. اضغط "Run" أو Ctrl+Enter
```

**التحقق من النجاح:**
```sql
-- يجب أن يرجع 99 صف (11 modules × 9 roles)
SELECT COUNT(*) FROM public.role_permissions;

-- يجب أن يعرض 9 أدوار
SELECT * FROM public.role_hierarchy ORDER BY hierarchy_level;

-- يجب أن يعرض الـ constraint الجديد
SELECT constraint_name, check_clause 
FROM information_schema.check_constraints 
WHERE constraint_name = 'users_role_check';
```

---

### الخطوة 2: اختبار إنشاء مستخدم (3 دقائق)
```bash
# 1. افتح التطبيق في المتصفح
# 2. اذهب لـ Settings → المستخدمين
# 3. اضغط "إضافة مستخدم جديد"
# 4. تحقق أن القائمة المنسدلة تعرض 9 أدوار:
#    - مدير النظام (Super Admin)
#    - مدير (Admin)
#    - مدير مشروع (Project Manager)
#    - مهندس موقع (Site Engineer)
#    - مدير الجودة (QA Manager)
#    - مسؤول السلامة (HSE Officer)
#    - محاسب (Accountant)
#    - عميل (Client)
#    - مشاهد (Viewer)
```

---

### الخطوة 3: تطبيق Permissions في ProjectsView (30 دقيقة)

افتح `components/ProjectsView.tsx` وأضف:

```typescript
// في بداية الملف
import { usePermissions } from '@/hooks/usePermissions';

// داخل Component
function ProjectsView() {
  const { can, canAccess } = usePermissions();
  
  // تحقق من الوصول
  if (!canAccess('projects')) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">غير مصرح لك</h2>
          <p className="text-muted-foreground">ليس لديك صلاحية الوصول لهذه الصفحة</p>
        </div>
      </div>
    );
  }
  
  // في جزء الأزرار
  return (
    <div>
      {/* زر إنشاء مشروع */}
      {can('projects', 'create') && (
        <Button onClick={() => setIsDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          إنشاء مشروع جديد
        </Button>
      )}
      
      {/* جدول المشاريع */}
      <Table>
        {/* ... */}
        <TableBody>
          {projects.map(project => (
            <TableRow key={project.id}>
              {/* ... */}
              <TableCell>
                {can('projects', 'update') && (
                  <Button variant="ghost" size="sm">
                    <Edit className="h-4 w-4" />
                  </Button>
                )}
                {can('projects', 'delete') && (
                  <Button variant="ghost" size="sm">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
```

---

### الخطوة 4: تطبيق Permissions في projects.ts Action (20 دقيقة)

افتح `lib/actions/projects.ts` وأضف:

```typescript
// في بداية الملف
import { requireAuth } from '@/lib/hooks/useAuth';
import { hasPermission, getPermissionScope } from '@/hooks/usePermissions';
import { UserRole } from '@/types';

// في getProjects
export async function getProjects() {
  try {
    // تحقق من المصادقة والصلاحية
    const user = await requireAuth();
    
    if (!hasPermission(user.role as UserRole, 'projects', 'read')) {
      throw new Error('غير مصرح لك بعرض المشاريع');
    }
    
    // تطبيق filtering حسب scope
    const scope = getPermissionScope(user.role as UserRole, 'projects');
    
    let query = supabase.from('projects').select('*');
    
    if (scope === 'assigned') {
      // عرض المشاريع المعينة فقط
      const { data: memberProjects } = await supabase
        .from('project_members')
        .select('project_id')
        .eq('user_id', user.id);
      
      const projectIds = memberProjects?.map(m => m.project_id) || [];
      query = query.in('id', projectIds);
    }
    
    const { data, error } = await query;
    if (error) throw error;
    
    return { success: true, data };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// في createProject
export async function createProject(formData: ProjectFormData) {
  try {
    const user = await requireAuth();
    
    if (!hasPermission(user.role as UserRole, 'projects', 'create')) {
      throw new Error('غير مصرح لك بإنشاء مشاريع');
    }
    
    // المتابعة مع الإنشاء...
    const { data, error } = await supabase
      .from('projects')
      .insert({
        ...formData,
        created_by: user.id,
      })
      .select()
      .single();
    
    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// في updateProject
export async function updateProject(projectId: string, formData: Partial<ProjectFormData>) {
  try {
    const user = await requireAuth();
    
    if (!hasPermission(user.role as UserRole, 'projects', 'update')) {
      throw new Error('غير مصرح لك بتعديل المشاريع');
    }
    
    const scope = getPermissionScope(user.role as UserRole, 'projects');
    
    if (scope === 'assigned') {
      // تحقق من أن المستخدم عضو في المشروع
      const { data: membership } = await supabase
        .from('project_members')
        .select('id')
        .eq('project_id', projectId)
        .eq('user_id', user.id)
        .single();
      
      if (!membership) {
        throw new Error('يمكنك فقط تعديل المشاريع المعينة لك');
      }
    }
    
    // المتابعة مع التعديل...
    const { data, error } = await supabase
      .from('projects')
      .update(formData)
      .eq('id', projectId)
      .select()
      .single();
    
    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// في deleteProject
export async function deleteProject(projectId: string) {
  try {
    const user = await requireAuth();
    
    if (!hasPermission(user.role as UserRole, 'projects', 'delete')) {
      throw new Error('غير مصرح لك بحذف المشاريع');
    }
    
    const { error } = await supabase
      .from('projects')
      .delete()
      .eq('id', projectId);
    
    if (error) throw error;
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
}
```

---

### الخطوة 5: اختبار النظام (15 دقيقة)

#### Test 1: Super Admin
```bash
# 1. سجل الدخول كـ super admin
# 2. تحقق أنك ترى:
#    ✅ جميع المشاريع
#    ✅ زر "إنشاء مشروع"
#    ✅ أزرار "تعديل" و "حذف"
#    ✅ جميع الخيارات في Sidebar
```

#### Test 2: Project Manager
```bash
# 1. أنشئ مستخدم بدور "Project Manager"
# 2. أضفه كعضو في مشروع واحد
# 3. سجل الدخول به
# 4. تحقق أنه:
#    ✅ يرى فقط المشروع المعين له
#    ❌ لا يرى باقي المشاريع
#    ✅ يستطيع التعديل
#    ❌ لا يستطيع الحذف
```

#### Test 3: Viewer
```bash
# 1. أنشئ مستخدم بدور "Viewer"
# 2. سجل الدخول به
# 3. تحقق أنه:
#    ✅ يرى جميع المشاريع
#    ❌ لا يرى زر "إنشاء"
#    ❌ لا يرى أزرار "تعديل" أو "حذف"
#    ❌ Sidebar محدود
```

---

## 📋 الخطوات بعد ذلك

### اليوم نفسه (2-3 ساعات)
- [ ] كرر نفس النمط في `PlanningView.tsx` (المهام)
- [ ] كرر نفس النمط في `lib/actions/tasks.ts`

### غداً (3-4 ساعات)
- [ ] تحديث `Sidebar.tsx` لإخفاء الخيارات غير المصرح بها
- [ ] إضافة loading states و error handling

### هذا الأسبوع (8-10 ساعات)
- [ ] إكمال NCR UI
- [ ] إكمال Safety UI
- [ ] تحسين Costs UI

---

## 🆘 إذا واجهت مشاكل

### مشكلة: SQL Script فشل
```sql
-- تحقق من الأخطاء
-- ربما الجداول موجودة بالفعل
-- جرب:
DROP TABLE IF EXISTS public.role_permissions CASCADE;
-- ثم أعد تشغيل السكريبت
```

### مشكلة: useAuth لا يعمل
```bash
# تأكد من تثبيت supabase packages
npm install @supabase/auth-helpers-nextjs @supabase/supabase-js
```

### مشكلة: TypeScript errors
```bash
# تأكد من types صحيحة
# تحقق من types.ts موجود
# تحقق من imports صحيحة
```

---

## ✅ Checklist سريع

- [ ] ✅ تم تشغيل SQL Script في Supabase
- [ ] ✅ تم التحقق من وجود 99 صف في role_permissions
- [ ] ✅ تم اختبار إنشاء مستخدم - يظهر 9 أدوار
- [ ] ✅ تم تطبيق usePermissions في ProjectsView
- [ ] ✅ تم تطبيق permission checks في projects.ts
- [ ] ✅ تم الاختبار مع 3 أدوار مختلفة
- [ ] 🔄 الانتقال للخطوة التالية

---

**الوقت الإجمالي المتوقع لهذه الخطوات:** ~2 ساعة  
**الصعوبة:** متوسطة  
**الأولوية:** 🚨 عاجلة جداً

**بعد إكمال هذه الخطوات، سيكون لديك:**
- ✅ نظام صلاحيات يعمل بالكامل
- ✅ 9 أدوار فعالة
- ✅ UI محمي
- ✅ Backend محمي
- ✅ قاعدة بيانات محمية

**🎉 ثم يمكنك المتابعة لإكمال باقي الميزات بثقة!**
