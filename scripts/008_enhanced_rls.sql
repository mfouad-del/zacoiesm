-- Enhanced RLS Policies with Resource Ownership
-- Run after 007_missing_tables.sql

-- Drop old permissive policies
DROP POLICY IF EXISTS "Authenticated users can view projects" ON public.projects;
DROP POLICY IF EXISTS "Authenticated users can create projects" ON public.projects;

-- ============================================
-- PROJECTS - Resource Ownership Based
-- ============================================
-- Users can only view projects they are members of OR created
CREATE POLICY "Users can view their projects" ON public.projects
  FOR SELECT USING (
    auth.uid() IN (
      SELECT user_id FROM public.project_members WHERE project_id = projects.id
    ) OR created_by = auth.uid() OR is_admin()
  );

-- Users can create projects if authenticated
CREATE POLICY "Authenticated users can create projects" ON public.projects
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL AND created_by = auth.uid());

-- Only project managers and admins can update
CREATE POLICY "Project managers can update their projects" ON public.projects
  FOR UPDATE USING (
    is_admin() OR 
    (auth.uid() = project_manager_id) OR
    (auth.uid() IN (
      SELECT user_id FROM public.project_members 
      WHERE project_id = projects.id AND role = 'PROJECT_MANAGER'
    ))
  );

-- ============================================
-- TASKS - Based on Project Membership
-- ============================================
DROP POLICY IF EXISTS "Users can view tasks" ON public.tasks;

CREATE POLICY "Users can view tasks in their projects" ON public.tasks
  FOR SELECT USING (
    auth.uid() IN (
      SELECT user_id FROM public.project_members WHERE project_id = tasks.project_id
    ) OR is_admin()
  );

CREATE POLICY "Project members can create tasks" ON public.tasks
  FOR INSERT WITH CHECK (
    auth.uid() IN (
      SELECT user_id FROM public.project_members WHERE project_id = tasks.project_id
    ) OR is_admin()
  );

-- ============================================
-- TIMESHEETS - User Owns Their Data
-- ============================================
DROP POLICY IF EXISTS "Authenticated users can view timesheets" ON public.timesheets;

-- Users can only view their own timesheets OR timesheets in their projects (if manager)
CREATE POLICY "Users can view relevant timesheets" ON public.timesheets
  FOR SELECT USING (
    user_id = auth.uid() OR
    is_admin() OR
    (auth.uid() IN (
      SELECT user_id FROM public.project_members 
      WHERE project_id = timesheets.project_id 
      AND role IN ('PROJECT_MANAGER', 'ADMIN')
    ))
  );

-- Project managers can approve timesheets
CREATE POLICY "Managers can update timesheets" ON public.timesheets
  FOR UPDATE USING (
    is_admin() OR
    (auth.uid() IN (
      SELECT user_id FROM public.project_members 
      WHERE project_id = timesheets.project_id 
      AND role IN ('PROJECT_MANAGER', 'ADMIN')
    ))
  );

-- ============================================
-- NCR REPORTS - Project Based
-- ============================================
DROP POLICY IF EXISTS "Authenticated users can view ncrs" ON public.ncr_reports;

CREATE POLICY "Project members can view ncrs" ON public.ncr_reports
  FOR SELECT USING (
    auth.uid() IN (
      SELECT user_id FROM public.project_members WHERE project_id = ncr_reports.project_id
    ) OR is_admin()
  );

CREATE POLICY "Project members can create ncrs" ON public.ncr_reports
  FOR INSERT WITH CHECK (
    auth.uid() IN (
      SELECT user_id FROM public.project_members WHERE project_id = ncr_reports.project_id
    ) OR is_admin()
  );

CREATE POLICY "Assigned users and QA can update ncrs" ON public.ncr_reports
  FOR UPDATE USING (
    is_admin() OR
    assigned_to = auth.uid() OR
    issued_by = auth.uid() OR
    (auth.uid() IN (
      SELECT id FROM public.users WHERE role = 'QUALITY_MANAGER'
    ))
  );

-- ============================================
-- CONTRACTS - Project Based
-- ============================================
DROP POLICY IF EXISTS "Authenticated users can view contracts" ON public.contracts;

CREATE POLICY "Project members can view contracts" ON public.contracts
  FOR SELECT USING (
    auth.uid() IN (
      SELECT user_id FROM public.project_members WHERE project_id = contracts.project_id
    ) OR is_admin()
  );

CREATE POLICY "Admins and managers can manage contracts" ON public.contracts
  FOR ALL USING (
    is_admin() OR
    (auth.uid() IN (
      SELECT user_id FROM public.project_members 
      WHERE project_id = contracts.project_id 
      AND role IN ('PROJECT_MANAGER', 'CONTRACTS_MANAGER')
    ))
  );

-- ============================================
-- SAFETY INCIDENTS - Project Based
-- ============================================
DROP POLICY IF EXISTS "Authenticated users can view incidents" ON public.safety_incidents;

CREATE POLICY "Project members can view incidents" ON public.safety_incidents
  FOR SELECT USING (
    auth.uid() IN (
      SELECT user_id FROM public.project_members WHERE project_id = safety_incidents.project_id
    ) OR is_admin()
  );

CREATE POLICY "Project members can report incidents" ON public.safety_incidents
  FOR INSERT WITH CHECK (
    auth.uid() IN (
      SELECT user_id FROM public.project_members WHERE project_id = safety_incidents.project_id
    ) OR is_admin()
  );

CREATE POLICY "HSE officers can update incidents" ON public.safety_incidents
  FOR UPDATE USING (
    is_admin() OR
    reported_by = auth.uid() OR
    (auth.uid() IN (
      SELECT id FROM public.users WHERE role IN ('HSE_OFFICER', 'SAFETY_OFFICER')
    ))
  );

-- ============================================
-- DOCUMENTS - Project Based
-- ============================================
DROP POLICY IF EXISTS "Users can view documents" ON public.documents;

CREATE POLICY "Project members can view documents" ON public.documents
  FOR SELECT USING (
    auth.uid() IN (
      SELECT user_id FROM public.project_members WHERE project_id = documents.project_id
    ) OR is_admin()
  );

CREATE POLICY "Project members can upload documents" ON public.documents
  FOR INSERT WITH CHECK (
    auth.uid() IN (
      SELECT user_id FROM public.project_members WHERE project_id = documents.project_id
    ) OR is_admin()
  );

-- ============================================
-- COST TRACKING - Restricted to Finance Roles
-- ============================================
DROP POLICY IF EXISTS "Authenticated users can view cost tracking" ON public.project_cost_tracking;

CREATE POLICY "Authorized users can view cost tracking" ON public.project_cost_tracking
  FOR SELECT USING (
    is_admin() OR
    (auth.uid() IN (
      SELECT user_id FROM public.project_members 
      WHERE project_id = project_cost_tracking.project_id 
      AND role IN ('PROJECT_MANAGER', 'ACCOUNTANT')
    )) OR
    (auth.uid() IN (
      SELECT id FROM public.users WHERE role IN ('ACCOUNTANT', 'TOP_MANAGEMENT')
    ))
  );

CREATE POLICY "Finance roles can manage cost tracking" ON public.project_cost_tracking
  FOR ALL USING (
    is_admin() OR
    (auth.uid() IN (
      SELECT id FROM public.users WHERE role IN ('ACCOUNTANT', 'TOP_MANAGEMENT')
    ))
  );

-- ============================================
-- NOTIFICATIONS - User Private Data
-- ============================================
DROP POLICY IF EXISTS "Users can view their notifications" ON public.notifications;

CREATE POLICY "Users can only view their notifications" ON public.notifications
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can update their notifications" ON public.notifications
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "System can create notifications" ON public.notifications
  FOR INSERT WITH CHECK (true); -- Will be created by backend service

-- ============================================
-- REPORTS - Project Based
-- ============================================
DROP POLICY IF EXISTS "Users can view reports" ON public.reports;

CREATE POLICY "Project members can view reports" ON public.reports
  FOR SELECT USING (
    auth.uid() IN (
      SELECT user_id FROM public.project_members WHERE project_id = reports.project_id
    ) OR is_admin()
  );

CREATE POLICY "Project members can create reports" ON public.reports
  FOR INSERT WITH CHECK (
    auth.uid() IN (
      SELECT user_id FROM public.project_members WHERE project_id = reports.project_id
    ) OR is_admin()
  );
