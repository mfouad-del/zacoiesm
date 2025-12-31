import React from 'react';
import { Menu, Search, Globe, User as UserIcon, ChevronDown } from 'lucide-react';
import { Language, User } from '../types';
import { TRANSLATIONS } from '../constants';
import NotificationsPanel from './NotificationsPanel';

interface HeaderProps {
  lang: Language;
  setLang: (lang: Language) => void;
  setSidebarOpen: (open: boolean | ((prev: boolean) => boolean)) => void;
  isSidebarOpen: boolean;
  user: User;
  onSearch: (query: string) => void;
}

const Header: React.FC<HeaderProps> = ({ lang, setLang, setSidebarOpen, isSidebarOpen: _isSidebarOpen, user, onSearch }) => {
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
            onChange={(e) => onSearch(e.target.value)}
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
          <NotificationsPanel lang={lang} userId={user.id} />
        </div>
        
        <div className="w-[1.5px] h-8 bg-slate-200/80 mx-1 hidden md:block"></div>
        
        <button className="flex items-center gap-3 p-1.5 md:pr-4 hover:bg-slate-100 rounded-2xl transition-all group active:scale-95 border border-transparent hover:border-slate-200">
          <div className="w-10 h-10 bg-gradient-to-br from-brand-500 to-indigo-600 rounded-xl flex items-center justify-center text-white shadow-md shadow-brand-500/20 group-hover:rotate-3 transition-transform overflow-hidden">
             {user.avatar ? (
               <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
             ) : (
               <UserIcon size={20} />
             )}
          </div>
          <div className={`hidden lg:flex flex-col ${lang === 'ar' ? 'text-right' : 'text-left'}`}>
            <p className="text-sm font-black text-slate-800 leading-none">{user.name}</p>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1.5">{user.role}</p>
          </div>
          <ChevronDown size={14} className="text-slate-400 hidden lg:block group-hover:translate-y-0.5 transition-transform" />
        </button>
      </div>
    </header>
  );
};

export default Header;
