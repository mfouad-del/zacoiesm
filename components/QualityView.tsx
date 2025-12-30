import React from 'react';
import { Language, NCR } from '../types';
import { TRANSLATIONS } from '../constants';
import { ShieldCheck, Search, Filter, AlertTriangle, CheckCircle } from 'lucide-react';

const QualityView: React.FC<{ lang: Language; ncrs: NCR[]; onAddNCR: () => void; onUpdateStatus: (id: string, status: string) => void }> = ({ lang, ncrs, onAddNCR, onUpdateStatus }) => {
  const t = TRANSLATIONS[lang];

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t.quality}</h1>
          <p className="text-gray-500 text-sm">
            {lang === 'ar' ? 'خطط التفتيش والاختبار (ITP)، وتقارير عدم المطابقة (NCR)، وقوائم الملاحظات.' : 'Inspection & Test Plans (ITP), NCRs, and Punch Lists.'}
          </p>
        </div>
        <div className="flex gap-2">
          <button onClick={onAddNCR} className="px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/20 active:scale-95">
            {t.newInspection}
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <h3 className="font-bold text-lg">{t.ncrTracking}</h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-right rtl">
            <thead className="bg-gray-50 text-[10px] text-gray-400 font-bold uppercase tracking-widest">
              <tr>
                <th className="px-6 py-4">{t.ncrId}</th>
                <th className="px-6 py-4">{t.description}</th>
                <th className="px-6 py-4">{t.severity}</th>
                <th className="px-6 py-4">{t.status}</th>
                <th className="px-6 py-4">{t.actions}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {ncrs.map(ncr => (
                <tr key={ncr.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 font-mono text-sm font-bold text-blue-600">{ncr.id}</td>
                  <td className="px-6 py-4 text-sm font-medium text-gray-800">{ncr.title}</td>
                  <td className="px-6 py-4">
                    <span className={`flex items-center gap-1.5 text-xs font-bold ${ncr.severity === 'high' ? 'text-red-500' : 'text-amber-500'}`}>
                      <AlertTriangle size={14} />
                      {t[ncr.severity as keyof typeof t] || ncr.severity}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider
                      ${ncr.status === 'open' ? 'bg-red-50 text-red-600' : 'bg-emerald-50 text-emerald-600'}`}>
                      {ncr.status === 'open' ? (lang === 'ar' ? 'مفتوح' : 'Open') : (lang === 'ar' ? 'مغلق' : 'Closed')}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {ncr.status === 'open' && (
                      <button 
                        onClick={() => onUpdateStatus(ncr.id, 'closed')}
                        className="flex items-center gap-1 text-[10px] font-bold text-emerald-600 hover:text-emerald-700 transition-colors"
                      >
                        <CheckCircle size={14}/> {lang === 'ar' ? 'إغلاق' : 'Close'}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default QualityView;
