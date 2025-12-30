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

-- Helper function to check if user is admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.users
    WHERE id = auth.uid()
    AND role IN ('super_admin', 'admin')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Users policies (admins can manage all users, users can view their own data)
CREATE POLICY "Users can view all users" ON public.users
  FOR SELECT USING (true);

CREATE POLICY "Admins can insert users" ON public.users
  FOR INSERT WITH CHECK (is_admin());

CREATE POLICY "Admins can update users" ON public.users
  FOR UPDATE USING (is_admin());

CREATE POLICY "Admins can delete users" ON public.users
  FOR DELETE USING (is_admin());

-- Projects policies (all authenticated users can view, admins can manage)
CREATE POLICY "Authenticated users can view projects" ON public.projects
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can create projects" ON public.projects
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Admins and creators can update projects" ON public.projects
  FOR UPDATE USING (is_admin() OR created_by = auth.uid());

CREATE POLICY "Admins can delete projects" ON public.projects
  FOR DELETE USING (is_admin());

-- Project members policies
CREATE POLICY "Users can view project members" ON public.project_members
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Admins can manage project members" ON public.project_members
  FOR ALL USING (is_admin());

-- Tasks policies
CREATE POLICY "Users can view tasks" ON public.tasks
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Users can create tasks" ON public.tasks
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Users can update their assigned tasks or created tasks" ON public.tasks
  FOR UPDATE USING (assigned_to = auth.uid() OR created_by = auth.uid() OR is_admin());

CREATE POLICY "Admins and creators can delete tasks" ON public.tasks
  FOR DELETE USING (is_admin() OR created_by = auth.uid());

-- Sites policies
CREATE POLICY "Users can view sites" ON public.sites
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Admins can manage sites" ON public.sites
  FOR ALL USING (is_admin());

-- Equipment policies
CREATE POLICY "Users can view equipment" ON public.equipment
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Admins can manage equipment" ON public.equipment
  FOR ALL USING (is_admin());

-- Resources policies
CREATE POLICY "Users can view resources" ON public.resources
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Admins can manage resources" ON public.resources
  FOR ALL USING (is_admin());

-- Resource transactions policies
CREATE POLICY "Users can view resource transactions" ON public.resource_transactions
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Users can create resource transactions" ON public.resource_transactions
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- Documents policies
CREATE POLICY "Users can view documents" ON public.documents
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Users can upload documents" ON public.documents
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Uploaders and admins can delete documents" ON public.documents
  FOR DELETE USING (uploaded_by = auth.uid() OR is_admin());

-- Reports policies
CREATE POLICY "Users can view reports" ON public.reports
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Users can create reports" ON public.reports
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Admins and creators can update reports" ON public.reports
  FOR UPDATE USING (is_admin() OR created_by = auth.uid());

CREATE POLICY "Admins can delete reports" ON public.reports
  FOR DELETE USING (is_admin());

-- Activity logs policies (read-only for users)
CREATE POLICY "Users can view activity logs" ON public.activity_logs
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "System can insert activity logs" ON public.activity_logs
  FOR INSERT WITH CHECK (true);
