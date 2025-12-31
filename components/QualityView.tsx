import React, { useState } from 'react';
import { Language, NCR } from '../types';
import { TRANSLATIONS } from '../constants';
import { AlertTriangle, CheckCircle, Search, Filter, FileText, Calendar, User, MapPin, Download, ChevronRight, AlertCircle } from 'lucide-react';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

interface QualityViewProps {
  lang: Language;
  ncrs: NCR[];
  onAddNCR: () => void;
  onUpdateStatus: (id: string, status: string) => void;
}

const QualityView: React.FC<QualityViewProps> = ({ lang, ncrs, onAddNCR, onUpdateStatus }) => {
  const t = TRANSLATIONS[lang];
  const [selectedNCR, setSelectedNCR] = useState<NCR | null>(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredNCRs = ncrs.filter(ncr => 
    (filterStatus === 'all' || ncr.status === filterStatus) &&
    (ncr.title.toLowerCase().includes(searchQuery.toLowerCase()) || ncr.id.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const getSeverityColor = (severity: string) => {
    switch(severity) {
      case 'high': return 'text-red-500 bg-red-50 border-red-100';
      case 'medium': return 'text-amber-500 bg-amber-50 border-amber-100';
      case 'low': return 'text-blue-500 bg-blue-50 border-blue-100';
      default: return 'text-slate-500 bg-slate-50 border-slate-100';
    }
  };

  const exportNCR = (ncr: NCR) => {
    const doc = new jsPDF();
    
    // Header
    doc.setFontSize(22);
    doc.setTextColor(220, 38, 38); // Red color for NCR
    doc.text(lang === 'ar' ? 'تقرير عدم مطابقة' : 'Non-Conformance Report (NCR)', 105, 20, { align: 'center' });
    
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`NCR ID: ${ncr.id}`, 20, 35);
    doc.text(`${lang === 'ar' ? 'التاريخ' : 'Date'}: ${ncr.date}`, 20, 40);
    doc.text(`${lang === 'ar' ? 'الحالة' : 'Status'}: ${ncr.status.toUpperCase()}`, 150, 35);

    // Details Table
    // @ts-ignore
    doc.autoTable({
      startY: 50,
      head: [[lang === 'ar' ? 'التفاصيل' : 'Details', '']],
      body: [
        [lang === 'ar' ? 'العنوان' : 'Title', ncr.title],
        [lang === 'ar' ? 'الموقع' : 'Location', ncr.location || '-'],
        [lang === 'ar' ? 'الخطورة' : 'Severity', ncr.severity.toUpperCase()],
        [lang === 'ar' ? 'المفتش' : 'Inspector', ncr.inspector || '-'],
        [lang === 'ar' ? 'تاريخ الاستحقاق' : 'Due Date', ncr.dueDate || '-']
      ],
      theme: 'grid',
      headStyles: { fillColor: [52, 73, 94] },
      columnStyles: { 0: { fontStyle: 'bold', width: 40 } }
    });

    // Description & Analysis
    // @ts-ignore
    doc.autoTable({
      startY: doc.lastAutoTable.finalY + 10,
      head: [[lang === 'ar' ? 'الوصف والتحليل' : 'Description & Analysis']],
      body: [
        [`${lang === 'ar' ? 'الوصف' : 'Description'}:\n${ncr.description || '-'}`],
        [`${lang === 'ar' ? 'السبب الجذري' : 'Root Cause'}:\n${ncr.rootCause || '-'}`],
        [`${lang === 'ar' ? 'الإجراء التصحيحي' : 'Corrective Action'}:\n${ncr.correctiveAction || '-'}`]
      ],
      theme: 'grid',
      headStyles: { fillColor: [192, 57, 43] } // Red header
    });

    doc.save(`NCR-${ncr.id}.pdf`);
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">{t.quality}</h1>
          <p className="text-slate-500 font-medium text-sm mt-1">
            {lang === 'ar' ? 'إدارة الجودة وتقارير عدم المطابقة (NCR)' : 'Quality Control & Non-Conformance Reports'}
          </p>
        </div>
        <button onClick={onAddNCR} className="flex items-center gap-2 px-6 py-3 bg-brand-600 text-white rounded-2xl text-sm font-bold hover:bg-brand-700 transition-all active:scale-95 shadow-lg shadow-brand-500/25">
          <AlertCircle size={18} />
          {lang === 'ar' ? 'تقرير عدم مطابقة جديد' : 'New NCR'}
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-[24px] border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-red-50 text-red-600 rounded-xl">
            <AlertTriangle size={24} />
          </div>
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{lang === 'ar' ? 'مفتوحة' : 'Open NCRs'}</p>
            <p className="text-2xl font-black text-slate-900">{ncrs.filter(n => n.status === 'open').length}</p>
          </div>
        </div>
        <div className="bg-white p-5 rounded-[24px] border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
            <CheckCircle size={24} />
          </div>
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{lang === 'ar' ? 'مغلقة' : 'Closed NCRs'}</p>
            <p className="text-2xl font-black text-slate-900">{ncrs.filter(n => n.status === 'closed').length}</p>
          </div>
        </div>
        <div className="bg-white p-5 rounded-[24px] border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
            <AlertCircle size={24} />
          </div>
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{lang === 'ar' ? 'عالية الخطورة' : 'High Severity'}</p>
            <p className="text-2xl font-black text-slate-900">{ncrs.filter(n => n.severity === 'high').length}</p>
          </div>
        </div>
        <div className="bg-white p-5 rounded-[24px] border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
            <FileText size={24} />
          </div>
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{lang === 'ar' ? 'إجمالي التقارير' : 'Total Reports'}</p>
            <p className="text-2xl font-black text-slate-900">{ncrs.length}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* List View */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white p-2 rounded-[24px] border border-slate-100 shadow-sm flex items-center gap-2 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                type="text" 
                placeholder={lang === 'ar' ? 'بحث...' : 'Search NCRs...'}
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
                <option value="all">{lang === 'ar' ? 'الكل' : 'All'}</option>
                <option value="open">{lang === 'ar' ? 'مفتوح' : 'Open'}</option>
                <option value="closed">{lang === 'ar' ? 'مغلق' : 'Closed'}</option>
              </select>
              <Filter className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
            </div>
          </div>

          <div className="bg-white rounded-[32px] border border-slate-100 shadow-sm overflow-hidden h-[600px] flex flex-col">
            <div className="p-6 border-b border-slate-100 bg-slate-50/50">
               <h3 className="font-bold text-lg text-slate-900">{lang === 'ar' ? 'قائمة التقارير' : 'NCR List'}</h3>
            </div>
            <div className="overflow-y-auto p-4 space-y-3 custom-scrollbar flex-1">
              {filteredNCRs.map(ncr => (
                <div 
                  key={ncr.id}
                  onClick={() => setSelectedNCR(ncr)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer group relative
                    ${selectedNCR?.id === ncr.id 
                      ? 'bg-slate-900 border-slate-900 text-white shadow-lg' 
                      : 'bg-white border-slate-100 hover:border-brand-200 hover:bg-slate-50'}`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-lg border
                      ${selectedNCR?.id === ncr.id ? 'bg-white/10 border-white/10 text-white' : getSeverityColor(ncr.severity)}`}>
                      {ncr.severity}
                    </span>
                    <span className={`text-[10px] font-bold ${selectedNCR?.id === ncr.id ? 'text-slate-400' : 'text-slate-400'}`}>
                      {ncr.date}
                    </span>
                  </div>
                  <h4 className={`font-bold text-sm mb-1 ${selectedNCR?.id === ncr.id ? 'text-white' : 'text-slate-800'}`}>{ncr.title}</h4>
                  <p className={`text-xs truncate ${selectedNCR?.id === ncr.id ? 'text-slate-400' : 'text-slate-500'}`}>{ncr.id}</p>
                  
                  <div className="flex items-center justify-between mt-3 pt-3 border-t border-dashed border-slate-200/20">
                    <span className={`text-[10px] font-bold uppercase tracking-widest flex items-center gap-1
                      ${ncr.status === 'open' ? 'text-red-500' : 'text-emerald-500'}`}>
                      {ncr.status === 'open' ? <AlertCircle size={12}/> : <CheckCircle size={12}/>}
                      {ncr.status}
                    </span>
                    <ChevronRight size={16} className={`transition-transform ${selectedNCR?.id === ncr.id ? 'text-white' : 'text-slate-300'}`} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Detail View */}
        <div className="lg:col-span-7">
          {selectedNCR ? (
            <div className="bg-white rounded-[32px] border border-slate-100 shadow-sm overflow-hidden animate-in fade-in slide-in-from-right-4 duration-500">
              {/* Detail Header */}
              <div className="p-8 border-b border-slate-100 bg-slate-50/50 flex justify-between items-start">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <span className="px-3 py-1 bg-slate-200 text-slate-600 rounded-lg text-[10px] font-black uppercase tracking-widest">{selectedNCR.id}</span>
                    <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border ${getSeverityColor(selectedNCR.severity)}`}>
                      {selectedNCR.severity} Severity
                    </span>
                  </div>
                  <h2 className="text-2xl font-black text-slate-900 leading-tight">{selectedNCR.title}</h2>
                </div>
                <div className="flex gap-2">
                  <button 
                    onClick={() => exportNCR(selectedNCR)}
                    className="p-3 bg-white border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50 transition-all"
                    title={lang === 'ar' ? 'تصدير PDF' : 'Export PDF'}
                  >
                    <Download size={20} />
                  </button>
                  {selectedNCR.status === 'open' && (
                    <button 
                      onClick={() => onUpdateStatus(selectedNCR.id, 'closed')}
                      className="flex items-center gap-2 px-4 py-3 bg-emerald-500 text-white rounded-xl text-sm font-bold hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-500/20"
                    >
                      <CheckCircle size={18} />
                      {lang === 'ar' ? 'إغلاق التقرير' : 'Close NCR'}
                    </button>
                  )}
                </div>
              </div>

              <div className="p-8 space-y-8">
                {/* Info Grid */}
                <div className="grid grid-cols-2 gap-6">
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                    <div className="flex items-center gap-2 text-slate-400 mb-1">
                      <MapPin size={14} />
                      <span className="text-[10px] font-black uppercase tracking-widest">{lang === 'ar' ? 'الموقع' : 'Location'}</span>
                    </div>
                    <p className="font-bold text-slate-800">{selectedNCR.location || 'N/A'}</p>
                  </div>
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                    <div className="flex items-center gap-2 text-slate-400 mb-1">
                      <User size={14} />
                      <span className="text-[10px] font-black uppercase tracking-widest">{lang === 'ar' ? 'المفتش' : 'Inspector'}</span>
                    </div>
                    <p className="font-bold text-slate-800">{selectedNCR.inspector || 'N/A'}</p>
                  </div>
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                    <div className="flex items-center gap-2 text-slate-400 mb-1">
                      <Calendar size={14} />
                      <span className="text-[10px] font-black uppercase tracking-widest">{lang === 'ar' ? 'تاريخ الإصدار' : 'Issued Date'}</span>
                    </div>
                    <p className="font-bold text-slate-800">{selectedNCR.date}</p>
                  </div>
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                    <div className="flex items-center gap-2 text-slate-400 mb-1">
                      <Calendar size={14} />
                      <span className="text-[10px] font-black uppercase tracking-widest">{lang === 'ar' ? 'تاريخ الاستحقاق' : 'Due Date'}</span>
                    </div>
                    <p className="font-bold text-red-600">{selectedNCR.dueDate || 'N/A'}</p>
                  </div>
                </div>

                {/* Description */}
                <div>
                  <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">{lang === 'ar' ? 'الوصف' : 'Description'}</h4>
                  <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 text-slate-700 leading-relaxed font-medium">
                    {selectedNCR.description || lang === 'ar' ? 'لا يوجد وصف متاح.' : 'No description available.'}
                  </div>
                </div>

                {/* Analysis Section */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">{lang === 'ar' ? 'السبب الجذري' : 'Root Cause'}</h4>
                    <div className="bg-amber-50 p-6 rounded-2xl border border-amber-100 text-slate-700 leading-relaxed font-medium">
                      {selectedNCR.rootCause || 'Pending Analysis'}
                    </div>
                  </div>
                  <div>
                    <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">{lang === 'ar' ? 'الإجراء التصحيحي' : 'Corrective Action'}</h4>
                    <div className="bg-blue-50 p-6 rounded-2xl border border-blue-100 text-slate-700 leading-relaxed font-medium">
                      {selectedNCR.correctiveAction || 'Pending Action'}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center p-10 bg-slate-50 rounded-[32px] border-2 border-dashed border-slate-200 min-h-[600px]">
              <div className="w-24 h-24 bg-white rounded-full shadow-sm flex items-center justify-center mb-6">
                <AlertTriangle size={40} className="text-slate-300" />
              </div>
              <h3 className="text-xl font-black text-slate-900 mb-2">{lang === 'ar' ? 'اختر تقريراً للعرض' : 'Select an NCR'}</h3>
              <p className="text-slate-400 font-medium max-w-xs mx-auto">
                {lang === 'ar' ? 'اختر تقرير عدم مطابقة من القائمة لعرض التفاصيل الكاملة والتحليل' : 'Select a Non-Conformance Report from the list to view full details and analysis'}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default QualityView;
