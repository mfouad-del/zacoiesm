import React, { useState } from 'react';
import { Language, Report } from '../types';
import { TRANSLATIONS } from '../constants';
import { Plus, Sun, Users, Truck, MessageSquare, Clock, MapPin, AlertTriangle, CheckCircle, Download, Calendar } from 'lucide-react';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

interface SiteManagementViewProps {
  lang: Language;
  reports: Report[];
  onAddReport: () => void;
}

const SiteManagementView: React.FC<SiteManagementViewProps> = ({ lang, reports, onAddReport }) => {
  const t = TRANSLATIONS[lang];
  const [selectedReport, setSelectedReport] = useState<Report | null>(reports[0] || null);

  const exportReport = (report: Report) => {
    const doc = new jsPDF();
    
    // Header
    doc.setFontSize(22);
    doc.setTextColor(41, 128, 185);
    doc.text(lang === 'ar' ? 'تقرير الموقع اليومي' : 'Daily Site Report', 105, 20, { align: 'center' });
    
    doc.setFontSize(12);
    doc.setTextColor(100);
    doc.text(`${lang === 'ar' ? 'التاريخ' : 'Date'}: ${report.date}`, 20, 40);
    doc.text(`${lang === 'ar' ? 'المشروع' : 'Project'}: ${report.projectId}`, 20, 50);

    // Weather Section
    // @ts-expect-error: jspdf-autotable types are missing
    doc.autoTable({
      startY: 60,
      head: [[lang === 'ar' ? 'الطقس' : 'Weather Conditions']],
      body: [[
        `${lang === 'ar' ? 'الحرارة' : 'Temp'}: ${report.weather?.temp || '-'}°C | ${report.weather?.condition || '-'}`
      ]],
      theme: 'striped',
      headStyles: { fillColor: [52, 73, 94] }
    });

    // Resources
    // @ts-expect-error: jspdf-autotable types are missing
    doc.autoTable({
      // @ts-expect-error: jspdf-autotable types are missing
      startY: doc.lastAutoTable.finalY + 10,
      head: [[lang === 'ar' ? 'الموارد' : 'Resources', lang === 'ar' ? 'العدد' : 'Count']],
      body: [
        [lang === 'ar' ? 'العمالة' : 'Manpower', report.laborCount],
        [lang === 'ar' ? 'المعدات' : 'Equipment', report.equipmentCount]
      ],
      theme: 'grid'
    });

    // Activities
    // @ts-expect-error: jspdf-autotable types are missing
    doc.autoTable({
      // @ts-expect-error: jspdf-autotable types are missing
      startY: doc.lastAutoTable.finalY + 10,
      head: [[lang === 'ar' ? 'الأنشطة المنجزة' : 'Completed Activities']],
      body: [[report.activities]],
      theme: 'grid',
      headStyles: { fillColor: [39, 174, 96] }
    });

    // Safety
    if (report.safetyObservations && report.safetyObservations.length > 0) {
      // @ts-expect-error: jspdf-autotable types are missing
      doc.autoTable({
        // @ts-expect-error: jspdf-autotable types are missing
        startY: doc.lastAutoTable.finalY + 10,
        head: [[lang === 'ar' ? 'ملاحظات السلامة' : 'Safety Observations']],
        body: report.safetyObservations.map(obs => [obs]),
        theme: 'grid',
        headStyles: { fillColor: [192, 57, 43] }
      });
    }

    doc.save(`site-report-${report.date}.pdf`);
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
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

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Report List */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm h-[calc(100vh-200px)] flex flex-col">
            <div className="flex items-center justify-between mb-6">
               <h3 className="font-bold text-lg text-slate-900">{lang === 'ar' ? 'سجل التقارير' : 'Report Log'}</h3>
               <span className="px-3 py-1 bg-slate-100 rounded-full text-xs font-bold text-slate-500">{reports.length}</span>
            </div>
            
            <div className="space-y-3 overflow-y-auto pr-2 custom-scrollbar flex-1">
              {reports.length === 0 ? (
                <div className="py-10 text-center">
                  <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-3 text-slate-300">
                    <MessageSquare size={24} />
                  </div>
                  <p className="text-slate-400 font-bold text-xs">{lang === 'ar' ? 'لا توجد تقارير' : 'No reports'}</p>
                </div>
              ) : (
                reports.map((rep) => (
                  <div 
                    key={rep.id} 
                    onClick={() => setSelectedReport(rep)}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer group relative overflow-hidden
                      ${selectedReport?.id === rep.id 
                        ? 'bg-brand-600 border-brand-600 text-white shadow-lg shadow-brand-500/30' 
                        : 'bg-white border-slate-100 hover:border-brand-200 hover:bg-slate-50'}`}
                  >
                    <div className="flex justify-between items-start mb-2">
                       <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-lg ${selectedReport?.id === rep.id ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'}`}>
                         {rep.projectId || 'PRJ-001'}
                       </span>
                       <span className={`text-[10px] font-bold flex items-center gap-1 ${selectedReport?.id === rep.id ? 'text-brand-100' : 'text-slate-400'}`}>
                         <Calendar size={12}/> {rep.date}
                       </span>
                    </div>
                    <p className={`text-sm font-bold line-clamp-2 ${selectedReport?.id === rep.id ? 'text-white' : 'text-slate-700'}`}>
                      {rep.activities}
                    </p>
                    {selectedReport?.id === rep.id && (
                      <div className="absolute right-0 top-0 bottom-0 w-1 bg-white/20"></div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Detailed View */}
        <div className="lg:col-span-8 space-y-6">
          {selectedReport ? (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
              {/* Weather & Stats Card */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-gradient-to-br from-slate-800 to-slate-900 p-6 rounded-[24px] text-white relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-4 opacity-10">
                    <Sun size={80} />
                  </div>
                  <div className="relative z-10">
                    <div className="flex items-center gap-2 text-slate-400 mb-4">
                      <MapPin size={14} />
                      <span className="text-[10px] font-black uppercase tracking-widest">Site Location</span>
                    </div>
                    <div className="flex items-end gap-4">
                      <span className="text-4xl font-black">{selectedReport.weather?.temp || 32}°</span>
                      <div className="mb-1">
                        <p className="text-sm font-bold text-brand-400">{selectedReport.weather?.condition || 'Sunny'}</p>
                        <p className="text-[10px] text-slate-400">Humidity: 45%</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-[24px] border border-slate-100 shadow-sm flex flex-col justify-center">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
                      <Users size={20} />
                    </div>
                    <span className="text-xs font-black text-slate-400 uppercase tracking-widest">{t.totalLabor}</span>
                  </div>
                  <span className="text-3xl font-black text-slate-900">{selectedReport.laborCount}</span>
                  <span className="text-[10px] text-slate-400 font-bold mt-1">{lang === 'ar' ? 'عامل في الموقع' : 'Workers on site'}</span>
                </div>

                <div className="bg-white p-6 rounded-[24px] border border-slate-100 shadow-sm flex flex-col justify-center">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-amber-50 text-amber-600 rounded-xl">
                      <Truck size={20} />
                    </div>
                    <span className="text-xs font-black text-slate-400 uppercase tracking-widest">{t.equipment}</span>
                  </div>
                  <span className="text-3xl font-black text-slate-900">{selectedReport.equipmentCount}</span>
                  <span className="text-[10px] text-slate-400 font-bold mt-1">{lang === 'ar' ? 'وحدة نشطة' : 'Active units'}</span>
                </div>
              </div>

              {/* Main Report Content */}
              <div className="bg-white rounded-[32px] border border-slate-100 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                  <h3 className="font-bold text-lg text-slate-900 flex items-center gap-2">
                    <MessageSquare size={20} className="text-brand-500" />
                    {lang === 'ar' ? 'تفاصيل التقرير' : 'Report Details'}
                  </h3>
                  <button 
                    onClick={() => exportReport(selectedReport)}
                    className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-xl text-xs font-bold hover:bg-slate-50 transition-all"
                  >
                    <Download size={14} />
                    {lang === 'ar' ? 'تصدير PDF' : 'Export PDF'}
                  </button>
                </div>
                
                <div className="p-8 space-y-8">
                  <div>
                    <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">{t.ongoingActivities}</h4>
                    <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 text-slate-700 leading-relaxed font-medium">
                      {selectedReport.activities}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div>
                      <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                        <AlertTriangle size={14} className="text-amber-500" />
                        {lang === 'ar' ? 'ملاحظات السلامة' : 'Safety Observations'}
                      </h4>
                      {selectedReport.safetyObservations && selectedReport.safetyObservations.length > 0 ? (
                        <ul className="space-y-3">
                          {selectedReport.safetyObservations.map((obs, idx) => (
                            <li key={idx} className="flex items-start gap-3 bg-amber-50 p-3 rounded-xl border border-amber-100">
                              <div className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-2 shrink-0"></div>
                              <span className="text-sm font-bold text-slate-700">{obs}</span>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <div className="flex items-center gap-2 text-slate-400 bg-slate-50 p-4 rounded-xl border border-slate-100 border-dashed">
                          <CheckCircle size={16} className="text-emerald-500" />
                          <span className="text-xs font-bold">{lang === 'ar' ? 'لا توجد ملاحظات سلامة' : 'No safety issues reported'}</span>
                        </div>
                      )}
                    </div>

                    <div>
                      <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                        <Clock size={14} className="text-red-500" />
                        {lang === 'ar' ? 'التأخيرات والمعوقات' : 'Delays & Issues'}
                      </h4>
                      {selectedReport.delays && selectedReport.delays.length > 0 ? (
                        <ul className="space-y-3">
                          {selectedReport.delays.map((delay, idx) => (
                            <li key={idx} className="flex items-start gap-3 bg-red-50 p-3 rounded-xl border border-red-100">
                              <div className="w-1.5 h-1.5 rounded-full bg-red-500 mt-2 shrink-0"></div>
                              <span className="text-sm font-bold text-slate-700">{delay}</span>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <div className="flex items-center gap-2 text-slate-400 bg-slate-50 p-4 rounded-xl border border-slate-100 border-dashed">
                          <CheckCircle size={16} className="text-emerald-500" />
                          <span className="text-xs font-bold">{lang === 'ar' ? 'لا توجد تأخيرات' : 'No delays reported'}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center p-10 bg-slate-50 rounded-[32px] border-2 border-dashed border-slate-200">
              <div className="w-24 h-24 bg-white rounded-full shadow-sm flex items-center justify-center mb-6">
                <MessageSquare size={40} className="text-slate-300" />
              </div>
              <h3 className="text-xl font-black text-slate-900 mb-2">{lang === 'ar' ? 'اختر تقريراً للعرض' : 'Select a Report'}</h3>
              <p className="text-slate-400 font-medium max-w-xs mx-auto">
                {lang === 'ar' ? 'اختر تقريراً من القائمة الجانبية لعرض التفاصيل الكاملة' : 'Choose a report from the sidebar to view full details and analytics'}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SiteManagementView;
