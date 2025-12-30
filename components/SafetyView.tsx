import React from 'react';
import { Language } from '../types';
import { TRANSLATIONS } from '../constants';
import { ShieldAlert, Users, HeartPulse, Activity, AlertTriangle, Clock } from 'lucide-react';

const SafetyView: React.FC<{ lang: Language; incidents: any[]; onAddIncident: () => void }> = ({ lang, incidents, onAddIncident }) => {
  const t = TRANSLATIONS[lang];

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t.safety}</h1>
          <p className="text-gray-500 text-sm">
            {lang === 'ar' ? 'بلاغات الحوادث، اجتماعات السلامة (Toolbox Talks)، ومراقبة البيئة والصحة والسلامة.' : 'Incident reporting, Toolbox Talks, and HSE monitoring.'}
          </p>
        </div>
        <button onClick={onAddIncident} className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-xl text-sm font-semibold hover:bg-red-700 transition-all shadow-lg shadow-red-500/20 active:scale-95">
          <ShieldAlert size={18} />
          {t.reportIncident}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-emerald-600 p-6 rounded-2xl text-white shadow-lg shadow-emerald-500/20">
          <HeartPulse size={32} className="mb-4 opacity-80" />
          <h3 className="text-3xl font-bold mb-1">452</h3>
          <p className="text-emerald-100 text-sm font-medium">{t.safeWorkingDays}</p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex flex-col justify-between">
           <div className="flex justify-between items-start">
            <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
              <Activity size={24} />
            </div>
          </div>
          <div>
            <h3 className="text-3xl font-bold text-gray-900">{incidents.length}</h3>
            <p className="text-gray-400 text-sm">{t.openIncidents}</p>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
              <Users size={24} />
            </div>
          </div>
          <div>
            <h3 className="text-3xl font-bold text-gray-900">28</h3>
            <p className="text-gray-400 text-sm">{t.toolboxTalks}</p>
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
        <h3 className="font-bold text-lg mb-6">{lang === 'ar' ? 'سجل الحوادث' : 'Incident Log'}</h3>
        <div className="space-y-4">
          {incidents.length === 0 ? (
            <p className="text-center py-10 text-gray-400 italic">{lang === 'ar' ? 'لم يتم تسجيل حوادث' : 'No incidents recorded'}</p>
          ) : (
            incidents.map((inc) => (
              <div key={inc.id} className="flex gap-4 p-4 border border-gray-100 rounded-xl hover:bg-gray-50 transition-colors">
                <div className={`w-1.5 h-auto rounded-full ${inc.severity === 'high' ? 'bg-red-500' : 'bg-amber-500'}`}></div>
                <div className="flex-1">
                  <div className="flex justify-between items-center mb-1">
                     <span className="text-[10px] font-bold uppercase text-gray-400 tracking-wider flex items-center gap-1"><Clock size={10}/> {inc.date}</span>
                     <span className={`px-2 py-0.5 rounded text-[8px] font-bold uppercase ${inc.severity === 'high' ? 'bg-red-50 text-red-600' : 'bg-amber-50 text-amber-600'}`}>
                        {t[inc.severity as keyof typeof t] || inc.severity}
                     </span>
                  </div>
                  <p className="text-sm font-semibold text-gray-800">{inc.desc}</p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default SafetyView;
