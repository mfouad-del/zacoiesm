import React from 'react';
import { Language } from '../types';
import { TRANSLATIONS } from '../constants';
import { FileText, ArrowUpRight, Clock, AlertCircle, Plus } from 'lucide-react';

interface ContractsViewProps {
  lang: Language;
  variations: any[];
  onAddVO: () => void;
}

const ContractsView: React.FC<ContractsViewProps> = ({ lang, variations, onAddVO }) => {
  const t = TRANSLATIONS[lang];

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t.contracts}</h1>
          <p className="text-gray-500 text-sm">{lang === 'ar' ? 'المستندات القانونية والمطالبات.' : 'Legal docs and claims.'}</p>
        </div>
        <button onClick={onAddVO} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all active:scale-95 shadow-lg shadow-blue-500/20">
          <Plus size={18} />
          {lang === 'ar' ? 'أمر تغيير جديد' : 'New Variation'}
        </button>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
          <h3 className="font-bold text-lg mb-6">{t.contractSummary}</h3>
          <div className="grid grid-cols-2 gap-8 mb-8">
            <div><p className="text-[10px] text-gray-400 font-bold uppercase">{t.contractValue}</p><p className="text-2xl font-bold text-gray-900">$150,000,000</p></div>
            <div><p className="text-[10px] text-gray-400 font-bold uppercase">{t.duration}</p><p className="text-2xl font-bold text-gray-900">36 {lang === 'ar' ? 'شهراً' : 'Months'}</p></div>
          </div>
          <div className="space-y-4">
            <h4 className="text-xs font-bold text-gray-400 border-b pb-2 uppercase">{t.upcomingMilestones}</h4>
            {[1, 2].map(i => (
              <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center text-blue-600 shadow-sm"><Clock size={16} /></div>
                  <div><p className="text-sm font-bold text-gray-800">{lang === 'ar' ? `المرحلة 0${i}` : `Milestone 0${i}`}</p><p className="text-[10px] text-gray-400">15 Oct 2024</p></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
          <h3 className="font-bold text-lg mb-6">{t.variationsClaims}</h3>
          <div className="space-y-4">
            {variations.map((vo, i) => (
              <div key={i} className="flex items-center justify-between p-4 border border-gray-100 rounded-xl hover:bg-gray-50 transition-colors">
                <div className="flex items-center gap-4">
                  <div className={`p-2 rounded-lg bg-${vo.color}-50 text-${vo.color}-600`}><AlertCircle size={20} /></div>
                  <div><p className="text-sm font-bold text-gray-900">{vo.title}</p><p className="text-xs text-gray-400">{vo.value}</p></div>
                </div>
                <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase bg-${vo.color}-50 text-${vo.color}-600`}>{vo.status}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContractsView;
