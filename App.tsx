import React, { useState, useEffect } from 'react';
import { createClient } from './lib/supabase/client';
import { api } from './lib/api';
import { TRANSLATIONS, MENU_ITEMS } from './constants';
import { Language, Project } from './types';
import DashboardView from './components/DashboardView';
import ProjectsView from './components/ProjectsView';
import ContractsView from './components/ContractsView';
import PlanningView from './components/PlanningView';
import SiteManagementView from './components/SiteManagementView';
import QualityView from './components/QualityView';
import SafetyView from './components/SafetyView';
import DocumentsView from './components/DocumentsView';
import CostsView from './components/CostsView';
import TimesheetsView from './components/TimesheetsView';
import SettingsView from './components/SettingsView';
import LoginView from './components/LoginView';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Modal from './components/Modal';

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const [lang, setLang] = useState<Language>('ar');
  const [activeModule, setActiveModule] = useState('dashboard');
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);

  // Check auth on mount
  useEffect(() => {
    const supabase = createClient();
    
    const checkUser = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          setIsAuthenticated(true);
          setUser(user);
        }
      } catch (error) {
        console.error('Error checking auth:', error);
      } finally {
        setIsLoadingAuth(false);
      }
    };

    checkUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setIsAuthenticated(true);
        setUser(session.user);
      } else {
        setIsAuthenticated(false);
        setUser(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // --- الحالة المركزية المستمرة (Persistent Global State) ---

  const [projects, setProjects] = useState<Project[]>([]);
  const [contracts, setContracts] = useState<any[]>([]);
  const [variations, setVariations] = useState<any[]>([]);
  const [planningTasks, setPlanningTasks] = useState<any[]>([]);
  const [reports, setReports] = useState<any[]>([]);
  const [ncrs, setNcrs] = useState<any[]>([]);
  const [documents, setDocuments] = useState<any[]>([]);
  const [timesheets, setTimesheets] = useState<any[]>([]);
  const [incidents, setIncidents] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch data from Backend
  useEffect(() => {
    cosetIsLoading(true);
      
      try {
        const [
          projectsData,
          contractsData,
          tasksData,
          reportsData,
          ncrsData,
          documentsData,
          timesheetsData,
          incidentsData,
          notificationsData
        ] = await Promise.all([
          api.projects.list(),
          api.contracts.list(),
          api.tasks.list(),
          api.reports.list(),
          api.ncr.list(),
          api.documents.list(),
          api.timesheets.list(),
          api.safety.list(),
          api.notifications.list()
        ]);

        setProjects(projectsData.map((p: any) => ({
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
        })));

        setContracts(contractsData.map((c: any) => ({
          id: c.id,
          projectId: c.project_id,
          contractorName: c.contractor_name || c.client_name,
          value: c.contract_value,
          startDate: c.start_date,
          endDate: c.end_date,
          status: c.status === 'active' ? 'Active' : 'Completed',
          type: 'Main Contract'
        })));

        // Get all variations for all contracts
        const allVariations = [];
        for (const contract of contractsData) {
          const vars = await api.contracts.getVariations(contract.id);
          allVariations.push(...vars.map((v: any) => ({
            id: v.id,
            contractId: v.contract_id, (Removed - Using Database as Single Source of Truth)
  // useEffect removed - All changes now saved directly to Supabase

  // معالج الإضافة العام
  const handleFormSubmit = async (formData: any) => {
    try {
      switch (modalType) {
        case 'project':
          const { data: newProject } = await api.projects.create(formData);
          if (newProject) {
            setProjects([...projects, {
              id: newProject.id,
              name: newProject.name,
              code: newProject.name.substring(0, 3).toUpperCase() + '-' + newProject.id.substring(0, 3).toUpperCase(),
              status: 'active',
              budget: newProject.budget || 0,
              progress: 0,
              startDate: newProject.start_date,
              endDate: newProject.end_date,
              location: newProject.location,
              manager: 'You'
            }]);
          }
          break;
          
        case 'timesheet':
          const { data: newTimesheet } = await api.timesheets.create(formData);
          if (newTimesheet) {
            setTimesheets([{
              id: newTimesheet.id,
              employeeName: user?.email || 'Unknown',
              role: 'Staff',
              date: newTimesheet.work_date,
              hours: newTimesheet.hours_worked,
              projectId: newTimesheet.project_id,
              status: 'Pending'
            }, ...timesheets]);
          }
          break;
          
        case 'ncr':
          const { data: newNcr } = await api.ncr.create(formData);
          if (newNcr) {
            setNcrs([{
              id: newNcr.ncr_number,
              projectId: newNcr.project_id,
              title: newNcr.title,
              description: newNcr.description,
              severity: newNcr.severity,
              status: 'draft',
              date: new Date().toISOString().split('T')[0]
            }, ...ncrs]);
          }
          break;
          
        case 'incident':
          const { data: neasync (id: string, status: string) => {
    try {
      await api.ncr.updateStatus(id, status.toUpperCase());
      setNcrs(ncrs.map(n => n.id === id ? { ...n, status: status.toLowerCase() } : n));
    } catch (error) {
      console.error('Failed to update NCR:', error);
    }
  };
  
  const approveTimesheet = async (id: string) => {
    try {
      await api.timesheets.approve(id);
      setTimesheets(timesheets.map(t => t.id === id ? { ...t, status: 'Approved' } : t));
    } catch (error) {
      console.error('Failed to approve timesheet:', error);
    }
  }
            setIncidents([{
              id: newIncident.incident_number,
              projectId: newIncident.project_id,
              type: newIncident.incident_type,
              description: newIncident.description,
              date: newIncident.incident_date,
              status: 'Open',
              actionTaken: newIncident.immediate_action || ''
            }, ...incidents]);
          }
          break;
          
        case 'report':
          const { data: newReport } = await api.reports.create(formData);
          if (newReport) {
            setReports([{
              id: newReport.id,
              projectId: newReport.project_id,
              date: newReport.report_date,
              weather: formData.weather || 'N/A',
              temperature: formData.temperature || 25,
              manpower: formData.manpower || 0,
              activities: formData.activities || '',
              issues: formData.issues || ''
            }, ...reports]);
          }
          break;
          
        case 'planning':
          const { data: newTask } = await api.tasks.create(formData);
          if (newTask) {
            setPlanningTasks([...planningTasks, {
              id: newTask.id,
              projectId: newTask.project_id,
              name: newTask.title,
              startDate: newTask.due_date,
              endDate: newTask.due_date,
              progress: 0,
              status: 'Pending',
              critical: newTask.priority === 'urgent'
            }]);
          }
          break;
      }
      setIsModalOpen(false);
    } catch (error) {
      console.error('Failed to create:', error);
      alert('Failed to create item. Please try again.');
    }eated_at,
          status: 'Approved'
        })));

        setTimesheets(timesheetsData.map((ts: any) => ({
          id: ts.id,
          employeeName: ts.user?.full_name || 'Unknown',
          role: 'Staff',
          date: ts.work_date,
          hours: ts.hours_worked,
          projectId: ts.project_id,
          status: ts.status === 'approved' ? 'Approved' : ts.status === 'rejected' ? 'Rejected' : 'Pending'
        })));

        setIncidents(incidentsData.map((inc: any) => ({
          id: inc.incident_number,
          projectId: inc.project_id,
          type: inc.incident_type,
          description: inc.description,
          date: inc.incident_date,
          status: inc.status === 'closed' ? 'Closed' : 'Open',
          actionTaken: inc.immediate_action || ''
        })));

        setNotifications(notificationsData);

      } catch (error) {
        console.error("Failed to load data:", error);
      } finally {
        setIsLoading(false
      } catch (error) {
        console.error("Failed to load data", error);
      }
    };
    
    if (isAuthenticated) {
      loadData();
    }
  }, [isAuthenticated]);

  // حفظ البيانات تلقائياً عند أي تغيير
  useEffect(() => {
    localStorage.se || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-brand-600 mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">جاري التحميل...</p>
        </div>
      </div>
    )
    localStorage.setItem('iems_variations', JSON.stringify(variations));
    localStorage.setItem('iems_planning', JSON.stringify(planningTasks));
    localStorage.setItem('iems_reports', JSON.stringify(reports));
    localStorage.setItem('iems_ncrs', JSON.stringify(ncrs));
    localStorage.setItem('iems_docs', JSON.stringify(documents));
    localStorage.setItem('iems_timesheets', JSON.stringify(timesheets));
    localStorage.setItem('iems_incidents', JSON.stringify(incidents));
  }, [projects, contracts, variations, planningTasks, reports, ncrs, documents, timesheets, incidents]);

  // معالج الإضافة العام
  const handleFormSubmit = (formData: any) => {
    const newId = Date.now().toString();
    const today = new Date().toISOString().split('T')[0];

    switch (modalType) {
      case 'project':
        setProjects([...projects, { ...formData, id: newId, status: 'active', progress: 0 }]);
        break;
      case 'contract':
        setContracts([...contracts, { ...formData, id: newId, status: 'Active' }]);
        break;
      case 'variation':
        setVariations([{ ...formData, id: `VO-${Math.floor(Math.random() * 1000)}`, status: 'Pending', color: 'amber' }, ...variations]);
        break;
      case 'planning':
        setPlanningTasks([...planningTasks, { ...formData, id: newId, progress: 0, critical: false }]);
        break;
      case 'report':
        setReports([{ ...formData, id: newId, date: today }, ...reports]);
        break;
      case 'ncr':
        setNcrs([{ ...formData, id: `NCR-${Math.floor(Math.random() * 1000)}`, status: 'open', date: today }, ...ncrs]);
        break;
      case 'doc':
        setDocuments([{ ...formData, date: today, status: 'Pending' }, ...documents]);
        break;
      case 'timesheet':
        setTimesheets([{ ...formData, id: newId, status: 'Pending' }, ...timesheets]);
        break;
      case 'incident':
        setIncidents([{ ...formData, id: newId, date: today }, ...incidents]);
        break;
    }
    setIsModalOpen(false);
  };

  // Open modal with specific type
  const openModal = (type: string) => {
    setModalType(type);
    setIsModalOpen(true);
  };

  const updateNCRStatus = (id: string, status: string) => setNcrs(ncrs.map(n => n.id === id ? { ...n, status } : n));
  const approveTimesheet = (id: string) => setTimesheets(timesheets.map(t => t.id === id ? { ...t, status: 'Approved' } : t));

  const renderModule = () => {
    switch (activeModule) {
      case 'dashboard': return <DashboardView projects={projects} lang={lang} incidentsCount={incidents.length} user={user} />;
      case 'projects': return <ProjectsView projects={projects} lang={lang} onAddProject={() => openModal('project')} />;
      case 'contracts': return <ContractsView lang={lang} contracts={contracts} variations={variations} onAddVO={() => openModal('variation')} />;
      case 'planning': return <PlanningView lang={lang} activities={planningTasks} onAddActivity={() => openModal('planning')} />;
      case 'site': return <SiteManagementView lang={lang} reports={reports} onAddReport={() => openModal('report')} />;
      case 'quality': return <QualityView lang={lang} ncrs={ncrs} onAddNCR={() => openModal('ncr')} onUpdateStatus={updateNCRStatus} />;
      case 'safety': return <SafetyView lang={lang} incidents={incidents} onAddIncident={() => openModal('incident')} />;
      case 'documents': return <DocumentsView lang={lang} documents={documents} onAddDoc={() => openModal('doc')} />;
      case 'costs': return <CostsView lang={lang} projects={projects} />;
      case 'timesheets': return <TimesheetsView lang={lang} entries={timesheets} onAddEntry={() => openModal('timesheet')} onApprove={approveTimesheet} />;
      case 'settings': return <SettingsView lang={lang} />;
      default: return null;
    }
  };

  if (isLoadingAuth) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  if (!isAuthenticated) {
    return <LoginView onLoginSuccess={() => setIsAuthenticated(true)} />;
  }

  return (
    <div className={`min-h-screen flex ${lang === 'ar' ? 'rtl' : 'ltr'}`}>
      <Sidebar isOpen={isSidebarOpen} activeModule={activeModule} setActiveModule={setActiveModule} lang={lang} />
      <div className="flex-1 flex flex-col min-w-0 bg-gray-50 overflow-hidden">
        <Header lang={lang} setLang={setLang} setSidebarOpen={setSidebarOpen} isSidebarOpen={isSidebarOpen} />
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          {renderModule()}
        </main>
      </div>
      {isModalOpen && (
        <Modal 
          type={modalType} 
          onClose={() => setIsModalOpen(false)} 
          onSubmit={handleFormSubmit}
          lang={lang}
          projects={projects}
        />
      )}
    </div>
  );
};


export default App;
