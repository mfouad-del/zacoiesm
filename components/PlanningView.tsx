import React from 'react';
import { Language } from '../types';
import { TRANSLATIONS } from '../constants';
import { GanttChartSquare, Download, Plus, Filter, LayoutList } from 'lucide-react';

interface PlanningViewProps {
  lang: Language;
  activities: any[];
  onAddActivity: () => void;
}

const PlanningView: React.FC<PlanningViewProps> = ({ lang, activities, onAddActivity }) => {
  const t = TRANSLATIONS[lang];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">{t.planning}</h1>
          <p className="text-slate-500 font-medium text-sm mt-1">
            {lang === 'ar' ? 'إدارة وتحسين الجداول الزمنية الرئيسية والمسارات الحرجة' : 'Manage and optimize master schedules and critical paths'}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-5 py-2.5 bg-white border border-slate-200 text-slate-700 rounded-2xl text-sm font-bold hover:bg-slate-50 transition-all active:scale-95 shadow-sm">
            <Download size={18} />
            {t.exportSchedule}
          </button>
          <button onClick={onAddActivity} className="flex items-center gap-2 px-6 py-3 bg-brand-600 text-white rounded-2xl text-sm font-bold hover:bg-brand-700 transition-all active:scale-95 shadow-lg shadow-brand-500/25">
            <Plus size={18} />
            {lang === 'ar' ? 'إضافة مهمة' : 'Add Activity'}
          </button>
        </div>
      </div>

      <div className="bg-white rounded-[32px] border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
             <div className="p-2 bg-brand-100 text-brand-600 rounded-xl">
               <GanttChartSquare size={20} strokeWidth={2.5} />
             </div>
             <h3 className="font-bold text-slate-900">{t.baseline}</h3>
          </div>
          <div className="flex items-center gap-4">
             <div className="flex items-center gap-2">
               <span className="w-3 h-3 rounded-full bg-brand-600"></span>
               <span className="text-[10px] font-black uppercase text-slate-500 tracking-widest">{lang === 'ar' ? 'عادي' : 'Normal'}</span>
             </div>
             <div className="flex items-center gap-2">
               <span className="w-3 h-3 rounded-full bg-red-500"></span>
               <span className="text-[10px] font-black uppercase text-slate-500 tracking-widest">{t.criticalPath}</span>
             </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <div className="min-w-[900px] p-8">
            <div className="grid grid-cols-12 gap-4 mb-10 border-b border-slate-100 pb-4">
              <div className="col-span-3 flex items-center gap-2">
                <LayoutList size={16} className="text-slate-400" />
                <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest">{t.activityDescription}</span>
              </div>
              <div className="col-span-9 grid grid-cols-10 gap-2 text-center">
                {t.months.slice(0, 10).map(m => (
                  <span key={m} className="text-[11px] font-black text-slate-400 uppercase tracking-widest border-l border-slate-50">{m}</span>
                ))}
              </div>
            </div>

            <div className="space-y-6">
              {activities.map((act) => (
                <div key={act.id} className="grid grid-cols-12 gap-4 items-center group">
                  <div className="col-span-3">
                    <p className="text-sm font-extrabold text-slate-800 group-hover:text-brand-600 transition-colors">{act.name}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="w-20 bg-slate-100 rounded-full h-1.5 overflow-hidden">
                        <div className="bg-slate-300 h-full" style={{ width: `${act.progress}%` }}></div>
                      </div>
                      <span className="text-[10px] font-bold text-slate-400">{act.progress}%</span>
                    </div>
                  </div>
                  <div className="col-span-9 relative h-10 bg-slate-50 rounded-2xl border border-slate-100 group-hover:bg-slate-100/50 transition-colors">
                    <div 
                      className={`absolute top-2 h-6 rounded-lg shadow-sm border-l-4 overflow-hidden
                        ${act.critical ? 'bg-red-500/10 border-red-500 shadow-red-500/10' : 'bg-brand-500/10 border-brand-500 shadow-brand-500/10'}`}
                      style={{ 
                        [lang === 'ar' ? 'right' : 'left']: `${act.start}%`, 
                        width: `${act.end - act.start}%` 
                      }}
                    >
                      <div className={`h-full opacity-60 transition-all duration-700 ${act.critical ? 'bg-red-500' : 'bg-brand-600'}`} style={{ width: `${act.progress}%` }}></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlanningView;
