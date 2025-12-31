-- Strict RLS Policies based on IEMS Core Idea
-- Run this to enforce the strict role-based access control

-- Enable RLS on all tables
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.procurement_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.correspondence ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ncr_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.incidents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.timesheets ENABLE ROW LEVEL SECURITY;

-- Helper function to check role
CREATE OR REPLACE FUNCTION public.has_role(required_role text)
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.users 
    WHERE id = auth.uid() AND role = required_role
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Helper function to check project membership
CREATE OR REPLACE FUNCTION public.is_project_member(project_id uuid)
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.project_members 
    WHERE user_id = auth.uid() AND project_id = $1
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =================================================================
-- 1. PROJECTS
-- =================================================================
-- SUPER_ADMIN & ADMIN: Full Access
-- PROJECT_MANAGER: Edit their projects
-- OTHERS: View assigned projects
-- CLIENT: View assigned projects (Read Only)

DROP POLICY IF EXISTS "Projects Policy" ON public.projects;

CREATE POLICY "Projects Select Policy" ON public.projects
  FOR SELECT USING (
    has_role('super_admin') OR 
    has_role('admin') OR 
    is_project_member(id) OR
    created_by = auth.uid()
  );

CREATE POLICY "Projects Insert Policy" ON public.projects
  FOR INSERT WITH CHECK (
    has_role('super_admin') OR 
    has_role('admin') OR 
    has_role('project_manager')
  );

CREATE POLICY "Projects Update Policy" ON public.projects
  FOR UPDATE USING (
    has_role('super_admin') OR 
    has_role('admin') OR 
    (has_role('project_manager') AND is_project_member(id))
  );

-- =================================================================
-- 2. EXPENSES (Cost Management)
-- =================================================================
-- ACCOUNTANT: Full Access
-- PROJECT_MANAGER: View Only (or Approve)
-- SUPER_ADMIN: Full Access

DROP POLICY IF EXISTS "Expenses Policy" ON public.expenses;

CREATE POLICY "Expenses Select Policy" ON public.expenses
  FOR SELECT USING (
    has_role('super_admin') OR 
    has_role('admin') OR 
    has_role('accountant') OR
    (has_role('project_manager') AND is_project_member(project_id))
  );

CREATE POLICY "Expenses Modify Policy" ON public.expenses
  FOR ALL USING (
    has_role('super_admin') OR 
    has_role('admin') OR 
    has_role('accountant')
  );

-- =================================================================
-- 3. NCR (Quality)
-- =================================================================
-- QA_MANAGER: Full Access
-- SITE_ENGINEER: Create
-- PROJECT_MANAGER: Approve (Update)
-- OTHERS: View assigned

DROP POLICY IF EXISTS "NCR Policy" ON public.ncr_reports;

CREATE POLICY "NCR Select Policy" ON public.ncr_reports
  FOR SELECT USING (
    has_role('super_admin') OR 
    has_role('admin') OR 
    has_role('qa_manager') OR
    is_project_member(project_id)
  );

CREATE POLICY "NCR Insert Policy" ON public.ncr_reports
  FOR INSERT WITH CHECK (
    has_role('super_admin') OR 
    has_role('qa_manager') OR 
    has_role('site_engineer')
  );

CREATE POLICY "NCR Update Policy" ON public.ncr_reports
  FOR UPDATE USING (
    has_role('super_admin') OR 
    has_role('qa_manager') OR 
    (has_role('project_manager') AND is_project_member(project_id))
  );

-- =================================================================
-- 4. SAFETY (HSE)
-- =================================================================
-- HSE_OFFICER: Full Access
-- OTHERS: View assigned

DROP POLICY IF EXISTS "Safety Policy" ON public.incidents;

CREATE POLICY "Safety Select Policy" ON public.incidents
  FOR SELECT USING (
    has_role('super_admin') OR 
    has_role('admin') OR 
    has_role('hse_officer') OR
    is_project_member(project_id)
  );

CREATE POLICY "Safety Modify Policy" ON public.incidents
  FOR ALL USING (
    has_role('super_admin') OR 
    has_role('admin') OR 
    has_role('hse_officer')
  );

-- =================================================================
-- 5. DOCUMENTS
-- =================================================================
-- CLIENT: View Approved Only (This logic needs a status check, simplified here)
-- OTHERS: View assigned

DROP POLICY IF EXISTS "Documents Policy" ON public.documents;

CREATE POLICY "Documents Select Policy" ON public.documents
  FOR SELECT USING (
    has_role('super_admin') OR 
    has_role('admin') OR 
    is_project_member(project_id)
  );

CREATE POLICY "Documents Modify Policy" ON public.documents
  FOR ALL USING (
    has_role('super_admin') OR 
    has_role('admin') OR 
    (has_role('project_manager') AND is_project_member(project_id)) OR
    (has_role('site_engineer') AND is_project_member(project_id)) -- Site engineers can upload
  );

