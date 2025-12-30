import React from 'react';
import { Project, Language } from '../types';
import { TRANSLATIONS } from '../constants';
import { Plus, Filter, MoreHorizontal, MapPin, Calendar, Clock, DollarSign, ArrowRight } from 'lucide-react';

interface ProjectsViewProps {
  projects: Project[];
  lang: Language;
  onAddProject: () => void;
}

const ProjectsView: React.FC<ProjectsViewProps> = ({ projects, lang, onAddProject }) => {
  const t = TRANSLATIONS[lang];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">{t.projects}</h1>
          <p className="text-slate-500 font-medium text-sm mt-1">
            {lang === 'ar' ? 'إدارة وتحليل جميع العقود والمشاريع الجارية' : 'Manage and analyze all ongoing contracts and projects'}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-5 py-2.5 bg-white border border-slate-200 text-slate-700 rounded-2xl text-sm font-bold hover:bg-slate-50 transition-all active:scale-95 shadow-sm">
            <Filter size={18} />
            {t.filter}
          </button>
          <button onClick={onAddProject} className="flex items-center gap-2 px-6 py-3 bg-brand-600 text-white rounded-2xl text-sm font-bold hover:bg-brand-700 transition-all active:scale-95 shadow-lg shadow-brand-500/25">
            <Plus size={18} />
            {t.addProject}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
        {projects.map((p) => (
          <div key={p.id} className="bg-white rounded-[40px] border border-slate-100 shadow-sm card-hover overflow-hidden flex flex-col">
            <div className="p-8 flex-1">
              <div className="flex justify-between items-start mb-8">
                <div className="w-14 h-14 bg-slate-900 rounded-2xl flex items-center justify-center text-white text-xl font-black shadow-xl shadow-slate-900/10">
                  {p.code.substring(0, 2)}
                </div>
                <div className="flex flex-col items-end gap-2">
                  <span className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest
                    ${p.status === 'active' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                    {p.status === 'active' ? t.active : t.onHold}
                  </span>
                  <button className="p-2 text-slate-400 hover:text-slate-900 hover:bg-slate-50 rounded-xl transition-all">
                    <MoreHorizontal size={20} />
                  </button>
                </div>
              </div>
              
              <h3 className="text-xl font-extrabold text-slate-900 mb-1 leading-tight">{p.name}</h3>
              <p className="text-xs text-brand-500 font-black uppercase tracking-widest mb-6">{p.code}</p>
              
              <div className="grid grid-cols-2 gap-3 mb-8">
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100/50">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">{lang === 'ar' ? 'الموقع' : 'Location'}</p>
                  <div className="flex items-center gap-1.5 text-slate-900 font-bold text-xs">
                    <MapPin size={14} className="text-brand-500" />
                    <span>UAE Central</span>
                  </div>
                </div>
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100/50">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">{lang === 'ar' ? 'المتبقي' : 'Timeline'}</p>
                  <div className="flex items-center gap-1.5 text-slate-900 font-bold text-xs">
                    <Clock size={14} className="text-brand-500" />
                    <span>18 Months</span>
                  </div>
                </div>
              </div>
              
              <div className="space-y-3">
                <div className="flex justify-between items-end">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t.progress}</span>
                  <span className="text-lg font-black text-slate-900">{p.progress}%</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-3 p-1">
                  <div 
                    className="bg-brand-600 h-full rounded-full transition-all duration-1000 shadow-[0_0_12px_rgba(2,113,199,0.3)]" 
                    style={{ width: `${p.progress}%` }}
                  ></div>
                </div>
              </div>
            </div>
            
            <div className="px-8 py-6 bg-slate-50 border-t border-slate-100 flex justify-between items-center group">
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
    </div>
  );
};

export default ProjectsView;
