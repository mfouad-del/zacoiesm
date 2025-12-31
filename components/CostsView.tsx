import React, { useState, useEffect } from 'react';
import { Project, Language, Expense, Resource } from '../types';
import { fetchExpenses, fetchInventory } from '../lib/services';
import { 
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, 
  PieChart, Pie, Cell, AreaChart, Area 
} from 'recharts';
import { 
  ArrowUpRight, ArrowDownRight, DollarSign, TrendingUp, TrendingDown, 
  Package, Users, Truck, Briefcase, Plus, Filter, Download, Search, Loader2
} from 'lucide-react';
import { toast } from 'sonner';

interface CostsViewProps {
  lang: Language;
  projects: Project[];
  onAddExpense: () => void;
  onAddResource: () => void;
}

interface StatCardProps {
  title: string;
  value: string | number;
  subtext?: string;
  icon: React.ElementType;
  trend?: 'up' | 'down' | 'neutral';
}

const StatCard = ({ title, value, subtext, icon: Icon, trend }: StatCardProps) => (
  <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-all">
    <div className="flex justify-between items-start mb-4">
      <div className={`p-3 rounded-2xl ${trend === 'up' ? 'bg-emerald-50 text-emerald-600' : trend === 'down' ? 'bg-red-50 text-red-600' : 'bg-blue-50 text-blue-600'}`}>
        <Icon size={24} />
      </div>
      <span className={`flex items-center text-xs font-bold px-2 py-1 rounded-lg ${trend === 'up' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}>
        {trend === 'up' ? <ArrowUpRight size={14} className="mr-1" /> : <ArrowDownRight size={14} className="mr-1" />}
        {subtext}
      </span>
    </div>
    <h3 className="text-slate-400 text-xs font-black uppercase tracking-widest mb-1">{title}</h3>
    <p className="text-2xl font-black text-slate-900">{value}</p>
  </div>
);

interface TabButtonProps {
  id: string;
  label: string;
  icon: React.ElementType;
  activeTab: string;
  setActiveTab: (id: 'overview' | 'expenses' | 'resources') => void;
}

const TabButton = ({ id, label, icon: Icon, activeTab, setActiveTab }: TabButtonProps) => (
  <button
    onClick={() => setActiveTab(id as 'overview' | 'expenses' | 'resources')}
    className={`flex items-center gap-2 px-6 py-3 rounded-2xl text-sm font-bold transition-all
      ${activeTab === id 
        ? 'bg-brand-600 text-white shadow-lg shadow-brand-500/20' 
        : 'bg-white text-slate-500 hover:bg-slate-50 border border-slate-200'}`}
  >
    <Icon size={18} />
    {label}
  </button>
);

const CostsView: React.FC<CostsViewProps> = ({ 
  lang, projects, onAddExpense, onAddResource 
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'expenses' | 'resources'>('overview');
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [resources, setResources] = useState<Resource[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        const [expensesData, resourcesData] = await Promise.all([
          fetchExpenses(),
          fetchInventory()
        ]);
        
        // Map DB resources to UI Resource type
        const mappedResources = (resourcesData || []).map((r: any) => ({
          id: r.id,
          name: r.name,
          type: r.category || 'Material', // Default to Material if category missing
          unit: r.unit,
          unitCost: r.unit_price || 0,
          totalQuantity: r.quantity || 0,
          usedQuantity: 0, // TODO: Calculate from transactions
          projectId: r.site_id // Using site_id as proxy for project context
        }));

        setExpenses(expensesData || []);
        setResources(mappedResources);
      } catch (error) {
        console.error('Failed to load costs data:', error);
        toast.error(lang === 'ar' ? 'فشل تحميل البيانات' : 'Failed to load data');
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [lang]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-brand-600" />
      </div>
    );
  }

  // --- Calculations ---
  const totalBudget = projects.reduce((acc, p) => acc + (Number(p.budget) || 0), 0);
  const totalExpenses = expenses.reduce((acc, e) => acc + (Number(e.amount) || 0), 0);
  const remainingBudget = totalBudget - totalExpenses;
  const burnRate = totalBudget > 0 ? (totalExpenses / totalBudget) * 100 : 0;

  // Category Breakdown
  const expensesByCategory = expenses.reduce((acc, curr) => {
    acc[curr.category] = (acc[curr.category] || 0) + Number(curr.amount);
    return acc;
  }, {} as Record<string, number>);

  const pieData = Object.keys(expensesByCategory).map(key => ({
    name: key,
    value: expensesByCategory[key]
  }));

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

  // Resource Usage

  // --- Helper Components ---
  // Components moved outside


  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">
            {lang === 'ar' ? 'التكاليف والموارد' : 'Costs & Resources'}
          </h1>
          <p className="text-slate-500 font-medium mt-2">
            {lang === 'ar' ? 'لوحة تحكم مالية شاملة للمشاريع' : 'Comprehensive financial dashboard for projects'}
          </p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={activeTab === 'resources' ? onAddResource : onAddExpense}
            className="flex items-center gap-2 px-6 py-3 bg-brand-600 text-white rounded-2xl font-bold hover:bg-brand-700 transition-all shadow-lg shadow-brand-500/20 active:scale-95"
          >
            <Plus size={20} />
            {lang === 'ar' ? (activeTab === 'resources' ? 'إضافة مورد' : 'إضافة مصروف') : (activeTab === 'resources' ? 'Add Resource' : 'Add Expense')}
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 overflow-x-auto pb-2">
        <TabButton id="overview" label={lang === 'ar' ? 'نظرة عامة' : 'Overview'} icon={DollarSign} activeTab={activeTab} setActiveTab={setActiveTab} />
        <TabButton id="expenses" label={lang === 'ar' ? 'المصروفات' : 'Expenses'} icon={TrendingDown} activeTab={activeTab} setActiveTab={setActiveTab} />
        <TabButton id="resources" label={lang === 'ar' ? 'الموارد' : 'Resources'} icon={Package} activeTab={activeTab} setActiveTab={setActiveTab} />
      </div>

      {/* Content */}
      {activeTab === 'overview' && (
        <div className="space-y-8">
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <StatCard 
              title={lang === 'ar' ? 'الميزانية الكلية' : 'Total Budget'} 
              value={`${(totalBudget / 1000000).toFixed(2)}M SAR`} 
              subtext="Allocated"
              icon={Briefcase}
              trend="neutral"
            />
            <StatCard 
              title={lang === 'ar' ? 'إجمالي المصروفات' : 'Total Expenses'} 
              value={`${(totalExpenses / 1000000).toFixed(2)}M SAR`} 
              subtext={`${burnRate.toFixed(1)}% Used`}
              icon={TrendingDown}
              trend="down"
            />
            <StatCard 
              title={lang === 'ar' ? 'الميزانية المتبقية' : 'Remaining Budget'} 
              value={`${(remainingBudget / 1000000).toFixed(2)}M SAR`} 
              subtext="Available"
              icon={DollarSign}
              trend={remainingBudget > 0 ? 'up' : 'down'}
            />
            <StatCard 
              title={lang === 'ar' ? 'كفاءة الإنفاق' : 'Spending Efficiency'} 
              value="94%" 
              subtext="+2.4% vs Plan"
              icon={TrendingUp}
              trend="up"
            />
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Expense Breakdown */}
            <div className="lg:col-span-1 bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm">
              <h3 className="text-lg font-black text-slate-900 mb-6">{lang === 'ar' ? 'توزيع المصروفات' : 'Expense Breakdown'}</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend verticalAlign="bottom" height={36}/>
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Budget vs Actual Trend */}
            <div className="lg:col-span-2 bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm">
              <h3 className="text-lg font-black text-slate-900 mb-6">{lang === 'ar' ? 'الميزانية مقابل الفعلي (شهري)' : 'Budget vs Actual (Monthly)'}</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={[
                    { name: 'Jan', budget: 4000, actual: 2400 },
                    { name: 'Feb', budget: 3000, actual: 1398 },
                    { name: 'Mar', budget: 2000, actual: 9800 },
                    { name: 'Apr', budget: 2780, actual: 3908 },
                    { name: 'May', budget: 1890, actual: 4800 },
                    { name: 'Jun', budget: 2390, actual: 3800 },
                  ]}>
                    <defs>
                      <linearGradient id="colorBudget" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1}/>
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorActual" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.1}/>
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="name" axisLine={false} tickLine={false} />
                    <YAxis axisLine={false} tickLine={false} />
                    <CartesianGrid vertical={false} stroke="#f1f5f9" />
                    <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                    <Area type="monotone" dataKey="budget" stroke="#3b82f6" fillOpacity={1} fill="url(#colorBudget)" strokeWidth={3} />
                    <Area type="monotone" dataKey="actual" stroke="#10b981" fillOpacity={1} fill="url(#colorActual)" strokeWidth={3} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'expenses' && (
        <div className="bg-white rounded-[32px] border border-slate-100 shadow-sm overflow-hidden">
          <div className="p-8 border-b border-slate-100 flex justify-between items-center">
            <h3 className="text-lg font-black text-slate-900">{lang === 'ar' ? 'سجل المصروفات' : 'Expense Log'}</h3>
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
                  <th className="px-8 py-4 text-left text-xs font-black text-slate-400 uppercase tracking-widest">{lang === 'ar' ? 'الوصف' : 'Description'}</th>
                  <th className="px-8 py-4 text-left text-xs font-black text-slate-400 uppercase tracking-widest">{lang === 'ar' ? 'الفئة' : 'Category'}</th>
                  <th className="px-8 py-4 text-left text-xs font-black text-slate-400 uppercase tracking-widest">{lang === 'ar' ? 'المبلغ' : 'Amount'}</th>
                  <th className="px-8 py-4 text-left text-xs font-black text-slate-400 uppercase tracking-widest">{lang === 'ar' ? 'المورد' : 'Vendor'}</th>
                  <th className="px-8 py-4 text-left text-xs font-black text-slate-400 uppercase tracking-widest">{lang === 'ar' ? 'التاريخ' : 'Date'}</th>
                  <th className="px-8 py-4 text-left text-xs font-black text-slate-400 uppercase tracking-widest">{lang === 'ar' ? 'الحالة' : 'Status'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {expenses.map((expense) => (
                  <tr key={expense.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-8 py-4 font-bold text-slate-700">{expense.description}</td>
                    <td className="px-8 py-4">
                      <span className="px-3 py-1 rounded-lg bg-slate-100 text-slate-600 text-xs font-bold">
                        {expense.category}
                      </span>
                    </td>
                    <td className="px-8 py-4 font-black text-slate-900">{Number(expense.amount).toLocaleString()} SAR</td>
                    <td className="px-8 py-4 text-slate-500 font-medium">{expense.vendor}</td>
                    <td className="px-8 py-4 text-slate-500 font-medium">{expense.date}</td>
                    <td className="px-8 py-4">
                      <span className={`px-3 py-1 rounded-lg text-xs font-bold
                        ${expense.status === 'Approved' ? 'bg-emerald-100 text-emerald-700' : 
                          expense.status === 'Pending' ? 'bg-amber-100 text-amber-700' : 
                          'bg-red-100 text-red-700'}`}>
                        {expense.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'resources' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {resources.map((resource) => (
            <div key={resource.id} className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm hover:shadow-md transition-all group">
              <div className="flex justify-between items-start mb-6">
                <div className="p-4 bg-blue-50 text-blue-600 rounded-2xl group-hover:scale-110 transition-transform">
                  {resource.type === 'Material' ? <Package size={24} /> : 
                   resource.type === 'Labor' ? <Users size={24} /> : <Truck size={24} />}
                </div>
                <span className="px-3 py-1 rounded-lg bg-slate-100 text-slate-600 text-xs font-bold">
                  {resource.type}
                </span>
              </div>
              
              <h3 className="text-lg font-black text-slate-900 mb-1">{resource.name}</h3>
              <p className="text-slate-500 text-sm font-medium mb-6">
                {Number(resource.unitCost).toLocaleString()} SAR / {resource.unit}
              </p>

              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-xs font-bold text-slate-500 mb-2">
                    <span>Usage</span>
                    <span>{Math.round((resource.usedQuantity / resource.totalQuantity) * 100)}%</span>
                  </div>
                  <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-brand-500 rounded-full transition-all duration-1000"
                      style={{ width: `${(resource.usedQuantity / resource.totalQuantity) * 100}%` }}
                    ></div>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-50">
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Used</p>
                    <p className="text-sm font-bold text-slate-900">{resource.usedQuantity.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total</p>
                    <p className="text-sm font-bold text-slate-900">{resource.totalQuantity.toLocaleString()}</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CostsView;
