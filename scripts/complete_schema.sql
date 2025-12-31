-- ============================================================================
-- IESM Database Schema - Complete & Final
-- Integrated Engineering Management System
-- نظام إدارة الهندسة المتكامل
-- ============================================================================
-- This is the ONLY SQL file you need to run
-- هذا هو ملف SQL الوحيد الذي تحتاج لتنفيذه
-- ============================================================================

-- 1. Enable Extensions
-- ============================================================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================================
-- 2. CORE TABLES - الجداول الأساسية
-- ============================================================================

-- Users table (extends auth.users)
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  full_name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'viewer' CHECK (role IN (
    'super_admin', 'admin', 'project_manager', 'site_engineer',
    'qa_manager', 'hse_officer', 'accountant', 'client', 'viewer'
  )),
  avatar_url TEXT,
  phone TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Projects table
CREATE TABLE IF NOT EXISTS public.projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'planning' CHECK (status IN ('planning', 'in_progress', 'on_hold', 'completed', 'cancelled')),
  priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  start_date DATE,
  end_date DATE,
  budget DECIMAL(15, 2),
  spent DECIMAL(15, 2) DEFAULT 0,
  progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  client_name TEXT,
  location TEXT,
  project_manager_id UUID REFERENCES public.users(id),
  created_by UUID NOT NULL REFERENCES public.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Project Members
CREATE TABLE IF NOT EXISTS public.project_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL,
  assigned_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(project_id, user_id)
);

-- Tasks table
CREATE TABLE IF NOT EXISTS public.tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'todo' CHECK (status IN ('todo', 'in_progress', 'review', 'completed')),
  priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  assigned_to UUID REFERENCES public.users(id),
  due_date DATE,
  completed_at TIMESTAMPTZ,
  created_by UUID NOT NULL REFERENCES public.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Sites/Locations table
CREATE TABLE IF NOT EXISTS public.sites (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  address TEXT NOT NULL,
  city TEXT,
  country TEXT,
  coordinates TEXT,
  site_manager_id UUID REFERENCES public.users(id),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('planning', 'active', 'completed', 'inactive')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Equipment table
CREATE TABLE IF NOT EXISTS public.equipment (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  model TEXT,
  serial_number TEXT UNIQUE,
  status TEXT NOT NULL DEFAULT 'available' CHECK (status IN ('available', 'in_use', 'maintenance', 'damaged', 'retired')),
  condition TEXT CHECK (condition IN ('excellent', 'good', 'fair', 'poor')),
  purchase_date DATE,
  purchase_price DECIMAL(12, 2),
  current_value DECIMAL(12, 2),
  site_id UUID REFERENCES public.sites(id) ON DELETE SET NULL,
  assigned_to UUID REFERENCES public.users(id) ON DELETE SET NULL,
  last_maintenance_date DATE,
  next_maintenance_date DATE,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Resources table (Materials/Inventory)
CREATE TABLE IF NOT EXISTS public.resources (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  unit TEXT NOT NULL,
  quantity DECIMAL(10, 2) NOT NULL DEFAULT 0,
  min_quantity DECIMAL(10, 2) DEFAULT 0,
  unit_price DECIMAL(10, 2),
  supplier TEXT,
  site_id UUID REFERENCES public.sites(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'available' CHECK (status IN ('available', 'low_stock', 'out_of_stock', 'discontinued')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Resource Transactions
CREATE TABLE IF NOT EXISTS public.resource_transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  resource_id UUID NOT NULL REFERENCES public.resources(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('in', 'out', 'adjustment')),
  quantity DECIMAL(10, 2) NOT NULL,
  reason TEXT,
  project_id UUID REFERENCES public.projects(id),
  user_id UUID NOT NULL REFERENCES public.users(id),
  transaction_date TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Documents table
CREATE TABLE IF NOT EXISTS public.documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_type TEXT,
  file_size INTEGER,
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
  site_id UUID REFERENCES public.sites(id) ON DELETE CASCADE,
  uploaded_by UUID NOT NULL REFERENCES public.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Reports table
CREATE TABLE IF NOT EXISTS public.reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('daily', 'weekly', 'monthly', 'incident', 'safety', 'progress', 'financial')),
  content JSONB NOT NULL,
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
  site_id UUID REFERENCES public.sites(id) ON DELETE CASCADE,
  created_by UUID NOT NULL REFERENCES public.users(id),
  report_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Activity Logs
CREATE TABLE IF NOT EXISTS public.activity_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id UUID,
  details JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- 3. MODULE TABLES - جداول الوحدات
-- ============================================================================

-- Contracts
CREATE TABLE IF NOT EXISTS public.contracts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  vendor TEXT,
  value DECIMAL(15, 2) NOT NULL DEFAULT 0,
  start_date DATE,
  end_date DATE,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'completed', 'terminated', 'pending')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Variations
CREATE TABLE IF NOT EXISTS public.variations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  value DECIMAL(15, 2) NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  submitted_date DATE DEFAULT CURRENT_DATE,
  approved_date DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- NCRs (Quality)
CREATE TABLE IF NOT EXISTS public.ncrs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  severity TEXT NOT NULL DEFAULT 'low' CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'investigating', 'resolved', 'closed')),
  created_by UUID REFERENCES public.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Incidents (Safety)
CREATE TABLE IF NOT EXISTS public.incidents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  severity TEXT NOT NULL DEFAULT 'low' CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'investigating', 'resolved', 'closed')),
  incident_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by UUID REFERENCES public.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Timesheets
CREATE TABLE IF NOT EXISTS public.timesheets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  hours DECIMAL(5, 2) NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'submitted', 'approved', 'rejected')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- 4. PROCUREMENT MODULE - وحدة المشتريات
-- ============================================================================

-- Suppliers
CREATE TABLE IF NOT EXISTS public.suppliers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  contact_person TEXT,
  email TEXT NOT NULL,
  phone TEXT,
  address TEXT,
  rating DECIMAL(3, 2) DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Procurement Orders
CREATE TABLE IF NOT EXISTS public.procurement_orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_number TEXT UNIQUE NOT NULL,
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
  supplier_id UUID REFERENCES public.suppliers(id) ON DELETE SET NULL,
  total_amount DECIMAL(15, 2) DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'pending_approval', 'approved', 'rejected', 'ordered', 'delivered')),
  request_date DATE DEFAULT CURRENT_DATE,
  delivery_date DATE,
  requested_by UUID REFERENCES public.users(id),
  approved_by UUID REFERENCES public.users(id),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Procurement Items
CREATE TABLE IF NOT EXISTS public.procurement_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID REFERENCES public.procurement_orders(id) ON DELETE CASCADE,
  description TEXT NOT NULL,
  quantity DECIMAL(10, 2) NOT NULL,
  unit TEXT NOT NULL,
  unit_price DECIMAL(12, 2) NOT NULL,
  total_price DECIMAL(15, 2) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- 5. CORRESPONDENCE MODULE - وحدة المراسلات
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.correspondence (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
  subject TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('incoming', 'outgoing', 'internal')),
  sender TEXT NOT NULL,
  recipient TEXT NOT NULL,
  content TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'replied', 'closed')),
  date DATE DEFAULT CURRENT_DATE,
  reference_number TEXT,
  created_by UUID REFERENCES public.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- 6. BIM MODULE - وحدة نمذجة المعلومات
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.bim_models (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  version TEXT DEFAULT '1.0',
  file_url TEXT NOT NULL,
  file_type TEXT DEFAULT 'IFC',
  file_size BIGINT,
  metadata JSONB,
  uploaded_by UUID REFERENCES public.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- 7. EXPENSES MODULE - وحدة المصروفات
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.expenses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
  category TEXT NOT NULL,
  description TEXT NOT NULL,
  amount DECIMAL(15, 2) NOT NULL,
  date DATE DEFAULT CURRENT_DATE,
  receipt_url TEXT,
  approved BOOLEAN DEFAULT false,
  approved_by UUID REFERENCES public.users(id),
  created_by UUID REFERENCES public.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- 8. INDEXES - الفهارس
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_projects_status ON public.projects(status);
CREATE INDEX IF NOT EXISTS idx_projects_created_by ON public.projects(created_by);
CREATE INDEX IF NOT EXISTS idx_tasks_project_id ON public.tasks(project_id);
CREATE INDEX IF NOT EXISTS idx_tasks_assigned_to ON public.tasks(assigned_to);
CREATE INDEX IF NOT EXISTS idx_equipment_site_id ON public.equipment(site_id);
CREATE INDEX IF NOT EXISTS idx_resources_site_id ON public.resources(site_id);
CREATE INDEX IF NOT EXISTS idx_documents_project_id ON public.documents(project_id);
CREATE INDEX IF NOT EXISTS idx_reports_project_id ON public.reports(project_id);
CREATE INDEX IF NOT EXISTS idx_suppliers_status ON public.suppliers(status);
CREATE INDEX IF NOT EXISTS idx_procurement_orders_project ON public.procurement_orders(project_id);
CREATE INDEX IF NOT EXISTS idx_procurement_orders_supplier ON public.procurement_orders(supplier_id);
CREATE INDEX IF NOT EXISTS idx_procurement_orders_status ON public.procurement_orders(status);
CREATE INDEX IF NOT EXISTS idx_procurement_items_order ON public.procurement_items(order_id);
CREATE INDEX IF NOT EXISTS idx_correspondence_project ON public.correspondence(project_id);
CREATE INDEX IF NOT EXISTS idx_correspondence_type ON public.correspondence(type);
CREATE INDEX IF NOT EXISTS idx_correspondence_status ON public.correspondence(status);
CREATE INDEX IF NOT EXISTS idx_bim_models_project ON public.bim_models(project_id);
CREATE INDEX IF NOT EXISTS idx_expenses_project ON public.expenses(project_id);

-- ============================================================================
-- 9. FUNCTIONS - الوظائف
-- ============================================================================

-- Update timestamp function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Auto-create user profile
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    COALESCE(NEW.raw_user_meta_data->>'role', 'viewer')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Log activity function
CREATE OR REPLACE FUNCTION public.log_activity(
  p_action TEXT,
  p_entity_type TEXT,
  p_entity_id UUID DEFAULT NULL,
  p_details JSONB DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  v_log_id UUID;
BEGIN
  INSERT INTO public.activity_logs (user_id, action, entity_type, entity_id, details)
  VALUES (auth.uid(), p_action, p_entity_type, p_entity_id, p_details)
  RETURNING id INTO v_log_id;
  RETURN v_log_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update resource status based on quantity
CREATE OR REPLACE FUNCTION public.update_resource_status()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.quantity <= 0 THEN
    NEW.status = 'out_of_stock';
  ELSIF NEW.quantity <= NEW.min_quantity THEN
    NEW.status = 'low_stock';
  ELSE
    NEW.status = 'available';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Generate order number
CREATE OR REPLACE FUNCTION public.generate_order_number()
RETURNS TEXT AS $$
DECLARE
  new_number TEXT;
  counter INTEGER;
BEGIN
  SELECT COUNT(*) + 1 INTO counter FROM public.procurement_orders;
  new_number := 'PO-' || TO_CHAR(NOW(), 'YYYY') || '-' || LPAD(counter::TEXT, 4, '0');
  RETURN new_number;
END;
$$ LANGUAGE plpgsql;

-- Set order number
CREATE OR REPLACE FUNCTION public.set_order_number()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.order_number IS NULL OR NEW.order_number = '' THEN
    NEW.order_number := generate_order_number();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Promote to super admin
CREATE OR REPLACE FUNCTION promote_to_super_admin(user_email TEXT)
RETURNS void AS $$
DECLARE
  user_uuid UUID;
BEGIN
  SELECT id INTO user_uuid FROM auth.users WHERE email = user_email;
  IF user_uuid IS NULL THEN
    RAISE EXCEPTION 'User with email % not found', user_email;
  END IF;
  UPDATE public.users SET role = 'super_admin', updated_at = now() WHERE id = user_uuid;
  RAISE NOTICE 'User % promoted to super_admin', user_email;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Admin check function
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.users
    WHERE id = auth.uid() AND role IN ('super_admin', 'admin')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- 10. TRIGGERS - المشغلات
-- ============================================================================

-- Updated_at triggers
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON public.projects FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_tasks_updated_at BEFORE UPDATE ON public.tasks FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_sites_updated_at BEFORE UPDATE ON public.sites FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_equipment_updated_at BEFORE UPDATE ON public.equipment FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_resources_updated_at BEFORE UPDATE ON public.resources FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_contracts_updated_at BEFORE UPDATE ON public.contracts FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_variations_updated_at BEFORE UPDATE ON public.variations FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_ncrs_updated_at BEFORE UPDATE ON public.ncrs FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_incidents_updated_at BEFORE UPDATE ON public.incidents FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_timesheets_updated_at BEFORE UPDATE ON public.timesheets FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_suppliers_updated_at BEFORE UPDATE ON public.suppliers FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_procurement_orders_updated_at BEFORE UPDATE ON public.procurement_orders FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_correspondence_updated_at BEFORE UPDATE ON public.correspondence FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_bim_models_updated_at BEFORE UPDATE ON public.bim_models FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_expenses_updated_at BEFORE UPDATE ON public.expenses FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Resource status trigger
CREATE TRIGGER update_resource_status_trigger BEFORE INSERT OR UPDATE ON public.resources FOR EACH ROW EXECUTE FUNCTION public.update_resource_status();

-- Order number trigger
CREATE TRIGGER set_procurement_order_number BEFORE INSERT ON public.procurement_orders FOR EACH ROW EXECUTE FUNCTION set_order_number();

-- Auth user trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================================
-- 11. ROW LEVEL SECURITY - أمان مستوى الصف
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.equipment ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resource_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contracts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.variations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ncrs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.incidents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.timesheets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.procurement_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.procurement_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.correspondence ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bim_models ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;

-- Users policies
DROP POLICY IF EXISTS "Users can view all users" ON public.users;
DROP POLICY IF EXISTS "Admins can insert users" ON public.users;
DROP POLICY IF EXISTS "Admins can update users" ON public.users;
DROP POLICY IF EXISTS "Admins can delete users" ON public.users;

CREATE POLICY "Users can view all users" ON public.users FOR SELECT USING (true);
CREATE POLICY "Admins can insert users" ON public.users FOR INSERT WITH CHECK (is_admin());
CREATE POLICY "Admins can update users" ON public.users FOR UPDATE USING (is_admin());
CREATE POLICY "Admins can delete users" ON public.users FOR DELETE USING (is_admin());

-- Projects policies
DROP POLICY IF EXISTS "Authenticated users can view projects" ON public.projects;
DROP POLICY IF EXISTS "Authenticated users can create projects" ON public.projects;
DROP POLICY IF EXISTS "Admins and creators can update projects" ON public.projects;
DROP POLICY IF EXISTS "Admins can delete projects" ON public.projects;

CREATE POLICY "Authenticated users can view projects" ON public.projects FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Authenticated users can create projects" ON public.projects FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Admins and creators can update projects" ON public.projects FOR UPDATE USING (is_admin() OR created_by = auth.uid());
CREATE POLICY "Admins can delete projects" ON public.projects FOR DELETE USING (is_admin());

-- Simplified policies for other tables
DROP POLICY IF EXISTS "Enable all for authenticated" ON public.project_members;
DROP POLICY IF EXISTS "Enable all for authenticated" ON public.tasks;
DROP POLICY IF EXISTS "Enable all for authenticated" ON public.sites;
DROP POLICY IF EXISTS "Enable all for authenticated" ON public.equipment;
DROP POLICY IF EXISTS "Enable all for authenticated" ON public.resources;
DROP POLICY IF EXISTS "Enable all for authenticated" ON public.resource_transactions;
DROP POLICY IF EXISTS "Enable all for authenticated" ON public.documents;
DROP POLICY IF EXISTS "Enable all for authenticated" ON public.reports;
DROP POLICY IF EXISTS "Enable all for authenticated" ON public.activity_logs;
DROP POLICY IF EXISTS "Enable all for authenticated" ON public.contracts;
DROP POLICY IF EXISTS "Enable all for authenticated" ON public.variations;
DROP POLICY IF EXISTS "Enable all for authenticated" ON public.ncrs;
DROP POLICY IF EXISTS "Enable all for authenticated" ON public.incidents;
DROP POLICY IF EXISTS "Enable all for authenticated" ON public.timesheets;
DROP POLICY IF EXISTS "Enable all for authenticated" ON public.suppliers;
DROP POLICY IF EXISTS "Enable all for authenticated" ON public.procurement_orders;
DROP POLICY IF EXISTS "Enable all for authenticated" ON public.procurement_items;
DROP POLICY IF EXISTS "Enable all for authenticated" ON public.correspondence;
DROP POLICY IF EXISTS "Enable all for authenticated" ON public.bim_models;
DROP POLICY IF EXISTS "Enable all for authenticated" ON public.expenses;

CREATE POLICY "Enable all for authenticated" ON public.project_members FOR ALL USING (auth.uid() IS NOT NULL);
CREATE POLICY "Enable all for authenticated" ON public.tasks FOR ALL USING (auth.uid() IS NOT NULL);
CREATE POLICY "Enable all for authenticated" ON public.sites FOR ALL USING (auth.uid() IS NOT NULL);
CREATE POLICY "Enable all for authenticated" ON public.equipment FOR ALL USING (auth.uid() IS NOT NULL);
CREATE POLICY "Enable all for authenticated" ON public.resources FOR ALL USING (auth.uid() IS NOT NULL);
CREATE POLICY "Enable all for authenticated" ON public.resource_transactions FOR ALL USING (auth.uid() IS NOT NULL);
CREATE POLICY "Enable all for authenticated" ON public.documents FOR ALL USING (auth.uid() IS NOT NULL);
CREATE POLICY "Enable all for authenticated" ON public.reports FOR ALL USING (auth.uid() IS NOT NULL);
CREATE POLICY "Enable all for authenticated" ON public.activity_logs FOR ALL USING (auth.uid() IS NOT NULL);
CREATE POLICY "Enable all for authenticated" ON public.contracts FOR ALL USING (auth.uid() IS NOT NULL);
CREATE POLICY "Enable all for authenticated" ON public.variations FOR ALL USING (auth.uid() IS NOT NULL);
CREATE POLICY "Enable all for authenticated" ON public.ncrs FOR ALL USING (auth.uid() IS NOT NULL);
CREATE POLICY "Enable all for authenticated" ON public.incidents FOR ALL USING (auth.uid() IS NOT NULL);
CREATE POLICY "Enable all for authenticated" ON public.timesheets FOR ALL USING (auth.uid() IS NOT NULL);
CREATE POLICY "Enable all for authenticated" ON public.suppliers FOR ALL USING (auth.uid() IS NOT NULL);
CREATE POLICY "Enable all for authenticated" ON public.procurement_orders FOR ALL USING (auth.uid() IS NOT NULL);
CREATE POLICY "Enable all for authenticated" ON public.procurement_items FOR ALL USING (auth.uid() IS NOT NULL);
CREATE POLICY "Enable all for authenticated" ON public.correspondence FOR ALL USING (auth.uid() IS NOT NULL);
CREATE POLICY "Enable all for authenticated" ON public.bim_models FOR ALL USING (auth.uid() IS NOT NULL);
CREATE POLICY "Enable all for authenticated" ON public.expenses FOR ALL USING (auth.uid() IS NOT NULL);

-- Grant permissions
GRANT EXECUTE ON FUNCTION promote_to_super_admin(TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated;
GRANT EXECUTE ON FUNCTION public.log_activity(TEXT, TEXT, UUID, JSONB) TO authenticated;

-- ============================================================================
-- 12. SAMPLE DATA (OPTIONAL) - بيانات تجريبية اختيارية
-- ============================================================================
-- Uncomment the following lines to add sample data for testing
-- قم بإلغاء التعليق على الأسطر التالية لإضافة بيانات تجريبية للاختبار

/*
-- Sample Suppliers
INSERT INTO public.suppliers (name, contact_person, email, phone, address, rating, status) VALUES
('شركة المواد الإنشائية المتحدة', 'أحمد محمد', 'ahmed@construction.com', '+966501234567', 'الرياض، المملكة العربية السعودية', 4.5, 'active'),
('مؤسسة الخليج للتجارة', 'خالد عبدالله', 'khalid@gulf-trading.com', '+966502345678', 'جدة، المملكة العربية السعودية', 4.8, 'active'),
('Al-Noor Steel Industries', 'Mohammed Ali', 'mohammed@alnoorsteel.com', '+966503456789', 'Dammam, Saudi Arabia', 4.2, 'active');

-- Sample Inventory
INSERT INTO public.resources (name, category, unit, quantity, min_quantity, unit_price, status) VALUES
('أسمنت أبيض', 'مواد البناء', 'كيس', 250, 50, 35.00, 'available'),
('طوب أحمر', 'مواد البناء', 'ألف', 50, 10, 450.00, 'available'),
('أنابيب PVC', 'السباكة', 'متر', 500, 100, 15.00, 'available'),
('كابلات كهربائية', 'الكهرباء', 'متر', 300, 80, 12.00, 'available');
*/

-- ============================================================================
-- SETUP COMPLETE! 🎉
-- الإعداد مكتمل
-- ============================================================================
-- Next steps:
-- 1. Run this script in Supabase SQL Editor
-- 2. Create your first user via Supabase Auth
-- 3. Promote user to super_admin: SELECT promote_to_super_admin('user@email.com');
-- 4. Start using the application!
-- ============================================================================
