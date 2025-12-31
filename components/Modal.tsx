/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from 'react';
import { TRANSLATIONS } from '../constants';
import { Language, Project } from '../types';
import { X, Save, Plus, Upload } from 'lucide-react';

interface ModalProps {
  type: string | null;
  onClose: () => void;
  onSubmit: (data: Record<string, any>) => void;
  lang: Language;
  projects?: Project[];
}

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
  const [formData, setFormData] = useState<Record<string, any>>({
    severity: 'low',
    projectId: projects[0]?.id || '',
    weather: 'Sunny',
    hours: 8,
    priority: 'medium',
    status: 'active'
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
                <InputLabel>{lang === 'ar' ? 'العميل' : 'Client'}</InputLabel>
                <FormInput required onChange={e => setFormData({...formData, client: e.target.value})} placeholder={lang === 'ar' ? 'اسم العميل' : 'Client Name'} />
              </div>
              <div>
                <InputLabel>{lang === 'ar' ? 'مدير المشروع' : 'Project Manager'}</InputLabel>
                <FormInput required onChange={e => setFormData({...formData, manager: e.target.value})} placeholder={lang === 'ar' ? 'اسم المدير' : 'Manager Name'} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-5">
              <div>
                <InputLabel>{lang === 'ar' ? 'الموقع' : 'Location'}</InputLabel>
                <FormInput required onChange={e => setFormData({...formData, location: e.target.value})} placeholder={lang === 'ar' ? 'موقع المشروع' : 'Project Location'} />
              </div>
              <div>
                <InputLabel>{lang === 'ar' ? 'الأولوية' : 'Priority'}</InputLabel>
                <FormSelect onChange={e => setFormData({...formData, priority: e.target.value})}>
                  <option value="low">{lang === 'ar' ? 'منخفضة' : 'Low'}</option>
                  <option value="medium">{lang === 'ar' ? 'متوسطة' : 'Medium'}</option>
                  <option value="high">{lang === 'ar' ? 'عالية' : 'High'}</option>
                </FormSelect>
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
            <div>
              <InputLabel>{t.description}</InputLabel>
              <FormTextarea rows={3} onChange={e => setFormData({...formData, description: e.target.value})} placeholder={lang === 'ar' ? 'وصف المشروع...' : 'Project description...'} />
            </div>
          </div>
        );
      case 'ncr':
        return (
          <div className="space-y-6 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
            <div>
              <InputLabel>{lang === 'ar' ? 'عنوان التقرير' : 'NCR Title'}</InputLabel>
              <FormInput required onChange={e => setFormData({...formData, title: e.target.value})} placeholder={lang === 'ar' ? 'عدم مطابقة في صب الخرسانة' : 'Concrete Pouring Non-Conformance'} />
            </div>
            
            <div className="grid grid-cols-2 gap-5">
              <div>
                <InputLabel>{lang === 'ar' ? 'الموقع' : 'Location'}</InputLabel>
                <FormInput required onChange={e => setFormData({...formData, location: e.target.value})} placeholder={lang === 'ar' ? 'المنطقة أ - الدور الأول' : 'Zone A - 1st Floor'} />
              </div>
              <div>
                <InputLabel>{lang === 'ar' ? 'تاريخ الاستحقاق' : 'Due Date'}</InputLabel>
                <FormInput type="date" required onChange={e => setFormData({...formData, dueDate: e.target.value})} />
              </div>
            </div>

            <div>
              <InputLabel>{t.description}</InputLabel>
              <FormTextarea required rows={3} onChange={e => setFormData({...formData, description: e.target.value})} placeholder={lang === 'ar' ? 'وصف تفصيلي لحالة عدم المطابقة...' : 'Detailed description of the non-conformance...'} />
            </div>

            <div className="grid grid-cols-2 gap-5">
              <div>
                <InputLabel>{lang === 'ar' ? 'السبب الجذري' : 'Root Cause'}</InputLabel>
                <FormTextarea rows={2} onChange={e => setFormData({...formData, rootCause: e.target.value})} placeholder={lang === 'ar' ? 'لماذا حدثت المشكلة؟' : 'Why did this happen?'} />
              </div>
              <div>
                <InputLabel>{lang === 'ar' ? 'الإجراء التصحيحي' : 'Corrective Action'}</InputLabel>
                <FormTextarea rows={2} onChange={e => setFormData({...formData, correctiveAction: e.target.value})} placeholder={lang === 'ar' ? 'كيف سيتم إصلاحها؟' : 'How will it be fixed?'} />
              </div>
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

            <div>
              <InputLabel>{lang === 'ar' ? 'المفتش المسؤول' : 'Inspector'}</InputLabel>
              <FormInput onChange={e => setFormData({...formData, inspector: e.target.value})} placeholder={lang === 'ar' ? 'اسم المفتش' : 'Inspector Name'} />
            </div>
          </div>
        );
      case 'report':
        return (
          <div className="space-y-6 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
            {/* Weather Section */}
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
              <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-brand-500"></span>
                {lang === 'ar' ? 'حالة الطقس' : 'Weather Conditions'}
              </h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <InputLabel>{lang === 'ar' ? 'درجة الحرارة (C)' : 'Temperature (C)'}</InputLabel>
                  <FormInput type="number" required onChange={e => setFormData({...formData, weather: { ...formData.weather, temp: e.target.value }})} placeholder="32" />
                </div>
                <div>
                  <InputLabel>{lang === 'ar' ? 'الحالة' : 'Condition'}</InputLabel>
                  <FormSelect onChange={e => setFormData({...formData, weather: { ...formData.weather, condition: e.target.value }})}>
                    <option value="Sunny">{lang === 'ar' ? 'مشمس' : 'Sunny'}</option>
                    <option value="Cloudy">{lang === 'ar' ? 'غائم' : 'Cloudy'}</option>
                    <option value="Rainy">{lang === 'ar' ? 'ممطر' : 'Rainy'}</option>
                    <option value="Windy">{lang === 'ar' ? 'عاصف' : 'Windy'}</option>
                  </FormSelect>
                </div>
              </div>
            </div>

            {/* Resources Section */}
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
              <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                {lang === 'ar' ? 'الموارد' : 'Resources'}
              </h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <InputLabel>{t.totalLabor}</InputLabel>
                  <FormInput type="number" required onChange={e => setFormData({...formData, laborCount: e.target.value})} placeholder="0" />
                </div>
                <div>
                  <InputLabel>{t.equipment}</InputLabel>
                  <FormInput type="number" required onChange={e => setFormData({...formData, equipmentCount: e.target.value})} placeholder="0" />
                </div>
              </div>
            </div>

            {/* Activities Section */}
            <div>
              <InputLabel>{t.ongoingActivities}</InputLabel>
              <FormTextarea required rows={4} onChange={e => setFormData({...formData, activities: e.target.value})} placeholder={lang === 'ar' ? 'سجل الأنشطة التي تمت اليوم...' : 'Log the activities carried out today...'} />
            </div>

            {/* Safety & Delays */}
            <div className="grid grid-cols-1 gap-4">
              <div>
                <InputLabel>{lang === 'ar' ? 'ملاحظات السلامة' : 'Safety Observations'}</InputLabel>
                <FormTextarea rows={2} onChange={e => setFormData({...formData, safetyObservations: e.target.value.split('\n')})} placeholder={lang === 'ar' ? 'ملاحظة 1\nملاحظة 2' : 'Observation 1\nObservation 2'} />
              </div>
              <div>
                <InputLabel>{lang === 'ar' ? 'التأخيرات والمعوقات' : 'Delays & Issues'}</InputLabel>
                <FormTextarea rows={2} onChange={e => setFormData({...formData, delays: e.target.value.split('\n')})} placeholder={lang === 'ar' ? 'سبب التأخير...' : 'Delay reason...'} />
              </div>
            </div>
          </div>
        );
      case 'planning':
        return (
          <div className="space-y-6">
            <div>
              <InputLabel>{lang === 'ar' ? 'اسم المهمة' : 'Task Name'}</InputLabel>
              <FormInput required onChange={e => setFormData({...formData, name: e.target.value})} placeholder={lang === 'ar' ? 'أعمال الحفر' : 'Excavation Works'} />
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
            <div className="grid grid-cols-2 gap-5">
              <div>
                <InputLabel>{lang === 'ar' ? 'نسبة الإنجاز %' : 'Progress %'}</InputLabel>
                <FormInput type="number" min="0" max="100" required onChange={e => setFormData({...formData, progress: e.target.value})} placeholder="0" />
              </div>
              <div>
                <InputLabel>{t.status}</InputLabel>
                <FormSelect onChange={e => setFormData({...formData, status: e.target.value})}>
                  <option value="not_started">{lang === 'ar' ? 'لم تبدأ' : 'Not Started'}</option>
                  <option value="in_progress">{lang === 'ar' ? 'قيد التنفيذ' : 'In Progress'}</option>
                  <option value="completed">{lang === 'ar' ? 'مكتملة' : 'Completed'}</option>
                  <option value="delayed">{lang === 'ar' ? 'متأخرة' : 'Delayed'}</option>
                </FormSelect>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-5">
              <div>
                <InputLabel>{lang === 'ar' ? 'المسؤول' : 'Assignee'}</InputLabel>
                <FormInput onChange={e => setFormData({...formData, assignee: e.target.value})} placeholder={lang === 'ar' ? 'اسم المهندس' : 'Engineer Name'} />
              </div>
              <div className="flex items-center pt-8">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input type="checkbox" className="w-5 h-5 rounded-lg border-slate-300 text-brand-600 focus:ring-brand-500" onChange={e => setFormData({...formData, critical: e.target.checked})} />
                  <span className="font-bold text-slate-700 text-sm">{lang === 'ar' ? 'مسار حرج' : 'Critical Path'}</span>
                </label>
              </div>
            </div>
          </div>
        );
      case 'contract':
        return (
          <div className="space-y-6">
            <div>
              <InputLabel>{lang === 'ar' ? 'عنوان العقد' : 'Contract Title'}</InputLabel>
              <FormInput required onChange={e => setFormData({...formData, title: e.target.value})} placeholder={lang === 'ar' ? 'عقد توريد خرسانة' : 'Concrete Supply Contract'} />
            </div>
            <div className="grid grid-cols-2 gap-5">
              <div>
                <InputLabel>{lang === 'ar' ? 'المورد / المقاول' : 'Vendor / Contractor'}</InputLabel>
                <FormInput required onChange={e => setFormData({...formData, vendor: e.target.value})} placeholder={lang === 'ar' ? 'شركة البناء الحديث' : 'Modern Construction Co.'} />
              </div>
              <div>
                <InputLabel>{lang === 'ar' ? 'القيمة' : 'Value'}</InputLabel>
                <FormInput type="number" required onChange={e => setFormData({...formData, value: e.target.value})} placeholder="0.00" />
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
            <div>
              <InputLabel>{t.status}</InputLabel>
              <FormSelect onChange={e => setFormData({...formData, status: e.target.value})}>
                <option value="active">{lang === 'ar' ? 'نشط' : 'Active'}</option>
                <option value="pending">{lang === 'ar' ? 'قيد الانتظار' : 'Pending'}</option>
                <option value="completed">{lang === 'ar' ? 'مكتمل' : 'Completed'}</option>
                <option value="terminated">{lang === 'ar' ? 'ملغى' : 'Terminated'}</option>
              </FormSelect>
            </div>
          </div>
        );
      case 'variation':
        return (
          <div className="space-y-6">
            <div>
              <InputLabel>{lang === 'ar' ? 'عنوان أمر التغيير' : 'Variation Order Title'}</InputLabel>
              <FormInput required onChange={e => setFormData({...formData, title: e.target.value})} placeholder={lang === 'ar' ? 'تغيير مواصفات التشطيب' : 'Finishing Specs Change'} />
            </div>
            <div className="grid grid-cols-2 gap-5">
              <div>
                <InputLabel>{lang === 'ar' ? 'القيمة الإضافية' : 'Additional Value'}</InputLabel>
                <FormInput type="number" required onChange={e => setFormData({...formData, value: e.target.value})} placeholder="0.00" />
              </div>
              <div>
                <InputLabel>{t.status}</InputLabel>
                <FormSelect onChange={e => setFormData({...formData, status: e.target.value})}>
                  <option value="Pending">{lang === 'ar' ? 'قيد المراجعة' : 'Pending'}</option>
                  <option value="Approved">{lang === 'ar' ? 'تمت الموافقة' : 'Approved'}</option>
                  <option value="Rejected">{lang === 'ar' ? 'مرفوض' : 'Rejected'}</option>
                </FormSelect>
              </div>
            </div>
            <div>
              <InputLabel>{lang === 'ar' ? 'سبب التغيير' : 'Reason for Change'}</InputLabel>
              <FormTextarea required rows={4} onChange={e => setFormData({...formData, description: e.target.value})} placeholder={lang === 'ar' ? 'شرح سبب طلب أمر التغيير...' : 'Explain the reason for this variation order...'} />
            </div>
            <div>
              <InputLabel>{lang === 'ar' ? 'التأثير على الجدول الزمني (أيام)' : 'Schedule Impact (Days)'}</InputLabel>
              <FormInput type="number" onChange={e => setFormData({...formData, scheduleImpact: e.target.value})} placeholder="0" />
            </div>
          </div>
        );
      case 'incident':
        return (
          <div className="space-y-6">
            {/* Header Info */}
            <div className="grid grid-cols-2 gap-5">
              <div>
                <InputLabel>{lang === 'ar' ? 'نوع الحادث' : 'Incident Type'}</InputLabel>
                <FormSelect onChange={e => setFormData({...formData, type: e.target.value})}>
                  <option value="Injury">{lang === 'ar' ? 'إصابة' : 'Injury'}</option>
                  <option value="Near Miss">{lang === 'ar' ? 'وشيك الوقوع' : 'Near Miss'}</option>
                  <option value="Property Damage">{lang === 'ar' ? 'تلف ممتلكات' : 'Property Damage'}</option>
                  <option value="Environmental">{lang === 'ar' ? 'بيئي' : 'Environmental'}</option>
                  <option value="Hazard">{lang === 'ar' ? 'خطر محتمل' : 'Hazard'}</option>
                </FormSelect>
              </div>
              <div>
                <InputLabel>{lang === 'ar' ? 'درجة الخطورة' : 'Severity'}</InputLabel>
                <FormSelect onChange={e => setFormData({...formData, severity: e.target.value})}>
                  <option value="Low">{lang === 'ar' ? 'منخفضة' : 'Low'}</option>
                  <option value="Medium">{lang === 'ar' ? 'متوسطة' : 'Medium'}</option>
                  <option value="High">{lang === 'ar' ? 'عالية' : 'High'}</option>
                  <option value="Critical">{lang === 'ar' ? 'حرجة' : 'Critical'}</option>
                </FormSelect>
              </div>
            </div>

            {/* Location & Date */}
            <div className="grid grid-cols-2 gap-5">
              <div>
                <InputLabel>{lang === 'ar' ? 'الموقع' : 'Location'}</InputLabel>
                <FormInput required onChange={e => setFormData({...formData, location: e.target.value})} placeholder={lang === 'ar' ? 'المنطقة أ - الدور الأول' : 'Zone A - 1st Floor'} />
              </div>
              <div>
                <InputLabel>{t.date}</InputLabel>
                <FormInput type="date" required onChange={e => setFormData({...formData, date: e.target.value})} />
              </div>
            </div>

            {/* Description */}
            <div>
              <InputLabel>{lang === 'ar' ? 'وصف الحادث' : 'Incident Description'}</InputLabel>
              <FormTextarea required rows={3} onChange={e => setFormData({...formData, description: e.target.value})} placeholder={lang === 'ar' ? 'وصف تفصيلي لما حدث...' : 'Detailed description of what happened...'} />
            </div>

            {/* People Involved */}
            <div className="grid grid-cols-2 gap-5">
              <div>
                <InputLabel>{lang === 'ar' ? 'الأشخاص المعنيين' : 'Involved Persons'}</InputLabel>
                <FormInput onChange={e => setFormData({...formData, involvedPersons: e.target.value})} placeholder={lang === 'ar' ? 'الأسماء...' : 'Names...'} />
              </div>
              <div>
                <InputLabel>{lang === 'ar' ? 'الشهود' : 'Witnesses'}</InputLabel>
                <FormInput onChange={e => setFormData({...formData, witnesses: e.target.value})} placeholder={lang === 'ar' ? 'الأسماء...' : 'Names...'} />
              </div>
            </div>

            {/* Analysis */}
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-4">
              <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-red-500"></span>
                {lang === 'ar' ? 'التحليل والإجراءات' : 'Analysis & Actions'}
              </h4>
              <div>
                <InputLabel>{lang === 'ar' ? 'السبب الجذري' : 'Root Cause'}</InputLabel>
                <FormTextarea rows={2} onChange={e => setFormData({...formData, rootCause: e.target.value})} placeholder={lang === 'ar' ? 'لماذا حدث ذلك؟' : 'Why did this happen?'} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <InputLabel>{lang === 'ar' ? 'إجراء فوري' : 'Immediate Action'}</InputLabel>
                  <FormTextarea rows={2} onChange={e => setFormData({...formData, immediateAction: e.target.value})} placeholder="..." />
                </div>
                <div>
                  <InputLabel>{lang === 'ar' ? 'إجراء تصحيحي' : 'Corrective Action'}</InputLabel>
                  <FormTextarea rows={2} onChange={e => setFormData({...formData, correctiveAction: e.target.value})} placeholder="..." />
                </div>
              </div>
            </div>

            {/* LTI */}
            <div>
              <InputLabel>{lang === 'ar' ? 'ساعات العمل الضائعة (LTI)' : 'Lost Time Hours (LTI)'}</InputLabel>
              <FormInput type="number" onChange={e => setFormData({...formData, lostTimeHours: e.target.value})} placeholder="0" />
            </div>
          </div>
        );
      case 'doc':
        return (
          <div className="space-y-6">
            {/* Basic Info */}
            <div className="grid grid-cols-2 gap-5">
              <div>
                <InputLabel>{lang === 'ar' ? 'رمز المستند' : 'Document Code'}</InputLabel>
                <FormInput required onChange={e => setFormData({...formData, code: e.target.value})} placeholder="DWG-AR-001" />
              </div>
              <div>
                <InputLabel>{lang === 'ar' ? 'الإصدار' : 'Version'}</InputLabel>
                <FormInput required onChange={e => setFormData({...formData, version: e.target.value})} placeholder="A0" />
              </div>
            </div>

            <div>
              <InputLabel>{lang === 'ar' ? 'عنوان المستند' : 'Document Title'}</InputLabel>
              <FormInput required onChange={e => setFormData({...formData, title: e.target.value})} placeholder={lang === 'ar' ? 'مخطط الدور الأرضي' : 'Ground Floor Plan'} />
            </div>

            {/* Classification */}
            <div className="grid grid-cols-2 gap-5">
              <div>
                <InputLabel>{lang === 'ar' ? 'التصنيف' : 'Category'}</InputLabel>
                <FormSelect onChange={e => setFormData({...formData, category: e.target.value})}>
                  <option value="Drawing">{lang === 'ar' ? 'مخطط' : 'Drawing'}</option>
                  <option value="RFI">{lang === 'ar' ? 'طلب استفسار (RFI)' : 'RFI'}</option>
                  <option value="Submittal">{lang === 'ar' ? 'اعتماد مواد' : 'Submittal'}</option>
                  <option value="Contract">{lang === 'ar' ? 'عقد' : 'Contract'}</option>
                  <option value="Report">{lang === 'ar' ? 'تقرير' : 'Report'}</option>
                  <option value="Specification">{lang === 'ar' ? 'مواصفات' : 'Specification'}</option>
                  <option value="Other">{lang === 'ar' ? 'أخرى' : 'Other'}</option>
                </FormSelect>
              </div>
              <div>
                <InputLabel>{lang === 'ar' ? 'نوع الملف' : 'File Type'}</InputLabel>
                <FormSelect onChange={e => setFormData({...formData, type: e.target.value})}>
                  <option value="PDF">PDF</option>
                  <option value="DWG">DWG (AutoCAD)</option>
                  <option value="XLSX">Excel</option>
                  <option value="DOCX">Word</option>
                  <option value="JPG">Image</option>
                </FormSelect>
              </div>
            </div>

            {/* Status & Date */}
            <div className="grid grid-cols-2 gap-5">
              <div>
                <InputLabel>{t.status}</InputLabel>
                <FormSelect onChange={e => setFormData({...formData, status: e.target.value})}>
                  <option value="Pending">{lang === 'ar' ? 'قيد المراجعة' : 'Pending'}</option>
                  <option value="Approved">{lang === 'ar' ? 'معتمد' : 'Approved'}</option>
                  <option value="Rejected">{lang === 'ar' ? 'مرفوض' : 'Rejected'}</option>
                  <option value="Superseded">{lang === 'ar' ? 'ملغى (نسخة قديمة)' : 'Superseded'}</option>
                </FormSelect>
              </div>
              <div>
                <InputLabel>{t.date}</InputLabel>
                <FormInput type="date" required onChange={e => setFormData({...formData, date: e.target.value})} />
              </div>
            </div>

            {/* Description */}
            <div>
              <InputLabel>{lang === 'ar' ? 'الوصف / ملاحظات' : 'Description / Notes'}</InputLabel>
              <FormTextarea rows={3} onChange={e => setFormData({...formData, description: e.target.value})} placeholder="..." />
            </div>

            {/* File Upload Mock */}
            <div className="border-2 border-dashed border-slate-200 rounded-2xl p-8 text-center hover:bg-slate-50 transition-colors cursor-pointer">
              <div className="w-12 h-12 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center mx-auto mb-3">
                <Upload size={24} />
              </div>
              <p className="text-sm font-bold text-slate-600">{lang === 'ar' ? 'اضغط لرفع الملف' : 'Click to upload file'}</p>
              <p className="text-xs text-slate-400 mt-1">PDF, DWG, XLSX (Max 50MB)</p>
            </div>
          </div>
        );
      case 'expense':
        return (
          <div className="space-y-6">
            <div>
              <InputLabel>{lang === 'ar' ? 'وصف المصروف' : 'Expense Description'}</InputLabel>
              <FormInput required onChange={e => setFormData({...formData, description: e.target.value})} placeholder={lang === 'ar' ? 'شراء أسمنت' : 'Cement Purchase'} />
            </div>
            <div className="grid grid-cols-2 gap-5">
              <div>
                <InputLabel>{lang === 'ar' ? 'الفئة' : 'Category'}</InputLabel>
                <FormSelect onChange={e => setFormData({...formData, category: e.target.value})}>
                  <option value="Material">{lang === 'ar' ? 'مواد' : 'Material'}</option>
                  <option value="Labor">{lang === 'ar' ? 'عمالة' : 'Labor'}</option>
                  <option value="Equipment">{lang === 'ar' ? 'معدات' : 'Equipment'}</option>
                  <option value="Subcontractor">{lang === 'ar' ? 'مقاول باطن' : 'Subcontractor'}</option>
                  <option value="Overhead">{lang === 'ar' ? 'مصاريف إدارية' : 'Overhead'}</option>
                </FormSelect>
              </div>
              <div>
                <InputLabel>{lang === 'ar' ? 'المبلغ (ر.س)' : 'Amount (SAR)'}</InputLabel>
                <FormInput type="number" required onChange={e => setFormData({...formData, amount: e.target.value})} placeholder="0.00" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-5">
              <div>
                <InputLabel>{lang === 'ar' ? 'المورد' : 'Vendor'}</InputLabel>
                <FormInput required onChange={e => setFormData({...formData, vendor: e.target.value})} placeholder={lang === 'ar' ? 'اسم المورد' : 'Vendor Name'} />
              </div>
              <div>
                <InputLabel>{t.date}</InputLabel>
                <FormInput type="date" required onChange={e => setFormData({...formData, date: e.target.value})} />
              </div>
            </div>
            <div>
              <InputLabel>{t.status}</InputLabel>
              <FormSelect onChange={e => setFormData({...formData, status: e.target.value})}>
                <option value="Pending">{lang === 'ar' ? 'قيد الانتظار' : 'Pending'}</option>
                <option value="Approved">{lang === 'ar' ? 'معتمد' : 'Approved'}</option>
                <option value="Paid">{lang === 'ar' ? 'مدفوع' : 'Paid'}</option>
                <option value="Rejected">{lang === 'ar' ? 'مرفوض' : 'Rejected'}</option>
              </FormSelect>
            </div>
          </div>
        );
      case 'resource':
        return (
          <div className="space-y-6">
            <div>
              <InputLabel>{lang === 'ar' ? 'اسم المورد' : 'Resource Name'}</InputLabel>
              <FormInput required onChange={e => setFormData({...formData, name: e.target.value})} placeholder={lang === 'ar' ? 'حديد تسليح 16مم' : 'Steel Rebar 16mm'} />
            </div>
            <div className="grid grid-cols-2 gap-5">
              <div>
                <InputLabel>{lang === 'ar' ? 'النوع' : 'Type'}</InputLabel>
                <FormSelect onChange={e => setFormData({...formData, type: e.target.value})}>
                  <option value="Material">{lang === 'ar' ? 'مواد' : 'Material'}</option>
                  <option value="Labor">{lang === 'ar' ? 'عمالة' : 'Labor'}</option>
                  <option value="Equipment">{lang === 'ar' ? 'معدات' : 'Equipment'}</option>
                </FormSelect>
              </div>
              <div>
                <InputLabel>{lang === 'ar' ? 'الوحدة' : 'Unit'}</InputLabel>
                <FormInput required onChange={e => setFormData({...formData, unit: e.target.value})} placeholder={lang === 'ar' ? 'طن / ساعة / يوم' : 'Ton / Hour / Day'} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-5">
              <div>
                <InputLabel>{lang === 'ar' ? 'الكمية الإجمالية' : 'Total Quantity'}</InputLabel>
                <FormInput type="number" required onChange={e => setFormData({...formData, totalQuantity: e.target.value})} placeholder="0" />
              </div>
              <div>
                <InputLabel>{lang === 'ar' ? 'تكلفة الوحدة (ر.س)' : 'Unit Cost (SAR)'}</InputLabel>
                <FormInput type="number" required onChange={e => setFormData({...formData, unitCost: e.target.value})} placeholder="0.00" />
              </div>
            </div>
            <div>
              <InputLabel>{lang === 'ar' ? 'الكمية المستخدمة' : 'Used Quantity'}</InputLabel>
              <FormInput type="number" required onChange={e => setFormData({...formData, usedQuantity: e.target.value})} placeholder="0" />
            </div>
          </div>
        );
      case 'timesheet':
        return (
          <div className="space-y-6">
            <div>
              <InputLabel>{lang === 'ar' ? 'اسم الموظف' : 'Employee Name'}</InputLabel>
              <FormInput required onChange={e => setFormData({...formData, employee: e.target.value})} placeholder={lang === 'ar' ? 'أحمد علي' : 'Ahmed Ali'} />
            </div>
            <div className="grid grid-cols-2 gap-5">
              <div>
                <InputLabel>{lang === 'ar' ? 'الدور الوظيفي' : 'Role'}</InputLabel>
                <FormInput required onChange={e => setFormData({...formData, role: e.target.value})} placeholder={lang === 'ar' ? 'مهندس موقع' : 'Site Engineer'} />
              </div>
              <div>
                <InputLabel>{lang === 'ar' ? 'المشروع' : 'Project'}</InputLabel>
                <FormSelect onChange={e => setFormData({...formData, project: e.target.value})}>
                  {projects.map(p => (
                    <option key={p.id} value={p.code}>{p.name}</option>
                  ))}
                </FormSelect>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-5">
              <div>
                <InputLabel>{t.date}</InputLabel>
                <FormInput type="date" required onChange={e => setFormData({...formData, date: e.target.value})} />
              </div>
              <div>
                <InputLabel>{lang === 'ar' ? 'ساعات العمل' : 'Hours'}</InputLabel>
                <FormInput type="number" required onChange={e => setFormData({...formData, hours: e.target.value})} placeholder="8" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-5">
              <div>
                <InputLabel>{lang === 'ar' ? 'ساعات إضافية' : 'Overtime'}</InputLabel>
                <FormInput type="number" onChange={e => setFormData({...formData, overtime: e.target.value})} placeholder="0" />
              </div>
              <div>
                <InputLabel>{t.status}</InputLabel>
                <FormSelect onChange={e => setFormData({...formData, status: e.target.value})}>
                  <option value="Pending">{lang === 'ar' ? 'قيد الانتظار' : 'Pending'}</option>
                  <option value="Approved">{lang === 'ar' ? 'معتمد' : 'Approved'}</option>
                  <option value="Rejected">{lang === 'ar' ? 'مرفوض' : 'Rejected'}</option>
                </FormSelect>
              </div>
            </div>
            <div>
              <InputLabel>{lang === 'ar' ? 'النشاط / الوصف' : 'Activity / Description'}</InputLabel>
              <FormTextarea rows={3} onChange={e => setFormData({...formData, activity: e.target.value})} placeholder="..." />
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
