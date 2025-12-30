import React from 'react';
import { Language } from '../types';
import { TRANSLATIONS } from '../constants';
import { User, Shield, Bell, Globe, Mail, Save } from 'lucide-react';

const SettingsView: React.FC<{ lang: Language }> = ({ lang }) => {
  const t = TRANSLATIONS[lang];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">{t.settings}</h1>
        <p className="text-gray-500 text-sm">{lang === 'ar' ? 'إدارة تفضيلات النظام والمستخدمين.' : 'Manage system preferences and users.'}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-1 space-y-2">
          {[
            { icon: <User size={18} />, label: lang === 'ar' ? 'الملف الشخصي' : 'Profile' },
            { icon: <Shield size={18} />, label: t.userManagement },
            { icon: <Bell size={18} />, label: lang === 'ar' ? 'الإشعارات' : 'Notifications' },
            { icon: <Globe size={18} />, label: lang === 'ar' ? 'اللغة والموقع' : 'Language & Region' },
          ].map((item, i) => (
            <button key={i} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors
              ${i === 0 ? 'bg-blue-50 text-blue-600' : 'text-gray-500 hover:bg-gray-100'}`}>
              {item.icon}
              {item.label}
            </button>
          ))}
        </div>

        <div className="lg:col-span-3 space-y-6">
          <div className="bg-white p-8 rounded-2xl border border-gray-200 shadow-sm">
            <h3 className="text-lg font-bold mb-8 border-b pb-4">{lang === 'ar' ? 'إعدادات الحساب' : 'Account Settings'}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">{lang === 'ar' ? 'الاسم بالكامل' : 'Full Name'}</label>
                <div className="relative">
                  <User size={16} className={`absolute ${lang === 'ar' ? 'right-3' : 'left-3'} top-1/2 -translate-y-1/2 text-gray-400`} />
                  <input type="text" defaultValue="Eng. Ahmed Ali" className={`w-full ${lang === 'ar' ? 'pr-10' : 'pl-10'} p-3 border rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-100`} />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">{t.email}</label>
                <div className="relative">
                  <Mail size={16} className={`absolute ${lang === 'ar' ? 'right-3' : 'left-3'} top-1/2 -translate-y-1/2 text-gray-400`} />
                  <input type="email" defaultValue="ahmed.ali@iems.pro" className={`w-full ${lang === 'ar' ? 'pr-10' : 'pl-10'} p-3 border rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-100`} />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">{t.role}</label>
                <select className="w-full p-3 border rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-100 bg-gray-50" disabled>
                  <option>Project Manager</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end pt-4">
              <button className="flex items-center gap-2 px-8 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 shadow-lg shadow-blue-500/20">
                <Save size={18} />
                {t.save}
              </button>
            </div>
          </div>

          <div className="bg-white p-8 rounded-2xl border border-gray-200 shadow-sm">
            <h3 className="text-lg font-bold mb-6">{t.userManagement}</h3>
            <div className="space-y-4">
              {[
                { name: 'Khaled Omar', role: 'Site Engineer', email: 'khaled@iems.pro' },
                { name: 'Sarah Wilson', role: 'QC Manager', email: 'sarah.w@iems.pro' },
              ].map((user, i) => (
                <div key={i} className="flex items-center justify-between p-4 border rounded-xl hover:bg-gray-50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center font-bold">{user.name[0]}</div>
                    <div>
                      <p className="text-sm font-bold text-gray-900">{user.name}</p>
                      <p className="text-xs text-gray-400">{user.email}</p>
                    </div>
                  </div>
                  <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-lg text-xs font-bold uppercase">{user.role}</span>
                </div>
              ))}
              <button className="w-full py-3 border-2 border-dashed border-gray-200 rounded-xl text-gray-400 font-bold hover:bg-gray-50 hover:border-blue-200 hover:text-blue-500 transition-all">
                + {lang === 'ar' ? 'إضافة مستخدم جديد' : 'Add New User'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsView;
