import React, { useState } from 'react';
import { TRANSLATIONS } from '../constants';
import { Language, Project } from '../types';
// Added Plus to the imports to fix the "Cannot find name 'Plus'" error
import { X, CheckCircle2, AlertCircle, Save, Plus } from 'lucide-react';

interface ModalProps {
  type: string | null;
  onClose: () => void;
  onSubmit: (data: any) => void;
  lang: Language;
  projects?: Project[];
}

// Moved helper components outside to fix "Property 'children' is missing" errors 
// and follow React best practices (avoid defining components inside components)
const InputLabel: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2.5 px-1">
    {children}
  </label>
);

const FormInput = (props: React.InputHTMLAttributes<HTMLInputElement>) => (
  <input 
    {...props}
    className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 outline-none transition-all font-bold text-slate-800 placeholder:text-slate-300"
  />
);

const FormTextarea = (props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) => (
  <textarea 
    {...props}
    className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 outline-none transition-all font-bold text-slate-800 resize-none placeholder:text-slate-300"
  ></textarea>
);

const FormSelect = (props: React.SelectHTMLAttributes<HTMLSelectElement>) => (
  <select 
    {...props}
    className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 outline-none transition-all font-bold text-slate-800"
  />
);

const Modal: React.FC<ModalProps> = ({ type, onClose, onSubmit, lang, projects = [] }) => {
  const t = TRANSLATIONS[lang];
  const [formData, setFormData] = useState<any>({
    severity: 'low',
    projectId: projects[0]?.id || '',
    weather: 'Sunny',
    hours: 8
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const renderForm = () => {
    switch (type) {
      case 'project':
        return (
          <div className="space-y-6">
            <div>
              <InputLabel>{t.projectName}</InputLabel>
              <FormInput required onChange={e => setFormData({...formData, name: e.target.value})} placeholder={lang === 'ar' ? 'أدخل اسم المشروع' : 'Engineering Complex A'} />
            </div>
            <div className="grid grid-cols-2 gap-5">
              <div>
                <InputLabel>{t.projectCode}</InputLabel>
                <FormInput required onChange={e => setFormData({...formData, code: e.target.value})} placeholder="PRJ-001" />
              </div>
              <div>
                <InputLabel>{t.budget}</InputLabel>
                <FormInput type="number" required onChange={e => setFormData({...formData, budget: e.target.value})} placeholder="0.00" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-5">
              <div>
                <InputLabel>{t.startDate}</InputLabel>
                <FormInput type="date" required onChange={e => setFormData({...formData, startDate: e.target.value})} />
              </div>
              <div>
                <InputLabel>{t.endDate}</InputLabel>
                <FormInput type="date" required onChange={e => setFormData({...formData, endDate: e.target.value})} />
              </div>
            </div>
          </div>
        );
      case 'ncr':
        return (
          <div className="space-y-6">
            <div>
              <InputLabel>{t.description}</InputLabel>
              <FormTextarea required rows={4} onChange={e => setFormData({...formData, title: e.target.value})} placeholder={lang === 'ar' ? 'صف الحالة المكتشفة هنا...' : 'Detail the observed non-conformance here...'} />
            </div>
            <div>
              <InputLabel>{t.severity}</InputLabel>
              <div className="grid grid-cols-3 gap-3">
                {['low', 'medium', 'high'].map(sev => (
                  <button
                    key={sev}
                    type="button"
                    onClick={() => setFormData({...formData, severity: sev})}
                    className={`py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest border-2 transition-all
                      ${formData.severity === sev 
                        ? 'bg-brand-600 border-brand-600 text-white shadow-lg shadow-brand-500/20 scale-105' 
                        : 'bg-white border-slate-100 text-slate-400 hover:border-slate-200'}`}
                  >
                    {t[sev as keyof typeof t] || sev}
                  </button>
                ))}
              </div>
            </div>
          </div>
        );
      case 'report':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-5">
              <div>
                <InputLabel>{t.totalLabor}</InputLabel>
                <FormInput type="number" required onChange={e => setFormData({...formData, laborCount: e.target.value})} placeholder="0" />
              </div>
              <div>
                <InputLabel>{t.equipment}</InputLabel>
                <FormInput type="number" required onChange={e => setFormData({...formData, equipmentCount: e.target.value})} placeholder="0" />
              </div>
            </div>
            <div>
              <InputLabel>{t.ongoingActivities}</InputLabel>
              <FormTextarea required rows={4} onChange={e => setFormData({...formData, activities: e.target.value})} placeholder={lang === 'ar' ? 'سجل الأنشطة التي تمت اليوم...' : 'Log the activities carried out today...'} />
            </div>
          </div>
        );
      default:
        return <div className="p-10 text-center text-slate-400 font-bold italic uppercase tracking-widest text-xs">Custom form logic pending integration</div>;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white rounded-[40px] w-full max-w-xl shadow-2xl overflow-hidden border border-slate-200 animate-in zoom-in-95 duration-300">
        <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-brand-600 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-brand-500/20">
               <Plus size={24} strokeWidth={3} />
            </div>
            <div>
              <h3 className="text-xl font-black text-slate-900 tracking-tight leading-none">
                {lang === 'ar' ? `إضافة ${type === 'project' ? 'مشروع' : type === 'ncr' ? 'تقرير عدم مطابقة' : 'سجل جديد'}` : `${t.addNew} ${type}`}
              </h3>
              <p className="text-[10px] font-black text-brand-500 uppercase tracking-widest mt-2">{lang === 'ar' ? 'نظام الإدارة المتكامل IEMS' : 'IEMS Integrated Control System'}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-3 hover:bg-white hover:shadow-sm border border-transparent hover:border-slate-100 rounded-2xl text-slate-400 transition-all active:scale-90"><X size={20} /></button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="p-8 max-h-[65vh] overflow-y-auto">
            {renderForm()}
          </div>
          <div className="p-8 bg-slate-50 flex justify-end gap-4 border-t border-slate-100">
            <button type="button" onClick={onClose} className="px-6 py-3 font-black text-slate-400 uppercase tracking-widest text-xs hover:text-slate-600 transition-colors">{t.cancel}</button>
            <button type="submit" className="px-10 py-4 bg-brand-600 text-white rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-brand-700 shadow-xl shadow-brand-500/20 active:scale-95 transition-all flex items-center gap-2">
              <Save size={18} strokeWidth={2.5} />
              {t.save}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Modal;
