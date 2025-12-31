import React, { useState, useMemo } from 'react';
import { Project, Language } from '../types';
import { TRANSLATIONS } from '../constants';
import { Plus, MoreHorizontal, MapPin, ArrowRight, FileDown, LayoutGrid, List, Search, User, Briefcase } from 'lucide-react';
import { exportToExcel, exportToPDF } from '../lib/utils/export';
import toast from 'react-hot-toast';

interface ProjectsViewProps {
  projects: Project[];
  lang: Language;
  onAddProject: () => void;
  readOnly?: boolean;
}

const ProjectsView: React.FC<ProjectsViewProps> = ({ projects, lang, onAddProject, readOnly }) => {
  const t = TRANSLATIONS[lang];
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'completed' | 'on-hold'>('all');

  const filteredProjects = useMemo(() => {
    return projects.filter(p => {
      const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            p.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            (p.client && p.client.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesStatus = statusFilter === 'all' || p.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [projects, searchQuery, statusFilter]);

  const handleExport = async (format: 'excel' | 'pdf') => {
    const data = filteredProjects.map(p => ({
      'كود المشروع': p.code,
      'اسم المشروع': p.name,
      'العميل': p.client || '-',
      'مدير المشروع': p.manager || '-',
      'الحالة': p.status,
      'الميزانية': p.budget,
      'التقدم': `${p.progress}%`,
      'تاريخ البدء': p.startDate,
      'تاريخ الانتهاء': p.endDate
    }));

    if (format === 'excel') {
      const success = exportToExcel(data, `projects_${Date.now()}`, 'المشاريع');
      if (success) toast.success('تم تصدير Excel بنجاح');
    } else {
      const columns = ['كود المشروع', 'اسم المشروع', 'العميل', 'مدير المشروع', 'الحالة', 'الميزانية', 'التقدم'];
      const success = await exportToPDF(data, columns, `projects_${Date.now()}`, 'تقرير المشاريع');
      if (success) toast.success('تم تصدير PDF بنجاح');
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">{t.projects}</h1>
          <p className="text-slate-500 font-medium text-sm mt-1">
            {lang === 'ar' ? 'إدارة وتحليل جميع العقود والمشاريع الجارية' : 'Manage and analyze all ongoing contracts and projects'}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center bg-white border border-slate-200 rounded-2xl px-3 py-2 w-full md:w-64 focus-within:ring-2 focus-within:ring-brand-500/20 transition-all">
            <Search size={18} className="text-slate-400" />
            <input 
              type="text" 
              placeholder={lang === 'ar' ? 'بحث عن مشروع...' : 'Search projects...'}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent border-none focus:ring-0 text-sm font-medium w-full outline-none placeholder:text-slate-400 mx-2"
            />
          </div>
          
          <div className="flex bg-slate-100 p-1 rounded-xl">
            <button 
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-white shadow-sm text-brand-600' : 'text-slate-400 hover:text-slate-600'}`}
            >
              <LayoutGrid size={18} />
            </button>
            <button 
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-lg transition-all ${viewMode === 'list' ? 'bg-white shadow-sm text-brand-600' : 'text-slate-400 hover:text-slate-600'}`}
            >
              <List size={18} />
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button 
              onClick={() => handleExport('excel')}
              className="p-2.5 bg-green-50 text-green-600 rounded-xl hover:bg-green-100 transition-all"
              title="Export Excel"
            >
              <FileDown size={18} />
            </button>
            <button 
              onClick={() => handleExport('pdf')}
              className="p-2.5 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 transition-all"
              title="Export PDF"
            >
              <FileDown size={18} />
            </button>
          </div>

          {!readOnly && (
            <button onClick={onAddProject} className="flex items-center gap-2 px-6 py-3 bg-brand-600 text-white rounded-2xl text-sm font-bold hover:bg-brand-700 transition-all active:scale-95 shadow-lg shadow-brand-500/25">
              <Plus size={18} />
              {t.addProject}
            </button>
          )}
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {['all', 'active', 'completed', 'on-hold'].map((status) => (
          <button
            key={status}
            onClick={() => setStatusFilter(status as 'all' | 'active' | 'completed' | 'on-hold')}
            className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider whitespace-nowrap transition-all
              ${statusFilter === status 
                ? 'bg-brand-600 text-white shadow-md shadow-brand-500/20' 
                : 'bg-white border border-slate-200 text-slate-500 hover:bg-slate-50'}`}
          >
            {status === 'all' ? (lang === 'ar' ? 'الكل' : 'All') : 
             status === 'active' ? (lang === 'ar' ? 'نشط' : 'Active') :
             status === 'completed' ? (lang === 'ar' ? 'مكتمل' : 'Completed') :
             (lang === 'ar' ? 'معلق' : 'On Hold')}
          </button>
        ))}
      </div>

      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
          {filteredProjects.map((p) => (
            <div key={p.id} className="bg-white rounded-[40px] border border-slate-100 shadow-sm card-hover overflow-hidden flex flex-col group">
              <div className="p-8 flex-1">
                <div className="flex justify-between items-start mb-6">
                  <div className="w-14 h-14 bg-slate-900 rounded-2xl flex items-center justify-center text-white text-xl font-black shadow-xl shadow-slate-900/10 group-hover:scale-110 transition-transform duration-300">
                    {p.code.substring(0, 2)}
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <span className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest
                      ${p.status === 'active' ? 'bg-emerald-100 text-emerald-700' : 
                        p.status === 'completed' ? 'bg-blue-100 text-blue-700' : 'bg-amber-100 text-amber-700'}`}>
                      {p.status}
                    </span>
                    <button className="p-2 text-slate-400 hover:text-slate-900 hover:bg-slate-50 rounded-xl transition-all">
                      <MoreHorizontal size={20} />
                    </button>
                  </div>
                </div>
                
                <h3 className="text-xl font-extrabold text-slate-900 mb-1 leading-tight line-clamp-2 h-14">{p.name}</h3>
                <p className="text-xs text-brand-500 font-black uppercase tracking-widest mb-6">{p.code}</p>
                
                <div className="space-y-3 mb-6">
                  {p.client && (
                    <div className="flex items-center gap-2 text-xs text-slate-600">
                      <Briefcase size={14} className="text-slate-400" />
                      <span className="font-bold">{p.client}</span>
                    </div>
                  )}
                  {p.manager && (
                    <div className="flex items-center gap-2 text-xs text-slate-600">
                      <User size={14} className="text-slate-400" />
                      <span className="font-bold">{p.manager}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-xs text-slate-600">
                    <MapPin size={14} className="text-slate-400" />
                    <span className="font-bold">{p.location || 'UAE Central'}</span>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div className="flex justify-between items-end">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t.progress}</span>
                    <span className="text-lg font-black text-slate-900">{p.progress}%</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-3 p-1">
                    <div 
                      className={`h-full rounded-full transition-all duration-1000 shadow-[0_0_12px_rgba(0,0,0,0.1)]
                        ${p.progress === 100 ? 'bg-emerald-500' : 'bg-brand-600'}`}
                      style={{ width: `${p.progress}%` }}
                    ></div>
                  </div>
                </div>
              </div>
              
              <div className="px-8 py-6 bg-slate-50 border-t border-slate-100 flex justify-between items-center">
                <div className="flex flex-col">
                  <p className="text-[10px] uppercase tracking-widest text-slate-400 font-black mb-0.5">{t.budget}</p>
                  <p className="text-lg font-black text-slate-900 tracking-tight">
                     <span className="text-brand-600 text-sm mr-1">$</span>
                     {(p.budget / 1000000).toFixed(1)}M
                  </p>
                </div>
                <button className="w-12 h-12 bg-white border border-slate-200 rounded-2xl flex items-center justify-center text-slate-900 shadow-sm hover:border-brand-500 hover:text-brand-600 transition-all group-hover:translate-x-1 group-hover:shadow-md active:scale-95">
                  <ArrowRight size={20} strokeWidth={2.5} className={lang === 'ar' ? 'rotate-180' : ''} />
                </button>
              </div>
            </div>
          ))}
          
          <button 
            onClick={onAddProject}
            className="border-4 border-dashed border-slate-200 rounded-[40px] p-8 flex flex-col items-center justify-center gap-5 text-slate-300 hover:border-brand-400 hover:text-brand-500 hover:bg-brand-50/20 transition-all group min-h-[400px]"
          >
            <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center group-hover:scale-110 group-hover:bg-white group-hover:shadow-xl transition-all duration-300">
              <Plus size={32} strokeWidth={3} />
            </div>
            <span className="font-black uppercase tracking-widest text-sm">{t.addProject}</span>
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-[32px] border border-slate-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left rtl:text-right">
              <thead className="bg-slate-50 text-[11px] text-slate-400 font-black uppercase tracking-widest border-b border-slate-100">
                <tr>
                  <th className="px-6 py-5">{t.projectCode}</th>
                  <th className="px-6 py-5">{t.projectName}</th>
                  <th className="px-6 py-5">{lang === 'ar' ? 'العميل' : 'Client'}</th>
                  <th className="px-6 py-5">{lang === 'ar' ? 'المدير' : 'Manager'}</th>
                  <th className="px-6 py-5">{t.budget}</th>
                  <th className="px-6 py-5">{t.progress}</th>
                  <th className="px-6 py-5">{t.status}</th>
                  <th className="px-6 py-5 text-center">{lang === 'ar' ? 'إجراءات' : 'Actions'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredProjects.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50/80 transition-colors group">
                    <td className="px-6 py-4 font-mono text-xs font-bold text-slate-500">{p.code}</td>
                    <td className="px-6 py-4">
                      <div className="font-bold text-slate-900">{p.name}</div>
                      <div className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                        <MapPin size={10} /> {p.location || 'UAE'}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-slate-600">{p.client || '-'}</td>
                    <td className="px-6 py-4 text-sm font-medium text-slate-600">{p.manager || '-'}</td>
                    <td className="px-6 py-4 font-bold text-slate-900">${(p.budget / 1000000).toFixed(2)}M</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-16 bg-slate-100 rounded-full h-1.5">
                          <div className="bg-brand-600 h-full rounded-full" style={{ width: `${p.progress}%` }}></div>
                        </div>
                        <span className="text-xs font-bold text-slate-600">{p.progress}%</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider
                        ${p.status === 'active' ? 'bg-emerald-50 text-emerald-600' : 
                          p.status === 'completed' ? 'bg-blue-50 text-blue-600' : 'bg-amber-50 text-amber-600'}`}>
                        {p.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button className="p-2 text-slate-400 hover:text-brand-600 hover:bg-brand-50 rounded-xl transition-all">
                        <MoreHorizontal size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectsView;
