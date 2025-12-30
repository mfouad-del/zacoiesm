import React from 'react';
import { Menu, Search, Bell, Globe, User, ChevronDown } from 'lucide-react';
import { Language } from '../types';
import { TRANSLATIONS } from '../constants';

interface HeaderProps {
  lang: Language;
  setLang: (lang: Language) => void;
  setSidebarOpen: (open: boolean | ((prev: boolean) => boolean)) => void;
  isSidebarOpen: boolean;
}

const Header: React.FC<HeaderProps> = ({ lang, setLang, setSidebarOpen, isSidebarOpen }) => {
  const t = TRANSLATIONS[lang];

  return (
    <header className="h-20 bg-white/80 backdrop-blur-md border-b border-slate-200/60 flex items-center justify-between px-6 md:px-8 flex-shrink-0 z-30 sticky top-0">
      <div className="flex items-center gap-6">
        <button 
          onClick={() => setSidebarOpen(prev => !prev)}
          className="p-2.5 hover:bg-slate-100 rounded-xl text-slate-500 transition-all active:scale-90"
        >
          <Menu size={22} strokeWidth={2.5} />
        </button>
        
        <div className="hidden md:flex items-center bg-slate-100/80 border border-slate-200/50 rounded-2xl px-4 py-2 w-72 lg:w-[450px] transition-all focus-within:w-80 lg:focus-within:w-[500px] focus-within:ring-4 focus-within:ring-brand-500/10 group">
          <Search size={18} className="text-slate-400 group-focus-within:text-brand-500 transition-colors" />
          <input 
            type="text" 
            placeholder={t.search} 
            className={`bg-transparent border-none focus:ring-0 text-sm font-medium ${lang === 'ar' ? 'mr-3 text-right' : 'ml-3 text-left'} w-full outline-none placeholder:text-slate-400`}
          />
        </div>
      </div>
      
      <div className="flex items-center gap-3 md:gap-5">
        <button 
          onClick={() => setLang(lang === 'en' ? 'ar' : 'en')}
          className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-all border border-slate-200/60 hover:border-slate-300 active:scale-95"
        >
          <Globe size={18} className="text-brand-500" />
          <span className="hidden sm:inline">{lang === 'en' ? 'العربية' : 'English'}</span>
        </button>
        
        <div className="relative group">
          <button className="p-3 text-slate-500 hover:bg-slate-100 rounded-xl transition-all relative active:scale-90">
            <Bell size={22} />
            <span className="absolute top-2.5 right-2.5 w-2.5 h-2.5 bg-rose-500 rounded-full border-2 border-white animate-pulse"></span>
          </button>
        </div>
        
        <div className="w-[1.5px] h-8 bg-slate-200/80 mx-1 hidden md:block"></div>
        
        <button className="flex items-center gap-3 p-1.5 md:pr-4 hover:bg-slate-100 rounded-2xl transition-all group active:scale-95 border border-transparent hover:border-slate-200">
          <div className="w-10 h-10 bg-gradient-to-br from-brand-500 to-indigo-600 rounded-xl flex items-center justify-center text-white shadow-md shadow-brand-500/20 group-hover:rotate-3 transition-transform">
             <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Ahmed" alt="User" className="w-full h-full rounded-xl object-cover" />
          </div>
          <div className={`hidden lg:flex flex-col ${lang === 'ar' ? 'text-right' : 'text-left'}`}>
            <p className="text-sm font-black text-slate-800 leading-none">{lang === 'ar' ? 'م. أحمد علي' : 'Eng. Ahmed Ali'}</p>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1.5">{lang === 'ar' ? 'مدير النظام' : 'Super Admin'}</p>
          </div>
          <ChevronDown size={14} className="text-slate-400 hidden lg:block group-hover:translate-y-0.5 transition-transform" />
        </button>
      </div>
    </header>
  );
};

export default Header;
