import React, { useState, useEffect, useCallback } from 'react';
import { api } from './lib/api';
import { auditLogger } from './lib/audit/logger';
import { Language, Project, Contract, Variation, PlanningTask, Report, NCR, Document, Timesheet, Incident, User, UserRole } from './types';
import { Toaster, toast } from 'react-hot-toast';
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
import AuditTrailView from './components/AuditTrailView';
import ProcurementView from './components/ProcurementView';
import InventoryView from './components/InventoryView';
import CorrespondenceView from './components/CorrespondenceView';
import BIMView from './components/BIMView';
import LoginView from './components/LoginView';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Modal from './components/Modal';

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(() => !!localStorage.getItem('sb-access-token'));
  const [lang, setLang] = useState<Language>('ar');
  const [activeModule, setActiveModule] = useState('dashboard');
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState<string | null>(null);

  const [projects, setProjects] = useState<Project[]>([]);
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [variations, setVariations] = useState<Variation[]>([]);
  const [planningTasks, setPlanningTasks] = useState<PlanningTask[]>([]);
  const [reports, setReports] = useState<Report[]>([]);
  const [ncrs, setNcrs] = useState<NCR[]>([]);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [timesheets, setTimesheets] = useState<Timesheet[]>([]);
  const [incidents, setIncidents] = useState<Incident[]>([]);

  const [user, setUser] = useState<User>({
    id: '1',
    name: 'م. أحمد علي',
    email: 'ahmed.ali@example.com',
    role: UserRole.SUPER_ADMIN,
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Ahmed'
  });

  const handleSearch = (query: string) => {
    console.log('Searching for:', query);
  };

  // --- الحالة المركزية المستمرة (Persistent Global State) ---


  // Fetch data from Backend
  useEffect(() => {
    const loadData = async () => {
      if (!isAuthenticated) return;
      try {
        const [
            projectsData,
            contractsData,
            variationsData,
            planningData,
            reportsData,
            ncrsData,
            documentsData,
            timesheetsData,
            incidentsData
        ] = await Promise.all([
            api.projects.list(),
            api.contracts.list(),
            api.variations.list(),
            api.planning.list(),
            api.reports.list(),
            api.quality.list(),
            api.documents.list(),
            api.timesheets.list(),
            api.safety.list()
        ]);

        setProjects(projectsData);
        setContracts(contractsData);
        setVariations(variationsData);
        
        // Map tasks to planning view model
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const mappedPlanning = planningData.map((t: any) => ({
            id: t.id,
            name: t.title,
            progress: t.status === 'completed' ? 100 : (t.status === 'in_progress' ? 50 : 0),
            startDate: t.start_date || new Date().toISOString().split('T')[0],
            endDate: t.end_date || new Date(Date.now() + 86400000 * 30).toISOString().split('T')[0],
            duration: t.duration || 30,
            status: t.status || 'not_started',
            critical: t.priority === 'urgent' || t.priority === 'high',
            assignee: t.assignee
        }));
        setPlanningTasks(mappedPlanning);

        setReports(reportsData);
        setNcrs(ncrsData);
        setDocuments(documentsData);
        setTimesheets(timesheetsData);
        setIncidents(incidentsData);
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
    localStorage.setItem('iems_projects', JSON.stringify(projects));
    localStorage.setItem('iems_contracts', JSON.stringify(contracts));
    localStorage.setItem('iems_variations', JSON.stringify(variations));
    localStorage.setItem('iems_planning', JSON.stringify(planningTasks));
    localStorage.setItem('iems_reports', JSON.stringify(reports));
    localStorage.setItem('iems_ncrs', JSON.stringify(ncrs));
    localStorage.setItem('iems_docs', JSON.stringify(documents));
    localStorage.setItem('iems_timesheets', JSON.stringify(timesheets));
    localStorage.setItem('iems_incidents', JSON.stringify(incidents));
  }, [projects, contracts, variations, planningTasks, reports, ncrs, documents, timesheets, incidents]);

  // معالج الإضافة العام - memoized
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleFormSubmit = useCallback((formData: any) => {
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
        setPlanningTasks([...planningTasks, { 
            ...formData, 
            id: newId, 
            duration: Math.ceil((new Date(formData.endDate).getTime() - new Date(formData.startDate).getTime()) / (1000 * 60 * 60 * 24))
        }]);
        break;
      case 'report':
        setReports([{ ...formData, id: newId, date: today }, ...reports]);
        break;
      case 'ncr':
        setNcrs([{ ...formData, id: `NCR-${Math.floor(Math.random() * 1000)}`, status: 'open', date: today }, ...ncrs]);
        break;
      case 'doc':
        setDocuments([{ ...formData, id: `DOC-${Math.floor(Math.random() * 1000)}`, date: today, size: '0 MB' }, ...documents]);
        break;
      case 'timesheet':
        setTimesheets([{ ...formData, id: newId, status: 'Pending' }, ...timesheets]);
        break;
      case 'incident':
        setIncidents([{ ...formData, id: `INC-${Math.floor(Math.random() * 1000)}`, status: 'Investigating' }, ...incidents]);
        break;
    }
    setIsModalOpen(false);
  }, [modalType, projects, contracts, variations, planningTasks, reports, ncrs, documents, timesheets, incidents]);

  // Open modal with specific type - memoized
  const openModal = useCallback((type: string) => {
    setModalType(type);
    setIsModalOpen(true);
  }, []);

  const updateNCRStatus = useCallback(async (id: string, status: string) => {
    const ncr = ncrs.find(n => n.id === id);
    if (ncr) {
      await auditLogger.logNCRStatusChange(id, ncr.id, ncr.status, status);
    }
    setNcrs(ncrs.map(n => n.id === id ? { ...n, status } : n));
  }, [ncrs]);
  
  const approveTimesheet = useCallback(async (id: string) => {
    const ts = timesheets.find(t => t.id === id);
    if (ts) {
      await auditLogger.logTimesheetApproval(id, ts.employeeName);
    }
    setTimesheets(timesheets.map(t => t.id === id ? { ...t, status: 'Approved' } : t));
  }, [timesheets]);

  const renderModule = () => {
    switch (activeModule) {
      case 'dashboard': return <DashboardView 
        projects={projects} 
        lang={lang} 
        incidentsCount={incidents.length} 
        contracts={contracts}
        variations={variations}
        ncrs={ncrs}
        reports={reports}
        timesheets={timesheets}
      />;
      case 'projects': return <ProjectsView projects={user.role === UserRole.CLIENT_VIEWER ? projects.filter(p => p.status === 'active').slice(0, 3) : projects} lang={lang} onAddProject={() => user.role === UserRole.CLIENT_VIEWER ? toast.error(lang === 'ar' ? 'ليس لديك صلاحية' : 'Access Denied') : openModal('project')} readOnly={user.role === UserRole.CLIENT_VIEWER} />;
      case 'contracts': return <ContractsView lang={lang} contracts={contracts} variations={variations} onAddVO={() => openModal('variation')} onAddContract={() => openModal('contract')} />;
      case 'planning': return <PlanningView lang={lang} activities={planningTasks} onAddActivity={() => openModal('planning')} />;
      case 'site': return <SiteManagementView lang={lang} reports={reports} onAddReport={() => openModal('report')} />;
      case 'quality': return <QualityView lang={lang} ncrs={ncrs} onAddNCR={() => openModal('ncr')} onUpdateStatus={updateNCRStatus} />;
      case 'safety': return <SafetyView lang={lang} incidents={incidents} onAddIncident={() => openModal('incident')} />;
      case 'documents': return <DocumentsView lang={lang} documents={documents} onAddDoc={() => openModal('doc')} />;
      case 'costs': return <CostsView lang={lang} projects={projects} onAddExpense={() => openModal('expense')} onAddResource={() => openModal('resource')} />;
      case 'timesheets': return <TimesheetsView lang={lang} entries={timesheets} onAddEntry={() => openModal('timesheet')} onApprove={approveTimesheet} />;
      case 'procurement': return <ProcurementView lang={lang} projects={projects} userRole={user.role} />;
      case 'inventory': return <InventoryView lang={lang} />;
      case 'correspondence': return <CorrespondenceView lang={lang} />;
      case 'bim': return <BIMView lang={lang} />;
      case 'audit': return <AuditTrailView lang={lang} />;
      case 'settings': return <SettingsView lang={lang} user={user} onUpdateUser={setUser} />;
      default: return null;
    }
  };

  if (!isAuthenticated) {
    return <LoginView onLoginSuccess={() => setIsAuthenticated(true)} />;
  }

  return (
    <div className={`h-screen overflow-hidden flex ${lang === 'ar' ? 'rtl' : 'ltr'}`}>
      <Toaster position={lang === 'ar' ? 'top-right' : 'top-left'} />
      <Sidebar isOpen={isSidebarOpen} activeModule={activeModule} setActiveModule={setActiveModule} lang={lang} user={user} />
      <div className="flex-1 flex flex-col min-w-0 bg-gray-50 h-full">
        <Header 
          lang={lang} 
          setLang={setLang} 
          setSidebarOpen={setSidebarOpen} 
          isSidebarOpen={isSidebarOpen} 
          user={user}
          onSearch={handleSearch}
        />
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
