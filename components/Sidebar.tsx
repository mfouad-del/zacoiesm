import React from 'react';
import { MENU_ITEMS, TRANSLATIONS } from '../constants';
import { Language, User, UserRole } from '../types';

interface SidebarProps {
  isOpen: boolean;
  activeModule: string;
  setActiveModule: (id: string) => void;
  lang: Language;
  user?: User;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, activeModule, setActiveModule, lang, user }) => {
  const t = TRANSLATIONS[lang];

  const getUserName = () => {
    return user?.name || (lang === 'ar' ? 'مستخدم' : 'User');
  };

  const getUserRole = () => {
    return user?.role || (lang === 'ar' ? 'عضو' : 'Member');
  };

  const getFilteredMenuItems = () => {
    if (!user) return MENU_ITEMS;

    if (user.role === UserRole.CLIENT_VIEWER) {
      return MENU_ITEMS.filter(item => 
        ['dashboard', 'projects', 'documents', 'site'].includes(item.id)
      );
    }
    
    if (user.role === UserRole.PROCUREMENT_MANAGER) {
       return MENU_ITEMS.filter(item => 
        ['dashboard', 'procurement', 'projects', 'contracts', 'costs', 'settings'].includes(item.id)
      );
    }

    return MENU_ITEMS;
  };

  const filteredItems = getFilteredMenuItems();

  return (
    <aside className={`sidebar-gradient text-slate-300 transition-all duration-300 ease-in-out z-40 relative flex flex-col border-slate-800 ${isOpen ? 'w-72' : 'w-20 overflow-hidden md:w-20'}`}>
      <div className="p-6 flex items-center justify-center h-24 shrink-0 border-b border-white/5 bg-white/5">
        {isOpen ? (
           <div className="w-full h-full flex items-center justify-center bg-white rounded-xl p-2 shadow-lg shadow-black/10">
             <img src={`${import.meta.env.BASE_URL}logo.png`} alt="IEMS Pro" className="w-full h-full object-contain" />
           </div>
        ) : (
          <div className="w-10 h-10 shrink-0 bg-white rounded-lg p-1">
             <img src={`${import.meta.env.BASE_URL}logo.png`} alt="Logo" className="w-full h-full object-contain" />
          </div>
        )}
      </div>
      
      <nav className="flex-1 px-3 space-y-1.5 py-6 overflow-y-auto">
        {filteredItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveModule(item.id)}
            className={`w-full flex items-center gap-4 px-3.5 py-3 rounded-xl transition-all duration-200 group relative
              ${activeModule === item.id 
                ? 'bg-brand-600 text-white shadow-lg shadow-brand-600/20' 
                : 'hover:bg-white/5 hover:text-white'}`}
          >
            <div className={`shrink-0 transition-transform duration-200 group-hover:scale-110 ${activeModule === item.id ? 'text-white' : 'text-slate-500 group-hover:text-brand-400'}`}>
              {item.icon}
            </div>
            {isOpen && <span className="font-semibold text-sm whitespace-nowrap">{t[item.labelKey as keyof typeof t]}</span>}
            
            {!isOpen && (
              <div className={`absolute ${lang === 'ar' ? 'right-full mr-4' : 'left-full ml-4'} px-3 py-1.5 bg-slate-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-all z-50 whitespace-nowrap shadow-xl border border-slate-800 pointer-events-none`}>
                {t[item.labelKey as keyof typeof t]}
              </div>
            )}
            
            {activeModule === item.id && (
              <div className={`absolute w-1.5 h-5 bg-brand-300 rounded-full ${lang === 'ar' ? '-right-1' : '-left-1'}`} />
            )}
          </button>
        ))}
      </nav>
      
      <div className="p-4 border-t border-white/5 bg-black/10">
        {isOpen ? (
          <div className="flex items-center gap-3 p-2">
            <div className="w-10 h-10 rounded-full border-2 border-brand-500/30 overflow-hidden shrink-0">
              <img src={user?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.email || 'User'}`} alt="User" className="w-full h-full object-cover" />
            </div>
            <div className="flex flex-col min-w-0">
              <p className="text-xs font-bold text-white truncate">{getUserName()}</p>
              <p className="text-[10px] text-slate-500 font-medium truncate uppercase tracking-tighter">{getUserRole()}</p>
            </div>
          </div>
        ) : (
          <div className="flex justify-center py-2">
             <div className="w-10 h-10 rounded-full border-2 border-brand-500/30 overflow-hidden shrink-0">
              <img src={user?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.email || 'User'}`} alt="User" className="w-full h-full object-cover" />
            </div>
          </div>
        )}
      </div>
    </aside>
  );
};

export default Sidebar;
