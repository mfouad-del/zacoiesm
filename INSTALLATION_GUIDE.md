# 🎯 IEMS - Installation & Deployment Guide

## 📋 Prerequisites

### Required Software
- **Node.js**: v18.0.0 or higher
- **pnpm**: v8.0.0 or higher (recommended) or npm v9.0.0+
- **PostgreSQL**: v14.0+ (via Supabase)
- **Git**: Latest version

### Required Accounts
- **Supabase Account**: [https://supabase.com](https://supabase.com)
- **Resend Account** (for emails): [https://resend.com](https://resend.com)
- **SendGrid Account** (alternative): [https://sendgrid.com](https://sendgrid.com)

---

## 🚀 Installation Steps

### 1. Clone Repository
```bash
git clone <repository-url>
cd iesm
```

### 2. Install Dependencies
```bash
# Using pnpm (recommended)
pnpm install

# Or using npm
npm install
```

This will install all dependencies including:
- React 19.2.3
- TypeScript 5.8.2
- Vite 6.2.0
- Supabase JS SDK
- jsPDF, xlsx, papaparse
- idb (IndexedDB)
- Resend (email)
- Jest & Testing Library
- And 40+ other packages

### 3. Environment Configuration

Create `.env.local` file in project root:

```bash
cp .env.example .env.local
```

Edit `.env.local` and add your credentials:

```env
# Supabase (Required)
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJxxx...

# Email Service (Choose one)
VITE_RESEND_API_KEY=re_xxxxx
# OR
VITE_SENDGRID_API_KEY=SG.xxxxx

# Application
VITE_APP_URL=http://localhost:5173
VITE_APP_NAME=IEMS

# Optional
VITE_WEBHOOK_SECRET=your-secret-key
VITE_ENABLE_OFFLINE_MODE=true
VITE_ENABLE_REAL_TIME=true
```

#### Getting Supabase Credentials:
1. Go to [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. Create new project or select existing
3. Go to **Settings** → **API**
4. Copy `Project URL` and `anon public` key

#### Getting Resend API Key:
1. Go to [https://resend.com/dashboard](https://resend.com/dashboard)
2. Click **API Keys**
3. Create new key
4. Copy the key (starts with `re_`)

### 4. Database Setup

#### Option A: Using Supabase Dashboard (Recommended)

1. Open your Supabase project
2. Go to **SQL Editor**
3. Run scripts in this exact order:

**Script 1**: `001_create_tables.sql`
```sql
-- Copy and paste entire content from scripts/001_create_tables.sql
-- Creates: users, projects, tasks, documents, ncr_reports, expenses, contracts, etc.
```

**Script 2**: `002_row_level_security.sql`
```sql
-- Copy and paste entire content from scripts/002_row_level_security.sql
-- Creates: RLS policies for all tables
```

**Script 3**: `003_triggers_and_functions.sql`
```sql
-- Copy and paste entire content from scripts/003_triggers_and_functions.sql
-- Creates: Database triggers and helper functions
```

**Script 4**: `004_seed_data.sql`
```sql
-- Copy and paste entire content from scripts/004_seed_data.sql
-- Creates: Sample projects, tasks, and test data
```

**Script 5**: `005_create_super_admin.sql`
```sql
-- Copy and paste entire content from scripts/005_create_super_admin.sql
-- Creates: promote_to_super_admin() function
```

**Script 6**: `012_advanced_features.sql` (NEW!)
```sql
-- Copy and paste entire content from scripts/012_advanced_features.sql
-- Creates: workflow_instances, approval_requests, document_revisions,
--          transmittals, webhooks, security_audit_log, etc.
```

#### Option B: Using psql CLI

```bash
# Connect to your Supabase database
psql "postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres"

# Run scripts in order
\i scripts/001_create_tables.sql
\i scripts/002_row_level_security.sql
\i scripts/003_triggers_and_functions.sql
\i scripts/004_seed_data.sql
\i scripts/005_create_super_admin.sql
\i scripts/012_advanced_features.sql

# Exit
\q
```

### 5. Create Admin Account

#### Method 1: Via Application (Recommended)

1. Start development server (see step 6)
2. Navigate to login page
3. Click "Sign Up"
4. Register with:
   - Email: `admin@iems.com`
   - Password: `Admin@123456`
5. After registration, promote to super admin:

```sql
-- Run in Supabase SQL Editor
SELECT promote_to_super_admin('admin@iems.com');
```

#### Method 2: Direct Database Insert

```sql
-- Run in Supabase SQL Editor
INSERT INTO public.users (
  id,
  email,
  full_name,
  role,
  created_at
) VALUES (
  gen_random_uuid(),
  'admin@iems.com',
  'System Administrator',
  'super_admin',
  NOW()
);
```

### 6. Start Development Server

```bash
# Development mode
pnpm dev

# Or with npm
npm run dev
```

Application will be available at: `http://localhost:5173`

### 7. Verify Installation

Open browser and navigate to `http://localhost:5173`

**Login with:**
- Email: `admin@iems.com`
- Password: `Admin@123456`

**Expected behavior:**
- ✅ Login successful
- ✅ Redirects to dashboard
- ✅ All modules accessible
- ✅ No console errors

---

## 🧪 Running Tests

```bash
# Run all tests
pnpm test

# Run with coverage
pnpm test:coverage

# Watch mode (for development)
pnpm test:watch

# Run specific test file
pnpm test tests/workflow.test.ts
```

**Expected output:**
```
PASS  tests/workflow.test.ts
PASS  tests/documents.test.ts

Test Suites: 2 passed, 2 total
Tests:       15 passed, 15 total
Coverage:    74.5% (Target: 70%)
Time:        3.241s
```

---

## 📦 Building for Production

### Build Application

```bash
# Build optimized production bundle
pnpm build

# Or with npm
npm run build
```

Output will be in `dist/` directory.

### Preview Production Build

```bash
# Preview production build locally
pnpm preview
```

### Build Size Analysis

Typical production build:
- **Total**: ~800 KB (gzipped)
- **Main bundle**: ~300 KB
- **Vendor chunks**: ~400 KB
- **Assets**: ~100 KB

---

## 🚢 Deployment

### Option 1: Vercel (Recommended)

1. **Install Vercel CLI**
```bash
npm i -g vercel
```

2. **Deploy**
```bash
vercel
```

3. **Set Environment Variables**
- Go to Vercel dashboard
- Navigate to Settings → Environment Variables
- Add all variables from `.env.local`

4. **Deploy to Production**
```bash
vercel --prod
```

### Option 2: Netlify

1. **Install Netlify CLI**
```bash
npm i -g netlify-cli
```

2. **Build**
```bash
pnpm build
```

3. **Deploy**
```bash
netlify deploy --prod --dir=dist
```

4. **Set Environment Variables**
- Go to Netlify dashboard
- Site Settings → Environment Variables
- Add all variables

### Option 3: Docker

Create `Dockerfile`:

```dockerfile
FROM node:18-alpine AS builder

WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN npm i -g pnpm && pnpm install --frozen-lockfile
COPY . .
RUN pnpm build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

Build and run:

```bash
# Build image
docker build -t iems:latest .

# Run container
docker run -p 80:80 iems:latest
```

### Option 4: Traditional Hosting (Apache/Nginx)

1. **Build application**
```bash
pnpm build
```

2. **Copy `dist/` folder to server**
```bash
scp -r dist/* user@server:/var/www/html/
```

3. **Configure server**

**Nginx config:**
```nginx
server {
    listen 80;
    server_name your-domain.com;
    root /var/www/html;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

**Apache .htaccess:**
```apache
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  RewriteRule ^index\.html$ - [L]
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule . /index.html [L]
</IfModule>
```

---

## 🔧 Configuration

### Tailwind CSS

Dark mode enabled by default in `tailwind.config.js`:

```javascript
module.exports = {
  darkMode: 'class',
  // ...
}
```

### TypeScript

Strict mode enabled in `tsconfig.json`:

```json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    // ...
  }
}
```

### Vite

Configuration in `vite.config.ts`:

```typescript
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
  },
});
```

---

## 🔒 Security Checklist

### Before Production:

- [ ] Change default admin credentials
- [ ] Update all `.env` variables
- [ ] Enable HTTPS
- [ ] Configure CORS properly
- [ ] Set up rate limiting (already in code)
- [ ] Enable RLS policies (already in SQL)
- [ ] Set up monitoring/logging
- [ ] Configure backup strategy
- [ ] Review security audit logs
- [ ] Test webhook signature verification
- [ ] Enable CSP headers
- [ ] Configure firewall rules

### Supabase Security:

```sql
-- Verify RLS is enabled
SELECT schemaname, tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
AND rowsecurity = false;

-- Should return 0 rows
```

---

## 🐛 Troubleshooting

### Common Issues

#### 1. "Cannot connect to Supabase"
**Solution:**
- Check `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`
- Verify Supabase project is active
- Check network connection

#### 2. "Database schema mismatch"
**Solution:**
```bash
# Re-run migrations
psql ... < scripts/012_advanced_features.sql
```

#### 3. "Email notifications not working"
**Solution:**
- Verify `VITE_RESEND_API_KEY` is set
- Check Resend dashboard for API status
- Test with: `await emailService.send({ ... })`

#### 4. "Tests failing"
**Solution:**
```bash
# Clean and reinstall
rm -rf node_modules
pnpm install
pnpm test
```

#### 5. "Build fails"
**Solution:**
```bash
# Clear cache
rm -rf dist .vite
pnpm build
```

#### 6. "Offline mode not working"
**Solution:**
- Check browser IndexedDB support
- Verify service worker registration
- Check console for errors

---

## 📊 Performance Optimization

### Production Optimizations:

1. **Enable Compression**
```nginx
# Nginx
gzip on;
gzip_types text/css application/javascript;
```

2. **Enable Caching**
```nginx
location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
}
```

3. **Use CDN**
- Upload static assets to CDN
- Update asset URLs in build config

4. **Database Indexing**
```sql
-- Already included in scripts, verify:
SHOW INDEX FROM projects;
SHOW INDEX FROM tasks;
```

5. **Enable Service Worker**
```typescript
// In src/main.tsx
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/sw.js');
}
```

---

## 📈 Monitoring & Logging

### Supabase Logs

Access logs in Supabase Dashboard:
- Database → Logs
- Storage → Logs
- Auth → Logs

### Application Logs

Production logging setup:

```typescript
// lib/logger.ts
export const logger = {
  info: (msg: string, data?: any) => {
    console.log(`[INFO] ${msg}`, data);
    // Send to logging service
  },
  error: (msg: string, error?: Error) => {
    console.error(`[ERROR] ${msg}`, error);
    // Send to error tracking
  },
};
```

### Recommended Services:
- **Sentry** - Error tracking
- **LogRocket** - Session replay
- **Datadog** - APM monitoring
- **Supabase Analytics** - Database insights

---

## 🔄 Updates & Maintenance

### Update Dependencies

```bash
# Check outdated packages
pnpm outdated

# Update all (careful!)
pnpm update

# Update specific package
pnpm update react
```

### Database Migrations

For future schema changes:

```bash
# Create new migration
touch scripts/013_new_feature.sql

# Run migration
psql ... < scripts/013_new_feature.sql
```

### Backup Strategy

**Database Backup:**
```bash
# Manual backup
pg_dump "postgresql://..." > backup.sql

# Restore
psql "postgresql://..." < backup.sql
```

**Supabase Auto-Backup:**
- Pro plan: Daily backups (7 days retention)
- Team plan: Daily backups (30 days retention)

---

## 📞 Support & Resources

### Documentation
- **Main README**: `/README.md`
- **Advanced Features**: `/ADVANCED_FEATURES_GUIDE.md`
- **API Docs**: Available after Swagger UI setup

### Community
- GitHub Issues: Report bugs
- Discussions: Ask questions
- Wiki: Additional guides

### Professional Support
- Email: support@iems.com
- Response time: 24-48 hours

---

## ✅ Post-Installation Checklist

- [ ] All dependencies installed
- [ ] Environment variables configured
- [ ] Database migrations completed
- [ ] Admin account created and promoted
- [ ] Development server running
- [ ] Tests passing
- [ ] Production build successful
- [ ] Deployment configured
- [ ] SSL/HTTPS enabled
- [ ] Monitoring set up
- [ ] Backup strategy configured
- [ ] Documentation reviewed

---

**Congratulations! 🎉**

Your IEMS installation is complete. You can now start managing your engineering projects with all advanced features enabled!

**Version**: 2.0.0  
**Last Updated**: 2025  
**Support**: support@iems.com
