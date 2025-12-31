import React, { useState, useMemo } from 'react';
import { Language, PlanningTask } from '../types';
import { TRANSLATIONS } from '../constants';
import { GanttChartSquare, Download, Plus, LayoutList, Filter, Search, Clock, AlertCircle, CheckCircle, User } from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface PlanningViewProps {
  lang: Language;
  activities: PlanningTask[];
  onAddActivity: () => void;
}

const PlanningView: React.FC<PlanningViewProps> = ({ lang, activities, onAddActivity }) => {
  const t = TRANSLATIONS[lang];
  const [viewMode, setViewMode] = useState<'gantt' | 'list'>('gantt');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  // Calculate timeline range
  const timeline = useMemo(() => {
    if (activities.length === 0) return { start: new Date(), end: new Date(), days: 30 };
    
    const dates = activities.flatMap(a => [new Date(a.startDate).getTime(), new Date(a.endDate).getTime()]);
    const minDate = new Date(Math.min(...dates));
    const maxDate = new Date(Math.max(...dates));
    
    // Add buffer
    minDate.setDate(minDate.getDate() - 5);
    maxDate.setDate(maxDate.getDate() + 5);
    
    const days = Math.ceil((maxDate.getTime() - minDate.getTime()) / (1000 * 60 * 60 * 24));
    
    return { start: minDate, end: maxDate, days };
  }, [activities]);

  const filteredActivities = activities.filter(a => 
    (filterStatus === 'all' || a.status === filterStatus) &&
    (a.name.toLowerCase().includes(searchQuery.toLowerCase()) || a.assignee?.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'completed': return 'bg-emerald-500';
      case 'in_progress': return 'bg-blue-500';
      case 'delayed': return 'bg-red-500';
      default: return 'bg-slate-400';
    }
  };

  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'completed': return 'bg-emerald-100 text-emerald-700';
      case 'in_progress': return 'bg-blue-100 text-blue-700';
      case 'delayed': return 'bg-red-100 text-red-700';
      default: return 'bg-slate-100 text-slate-700';
    }
  };

  const exportSchedule = () => {
    const doc = new jsPDF();
    
    // Add Title
    doc.setFontSize(20);
    doc.text(lang === 'ar' ? 'الجدول الزمني للمشروع' : 'Project Master Schedule', 105, 20, { align: 'center' });
    
    // Add Date
    doc.setFontSize(10);
    doc.text(new Date().toLocaleDateString(), 105, 30, { align: 'center' });

    // Table Data
    const tableData = filteredActivities.map(a => [
      a.name,
      a.startDate,
      a.endDate,
      `${a.progress}%`,
      a.status,
      a.assignee || '-'
    ]);

    autoTable(doc, {
      startY: 40,
      head: [[
        lang === 'ar' ? 'المهمة' : 'Task',
        lang === 'ar' ? 'البداية' : 'Start',
        lang === 'ar' ? 'النهاية' : 'End',
        lang === 'ar' ? 'الإنجاز' : 'Progress',
        lang === 'ar' ? 'الحالة' : 'Status',
        lang === 'ar' ? 'المسؤول' : 'Assignee'
      ]],
      body: tableData,
      theme: 'grid',
      headStyles: { fillColor: [41, 128, 185], textColor: 255 },
      styles: { font: 'helvetica', fontSize: 9 }
    });

    doc.save('project-schedule.pdf');
  };

  // Generate calendar days
  const calendarDays = useMemo(() => {
    const days = [];
    for (let i = 0; i <= timeline.days; i++) {
      const d = new Date(timeline.start);
      d.setDate(d.getDate() + i);
      days.push(d);
    }
    return days;
  }, [timeline]);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">{t.planning}</h1>
          <p className="text-slate-500 font-medium text-sm mt-1">
            {lang === 'ar' ? 'إدارة وتحسين الجداول الزمنية الرئيسية والمسارات الحرجة' : 'Manage and optimize master schedules and critical paths'}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={exportSchedule} className="flex items-center gap-2 px-5 py-2.5 bg-white border border-slate-200 text-slate-700 rounded-2xl text-sm font-bold hover:bg-slate-50 transition-all active:scale-95 shadow-sm">
            <Download size={18} />
            {t.exportSchedule}
          </button>
          <button onClick={onAddActivity} className="flex items-center gap-2 px-6 py-3 bg-brand-600 text-white rounded-2xl text-sm font-bold hover:bg-brand-700 transition-all active:scale-95 shadow-lg shadow-brand-500/25">
            <Plus size={18} />
            {lang === 'ar' ? 'إضافة مهمة' : 'Add Activity'}
          </button>
        </div>
      </div>

      {/* Controls & Filters */}
      <div className="bg-white p-2 rounded-[24px] border border-slate-100 shadow-sm flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="flex p-1 bg-slate-50 rounded-xl w-full md:w-auto">
          <button 
            onClick={() => setViewMode('gantt')}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-bold transition-all ${viewMode === 'gantt' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
          >
            <GanttChartSquare size={18} />
            {lang === 'ar' ? 'مخطط زمني' : 'Gantt Chart'}
          </button>
          <button 
            onClick={() => setViewMode('list')}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-bold transition-all ${viewMode === 'list' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
          >
            <LayoutList size={18} />
            {lang === 'ar' ? 'قائمة المهام' : 'Task List'}
          </button>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto px-2">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder={lang === 'ar' ? 'بحث عن مهمة...' : 'Search tasks...'}
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
              <option value="all">{lang === 'ar' ? 'كل الحالات' : 'All Status'}</option>
              <option value="not_started">{lang === 'ar' ? 'لم تبدأ' : 'Not Started'}</option>
              <option value="in_progress">{lang === 'ar' ? 'قيد التنفيذ' : 'In Progress'}</option>
              <option value="completed">{lang === 'ar' ? 'مكتملة' : 'Completed'}</option>
              <option value="delayed">{lang === 'ar' ? 'متأخرة' : 'Delayed'}</option>
            </select>
            <Filter className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="bg-white rounded-[32px] border border-slate-100 shadow-sm overflow-hidden min-h-[500px]">
        {viewMode === 'gantt' ? (
          <div className="flex flex-col h-full">
            {/* Gantt Header */}
            <div className="flex border-b border-slate-100">
              <div className="w-80 shrink-0 p-4 border-r border-slate-100 bg-slate-50/50 font-black text-slate-400 uppercase tracking-widest text-[11px]">
                {lang === 'ar' ? 'المهمة' : 'Task Name'}
              </div>
              <div className="flex-1 overflow-x-auto">
                <div className="flex" style={{ width: `${calendarDays.length * 40}px` }}>
                  {calendarDays.map((day, i) => (
                    <div key={i} className="w-10 shrink-0 text-center border-r border-slate-50 py-2">
                      <div className="text-[10px] font-bold text-slate-400">{day.getDate()}</div>
                      <div className="text-[9px] text-slate-300 uppercase">{day.toLocaleDateString(lang === 'ar' ? 'ar-EG' : 'en-US', { weekday: 'narrow' })}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Gantt Body */}
            <div className="flex-1 overflow-y-auto max-h-[600px]">
              {filteredActivities.map((act) => {
                const startDate = new Date(act.startDate);
                const endDate = new Date(act.endDate);
                const startOffset = Math.max(0, Math.ceil((startDate.getTime() - timeline.start.getTime()) / (1000 * 60 * 60 * 24)));
                const duration = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
                
                return (
                  <div key={act.id} className="flex border-b border-slate-50 hover:bg-slate-50/50 transition-colors group">
                    <div className="w-80 shrink-0 p-4 border-r border-slate-100 flex items-center justify-between">
                      <div>
                        <p className="font-bold text-slate-800 text-sm truncate max-w-[180px]">{act.name}</p>
                        <p className="text-[10px] text-slate-400">{act.startDate} - {act.endDate}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        {act.critical && <AlertCircle size={14} className="text-red-500" />}
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${getStatusBadge(act.status)}`}>
                          {act.progress}%
                        </span>
                      </div>
                    </div>
                    <div className="flex-1 overflow-hidden relative">
                      <div className="absolute inset-0 flex" style={{ width: `${calendarDays.length * 40}px` }}>
                        {calendarDays.map((_, i) => (
                          <div key={i} className="w-10 shrink-0 border-r border-slate-50 h-full"></div>
                        ))}
                      </div>
                      <div 
                        className={`absolute top-3 h-8 rounded-lg shadow-sm border border-white/20 flex items-center px-2 overflow-hidden transition-all hover:shadow-md cursor-pointer
                          ${act.critical ? 'bg-red-500 text-white' : getStatusColor(act.status) + ' text-white'}`}
                        style={{ 
                          left: `${startOffset * 40}px`, 
                          width: `${Math.max(40, duration * 40)}px` 
                        }}
                      >
                        <span className="text-[10px] font-bold truncate drop-shadow-md">{act.name}</span>
                        <div 
                          className="absolute bottom-0 left-0 h-1 bg-white/30" 
                          style={{ width: `${act.progress}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/50">
                  <th className="px-8 py-5 text-left text-[11px] font-black text-slate-400 uppercase tracking-widest">{lang === 'ar' ? 'المهمة' : 'Task'}</th>
                  <th className="px-8 py-5 text-left text-[11px] font-black text-slate-400 uppercase tracking-widest">{lang === 'ar' ? 'المدة' : 'Duration'}</th>
                  <th className="px-8 py-5 text-left text-[11px] font-black text-slate-400 uppercase tracking-widest">{lang === 'ar' ? 'المسؤول' : 'Assignee'}</th>
                  <th className="px-8 py-5 text-left text-[11px] font-black text-slate-400 uppercase tracking-widest">{lang === 'ar' ? 'الإنجاز' : 'Progress'}</th>
                  <th className="px-8 py-5 text-left text-[11px] font-black text-slate-400 uppercase tracking-widest">{t.status}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filteredActivities.map((act) => (
                  <tr key={act.id} className="group hover:bg-slate-50/80 transition-colors">
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${act.critical ? 'bg-red-50 text-red-600' : 'bg-blue-50 text-blue-600'}`}>
                          {act.critical ? <AlertCircle size={18} /> : <CheckCircle size={18} />}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900">{act.name}</p>
                          <p className="text-xs text-slate-400 font-medium">{act.startDate} → {act.endDate}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-2 text-slate-500">
                        <Clock size={16} />
                        <span className="font-bold text-sm">{act.duration} {lang === 'ar' ? 'يوم' : 'Days'}</span>
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center text-slate-500">
                          <User size={12} />
                        </div>
                        <span className="font-bold text-slate-700 text-sm">{act.assignee || 'Unassigned'}</span>
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <div className="w-32">
                        <div className="flex justify-between text-xs mb-1">
                          <span className="font-bold text-slate-700">{act.progress}%</span>
                        </div>
                        <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                          <div 
                            className={`h-full rounded-full ${act.critical ? 'bg-red-500' : 'bg-brand-600'}`} 
                            style={{ width: `${act.progress}%` }}
                          ></div>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <span className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider ${getStatusBadge(act.status)}`}>
                        {act.status.replace('_', ' ')}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default PlanningView;
