import React, { useState } from 'react';
import { Language, Incident } from '../types';
import { TRANSLATIONS } from '../constants';
import { ShieldAlert, Users, HeartPulse, Activity, Clock, Search, Filter, MapPin, AlertTriangle, CheckCircle, Download, ChevronRight, Flame, HardHat } from 'lucide-react';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

interface SafetyViewProps {
  lang: Language;
  incidents: Incident[];
  onAddIncident: () => void;
}

const SafetyView: React.FC<SafetyViewProps> = ({ lang, incidents, onAddIncident }) => {
  const t = TRANSLATIONS[lang];
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredIncidents = incidents.filter(inc => 
    (filterStatus === 'all' || inc.status === filterStatus) &&
    (inc.description.toLowerCase().includes(searchQuery.toLowerCase()) || inc.id.toLowerCase().includes(searchQuery.toLowerCase()) || inc.type.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const getSeverityColor = (severity: string) => {
    switch(severity) {
      case 'Critical': return 'text-red-600 bg-red-100 border-red-200';
      case 'High': return 'text-orange-600 bg-orange-100 border-orange-200';
      case 'Medium': return 'text-amber-600 bg-amber-100 border-amber-200';
      case 'Low': return 'text-blue-600 bg-blue-100 border-blue-200';
      default: return 'text-slate-600 bg-slate-100 border-slate-200';
    }
  };

  const getTypeIcon = (type: string) => {
    switch(type) {
      case 'Injury': return <HeartPulse size={16} />;
      case 'Fire': return <Flame size={16} />;
      case 'Near Miss': return <AlertTriangle size={16} />;
      case 'Property Damage': return <HardHat size={16} />;
      default: return <ShieldAlert size={16} />;
    }
  };

  const exportIncident = (incident: Incident) => {
    const doc = new jsPDF();
    
    // Header
    doc.setFontSize(22);
    doc.setTextColor(220, 38, 38); // Red
    doc.text(lang === 'ar' ? 'تقرير حادث' : 'Incident Report', 105, 20, { align: 'center' });
    
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Incident ID: ${incident.id}`, 20, 35);
    doc.text(`${lang === 'ar' ? 'التاريخ' : 'Date'}: ${incident.date}`, 20, 40);
    doc.text(`${lang === 'ar' ? 'الحالة' : 'Status'}: ${incident.status.toUpperCase()}`, 150, 35);

    // Details Table
    // @ts-expect-error: jspdf-autotable types are missing
    doc.autoTable({
      startY: 50,
      head: [[lang === 'ar' ? 'التفاصيل' : 'Details', '']],
      body: [
        [lang === 'ar' ? 'النوع' : 'Type', incident.type],
        [lang === 'ar' ? 'الموقع' : 'Location', incident.location],
        [lang === 'ar' ? 'الخطورة' : 'Severity', incident.severity.toUpperCase()],
        [lang === 'ar' ? 'الأشخاص المعنيين' : 'Involved Persons', incident.involvedPersons || '-'],
        [lang === 'ar' ? 'الشهود' : 'Witnesses', incident.witnesses || '-']
      ],
      theme: 'grid',
      headStyles: { fillColor: [44, 62, 80] },
      columnStyles: { 0: { fontStyle: 'bold', width: 50 } }
    });

    // Description & Analysis
    // @ts-expect-error: jspdf-autotable types are missing
    doc.autoTable({
      startY: doc.lastAutoTable.finalY + 10,
      head: [[lang === 'ar' ? 'الوصف والتحليل' : 'Description & Analysis']],
      body: [
        [`${lang === 'ar' ? 'الوصف' : 'Description'}:\n${incident.description}`],
        [`${lang === 'ar' ? 'السبب الجذري' : 'Root Cause'}:\n${incident.rootCause || '-'}`],
        [`${lang === 'ar' ? 'الإجراء الفوري' : 'Immediate Action'}:\n${incident.immediateAction || '-'}`],
        [`${lang === 'ar' ? 'الإجراء التصحيحي' : 'Corrective Action'}:\n${incident.correctiveAction || '-'}`]
      ],
      theme: 'grid',
      headStyles: { fillColor: [192, 57, 43] }
    });

    doc.save(`Incident-${incident.id}.pdf`);
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">{t.safety}</h1>
          <p className="text-slate-500 font-medium text-sm mt-1">
            {lang === 'ar' ? 'إدارة الصحة والسلامة والبيئة (HSE) وتقارير الحوادث' : 'Health, Safety & Environment (HSE) Management'}
          </p>
        </div>
        <button onClick={onAddIncident} className="flex items-center gap-2 px-6 py-3 bg-red-600 text-white rounded-2xl text-sm font-bold hover:bg-red-700 transition-all active:scale-95 shadow-lg shadow-red-500/25">
          <ShieldAlert size={18} />
          {lang === 'ar' ? 'إبلاغ عن حادث جديد' : 'Report New Incident'}
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-emerald-600 p-5 rounded-[24px] shadow-lg shadow-emerald-500/20 text-white relative overflow-hidden group">
          <div className="absolute -right-6 -top-6 w-24 h-24 bg-white/10 rounded-full group-hover:scale-150 transition-transform duration-500"></div>
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
                <HeartPulse size={20} />
              </div>
              <span className="text-xs font-bold uppercase tracking-widest opacity-80">{t.safeWorkingDays}</span>
            </div>
            <p className="text-4xl font-black">452</p>
            <p className="text-xs font-medium opacity-70 mt-1">{lang === 'ar' ? 'يوم بدون حوادث مضيعة للوقت' : 'Days without LTI'}</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-[24px] border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-red-50 text-red-600 rounded-xl">
            <Activity size={24} />
          </div>
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{lang === 'ar' ? 'إجمالي الحوادث' : 'Total Incidents'}</p>
            <p className="text-2xl font-black text-slate-900">{incidents.length}</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-[24px] border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
            <Search size={24} />
          </div>
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{lang === 'ar' ? 'قيد التحقيق' : 'Investigating'}</p>
            <p className="text-2xl font-black text-slate-900">{incidents.filter(i => i.status === 'Investigating').length}</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-[24px] border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
            <Users size={24} />
          </div>
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{lang === 'ar' ? 'اجتماعات السلامة' : 'Toolbox Talks'}</p>
            <p className="text-2xl font-black text-slate-900">28</p>
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
                placeholder={lang === 'ar' ? 'بحث في الحوادث...' : 'Search incidents...'}
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
                <option value="Open">{lang === 'ar' ? 'مفتوح' : 'Open'}</option>
                <option value="Investigating">{lang === 'ar' ? 'قيد التحقيق' : 'Investigating'}</option>
                <option value="Closed">{lang === 'ar' ? 'مغلق' : 'Closed'}</option>
              </select>
              <Filter className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
            </div>
          </div>

          <div className="bg-white rounded-[32px] border border-slate-100 shadow-sm overflow-hidden h-[600px] flex flex-col">
            <div className="p-6 border-b border-slate-100 bg-slate-50/50">
               <h3 className="font-bold text-lg text-slate-900">{lang === 'ar' ? 'سجل الحوادث' : 'Incident Log'}</h3>
            </div>
            <div className="overflow-y-auto p-4 space-y-3 custom-scrollbar flex-1">
              {filteredIncidents.map(inc => (
                <div 
                  key={inc.id}
                  onClick={() => setSelectedIncident(inc)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer group relative
                    ${selectedIncident?.id === inc.id 
                      ? 'bg-slate-900 border-slate-900 text-white shadow-lg' 
                      : 'bg-white border-slate-100 hover:border-red-200 hover:bg-red-50/30'}`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-lg border flex items-center gap-1
                      ${selectedIncident?.id === inc.id ? 'bg-white/10 border-white/10 text-white' : getSeverityColor(inc.severity)}`}>
                      {getTypeIcon(inc.type)}
                      {inc.type}
                    </span>
                    <span className={`text-[10px] font-bold ${selectedIncident?.id === inc.id ? 'text-slate-400' : 'text-slate-400'}`}>
                      {inc.date}
                    </span>
                  </div>
                  <h4 className={`font-bold text-sm mb-1 line-clamp-1 ${selectedIncident?.id === inc.id ? 'text-white' : 'text-slate-800'}`}>{inc.description}</h4>
                  <p className={`text-xs truncate ${selectedIncident?.id === inc.id ? 'text-slate-400' : 'text-slate-500'}`}>{inc.id}</p>
                  
                  <div className="flex items-center justify-between mt-3 pt-3 border-t border-dashed border-slate-200/20">
                    <span className={`text-[10px] font-bold uppercase tracking-widest flex items-center gap-1
                      ${inc.status === 'Closed' ? 'text-emerald-500' : 'text-amber-500'}`}>
                      {inc.status === 'Closed' ? <CheckCircle size={12}/> : <Clock size={12}/>}
                      {inc.status}
                    </span>
                    <ChevronRight size={16} className={`transition-transform ${selectedIncident?.id === inc.id ? 'text-white' : 'text-slate-300'}`} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Detail View */}
        <div className="lg:col-span-7">
          {selectedIncident ? (
            <div className="bg-white rounded-[32px] border border-slate-100 shadow-sm overflow-hidden animate-in fade-in slide-in-from-right-4 duration-500">
              {/* Detail Header */}
              <div className="p-8 border-b border-slate-100 bg-slate-50/50 flex justify-between items-start">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <span className="px-3 py-1 bg-slate-200 text-slate-600 rounded-lg text-[10px] font-black uppercase tracking-widest">{selectedIncident.id}</span>
                    <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border ${getSeverityColor(selectedIncident.severity)}`}>
                      {selectedIncident.severity} Severity
                    </span>
                  </div>
                  <h2 className="text-xl font-black text-slate-900 leading-tight">{selectedIncident.type}</h2>
                </div>
                <div className="flex gap-2">
                  <button 
                    onClick={() => exportIncident(selectedIncident)}
                    className="p-3 bg-white border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50 transition-all"
                    title={lang === 'ar' ? 'تصدير PDF' : 'Export PDF'}
                  >
                    <Download size={20} />
                  </button>
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
                    <p className="font-bold text-slate-800">{selectedIncident.location}</p>
                  </div>
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                    <div className="flex items-center gap-2 text-slate-400 mb-1">
                      <Users size={14} />
                      <span className="text-[10px] font-black uppercase tracking-widest">{lang === 'ar' ? 'الأشخاص المعنيين' : 'Involved Persons'}</span>
                    </div>
                    <p className="font-bold text-slate-800">{selectedIncident.involvedPersons || 'N/A'}</p>
                  </div>
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                    <div className="flex items-center gap-2 text-slate-400 mb-1">
                      <Clock size={14} />
                      <span className="text-[10px] font-black uppercase tracking-widest">{lang === 'ar' ? 'وقت الضائع' : 'Lost Time'}</span>
                    </div>
                    <p className="font-bold text-red-600">{selectedIncident.lostTimeHours || 0} Hours</p>
                  </div>
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                    <div className="flex items-center gap-2 text-slate-400 mb-1">
                      <Activity size={14} />
                      <span className="text-[10px] font-black uppercase tracking-widest">{lang === 'ar' ? 'الحالة' : 'Status'}</span>
                    </div>
                    <p className={`font-bold ${selectedIncident.status === 'Closed' ? 'text-emerald-600' : 'text-amber-600'}`}>{selectedIncident.status}</p>
                  </div>
                </div>

                {/* Description */}
                <div>
                  <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">{lang === 'ar' ? 'وصف الحادث' : 'Incident Description'}</h4>
                  <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 text-slate-700 leading-relaxed font-medium">
                    {selectedIncident.description}
                  </div>
                </div>

                {/* Analysis Section */}
                <div className="space-y-4">
                  <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">{lang === 'ar' ? 'التحليل والإجراءات' : 'Analysis & Actions'}</h4>
                  
                  <div className="bg-red-50 p-5 rounded-2xl border border-red-100">
                    <h5 className="text-xs font-bold text-red-400 uppercase mb-2">{lang === 'ar' ? 'السبب الجذري' : 'Root Cause'}</h5>
                    <p className="text-slate-800 font-medium">{selectedIncident.rootCause || 'Pending Investigation'}</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-amber-50 p-5 rounded-2xl border border-amber-100">
                      <h5 className="text-xs font-bold text-amber-400 uppercase mb-2">{lang === 'ar' ? 'الإجراء الفوري' : 'Immediate Action'}</h5>
                      <p className="text-slate-800 font-medium">{selectedIncident.immediateAction || 'N/A'}</p>
                    </div>
                    <div className="bg-blue-50 p-5 rounded-2xl border border-blue-100">
                      <h5 className="text-xs font-bold text-blue-400 uppercase mb-2">{lang === 'ar' ? 'الإجراء التصحيحي' : 'Corrective Action'}</h5>
                      <p className="text-slate-800 font-medium">{selectedIncident.correctiveAction || 'Pending'}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center p-10 bg-slate-50 rounded-[32px] border-2 border-dashed border-slate-200 min-h-[600px]">
              <div className="w-24 h-24 bg-white rounded-full shadow-sm flex items-center justify-center mb-6">
                <ShieldAlert size={40} className="text-slate-300" />
              </div>
              <h3 className="text-xl font-black text-slate-900 mb-2">{lang === 'ar' ? 'اختر حادثاً للعرض' : 'Select an Incident'}</h3>
              <p className="text-slate-400 font-medium max-w-xs mx-auto">
                {lang === 'ar' ? 'اختر حادثاً من القائمة لعرض التفاصيل الكاملة والتحليل' : 'Select an incident from the list to view full details and analysis'}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SafetyView;
