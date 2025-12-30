import React, { useState, useMemo } from 'react';
import { Project, Language } from '../types';
import { TRANSLATIONS } from '../constants';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area } from 'recharts';
import { TrendingUp, AlertCircle, CheckCircle2, DollarSign, ArrowUpRight, Plus, Calendar, Activity } from 'lucide-react';
import EVMDashboard from './EVMDashboard';

interface DashboardViewProps {
  projects: Project[];
  lang: Language;
  incidentsCount: number;
}

const StatCard = ({ title, value, icon, color, trend }: any) => {
  const colorMap: Record<string, string> = {
    blue: 'bg-blue-600 shadow-blue-500/20',
    indigo: 'bg-indigo-600 shadow-indigo-500/20',
    emerald: 'bg-emerald-600 shadow-emerald-500/20',
    amber: 'bg-amber-500 shadow-amber-500/20',
  };

  return (
    <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm card-hover">
      <div className="flex justify-between items-start mb-4">
        <div className={`p-3 rounded-2xl text-white ${colorMap[color]}`}>
          {icon}
        </div>
        <div className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold ${trend.startsWith('↑') ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
          {trend}
        </div>
      </div>
      <div>
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">{title}</p>
        <h3 className="text-2xl font-black text-slate-900 tracking-tight">{value}</h3>
      </div>
    </div>
  );
};

const DashboardView: React.FC<DashboardViewProps> = ({ projects, lang, incidentsCount }) => {
  const t = TRANSLATIONS[lang];
  const [selectedProjectId, setSelectedProjectId] = useState<string | undefined>(
    projects.length > 0 ? projects[0].id : undefined
  );

  const chartData = useMemo(
    () => projects.map(p => ({
      name: p.code,
      progress: p.progress,
      budget: p.budget / 1000000,
    })),
    [projects]
  );

  const pieData = useMemo(
    () => [
      { name: t.completed, value: projects.filter(p => p.status === 'completed').length || 0, color: '#10b981' },
      { name: t.active, value: projects.filter(p => p.status === 'active').length || 1, color: '#3b82f6' },
      { name: t.onHold, value: projects.filter(p => p.status === 'on-hold').length || 0, color: '#f59e0b' },
    ].filter(d => d.value > 0),
    [projects, t]
  );



  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight mb-2">{t.welcomeBack}</h1>
          <div className="flex items-center gap-2 text-slate-500 text-sm font-medium">
            <Activity size={16} className="text-brand-500" />
            <span>{lang === 'ar' ? 'جميع الأنظمة تعمل بكفاءة عالية اليوم' : 'All systems reporting high efficiency today'}</span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-5 py-2.5 bg-white border border-slate-200 text-slate-700 rounded-2xl text-sm font-bold hover:bg-slate-50 transition-all active:scale-95 shadow-sm">
            <Calendar size={18} />
            {lang === 'ar' ? 'الجدول اليومي' : 'Daily Schedule'}
          </button>
          <button className="flex items-center gap-2 px-6 py-3 bg-brand-600 text-white rounded-2xl text-sm font-bold hover:bg-brand-700 transition-all active:scale-95 shadow-lg shadow-brand-500/25">
            <Plus size={18} />
            {t.generateReport}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title={t.totalBudget} value={`$${(projects.reduce((acc, p) => acc + p.budget, 0) / 1000000).toFixed(1)}M`} icon={<DollarSign size={20} />} color="blue" trend="↑ 12%" />
        <StatCard title={t.activeProjects} value={projects.length} icon={<TrendingUp size={20} />} color="indigo" trend="↑ 4" />
        <StatCard title={t.overallProgress} value={`${(projects.reduce((acc, p) => acc + p.progress, 0) / projects.length || 0).toFixed(0)}%`} icon={<CheckCircle2 size={20} />} color="emerald" trend="↑ 8%" />
        <StatCard title={t.safetyIncidents} value={incidentsCount} icon={<AlertCircle size={20} />} color="amber" trend="↓ 2" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-lg font-bold text-slate-900 tracking-tight">{t.progressPerProject}</h3>
            <div className="flex gap-2">
               <span className="flex items-center gap-1 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                 <span className="w-2 h-2 rounded-full bg-brand-500"></span> {t.progress}
               </span>
            </div>
          </div>
          <div className="h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorProgress" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#64748b', fontWeight: 600 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#64748b', fontWeight: 600 }} />
                <Tooltip 
                  contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)', padding: '12px' }}
                />
                <Area type="monotone" dataKey="progress" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorProgress)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm flex flex-col">
          <h3 className="text-lg font-bold text-slate-900 tracking-tight mb-8">{t.projectDistribution}</h3>
          <div className="flex-1 flex items-center justify-center relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={70}
                  outerRadius={95}
                  paddingAngle={8}
                  dataKey="value"
                  stroke="none"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-4xl font-black text-slate-900">{projects.length}</span>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{lang === 'ar' ? 'مشروع' : 'Projects'}</span>
            </div>
          </div>
          <div className="mt-10 space-y-3">
            {pieData.map((item, i) => (
              <div key={i} className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 border border-slate-100/50">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                  <span className="text-sm font-bold text-slate-700">{item.name}</span>
                </div>
                <span className="text-sm font-black text-slate-900">{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* EVM Dashboard */}
      {projects.length > 0 && (
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
          <div className="mb-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              📊 {lang === 'ar' ? 'تحليل الأداء - EVM' : 'Performance Analysis - EVM'}
            </h2>
            <select
              value={selectedProjectId}
              onChange={(e) => setSelectedProjectId(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent"
            >
              {projects.map((project) => (
                <option key={project.id} value={project.id}>
                  {project.name}
                </option>
              ))}
            </select>
          </div>
          <EVMDashboard projectId={selectedProjectId} lang={lang} />
        </div>
      )}
    </div>
  );
};

export default DashboardView;
