import React from 'react';
import { Project, Language } from '../types';
import { TRANSLATIONS } from '../constants';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { DollarSign, ArrowUpRight, ArrowDownRight } from 'lucide-react';

const CostsView: React.FC<{ lang: Language; projects: Project[] }> = ({ lang, projects }) => {
  const t = TRANSLATIONS[lang];

  const data = projects.map(p => ({
    name: p.code,
    planned: p.budget / 1000000,
    actual: (p.budget * (0.8 + Math.random() * 0.4)) / 1000000,
  }));

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t.costs}</h1>
          <p className="text-gray-500 text-sm">{lang === 'ar' ? 'مراقبة التكاليف المالية والميزانيات.' : 'Monitor financial costs and budgets.'}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
          <p className="text-xs font-bold text-gray-400 uppercase mb-1">{t.totalBudget}</p>
          <p className="text-3xl font-bold text-gray-900">$435.0M</p>
          <div className="mt-4 flex items-center gap-2 text-sm text-emerald-600 font-bold">
            <ArrowUpRight size={16} />
            <span>12% over baseline</span>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
          <p className="text-xs font-bold text-gray-400 uppercase mb-1">{t.actualCost}</p>
          <p className="text-3xl font-bold text-gray-900">$218.4M</p>
          <div className="mt-4 flex items-center gap-2 text-sm text-blue-600 font-bold">
            <span>50.2% Spent</span>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
          <p className="text-xs font-bold text-gray-400 uppercase mb-1">{t.variance}</p>
          <p className="text-3xl font-bold text-red-600">-$2.4M</p>
          <div className="mt-4 flex items-center gap-2 text-sm text-red-600 font-bold">
            <ArrowDownRight size={16} />
            <span>Under-performing</span>
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
        <h3 className="font-bold text-lg mb-8">{t.plannedCost} vs {t.actualCost} (Million USD)</h3>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} />
              <YAxis axisLine={false} tickLine={false} />
              <Tooltip 
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
              />
              <Legend verticalAlign="top" height={36}/>
              <Bar dataKey="planned" name={t.plannedCost} fill="#94a3b8" radius={[4, 4, 0, 0]} />
              <Bar dataKey="actual" name={t.actualCost} fill="#3b82f6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default CostsView;
