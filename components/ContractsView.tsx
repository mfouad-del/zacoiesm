import React from 'react';
import { Language, Contract, Variation } from '../types';
import { TRANSLATIONS } from '../constants';
import { FileText, ArrowUpRight, Clock, AlertCircle, Plus } from 'lucide-react';

interface ContractsViewProps {
  lang: Language;
  contracts: Contract[];
  variations: Variation[];
  onAddVO: () => void;
}

const ContractsView: React.FC<ContractsViewProps> = ({ lang, contracts = [], variations = [], onAddVO }) => {
  const t = TRANSLATIONS[lang];
  
  const totalValue = contracts.reduce((acc, c) => acc + (Number(c.value) || 0), 0);

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
            <div>
                <p className="text-[10px] text-gray-400 font-bold uppercase">{t.contractValue}</p>
                <p className="text-2xl font-bold text-gray-900">${totalValue.toLocaleString()}</p>
            </div>
            <div>
                <p className="text-[10px] text-gray-400 font-bold uppercase">{t.duration}</p>
                <p className="text-2xl font-bold text-gray-900">{contracts.length} {lang === 'ar' ? 'عقود' : 'Contracts'}</p>
            </div>
          </div>
          
          <div className="space-y-4">
            <h4 className="text-xs font-bold text-gray-400 border-b pb-2 uppercase">{lang === 'ar' ? 'قائمة العقود' : 'Contracts List'}</h4>
            {contracts.length === 0 ? (
                <p className="text-sm text-gray-500 italic">{lang === 'ar' ? 'لا توجد عقود' : 'No contracts found'}</p>
            ) : (
                contracts.map((contract: any) => (
                <div key={contract.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                    <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center text-blue-600 shadow-sm"><FileText size={16} /></div>
                    <div>
                        <p className="text-sm font-bold text-gray-800">{contract.title}</p>
                        <p className="text-[10px] text-gray-400">{contract.vendor} - ${Number(contract.value).toLocaleString()}</p>
                    </div>
                    </div>
                    <span className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase ${contract.status === 'active' ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-600'}`}>
                        {contract.status}
                    </span>
                </div>
                ))
            )}
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
