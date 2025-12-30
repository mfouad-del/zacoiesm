# 🚀 دليل الإعداد السريع - IEMS Pro v2.0

## 📋 المتطلبات الأساسية

- Node.js 18+ 
- npm أو pnpm
- حساب Supabase
- حساب hCaptcha (مجاني)

---

## ⚡ التثبيت السريع

### 1. استنساخ المشروع
```bash
git clone https://github.com/mfouad-del/zacoiesm.git
cd zacoiesm
```

### 2. تثبيت المكتبات
```bash
npm install
```

### 3. إعداد Environment Variables
```bash
cp .env.example .env
```

املأ الملف `.env`:
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_HCAPTCHA_SITE_KEY=your-hcaptcha-site-key
VITE_ENCRYPTION_KEY=your-32-character-encryption-key
```

### 4. إعداد Supabase Database

#### A. تنفيذ SQL Scripts بالترتيب:
1. `scripts/001_create_tables.sql`
2. `scripts/002_row_level_security.sql`
3. `scripts/003_triggers_and_functions.sql`
4. `scripts/004_seed_data.sql`
5. `scripts/005_create_super_admin.sql`
6. `scripts/007_missing_tables.sql`
7. `scripts/008_enhanced_rls.sql`

#### B. إنشاء Storage Bucket:
```sql
-- في Supabase SQL Editor
INSERT INTO storage.buckets (id, name, public)
VALUES ('documents', 'documents', true);

-- Storage Policies
CREATE POLICY "Authenticated users can upload"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'documents');

CREATE POLICY "Users can view their files"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'documents');

CREATE POLICY "Users can delete their files"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'documents' AND auth.uid()::text = (storage.foldername(name))[1]);
```

### 5. تشغيل المشروع
```bash
npm run dev
```

الموقع سيفتح على: `http://localhost:3000/pm/`

---

## 🔑 بيانات الدخول الافتراضية

```
Email: admin@zaco.sa
Password: admin123
```

---

## 🛠️ إعداد hCaptcha

1. سجل حساب مجاني: https://www.hcaptcha.com/signup-interstitial
2. أنشئ Site Key جديد
3. أضف Domain الخاص بك (أو localhost للتطوير)
4. انسخ Site Key إلى `.env`

**للتطوير:**
استخدم Site Key الاختباري: `10000000-ffff-ffff-ffff-000000000001`

---

## 📦 البناء للإنتاج

```bash
npm run build
npm run preview
```

الملفات المبنية ستكون في مجلد `dist/`

---

## 🚢 النشر (Deployment)

### Render (Recommended)
1. اربط GitHub repository
2. Build Command: `npm run build`
3. Publish Directory: `dist`
4. أضف Environment Variables في Render Dashboard

### Vercel
```bash
npm install -g vercel
vercel
```

### Netlify
```bash
npm install -g netlify-cli
netlify deploy --prod
```

---

## ✅ التحقق من التثبيت

### 1. Security Features
- [ ] hCaptcha يظهر في صفحة تسجيل الدخول
- [ ] Rate limiting يعمل (5 محاولات ثم منع)
- [ ] Encrypted storage يحفظ البيانات

### 2. File Upload
- [ ] يمكن رفع ملفات PDF/Word/Excel
- [ ] يظهر progress indicator
- [ ] Toast notifications تعمل

### 3. Notifications
- [ ] Bell icon في Header
- [ ] Dropdown panel يعمل
- [ ] Real-time updates تعمل

### 4. Export
- [ ] زر Excel في ProjectsView
- [ ] زر PDF في ProjectsView
- [ ] تحميل الملفات يعمل

### 5. PWA
- [ ] Install prompt يظهر في Chrome
- [ ] Service Worker مسجل
- [ ] Offline mode يعمل

---

## 🐛 Troubleshooting

### خطأ: "Cannot find module"
```bash
rm -rf node_modules package-lock.json
npm install
```

### خطأ: "Supabase connection failed"
- تحقق من `VITE_SUPABASE_URL` و `VITE_SUPABASE_ANON_KEY`
- تأكد من تشغيل جميع SQL scripts

### hCaptcha لا يظهر
- تحقق من `VITE_HCAPTCHA_SITE_KEY` في `.env`
- تأكد من restart الخادم بعد تغيير `.env`

### File Upload فشل
- تحقق من إنشاء bucket "documents" في Supabase Storage
- تأكد من Storage Policies صحيحة

### Notifications لا تعمل
- تأكد من وجود جدول `notifications` في Database
- تحقق من Supabase Realtime مفعّل

---

## 📚 الموارد

- [Supabase Docs](https://supabase.com/docs)
- [hCaptcha Docs](https://docs.hcaptcha.com/)
- [Vite Docs](https://vitejs.dev/)
- [React Docs](https://react.dev/)

---

## 🆘 الدعم

لأي مشاكل:
1. افتح Issue في GitHub
2. تحقق من console للأخطاء
3. راجع ملف logs في Supabase Dashboard

---

**نجاح التثبيت؟** ابدأ باستكشاف النظام! 🎉
