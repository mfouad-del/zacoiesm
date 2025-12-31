/* eslint-disable @typescript-eslint/no-explicit-any */
import { createClient } from '../supabase/client';
import { Project } from '../../types';

export interface ApiResponse<T> {
  data: T | null;
  error: string | null;
}

// ============================================
// PROJECTS API
// ============================================
export const projectsApi = {
  async list(): Promise<Project[]> {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('projects')
      .select('*, project_manager:users!project_manager_id(full_name)')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return (data || []) as unknown as Project[];
  },

  async getById(id: string): Promise<Project> {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('projects')
      .select('*, project_manager:users!project_manager_id(full_name), project_members(user_id, role)')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data as unknown as Project;
  },

  async create(project: Partial<Project>): Promise<ApiResponse<Project>> {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    const { data, error } = await supabase
      .from('projects')
      .insert([{ ...project, created_by: user?.id }])
      .select()
      .single();
    
    return { data: data as unknown as Project, error: error?.message || null };
  },

  async update(id: string, project: Partial<Project>): Promise<ApiResponse<Project>> {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('projects')
      .update(project)
      .eq('id', id)
      .select()
      .single();
    
    return { data, error: error?.message || null };
  }
};

// ============================================
// TASKS API
// ============================================
export const tasksApi = {
  async list(projectId?: string): Promise<any[]> {
    const supabase = createClient();
    let query = supabase.from('tasks').select('*, assigned_user:users!assigned_to(full_name)');
    
    if (projectId) {
      query = query.eq('project_id', projectId);
    }
    
    const { data, error } = await query.order('created_at', { ascending: false });
    if (error) throw error;
    return data || [];
  },

  async create(task: any): Promise<ApiResponse<any>> {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    const { data, error } = await supabase
      .from('tasks')
      .insert([{ ...task, created_by: user?.id }])
      .select()
      .single();
    
    return { data, error: error?.message || null };
  },

  async update(id: string, task: any): Promise<ApiResponse<any>> {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('tasks')
      .update(task)
      .eq('id', id)
      .select()
      .single();
    
    return { data, error: error?.message || null };
  }
};

// ============================================
// TIMESHEETS API
// ============================================
export const timesheetsApi = {
  async list(): Promise<any[]> {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('timesheets')
      .select('*, user:users!user_id(full_name), project:projects(name)')
      .order('work_date', { ascending: false });
    
    if (error) throw error;
    return data || [];
  },

  async create(timesheet: any): Promise<ApiResponse<any>> {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    const { data, error } = await supabase
      .from('timesheets')
      .insert([{ ...timesheet, user_id: user?.id }])
      .select()
      .single();
    
    return { data, error: error?.message || null };
  },

  async approve(id: string): Promise<ApiResponse<any>> {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    const { data, error } = await supabase
      .from('timesheets')
      .update({ status: 'approved', approved_by: user?.id, approved_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    
    return { data, error: error?.message || null };
  }
};

// ============================================
// NCR API
// ============================================
export const ncrApi = {
  async list(projectId?: string): Promise<any[]> {
    const supabase = createClient();
    let query = supabase
      .from('ncr_reports')
      .select('*, project:projects(name), issued_by_user:users!issued_by(full_name)');
    
    if (projectId) {
      query = query.eq('project_id', projectId);
    }
    
    const { data, error } = await query.order('created_at', { ascending: false });
    if (error) throw error;
    return data || [];
  },

  async create(ncr: any): Promise<ApiResponse<any>> {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    // Generate NCR number
    const { data: lastNcr } = await supabase
      .from('ncr_reports')
      .select('ncr_number')
      .order('created_at', { ascending: false })
      .limit(1)
      .single();
    
    const nextNumber = lastNcr ? parseInt(lastNcr.ncr_number.split('-')[1]) + 1 : 1;
    const ncr_number = `NCR-${String(nextNumber).padStart(4, '0')}`;
    
    const { data, error } = await supabase
      .from('ncr_reports')
      .insert([{ ...ncr, ncr_number, issued_by: user?.id }])
      .select()
      .single();
    
    return { data, error: error?.message || null };
  },

  async updateStatus(id: string, status: string, comments?: string): Promise<ApiResponse<any>> {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    // Get current NCR
    const { data: currentNcr } = await supabase
      .from('ncr_reports')
      .select('status')
      .eq('id', id)
      .single();
    
    // Update NCR
    const { data, error } = await supabase
      .from('ncr_reports')
      .update({ status })
      .eq('id', id)
      .select()
      .single();
    
    // Log history
    if (data && currentNcr) {
      await supabase.from('ncr_history').insert([{
        ncr_id: id,
        previous_status: currentNcr.status,
        new_status: status,
        action: 'STATUS_CHANGE',
        comments,
        changed_by: user?.id
      }]);
    }
    
    return { data, error: error?.message || null };
  }
};

// ============================================
// CONTRACTS API
// ============================================
export const contractsApi = {
  async list(projectId?: string): Promise<any[]> {
    const supabase = createClient();
    let query = supabase.from('contracts').select('*, project:projects(name)');
    
    if (projectId) {
      query = query.eq('project_id', projectId);
    }
    
    const { data, error } = await query.order('created_at', { ascending: false });
    if (error) throw error;
    return data || [];
  },

  async getVariations(contractId: string): Promise<any[]> {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('contract_variations')
      .select('*')
      .eq('contract_id', contractId)
      .order('submitted_date', { ascending: false });
    
    if (error) throw error;
    return data || [];
  },

  async createVariation(variation: any): Promise<ApiResponse<any>> {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('contract_variations')
      .insert([variation])
      .select()
      .single();
    
    return { data, error: error?.message || null };
  }
};

// ============================================
// DOCUMENTS API
// ============================================
export const documentsApi = {
  async list(projectId?: string): Promise<any[]> {
    const supabase = createClient();
    let query = supabase
      .from('documents')
      .select('*, project:projects(name), uploaded_by_user:users!uploaded_by(full_name)');
    
    if (projectId) {
      query = query.eq('project_id', projectId);
    }
    
    const { data, error } = await query.order('created_at', { ascending: false });
    if (error) throw error;
    return data || [];
  },

  async upload(document: any, file: File): Promise<ApiResponse<any>> {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    // Upload file to storage
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}.${fileExt}`;
    const { error: uploadError } = await supabase.storage
      .from('documents')
      .upload(fileName, file);
    
    if (uploadError) return { data: null, error: uploadError.message };
    
    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('documents')
      .getPublicUrl(fileName);
    
    // Create document record
    const { data, error } = await supabase
      .from('documents')
      .insert([{
        ...document,
        file_url: publicUrl,
        file_type: file.type,
        file_size: file.size,
        uploaded_by: user?.id
      }])
      .select()
      .single();
    
    return { data, error: error?.message || null };
  }
};

// ============================================
// REPORTS API
// ============================================
export const reportsApi = {
  async list(projectId?: string): Promise<any[]> {
    const supabase = createClient();
    let query = supabase
      .from('reports')
      .select('*, project:projects(name), created_by_user:users!created_by(full_name)');
    
    if (projectId) {
      query = query.eq('project_id', projectId);
    }
    
    const { data, error } = await query.order('report_date', { ascending: false });
    if (error) throw error;
    return data || [];
  },

  async create(report: any): Promise<ApiResponse<any>> {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    const { data, error } = await supabase
      .from('reports')
      .insert([{ ...report, created_by: user?.id }])
      .select()
      .single();
    
    return { data, error: error?.message || null };
  }
};

// ============================================
// SAFETY INCIDENTS API
// ============================================
export const safetyApi = {
  async list(projectId?: string): Promise<any[]> {
    const supabase = createClient();
    let query = supabase
      .from('safety_incidents')
      .select('*, project:projects(name), reported_by_user:users!reported_by(full_name)');
    
    if (projectId) {
      query = query.eq('project_id', projectId);
    }
    
    const { data, error } = await query.order('incident_date', { ascending: false });
    if (error) throw error;
    return data || [];
  },

  async create(incident: any): Promise<ApiResponse<any>> {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    // Generate incident number
    const { data: lastIncident } = await supabase
      .from('safety_incidents')
      .select('incident_number')
      .order('created_at', { ascending: false })
      .limit(1)
      .single();
    
    const nextNumber = lastIncident ? parseInt(lastIncident.incident_number.split('-')[1]) + 1 : 1;
    const incident_number = `INC-${String(nextNumber).padStart(4, '0')}`;
    
    const { data, error } = await supabase
      .from('safety_incidents')
      .insert([{ ...incident, incident_number, reported_by: user?.id }])
      .select()
      .single();
    
    return { data, error: error?.message || null };
  }
};

// ============================================
// NOTIFICATIONS API
// ============================================
export const notificationsApi = {
  async list(): Promise<any[]> {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50);
    
    if (error) throw error;
    return data || [];
  },

  async markAsRead(id: string): Promise<ApiResponse<any>> {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('notifications')
      .update({ is_read: true, read_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    
    return { data, error: error?.message || null };
  },

  async markAllAsRead(): Promise<ApiResponse<any>> {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    const { data, error } = await supabase
      .from('notifications')
      .update({ is_read: true, read_at: new Date().toISOString() })
      .eq('user_id', user?.id)
      .eq('is_read', false);
    
    return { data, error: error?.message || null };
  }
};

// ============================================
// COST TRACKING API (EVM)
// ============================================
export const costTrackingApi = {
  async getLatest(projectId: string): Promise<any> {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('project_cost_tracking')
      .select('*')
      .eq('project_id', projectId)
      .order('period_date', { ascending: false })
      .limit(1)
      .single();
    
    if (error && error.code !== 'PGRST116') throw error; // Ignore not found
    return data;
  },

  async getHistory(projectId: string): Promise<any[]> {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('project_cost_tracking')
      .select('*')
      .eq('project_id', projectId)
      .order('period_date', { ascending: true });
    
    if (error) throw error;
    return data || [];
  }
};

// Export consolidated API
export const api = {
  projects: projectsApi,
  tasks: tasksApi,
  timesheets: timesheetsApi,
  ncr: ncrApi,
  contracts: contractsApi,
  documents: documentsApi,
  reports: reportsApi,
  safety: safetyApi,
  notifications: notificationsApi,
  costTracking: costTrackingApi
};
