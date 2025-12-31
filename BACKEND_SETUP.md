# دليل الإعداد الكامل للنظام
# Complete System Setup Guide

## 🚀 خطوات الإعداد / Setup Steps

### 1️⃣ إعداد قاعدة البيانات / Database Setup

قم بتنفيذ الملفات التالية بالترتيب في Supabase SQL Editor:
Execute the following files in order in Supabase SQL Editor:

```sql
-- الخطوة 1: المخطط الأساسي / Step 1: Base Schema
-- نفذ: scripts/consolidated_schema.sql
-- Execute: scripts/consolidated_schema.sql

-- الخطوة 2: الجداول الإضافية / Step 2: Additional Tables
-- نفذ: scripts/additional_tables.sql
-- Execute: scripts/additional_tables.sql
```

### 2️⃣ التحقق من الجداول / Verify Tables

تأكد من إنشاء الجداول التالية:
Make sure the following tables are created:

**الجداول الأساسية / Core Tables:**
- ✅ users
- ✅ projects
- ✅ tasks
- ✅ contracts
- ✅ variations
- ✅ ncrs (Quality)
- ✅ incidents (Safety)
- ✅ documents
- ✅ reports
- ✅ timesheets
- ✅ sites
- ✅ equipment
- ✅ resources

**الجداول الجديدة / New Tables:**
- ✅ suppliers (المشتريات / Procurement)
- ✅ procurement_orders (المشتريات / Procurement)
- ✅ procurement_items (المشتريات / Procurement)
- ✅ correspondence (المراسلات / Correspondence)
- ✅ bim_models (نمذجة المعلومات / BIM)
- ✅ expenses (المصروفات / Expenses)
- ✅ resource_transactions (حركات المخزون / Inventory Transactions)

### 3️⃣ إعداد ملف البيئة / Environment Setup

تأكد من وجود ملف `.env` مع المتغيرات التالية:
Ensure `.env` file exists with the following variables:

```env
# Supabase Configuration
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# Optional: hCaptcha, Cloudflare R2, etc.
VITE_HCAPTCHA_SITE_KEY=your_hcaptcha_site_key
VITE_CF_R2_BUCKET=your_bucket_name
```

### 4️⃣ تثبيت الحزم / Install Packages

```bash
# إذا كنت تستخدم npm / If using npm
npm install

# أو إذا كنت تستخدم pnpm / Or if using pnpm
pnpm install
```

### 5️⃣ تشغيل التطبيق / Run Application

```bash
# وضع التطوير / Development Mode
npm run dev
# أو / or
pnpm dev

# بناء التطبيق / Build Application
npm run build
# أو / or
pnpm build
```

---

## 📊 الأقسام المحدثة / Updated Sections

### 1. المشتريات / Procurement ✅
**الوظائف:**
- ✅ عرض طلبات الشراء / View purchase orders
- ✅ إنشاء طلب شراء جديد / Create new purchase order
- ✅ إدارة الموردين / Manage suppliers
- ✅ تتبع حالات الطلبات / Track order statuses
- ✅ إحصائيات شاملة / Comprehensive statistics

**الجداول المستخدمة:**
- `suppliers`
- `procurement_orders`
- `procurement_items`

### 2. المخزون / Inventory ✅
**الوظائف:**
- ✅ عرض أصناف المخزون / View inventory items
- ✅ تتبع الكميات / Track quantities
- ✅ تنبيهات المخزون المنخفض / Low stock alerts
- ✅ سجل الحركات / Movement history
- ✅ البحث والتصفية / Search and filter

**الجداول المستخدمة:**
- `resources`
- `resource_transactions`

### 3. المراسلات / Correspondence ✅
**الوظائف:**
- ✅ إدارة المراسلات الواردة / Manage incoming correspondence
- ✅ إدارة المراسلات الصادرة / Manage outgoing correspondence
- ✅ المراسلات الداخلية / Internal communications
- ✅ تتبع الحالات / Status tracking
- ✅ البحث المتقدم / Advanced search

**الجداول المستخدمة:**
- `correspondence`

### 4. نمذجة المعلومات BIM ✅
**الوظائف:**
- ✅ رفع نماذج IFC / Upload IFC models
- ✅ عرض قائمة النماذج / View model list
- ✅ واجهة عارض 3D (قيد التطوير) / 3D viewer interface (in development)
- ✅ إدارة الإصدارات / Version management
- ✅ معلومات النماذج / Model information

**الجداول المستخدمة:**
- `bim_models`

---

## 🔧 الوظائف المتاحة في lib/services.ts

### المشتريات / Procurement
```typescript
fetchSuppliers()
createSupplier(supplier)
updateSupplier(id, updates)

fetchProcurementOrders(projectId?)
createProcurementOrder(order, items)
updateProcurementOrder(id, updates)
deleteProcurementOrder(id)
```

### المخزون / Inventory
```typescript
fetchInventory(siteId?)
createInventoryItem(item)
updateInventoryQuantity(id, quantity)

fetchResourceTransactions(resourceId?)
createResourceTransaction(transaction)
```

### المراسلات / Correspondence
```typescript
fetchCorrespondence(projectId?)
createCorrespondence(item)
updateCorrespondence(id, updates)
deleteCorrespondence(id)
```

### نمذجة المعلومات / BIM
```typescript
fetchBIMModels(projectId?)
createBIMModel(model)
updateBIMModel(id, updates)
deleteBIMModel(id)
```

---

## 🎨 التحسينات الجمالية / UI Improvements

### ✨ المكونات المحدثة / Updated Components
- ✅ ProcurementView.tsx (محسّن بالكامل)
- ✅ InventoryView.tsx (محسّن بالكامل)
- ✅ CorrespondenceView.tsx (محسّن بالكامل)
- ✅ BIMView.tsx (محسّن بالكامل)

### 🎨 التحسينات الرئيسية:
- ✅ **بطاقات إحصائية**: 4 بطاقات لكل قسم مع أيقونات ملونة
- ✅ **نظام ألوان متسق**: استخدام العلامة التجارية والألوان الدلالية
- ✅ **ترجمة كاملة**: عربي/إنجليزي لجميع العناصر
- ✅ **تصميم متجاوب**: يعمل على جميع الأجهزة
- ✅ **تجربة مستخدم محسنة**: مؤشرات تحميل، رسائل واضحة
- ✅ **بحث وتصفية**: في جميع الجداول
- ✅ **حالات ملونة**: badges مميزة لكل حالة

---

## 🔒 الأمان / Security

### Row Level Security (RLS)
جميع الجداول محمية بـ RLS:
All tables are protected with RLS:

- ✅ المستخدمون المصادق عليهم فقط / Authenticated users only
- ✅ صلاحيات حسب الدور / Role-based permissions
- ✅ سياسات INSERT/UPDATE/DELETE محددة / Specific INSERT/UPDATE/DELETE policies

### الأدوار المدعومة / Supported Roles:
- `super_admin`: كامل الصلاحيات / Full access
- `admin`: إدارة الشركة / Company management
- `project_manager`: إدارة المشاريع / Project management
- `site_engineer`: العمليات اليومية / Daily operations
- `qa_manager`: مراجعات الجودة / Quality reviews
- `hse_officer`: الصحة والسلامة / Health & safety
- `accountant`: إدارة التكاليف / Cost management
- `client`: عرض المشاريع الخاصة / View own projects
- `viewer`: قراءة فقط / Read-only

---

## 🐛 استكشاف الأخطاء / Troubleshooting

### مشكلة: لا تظهر البيانات
**الحل:**
1. تحقق من اتصال Supabase
2. تأكد من تنفيذ SQL scripts
3. تحقق من ملف `.env`

### مشكلة: خطأ في الصلاحيات
**الحل:**
1. تحقق من RLS policies
2. تأكد من تسجيل الدخول
3. تحقق من دور المستخدم

### مشكلة: الترجمات لا تعمل
**الحل:**
1. تحقق من ملف `constants.tsx`
2. تأكد من وجود جميع المفاتيح
3. أعد تشغيل التطبيق

---

## 📞 الدعم / Support

للمساعدة أو الأسئلة:
For help or questions:

- 📧 راجع التوثيق / Check documentation
- 🐛 افتح issue في GitHub / Open GitHub issue
- 💬 اتصل بفريق التطوير / Contact development team

---

## ✅ قائمة التحقق النهائية / Final Checklist

قبل البدء في الاستخدام:
Before starting:

- [ ] تنفيذ SQL scripts
- [ ] إعداد ملف `.env`
- [ ] تثبيت الحزم
- [ ] التحقق من اتصال Supabase
- [ ] إنشاء مستخدم تجريبي
- [ ] اختبار الأقسام الأربعة
- [ ] التحقق من الترجمات

---

**🎉 النظام جاهز للاستخدام!**
**🎉 System Ready to Use!**
