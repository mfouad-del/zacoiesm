import React from 'react';
import { Language, Timesheet } from '../types';
import { TRANSLATIONS } from '../constants';
import { Plus, CheckCircle, Clock, User, Check } from 'lucide-react';

const TimesheetsView: React.FC<{ lang: Language; entries: Timesheet[]; onAddEntry: () => void; onApprove: (id: string) => void }> = ({ lang, entries, onAddEntry, onApprove }) => {
  const t = TRANSLATIONS[lang];

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t.timesheets}</h1>
          <p className="text-gray-500 text-sm">{lang === 'ar' ? 'تسجيل ساعات العمل والموافقات.' : 'Record working hours and approvals.'}</p>
        </div>
        <button onClick={onAddEntry} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/20 active:scale-95">
          <Plus size={18} />
          {t.addNew}
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <table className="w-full text-left rtl">
          <thead className="bg-gray-50 text-[10px] text-gray-400 font-bold uppercase tracking-widest">
            <tr>
              <th className="px-6 py-4">{t.employee}</th>
              <th className="px-6 py-4">{t.projectName}</th>
              <th className="px-6 py-4">{t.hours}</th>
              <th className="px-6 py-4">{t.status}</th>
              <th className="px-6 py-4">{t.actions}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {entries.length === 0 ? (
              <tr><td colSpan={5} className="py-10 text-center text-gray-400">{lang === 'ar' ? 'لا توجد سجلات' : 'No entries found'}</td></tr>
            ) : (
              entries.map((entry) => (
                <tr key={entry.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center font-bold text-xs">{entry.employee[0]}</div>
                      <span className="text-sm font-semibold text-gray-800">{entry.employee}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-xs font-mono font-bold text-gray-400">{entry.project}</td>
                  <td className="px-6 py-4 font-bold text-blue-600">{entry.hours}h</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase
                      ${entry.status === 'Approved' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>
                      {entry.status === 'Approved' ? (lang === 'ar' ? 'معتمد' : 'Approved') : (lang === 'ar' ? 'معلق' : 'Pending')}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {entry.status === 'Pending' && (
                      <button 
                        onClick={() => onApprove(entry.id)}
                        className="p-2 text-emerald-600 hover:bg-emerald-50 rounded transition-colors"
                        title={t.approve}
                      >
                        <Check size={18}/>
                      </button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TimesheetsView;
