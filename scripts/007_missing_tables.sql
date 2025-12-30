-- Missing Tables for Complete IEMS Implementation
-- Run after 001-006 scripts

-- ============================================
-- 1. PROJECT COST TRACKING (For EVM Calculations)
-- ============================================
DROP TABLE IF EXISTS public.project_cost_tracking CASCADE;

CREATE TABLE public.project_cost_tracking (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  period_date DATE NOT NULL,
  planned_value DECIMAL(15, 2) NOT NULL DEFAULT 0, -- PV
  earned_value DECIMAL(15, 2) NOT NULL DEFAULT 0,  -- EV
  actual_cost DECIMAL(15, 2) NOT NULL DEFAULT 0,   -- AC
  budget_at_completion DECIMAL(15, 2) NOT NULL,    -- BAC
  
  -- Calculated Metrics (stored for historical tracking)
  schedule_variance DECIMAL(15, 2),    -- SV = EV - PV
  cost_variance DECIMAL(15, 2),        -- CV = EV - AC
  spi DECIMAL(10, 4),                  -- Schedule Performance Index
  cpi DECIMAL(10, 4),                  -- Cost Performance Index
  eac DECIMAL(15, 2),                  -- Estimate at Completion
  etc DECIMAL(15, 2),                  -- Estimate to Complete
  vac DECIMAL(15, 2),                  -- Variance at Completion
  tcpi DECIMAL(10, 4),                 -- To-Complete Performance Index
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(project_id, period_date)
);

CREATE INDEX IF NOT EXISTS idx_cost_tracking_project_date ON public.project_cost_tracking(project_id, period_date DESC);

-- ============================================
-- 2. TASK SCHEDULE (For CPM Calculations)
-- ============================================
DROP TABLE IF EXISTS public.task_schedule CASCADE;

CREATE TABLE public.task_schedule (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  task_id UUID NOT NULL REFERENCES public.tasks(id) ON DELETE CASCADE,
  duration_days INTEGER NOT NULL DEFAULT 0,
  
  -- CPM Calculated Fields
  early_start INTEGER NOT NULL DEFAULT 0,
  early_finish INTEGER NOT NULL DEFAULT 0,
  late_start INTEGER NOT NULL DEFAULT 0,
  late_finish INTEGER NOT NULL DEFAULT 0,
  total_float INTEGER NOT NULL DEFAULT 0,
  is_critical BOOLEAN NOT NULL DEFAULT FALSE,
  
  -- Dependencies stored as array
  dependencies UUID[] DEFAULT '{}',
  
  calculated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(task_id)
);

CREATE INDEX IF NOT EXISTS idx_task_schedule_critical ON public.task_schedule(is_critical) WHERE is_critical = TRUE;

-- ============================================
-- 3. NCR HISTORY & ATTACHMENTS
-- ============================================
DROP TABLE IF EXISTS public.ncr_attachments CASCADE;
DROP TABLE IF EXISTS public.ncr_history CASCADE;
DROP TABLE IF EXISTS public.ncr_reports CASCADE;

CREATE TABLE public.ncr_reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  ncr_number TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  severity TEXT NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  status TEXT NOT NULL DEFAULT 'DRAFT' CHECK (status IN (
    'DRAFT', 'ISSUED', 'ACKNOWLEDGED', 'PROPOSED_ACTION', 
    'ACTION_APPROVED', 'ACTION_REJECTED', 'ACTION_COMPLETED', 
    'VERIFIED', 'CLOSED'
  )),
  issued_by UUID REFERENCES public.users(id),
  assigned_to UUID REFERENCES public.users(id),
  issued_date DATE,
  due_date DATE,
  closed_date DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE public.ncr_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  ncr_id UUID NOT NULL REFERENCES public.ncr_reports(id) ON DELETE CASCADE,
  previous_status TEXT NOT NULL,
  new_status TEXT NOT NULL,
  action TEXT NOT NULL,
  comments TEXT,
  changed_by UUID NOT NULL REFERENCES public.users(id),
  changed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE public.ncr_attachments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  ncr_id UUID NOT NULL REFERENCES public.ncr_reports(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_type TEXT,
  file_size INTEGER,
  attachment_type TEXT CHECK (attachment_type IN ('photo', 'document', 'signature')),
  uploaded_by UUID NOT NULL REFERENCES public.users(id),
  uploaded_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ncr_project ON public.ncr_reports(project_id);
CREATE INDEX IF NOT EXISTS idx_ncr_status ON public.ncr_reports(status);
CREATE INDEX IF NOT EXISTS idx_ncr_history_ncr ON public.ncr_history(ncr_id, changed_at DESC);

-- ============================================
-- 4. TIMESHEETS
-- ============================================
DROP TABLE IF EXISTS public.timesheets CASCADE;

CREATE TABLE public.timesheets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  task_id UUID REFERENCES public.tasks(id) ON DELETE SET NULL,
  work_date DATE NOT NULL,
  hours_worked DECIMAL(5, 2) NOT NULL CHECK (hours_worked >= 0 AND hours_worked <= 24),
  overtime_hours DECIMAL(5, 2) DEFAULT 0 CHECK (overtime_hours >= 0),
  description TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  approved_by UUID REFERENCES public.users(id),
  approved_at TIMESTAMPTZ,
  rejection_reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes after table is confirmed to exist
CREATE INDEX IF NOT EXISTS idx_timesheets_user_date ON public.timesheets(user_id, work_date DESC);
CREATE INDEX IF NOT EXISTS idx_timesheets_project ON public.timesheets(project_id);
CREATE INDEX IF NOT EXISTS idx_timesheets_status ON public.timesheets(status);

-- ============================================
-- 5. NOTIFICATIONS
-- ============================================
DROP TABLE IF EXISTS public.notifications CASCADE;

CREATE TABLE public.notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('info', 'warning', 'error', 'success', 'task', 'approval')),
  priority TEXT NOT NULL DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
  is_read BOOLEAN NOT NULL DEFAULT FALSE,
  entity_type TEXT, -- e.g., 'project', 'task', 'ncr', 'timesheet'
  entity_id UUID,
  action_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  read_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_notifications_user_unread ON public.notifications(user_id, is_read, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_type ON public.notifications(type);

-- ============================================
-- 6. DOCUMENT REVISIONS
-- ============================================
DROP TABLE IF EXISTS public.document_revisions CASCADE;

CREATE TABLE public.document_revisions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  document_id UUID NOT NULL REFERENCES public.documents(id) ON DELETE CASCADE,
  revision_number TEXT NOT NULL, -- e.g., 'A0', 'A1', 'B0'
  file_url TEXT NOT NULL,
  file_size INTEGER,
  revision_notes TEXT,
  revised_by UUID NOT NULL REFERENCES public.users(id),
  revised_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'review', 'approved', 'superseded')),
  UNIQUE(document_id, revision_number)
);

CREATE INDEX IF NOT EXISTS idx_doc_revisions_doc ON public.document_revisions(document_id, revised_at DESC);

-- ============================================
-- 7. CONTRACTS & VARIATIONS
-- ============================================
DROP TABLE IF EXISTS public.contract_variations CASCADE;
DROP TABLE IF EXISTS public.contracts CASCADE;

CREATE TABLE public.contracts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  contract_number TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  client_name TEXT NOT NULL,
  contractor_name TEXT,
  contract_value DECIMAL(15, 2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'SAR',
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('draft', 'active', 'completed', 'terminated')),
  created_by UUID NOT NULL REFERENCES public.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE public.contract_variations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  contract_id UUID NOT NULL REFERENCES public.contracts(id) ON DELETE CASCADE,
  variation_number TEXT NOT NULL,
  description TEXT NOT NULL,
  amount DECIMAL(15, 2) NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  submitted_date DATE NOT NULL,
  approved_date DATE,
  approved_by UUID REFERENCES public.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(contract_id, variation_number)
);

CREATE INDEX IF NOT EXISTS idx_contracts_project ON public.contracts(project_id);
CREATE INDEX IF NOT EXISTS idx_variations_contract ON public.contract_variations(contract_id);

-- ============================================
-- 8. SAFETY INCIDENTS
-- ============================================
DROP TABLE IF EXISTS public.safety_incidents CASCADE;

CREATE TABLE public.safety_incidents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  site_id UUID REFERENCES public.sites(id) ON DELETE SET NULL,
  incident_number TEXT NOT NULL UNIQUE,
  incident_type TEXT NOT NULL CHECK (incident_type IN ('near_miss', 'first_aid', 'medical_treatment', 'lost_time', 'fatality')),
  severity TEXT NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  description TEXT NOT NULL,
  incident_date TIMESTAMPTZ NOT NULL,
  location TEXT,
  injured_person TEXT,
  witnesses TEXT,
  immediate_action TEXT,
  root_cause TEXT,
  corrective_action TEXT,
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'investigating', 'closed')),
  reported_by UUID NOT NULL REFERENCES public.users(id),
  investigated_by UUID REFERENCES public.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_incidents_project ON public.safety_incidents(project_id);
CREATE INDEX IF NOT EXISTS idx_incidents_type ON public.safety_incidents(incident_type);
CREATE INDEX IF NOT EXISTS idx_incidents_date ON public.safety_incidents(incident_date DESC);

-- ============================================
-- TRIGGERS FOR AUTO TIMESTAMPS
-- ============================================
-- Drop existing triggers if they exist
DROP TRIGGER IF EXISTS update_cost_tracking_timestamp ON public.project_cost_tracking;
DROP TRIGGER IF EXISTS update_task_schedule_timestamp ON public.task_schedule;
DROP TRIGGER IF EXISTS update_ncr_reports_timestamp ON public.ncr_reports;
DROP TRIGGER IF EXISTS update_timesheets_timestamp ON public.timesheets;
DROP TRIGGER IF EXISTS update_contracts_timestamp ON public.contracts;
DROP TRIGGER IF EXISTS update_variations_timestamp ON public.contract_variations;
DROP TRIGGER IF EXISTS update_incidents_timestamp ON public.safety_incidents;

-- Create or replace the timestamp function
CREATE OR REPLACE FUNCTION update_missing_tables_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_cost_tracking_timestamp BEFORE UPDATE ON public.project_cost_tracking
  FOR EACH ROW EXECUTE FUNCTION update_missing_tables_timestamp();

CREATE TRIGGER update_task_schedule_timestamp BEFORE UPDATE ON public.task_schedule
  FOR EACH ROW EXECUTE FUNCTION update_missing_tables_timestamp();

CREATE TRIGGER update_ncr_reports_timestamp BEFORE UPDATE ON public.ncr_reports
  FOR EACH ROW EXECUTE FUNCTION update_missing_tables_timestamp();

CREATE TRIGGER update_timesheets_timestamp BEFORE UPDATE ON public.timesheets
  FOR EACH ROW EXECUTE FUNCTION update_missing_tables_timestamp();

CREATE TRIGGER update_contracts_timestamp BEFORE UPDATE ON public.contracts
  FOR EACH ROW EXECUTE FUNCTION update_missing_tables_timestamp();

CREATE TRIGGER update_variations_timestamp BEFORE UPDATE ON public.contract_variations
  FOR EACH ROW EXECUTE FUNCTION update_missing_tables_timestamp();

CREATE TRIGGER update_incidents_timestamp BEFORE UPDATE ON public.safety_incidents
  FOR EACH ROW EXECUTE FUNCTION update_missing_tables_timestamp();

-- ============================================
-- ENABLE RLS
-- ============================================
ALTER TABLE public.project_cost_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.task_schedule ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ncr_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ncr_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ncr_attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.timesheets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.document_revisions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contracts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contract_variations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.safety_incidents ENABLE ROW LEVEL SECURITY;

-- Basic RLS Policies (will be enhanced in 008_enhanced_rls.sql)
CREATE POLICY "Users can view their notifications" ON public.notifications
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Authenticated users can view timesheets" ON public.timesheets
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Users can create their timesheets" ON public.timesheets
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Authenticated users can view cost tracking" ON public.project_cost_tracking
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can view ncrs" ON public.ncr_reports
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can view contracts" ON public.contracts
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can view incidents" ON public.safety_incidents
  FOR SELECT USING (auth.uid() IS NOT NULL);
