import React, { useState, useEffect } from 'react';
import { api } from './lib/api';
import { auditLogger } from './lib/audit/logger';
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
import AuditTrailView from './components/AuditTrailView';
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

  // Check auth on mount
  useEffect(() => {
    const token = localStorage.getItem('sb-access-token');
    if (token) {
      setIsAuthenticated(true);
    }
    setIsLoadingAuth(false);
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
        const mappedPlanning = planningData.map((t: any) => ({
            id: t.id,
            name: t.title,
            progress: t.status === 'completed' ? 100 : (t.status === 'in_progress' ? 50 : 0),
            start: Math.floor(Math.random() * 40), // Visual placeholder
            end: 40 + Math.floor(Math.random() * 40), // Visual placeholder
            critical: t.priority === 'urgent' || t.priority === 'high'
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

  const updateNCRStatus = async (id: string, status: string) => {
    const ncr = ncrs.find(n => n.id === id);
    if (ncr) {
      await auditLogger.logNCRStatusChange(id, ncr.id, ncr.status, status);
    }
    setNcrs(ncrs.map(n => n.id === id ? { ...n, status } : n));
  };
  
  const approveTimesheet = async (id: string) => {
    const ts = timesheets.find(t => t.id === id);
    if (ts) {
      await auditLogger.logTimesheetApproval(id, ts.employeeName);
    }
    setTimesheets(timesheets.map(t => t.id === id ? { ...t, status: 'Approved' } : t));
  };

  const renderModule = () => {
    switch (activeModule) {
      case 'dashboard': return <DashboardView projects={projects} lang={lang} incidentsCount={incidents.length} />;
      case 'projects': return <ProjectsView projects={projects} lang={lang} onAddProject={() => openModal('project')} />;
      case 'contracts': return <ContractsView lang={lang} contracts={contracts} variations={variations} onAddVO={() => openModal('variation')} />;
      case 'planning': return <PlanningView lang={lang} activities={planningTasks} onAddActivity={() => openModal('planning')} />;
      case 'site': return <SiteManagementView lang={lang} reports={reports} onAddReport={() => openModal('report')} />;
      case 'quality': return <QualityView lang={lang} ncrs={ncrs} onAddNCR={() => openModal('ncr')} onUpdateStatus={updateNCRStatus} />;
      case 'safety': return <SafetyView lang={lang} incidents={incidents} onAddIncident={() => openModal('incident')} />;
      case 'documents': return <DocumentsView lang={lang} documents={documents} onAddDoc={() => openModal('doc')} />;
      case 'costs': return <CostsView lang={lang} projects={projects} />;
      case 'timesheets': return <TimesheetsView lang={lang} entries={timesheets} onAddEntry={() => openModal('timesheet')} onApprove={approveTimesheet} />;
      case 'audit': return <AuditTrailView lang={lang} />;
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
