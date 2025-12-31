import React, { useState } from 'react';
import { Language, Timesheet } from '../types';
import { TRANSLATIONS } from '../constants';
import { 
  Plus, Check, X, Clock, Calendar, User, Briefcase, 
  TrendingUp, AlertCircle, Search, Filter, Download,
  ChevronLeft, ChevronRight
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  AreaChart, Area, PieChart, Pie, Cell, Legend 
} from 'recharts';

interface TimesheetsViewProps {
  lang: Language;
  entries: Timesheet[];
  onAddEntry: () => void;
  onApprove: (id: string) => void;
}

const TimesheetsView: React.FC<TimesheetsViewProps> = ({ lang, entries, onAddEntry, onApprove }) => {
  const t = TRANSLATIONS[lang];
  const [activeTab, setActiveTab] = useState<'overview' | 'list' | 'approvals'>('overview');
  const [filterStatus, setFilterStatus] = useState('all');

  // Stats
  const totalHours = entries.reduce((acc, curr) => acc + Number(curr.hours), 0);
  const totalOvertime = entries.reduce((acc, curr) => acc + (Number(curr.overtime) || 0), 0);
  const pendingCount = entries.filter(e => e.status === 'Pending').length;
  const approvedCount = entries.filter(e => e.status === 'Approved').length;

  // Chart Data
  const hoursByProject = entries.reduce((acc, curr) => {
    acc[curr.project] = (acc[curr.project] || 0) + Number(curr.hours);
    return acc;
  }, {} as Record<string, number>);

  const barData = Object.keys(hoursByProject).map(key => ({
    name: key,
    hours: hoursByProject[key]
  }));

  const statusData = [
    { name: 'Approved', value: approvedCount, color: '#10b981' },
    { name: 'Pending', value: pendingCount, color: '#f59e0b' },
    { name: 'Rejected', value: entries.filter(e => e.status === 'Rejected').length, color: '#ef4444' }
  ];

  const StatCard = ({ title, value, icon: Icon, color, subtext }: any) => (
    <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-all">
      <div className="flex justify-between items-start mb-4">
        <div className={`p-3 rounded-2xl ${color}`}>
          <Icon size={24} />
        </div>
        {subtext && <span className="text-xs font-bold text-slate-400 bg-slate-50 px-2 py-1 rounded-lg">{subtext}</span>}
      </div>
      <h3 className="text-slate-400 text-xs font-black uppercase tracking-widest mb-1">{title}</h3>
      <p className="text-2xl font-black text-slate-900">{value}</p>
    </div>
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">
            {t.timesheets}
          </h1>
          <p className="text-slate-500 font-medium mt-2">
            {lang === 'ar' ? 'إدارة سجلات الدوام وساعات العمل' : 'Manage timesheets and working hours'}
          </p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={onAddEntry}
            className="flex items-center gap-2 px-6 py-3 bg-brand-600 text-white rounded-2xl font-bold hover:bg-brand-700 transition-all shadow-lg shadow-brand-500/20 active:scale-95"
          >
            <Plus size={20} />
            {lang === 'ar' ? 'تسجيل جديد' : 'New Entry'}
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 overflow-x-auto pb-2 border-b border-slate-100">
        {[
          { id: 'overview', label: lang === 'ar' ? 'نظرة عامة' : 'Overview', icon: TrendingUp },
          { id: 'list', label: lang === 'ar' ? 'السجلات' : 'All Entries', icon: Clock },
          { id: 'approvals', label: lang === 'ar' ? 'الموافقات' : 'Approvals', icon: Check },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-2 px-6 py-3 rounded-t-2xl text-sm font-bold transition-all border-b-2 
              ${activeTab === tab.id 
                ? 'border-brand-600 text-brand-600 bg-brand-50/50' 
                : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50'}`}
          >
            <tab.icon size={18} />
            {tab.label}
            {tab.id === 'approvals' && pendingCount > 0 && (
              <span className="bg-red-500 text-white text-[10px] px-2 py-0.5 rounded-full">{pendingCount}</span>
            )}
          </button>
        ))}
      </div>

      {activeTab === 'overview' && (
        <div className="space-y-8">
          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <StatCard 
              title={lang === 'ar' ? 'إجمالي الساعات' : 'Total Hours'} 
              value={totalHours} 
              icon={Clock} 
              color="bg-blue-50 text-blue-600"
              subtext="This Month"
            />
            <StatCard 
              title={lang === 'ar' ? 'ساعات إضافية' : 'Overtime Hours'} 
              value={totalOvertime} 
              icon={TrendingUp} 
              color="bg-purple-50 text-purple-600"
              subtext="+12% vs Last Month"
            />
            <StatCard 
              title={lang === 'ar' ? 'قيد الانتظار' : 'Pending Approval'} 
              value={pendingCount} 
              icon={AlertCircle} 
              color="bg-amber-50 text-amber-600"
            />
            <StatCard 
              title={lang === 'ar' ? 'نسبة الالتزام' : 'Compliance Rate'} 
              value="98%" 
              icon={Check} 
              color="bg-emerald-50 text-emerald-600"
            />
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm">
              <h3 className="text-lg font-black text-slate-900 mb-6">{lang === 'ar' ? 'الساعات حسب المشروع' : 'Hours by Project'}</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={barData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} />
                    <YAxis axisLine={false} tickLine={false} />
                    <Tooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                    <Bar dataKey="hours" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={40} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm">
              <h3 className="text-lg font-black text-slate-900 mb-6">{lang === 'ar' ? 'حالة السجلات' : 'Entry Status'}</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={statusData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {statusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend verticalAlign="bottom" height={36}/>
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      )}

      {(activeTab === 'list' || activeTab === 'approvals') && (
        <div className="bg-white rounded-[32px] border border-slate-100 shadow-sm overflow-hidden">
          <div className="p-8 border-b border-slate-100 flex justify-between items-center">
            <h3 className="text-lg font-black text-slate-900">
              {activeTab === 'approvals' ? (lang === 'ar' ? 'طلبات الموافقة' : 'Pending Approvals') : (lang === 'ar' ? 'سجل الدوام' : 'Timesheet Log')}
            </h3>
            <div className="flex gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input 
                  type="text" 
                  placeholder={lang === 'ar' ? 'بحث...' : 'Search...'}
                  className="pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                />
              </div>
              <button className="p-2 text-slate-400 hover:text-brand-600 hover:bg-brand-50 rounded-xl transition-colors">
                <Filter size={20} />
              </button>
              <button className="p-2 text-slate-400 hover:text-brand-600 hover:bg-brand-50 rounded-xl transition-colors">
                <Download size={20} />
              </button>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-100">
                <tr>
                  <th className="px-8 py-4 text-left text-xs font-black text-slate-400 uppercase tracking-widest">{t.employee}</th>
                  <th className="px-8 py-4 text-left text-xs font-black text-slate-400 uppercase tracking-widest">{lang === 'ar' ? 'الدور' : 'Role'}</th>
                  <th className="px-8 py-4 text-left text-xs font-black text-slate-400 uppercase tracking-widest">{t.projectName}</th>
                  <th className="px-8 py-4 text-left text-xs font-black text-slate-400 uppercase tracking-widest">{t.date}</th>
                  <th className="px-8 py-4 text-left text-xs font-black text-slate-400 uppercase tracking-widest">{t.hours}</th>
                  <th className="px-8 py-4 text-left text-xs font-black text-slate-400 uppercase tracking-widest">{lang === 'ar' ? 'إضافي' : 'OT'}</th>
                  <th className="px-8 py-4 text-left text-xs font-black text-slate-400 uppercase tracking-widest">{t.status}</th>
                  <th className="px-8 py-4 text-left text-xs font-black text-slate-400 uppercase tracking-widest">{t.actions}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {entries
                  .filter(e => activeTab === 'approvals' ? e.status === 'Pending' : true)
                  .map((entry) => (
                  <tr key={entry.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-8 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-brand-100 text-brand-600 rounded-full flex items-center justify-center font-black text-xs">
                          {entry.employee.charAt(0)}
                        </div>
                        <span className="font-bold text-slate-700">{entry.employee}</span>
                      </div>
                    </td>
                    <td className="px-8 py-4 text-sm font-medium text-slate-500">{entry.role || '-'}</td>
                    <td className="px-8 py-4">
                      <span className="px-2 py-1 bg-slate-100 rounded-lg text-xs font-bold text-slate-600">{entry.project}</span>
                    </td>
                    <td className="px-8 py-4 text-sm font-medium text-slate-500">{entry.date || '-'}</td>
                    <td className="px-8 py-4 font-black text-slate-900">{entry.hours}h</td>
                    <td className="px-8 py-4 font-bold text-slate-500">{entry.overtime ? `+${entry.overtime}h` : '-'}</td>
                    <td className="px-8 py-4">
                      <span className={`px-3 py-1 rounded-lg text-xs font-bold
                        ${entry.status === 'Approved' ? 'bg-emerald-100 text-emerald-700' : 
                          entry.status === 'Pending' ? 'bg-amber-100 text-amber-700' : 
                          'bg-red-100 text-red-700'}`}>
                        {entry.status}
                      </span>
                    </td>
                    <td className="px-8 py-4">
                      {entry.status === 'Pending' && (
                        <div className="flex gap-2">
                          <button 
                            onClick={() => onApprove(entry.id)}
                            className="p-2 bg-emerald-50 text-emerald-600 hover:bg-emerald-100 rounded-xl transition-colors"
                            title={t.approve}
                          >
                            <Check size={16} strokeWidth={3} />
                          </button>
                          <button 
                            className="p-2 bg-red-50 text-red-600 hover:bg-red-100 rounded-xl transition-colors"
                            title="Reject"
                          >
                            <X size={16} strokeWidth={3} />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default TimesheetsView;
