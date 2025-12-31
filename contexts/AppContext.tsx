/* eslint-disable react-refresh/only-export-components */
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { createClient } from '../lib/supabase/client';
import { api } from '../lib/api';
import { 
  Project, Contract, Variation, PlanningTask, Report, NCR, 
  Document, Timesheet, Incident, Notification, User 
} from '../types';

interface AppState {
  user: User | null;
  isAuthenticated: boolean;
  projects: Project[];
  contracts: Contract[];
  variations: Variation[];
  planningTasks: PlanningTask[];
  reports: Report[];
  ncrs: NCR[];
  documents: Document[];
  timesheets: Timesheet[];
  incidents: Incident[];
  notifications: Notification[];
  isLoading: boolean;
}

interface AppContextType extends AppState {
  refreshData: () => Promise<void>;
  addProject: (project: any) => Promise<void>;
  addTimesheet: (timesheet: any) => Promise<void>;
  addNCR: (ncr: any) => Promise<void>;
  addIncident: (incident: any) => Promise<void>;
  addReport: (report: any) => Promise<void>;
  addTask: (task: any) => Promise<void>;
  updateNCRStatus: (id: string, status: string) => Promise<void>;
  approveTimesheet: (id: string) => Promise<void>;
  markNotificationRead: (id: string) => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, setState] = useState<AppState>({
    user: null,
    isAuthenticated: false,
    projects: [],
    contracts: [],
    variations: [],
    planningTasks: [],
    reports: [],
    ncrs: [],
    documents: [],
    timesheets: [],
    incidents: [],
    notifications: [],
    isLoading: true
  });

  const refreshData = useCallback(async () => {
    setState(prev => ({ ...prev, isLoading: true }));
    
    try {
      const [
        projectsData,
        contractsData,
        tasksData,
        reportsData,
        ncrsData,
        documentsData,
        timesheetsData,
        incidentsData
      ] = await Promise.all([
        api.projects.list(),
        api.contracts.list(),
        api.planning.list(),
        api.reports.list(),
        api.quality.list(),
        api.documents.list(),
        api.timesheets.list(),
        api.safety.list()
      ]);

      setState(prev => ({
        ...prev,
        projects: (projectsData as Record<string, any>[]).map((p) => ({
          id: p.id,
          name: p.name,
          code: p.name.substring(0, 3).toUpperCase() + '-' + p.id.substring(0, 3).toUpperCase(),
          status: p.status === 'in_progress' ? 'active' : p.status,
          budget: p.budget || 0,
          progress: p.progress || 0,
          startDate: p.start_date,
          endDate: p.end_date,
          location: p.location,
          manager: p.project_manager?.full_name || 'N/A'
        })),
        contracts: contractsData as Contract[],
        planningTasks: (tasksData as Record<string, any>[]).map((t) => ({
          id: t.id,
          projectId: t.project_id,
          name: t.title,
          startDate: t.due_date,
          endDate: t.due_date,
          progress: t.status === 'completed' ? 100 : t.status === 'in_progress' ? 50 : 0,
          status: t.status,
          critical: t.priority === 'urgent' || t.priority === 'high'
        })),
        reports: reportsData as Report[],
        ncrs: (ncrsData as Record<string, any>[]).map((n) => ({
          id: n.ncr_number,
          projectId: n.project_id,
          title: n.title,
          description: n.description,
          severity: n.severity,
          status: n.status.toLowerCase(),
          date: n.issued_date || n.created_at
        })),
        documents: documentsData as Document[],
        timesheets: timesheetsData as Timesheet[],
        incidents: incidentsData as Incident[],
        notifications: notificationsData as Notification[],
        isLoading: false
      }));
    } catch (error) {
      console.error('Failed to refresh data:', error);
      setState(prev => ({ ...prev, isLoading: false }));
    }
  }, []);

  useEffect(() => {
    const supabase = createClient();
    
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setState(prev => ({
        ...prev,
        user,
        isAuthenticated: !!user,
        isLoading: !user
      }));
      
      if (user) {
        await refreshData();
      } else {
        setState(prev => ({ ...prev, isLoading: false }));
      }
    };

    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setState(prev => ({
        ...prev,
        user: session?.user || null,
        isAuthenticated: !!session?.user
      }));
      
      if (session?.user) {
        refreshData();
      }
    });

    return () => subscription.unsubscribe();
  }, [refreshData]);

  const addProject = async (project: any) => {
    const { data } = await api.projects.create(project);
    if (data) {
      setState(prev => ({
        ...prev,
        projects: [...prev.projects, {
          id: data.id,
          name: data.name,
          code: data.name.substring(0, 3).toUpperCase() + '-' + data.id.substring(0, 3).toUpperCase(),
          status: 'active',
          budget: data.budget || 0,
          progress: 0,
          startDate: data.start_date,
          endDate: data.end_date,
          location: data.location,
          manager: 'You'
        }]
      }));
    }
  };

  const addTimesheet = async (timesheet: any) => {
    const { data } = await api.timesheets.create(timesheet);
    if (data) {
      await refreshData();
    }
  };

  const addNCR = async (ncr: any) => {
    const { data } = await api.ncr.create(ncr);
    if (data) {
      await refreshData();
    }
  };

  const addIncident = async (incident: any) => {
    const { data } = await api.safety.create(incident);
    if (data) {
      await refreshData();
    }
  };

  const addReport = async (report: any) => {
    const { data } = await api.reports.create(report);
    if (data) {
      await refreshData();
    }
  };

  const addTask = async (task: any) => {
    const { data } = await api.tasks.create(task);
    if (data) {
      await refreshData();
    }
  };

  const updateNCRStatus = async (id: string, status: string) => {
    await api.ncr.updateStatus(id, status.toUpperCase());
    setState(prev => ({
      ...prev,
      ncrs: prev.ncrs.map(n => n.id === id ? { ...n, status: status.toLowerCase() } : n)
    }));
  };

  const approveTimesheet = async (id: string) => {
    await api.timesheets.approve(id);
    setState(prev => ({
      ...prev,
      timesheets: prev.timesheets.map(t => t.id === id ? { ...t, status: 'Approved' } : t)
    }));
  };

  const markNotificationRead = async (id: string) => {
    await api.notifications.markAsRead(id);
    setState(prev => ({
      ...prev,
      notifications: prev.notifications.map(n => n.id === id ? { ...n, is_read: true } : n)
    }));
  };

  return (
    <AppContext.Provider
      value={{
        ...state,
        refreshData,
        addProject,
        addTimesheet,
        addNCR,
        addIncident,
        addReport,
        addTask,
        updateNCRStatus,
        approveTimesheet,
        markNotificationRead
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};
