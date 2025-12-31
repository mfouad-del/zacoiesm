import React, { useState } from 'react';
import { Language, Contract, Variation } from '../types';
import { TRANSLATIONS } from '../constants';
import { FileText, AlertCircle, Plus, Search, Filter, Calendar, DollarSign, Briefcase, CheckCircle, XCircle } from 'lucide-react';

interface ContractsViewProps {
  lang: Language;
  contracts: Contract[];
  variations: Variation[];
  onAddVO: () => void;
  onAddContract?: () => void;
}

const ContractsView: React.FC<ContractsViewProps> = ({ lang, contracts = [], variations = [], onAddVO, onAddContract }) => {
  const t = TRANSLATIONS[lang];
  const [activeTab, setActiveTab] = useState<'contracts' | 'variations'>('contracts');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  const totalValue = contracts.reduce((acc, c) => acc + (Number(c.value) || 0), 0);
  const totalVariationsValue = variations.reduce((acc, v) => acc + (Number(v.value) || 0), 0);

  const filteredContracts = contracts.filter(c => 
    (filterStatus === 'all' || c.status.toLowerCase() === filterStatus.toLowerCase()) &&
    (c.title.toLowerCase().includes(searchQuery.toLowerCase()) || c.vendor?.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const filteredVariations = variations.filter(v => 
    (filterStatus === 'all' || v.status.toLowerCase() === filterStatus.toLowerCase()) &&
    (v.title.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const getStatusColor = (status: string) => {
    switch(status.toLowerCase()) {
      case 'active': return 'bg-emerald-100 text-emerald-700';
      case 'completed': return 'bg-blue-100 text-blue-700';
      case 'pending': return 'bg-amber-100 text-amber-700';
      case 'terminated': return 'bg-red-100 text-red-700';
      case 'approved': return 'bg-emerald-100 text-emerald-700';
      case 'rejected': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">{t.contracts}</h1>
          <p className="text-slate-500 font-medium mt-2">{lang === 'ar' ? 'إدارة العقود والمطالبات وأوامر التغيير' : 'Manage contracts, claims, and variation orders.'}</p>
        </div>
        <div className="flex gap-3">
          {activeTab === 'contracts' && onAddContract && (
            <button onClick={onAddContract} className="flex items-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-2xl font-bold hover:bg-slate-800 transition-all active:scale-95 shadow-xl shadow-slate-900/20">
              <Plus size={20} />
              {lang === 'ar' ? 'عقد جديد' : 'New Contract'}
            </button>
          )}
          <button onClick={onAddVO} className="flex items-center gap-2 px-6 py-3 bg-brand-600 text-white rounded-2xl font-bold hover:bg-brand-700 transition-all active:scale-95 shadow-xl shadow-brand-600/20">
            <Plus size={20} />
            {lang === 'ar' ? 'أمر تغيير' : 'New Variation'}
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-[24px] border border-slate-100 shadow-sm hover:shadow-md transition-all">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl">
              <DollarSign size={24} />
            </div>
            <div>
              <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest">{t.contractValue}</p>
              <p className="text-2xl font-black text-slate-900">${totalValue.toLocaleString()}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-[24px] border border-slate-100 shadow-sm hover:shadow-md transition-all">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-purple-50 text-purple-600 rounded-2xl">
              <Briefcase size={24} />
            </div>
            <div>
              <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest">{lang === 'ar' ? 'إجمالي العقود' : 'Total Contracts'}</p>
              <p className="text-2xl font-black text-slate-900">{contracts.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-[24px] border border-slate-100 shadow-sm hover:shadow-md transition-all">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-amber-50 text-amber-600 rounded-2xl">
              <AlertCircle size={24} />
            </div>
            <div>
              <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest">{t.variationsClaims}</p>
              <p className="text-2xl font-black text-slate-900">{variations.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-[24px] border border-slate-100 shadow-sm hover:shadow-md transition-all">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl">
              <DollarSign size={24} />
            </div>
            <div>
              <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest">{lang === 'ar' ? 'قيمة التغييرات' : 'Variations Value'}</p>
              <p className="text-2xl font-black text-slate-900">${totalVariationsValue.toLocaleString()}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs & Filters */}
      <div className="bg-white p-2 rounded-[24px] border border-slate-100 shadow-sm flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="flex p-1 bg-slate-50 rounded-xl w-full md:w-auto">
          <button 
            onClick={() => setActiveTab('contracts')}
            className={`flex-1 md:flex-none px-6 py-2.5 rounded-lg text-sm font-bold transition-all ${activeTab === 'contracts' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
          >
            {lang === 'ar' ? 'العقود' : 'Contracts'}
          </button>
          <button 
            onClick={() => setActiveTab('variations')}
            className={`flex-1 md:flex-none px-6 py-2.5 rounded-lg text-sm font-bold transition-all ${activeTab === 'variations' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
          >
            {t.variationsClaims}
          </button>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto px-2">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder={lang === 'ar' ? 'بحث...' : 'Search...'}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border-none rounded-xl text-sm font-bold text-slate-700 focus:ring-2 focus:ring-brand-500/20 outline-none"
            />
          </div>
          <div className="relative">
            <select 
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="appearance-none pl-4 pr-10 py-2.5 bg-slate-50 border-none rounded-xl text-sm font-bold text-slate-700 focus:ring-2 focus:ring-brand-500/20 outline-none cursor-pointer"
            >
              <option value="all">{lang === 'ar' ? 'الكل' : 'All Status'}</option>
              <option value="active">{lang === 'ar' ? 'نشط' : 'Active'}</option>
              <option value="pending">{lang === 'ar' ? 'قيد الانتظار' : 'Pending'}</option>
              <option value="completed">{lang === 'ar' ? 'مكتمل' : 'Completed'}</option>
            </select>
            <Filter className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
          </div>
        </div>
      </div>

      {/* Content Area */}
      <div className="bg-white rounded-[32px] border border-slate-100 shadow-sm overflow-hidden min-h-[400px]">
        {activeTab === 'contracts' ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/50">
                  <th className="px-8 py-5 text-left text-[11px] font-black text-slate-400 uppercase tracking-widest">{lang === 'ar' ? 'العقد' : 'Contract'}</th>
                  <th className="px-8 py-5 text-left text-[11px] font-black text-slate-400 uppercase tracking-widest">{lang === 'ar' ? 'المورد' : 'Vendor'}</th>
                  <th className="px-8 py-5 text-left text-[11px] font-black text-slate-400 uppercase tracking-widest">{lang === 'ar' ? 'القيمة' : 'Value'}</th>
                  <th className="px-8 py-5 text-left text-[11px] font-black text-slate-400 uppercase tracking-widest">{lang === 'ar' ? 'التاريخ' : 'Date'}</th>
                  <th className="px-8 py-5 text-left text-[11px] font-black text-slate-400 uppercase tracking-widest">{t.status}</th>
                  <th className="px-8 py-5 text-left text-[11px] font-black text-slate-400 uppercase tracking-widest"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filteredContracts.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-8 py-12 text-center text-slate-400 font-medium italic">
                      {lang === 'ar' ? 'لا توجد عقود مطابقة' : 'No contracts found matching your criteria'}
                    </td>
                  </tr>
                ) : (
                  filteredContracts.map((contract) => (
                    <tr key={contract.id} className="group hover:bg-slate-50/80 transition-colors">
                      <td className="px-8 py-5">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                            <FileText size={20} />
                          </div>
                          <div>
                            <p className="font-bold text-slate-900">{contract.title}</p>
                            <p className="text-xs text-slate-400 font-medium">#{contract.id.substring(0, 8)}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-5">
                        <p className="font-bold text-slate-700">{contract.vendor || 'N/A'}</p>
                      </td>
                      <td className="px-8 py-5">
                        <p className="font-bold text-slate-900">${Number(contract.value).toLocaleString()}</p>
                      </td>
                      <td className="px-8 py-5">
                        <div className="flex items-center gap-2 text-slate-500">
                          <Calendar size={14} />
                          <span className="text-sm font-bold">{contract.startDate}</span>
                        </div>
                      </td>
                      <td className="px-8 py-5">
                        <span className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider ${getStatusColor(contract.status)}`}>
                          {contract.status}
                        </span>
                      </td>
                      <td className="px-8 py-5 text-right">
                        <button className="p-2 text-slate-300 hover:text-brand-600 hover:bg-brand-50 rounded-xl transition-all">
                          <Briefcase size={18} />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/50">
                  <th className="px-8 py-5 text-left text-[11px] font-black text-slate-400 uppercase tracking-widest">{lang === 'ar' ? 'أمر التغيير' : 'Variation Order'}</th>
                  <th className="px-8 py-5 text-left text-[11px] font-black text-slate-400 uppercase tracking-widest">{lang === 'ar' ? 'القيمة' : 'Value'}</th>
                  <th className="px-8 py-5 text-left text-[11px] font-black text-slate-400 uppercase tracking-widest">{t.status}</th>
                  <th className="px-8 py-5 text-left text-[11px] font-black text-slate-400 uppercase tracking-widest"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filteredVariations.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-8 py-12 text-center text-slate-400 font-medium italic">
                      {lang === 'ar' ? 'لا توجد أوامر تغيير' : 'No variations found'}
                    </td>
                  </tr>
                ) : (
                  filteredVariations.map((vo) => (
                    <tr key={vo.id} className="group hover:bg-slate-50/80 transition-colors">
                      <td className="px-8 py-5">
                        <div className="flex items-center gap-4">
                          <div className={`w-10 h-10 rounded-xl bg-${vo.color || 'amber'}-50 text-${vo.color || 'amber'}-600 flex items-center justify-center`}>
                            <AlertCircle size={20} />
                          </div>
                          <div>
                            <p className="font-bold text-slate-900">{vo.title}</p>
                            <p className="text-xs text-slate-400 font-medium">#{vo.id}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-5">
                        <p className="font-bold text-slate-900">${Number(vo.value).toLocaleString()}</p>
                      </td>
                      <td className="px-8 py-5">
                        <span className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider ${getStatusColor(vo.status)}`}>
                          {vo.status}
                        </span>
                      </td>
                      <td className="px-8 py-5 text-right">
                        <div className="flex justify-end gap-2">
                          <button className="p-2 text-emerald-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-xl transition-all">
                            <CheckCircle size={18} />
                          </button>
                          <button className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all">
                            <XCircle size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default ContractsView;
