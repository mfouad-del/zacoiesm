import React from 'react';
import { Language } from '../types';
import { TRANSLATIONS } from '../constants';
import { Plus, Sun, Users, Truck, Camera, MessageSquare, Clock, Cloud, Thermometer, MapPin } from 'lucide-react';

const SiteManagementView: React.FC<{ lang: Language; reports: any[]; onAddReport: () => void }> = ({ lang, reports, onAddReport }) => {
  const t = TRANSLATIONS[lang];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">{t.siteManagement}</h1>
          <p className="text-slate-500 font-medium text-sm mt-1">
            {lang === 'ar' ? 'مراقبة العمليات الميدانية والتقارير اليومية' : 'Monitor field operations and daily logging'}
          </p>
        </div>
        <button onClick={onAddReport} className="flex items-center gap-2 px-6 py-3 bg-brand-600 text-white rounded-2xl text-sm font-bold hover:bg-brand-700 transition-all active:scale-95 shadow-lg shadow-brand-500/25">
          <Plus size={18} />
          {t.newDailyReport}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm">
            <div className="flex items-center justify-between mb-8">
               <h3 className="font-bold text-lg text-slate-900">{lang === 'ar' ? 'آخر التقارير اليومية' : 'Recent Field Logs'}</h3>
               <button className="text-[10px] font-black text-brand-500 uppercase tracking-widest hover:underline">{t.viewAll}</button>
            </div>
            
            <div className="space-y-4">
              {reports.length === 0 ? (
                <div className="py-20 text-center bg-slate-50 rounded-3xl border-2 border-dashed border-slate-100">
                  <div className="w-20 h-20 bg-white rounded-3xl shadow-sm border border-slate-100 flex items-center justify-center mx-auto mb-4 text-slate-200">
                    <MessageSquare size={32} />
                  </div>
                  <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">{lang === 'ar' ? 'لا توجد تقارير جارية' : 'No active reports found'}</p>
                </div>
              ) : (
                reports.map((rep) => (
                  <div key={rep.id} className="p-6 border border-slate-100 rounded-3xl bg-white hover:bg-slate-50 transition-all card-hover">
                    <div className="flex justify-between items-start mb-4">
                       <div className="flex items-center gap-2">
                         <span className="px-3 py-1 bg-brand-50 text-brand-600 rounded-xl text-[10px] font-black uppercase tracking-widest">{rep.projectId}</span>
                         <div className="w-1.5 h-1.5 rounded-full bg-slate-200"></div>
                         <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1">
                           <Clock size={12}/> {rep.date}
                         </span>
                       </div>
                       <button className="p-1.5 text-slate-400 hover:text-slate-900 transition-colors">
                         <Camera size={18} />
                       </button>
                    </div>
                    <p className="text-sm font-bold text-slate-800 leading-relaxed mb-6">{rep.activities}</p>
                    <div className="flex flex-wrap gap-4 border-t border-slate-100 pt-5">
                      <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 border border-slate-100 rounded-xl">
                        <Users size={14} className="text-brand-500"/> 
                        <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">{rep.laborCount} {t.totalLabor}</span>
                      </div>
                      <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 border border-slate-100 rounded-xl">
                        <Truck size={14} className="text-brand-500"/> 
                        <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">{rep.equipmentCount} {t.equipment}</span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        <div className="space-y-8">
           <div className="bg-slate-900 p-8 rounded-[32px] text-white shadow-xl shadow-slate-900/10 relative overflow-hidden group">
            <div className="absolute -right-4 -top-4 w-32 h-32 bg-brand-500 opacity-20 blur-3xl group-hover:scale-150 transition-transform"></div>
            <div className="relative z-10 flex flex-col h-full">
              <div className="flex justify-between items-start mb-10">
                <div className="flex flex-col">
                  <h3 className="font-black text-xl tracking-tight">{lang === 'ar' ? 'الطقس الميداني' : 'Site Weather'}</h3>
                  <div className="flex items-center gap-1.5 mt-1 text-slate-400">
                    <MapPin size={12} className="text-brand-400" />
                    <span className="text-[10px] font-bold uppercase tracking-widest">Main Sector Area</span>
                  </div>
                </div>
                <div className="p-3 bg-white/10 rounded-2xl backdrop-blur-md">
                   <Sun size={24} className="text-engineering-gold" />
                </div>
              </div>
              <div className="flex items-end gap-3 mb-10">
                <span className="text-5xl font-black tracking-tighter">32°</span>
                <span className="text-xl font-bold text-slate-400 mb-1">C</span>
                <div className="ml-auto flex flex-col items-end">
                   <span className="text-xs font-black uppercase text-brand-400 tracking-widest">{lang === 'ar' ? 'مشمس' : 'Sunny'}</span>
                   <span className="text-[10px] text-slate-400 font-medium">Feels like 35°</span>
                </div>
              </div>
              <div className="p-5 bg-white/5 border border-white/10 rounded-2xl backdrop-blur-sm">
                <p className="text-[10px] text-brand-300 font-black uppercase tracking-widest mb-1.5">{lang === 'ar' ? 'توصية العمل' : 'Field Advisory'}</p>
                <p className="text-sm text-slate-300 leading-relaxed font-medium">
                  {lang === 'ar' ? 'الظروف مثالية لصب الخرسانة اليوم. يرجى توفير فترات راحة إضافية للعمال بسبب الحرارة.' : 'Optimal conditions for concrete works. Provide extra cooling breaks for site labor due to humidity.'}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm">
             <h3 className="font-bold text-lg text-slate-900 mb-6">{lang === 'ar' ? 'مؤشرات الموقع' : 'Site Metrics'}</h3>
             <div className="space-y-5">
               {[
                 { label: t.totalLabor, val: '142', color: 'blue' },
                 { label: t.deliveries, val: '08', color: 'emerald' },
                 { label: t.equipment, val: '12', color: 'indigo' },
               ].map((m, i) => (
                 <div key={i} className="flex justify-between items-center p-4 bg-slate-50 rounded-2xl">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{m.label}</span>
                    <span className="text-xl font-black text-slate-900 tracking-tighter">{m.val}</span>
                 </div>
               ))}
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SiteManagementView;
