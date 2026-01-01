import React, { useState, useEffect } from 'react';
import { Menu, Search, Globe, User as UserIcon, ChevronDown, Settings, LogOut, UserCircle, Bell } from 'lucide-react';
import { Language, User } from '../types';
import { TRANSLATIONS } from '../constants';
import NotificationsPanel from './NotificationsPanel';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { globalSearchService, SearchResult } from '@/lib/search/global.service';
import { debounce } from '@/lib/performance/optimization';

interface HeaderProps {
  lang: Language;
  setLang: (lang: Language) => void;
  setSidebarOpen: (open: boolean | ((prev: boolean) => boolean)) => void;
  isSidebarOpen: boolean;
  user: User;
  onSearch: (query: string) => void;
  onNavigate: (module: string) => void;
  onLogout: () => void;
}

const Header: React.FC<HeaderProps> = ({ 
  lang, 
  setLang, 
  setSidebarOpen, 
  isSidebarOpen: _isSidebarOpen, 
  user, 
  onSearch,
  onNavigate,
  onLogout
}) => {
  const t = TRANSLATIONS[lang];
  const [openSearch, setOpenSearch] = useState(false);
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setOpenSearch((open) => !open)
      }
    }
    document.addEventListener("keydown", down)
    return () => document.removeEventListener("keydown", down)
  }, [])

  const performSearch = React.useMemo(
    () => debounce(async (query: string) => {
      if (query.length < 2) {
        setSearchResults([]);
        return;
      }
      try {
        const results = await globalSearchService.search(query);
        setSearchResults(results);
      } catch (error) {
        console.error('Search error:', error);
      }
    }, 300),
    []
  );

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    performSearch(value);
    onSearch(value); // Keep original prop for backward compatibility if needed
  };

  const handleSelectResult = (result: SearchResult) => {
    setOpenSearch(false);
    // Navigate to result
    console.log('Navigate to:', result.url);
    // In a real app: router.push(result.url);
  };

  return (
    <header className="h-20 bg-white/80 backdrop-blur-md border-b border-slate-200/60 flex items-center justify-between px-6 md:px-8 flex-shrink-0 z-30 sticky top-0">
      <div className="flex items-center gap-6">
        <button 
          onClick={() => setSidebarOpen(prev => !prev)}
          className="p-2.5 hover:bg-slate-100 rounded-xl text-slate-500 transition-all active:scale-90"
        >
          <Menu size={22} strokeWidth={2.5} />
        </button>
        
        <div 
          className="hidden md:flex items-center bg-slate-100/80 border border-slate-200/50 rounded-2xl px-4 py-2 w-72 lg:w-[450px] transition-all cursor-text group hover:bg-slate-100"
          onClick={() => setOpenSearch(true)}
        >
          <Search size={18} className="text-slate-400 group-hover:text-brand-500 transition-colors" />
          <span className={`text-sm font-medium text-slate-400 ${lang === 'ar' ? 'mr-3' : 'ml-3'}`}>
            {t.search}... <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100 ml-2">
              <span className="text-xs">⌘</span>K
            </kbd>
          </span>
        </div>

        <CommandDialog open={openSearch} onOpenChange={setOpenSearch}>
          <CommandInput 
            placeholder={lang === 'ar' ? 'ابحث عن المشاريع، المهام، المستندات...' : 'Search projects, tasks, documents...'} 
            value={searchQuery}
            onValueChange={handleSearchChange}
          />
          <CommandList>
            <CommandEmpty>{lang === 'ar' ? 'لا توجد نتائج.' : 'No results found.'}</CommandEmpty>
            {searchResults.length > 0 && (
              <CommandGroup heading={lang === 'ar' ? 'النتائج' : 'Results'}>
                {searchResults.map((result) => (
                  <CommandItem key={result.id} onSelect={() => handleSelectResult(result)}>
                    <Search className="mr-2 h-4 w-4" />
                    <span>{result.title}</span>
                    {result.description && <span className="ml-2 text-slate-400 text-xs">- {result.description}</span>}
                  </CommandItem>
                ))}
              </CommandGroup>
            )}
            {searchResults.length === 0 && (
              <CommandGroup heading={lang === 'ar' ? 'مقترحات' : 'Suggestions'}>
                <CommandItem onSelect={() => setOpenSearch(false)}>
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Settings</span>
                </CommandItem>
                <CommandItem onSelect={() => setOpenSearch(false)}>
                  <UserCircle className="mr-2 h-4 w-4" />
                  <span>Profile</span>
                </CommandItem>
                <CommandItem onSelect={() => setOpenSearch(false)}>
                  <Bell className="mr-2 h-4 w-4" />
                  <span>Notifications</span>
                </CommandItem>
              </CommandGroup>
            )}
          </CommandList>
        </CommandDialog>
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
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-3 p-1.5 md:pr-4 hover:bg-slate-100 rounded-2xl transition-all group active:scale-95 border border-transparent hover:border-slate-200 outline-none">
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
          </DropdownMenuTrigger>
          <DropdownMenuContent align={lang === 'ar' ? 'start' : 'end'} className="w-56">
            <DropdownMenuLabel>{lang === 'ar' ? 'حسابي' : 'My Account'}</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => onNavigate('settings')} className="cursor-pointer">
              <UserCircle className="mr-2 h-4 w-4" />
              <span>{lang === 'ar' ? 'الملف الشخصي' : 'Profile'}</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onNavigate('settings')} className="cursor-pointer">
              <Settings className="mr-2 h-4 w-4" />
              <span>{lang === 'ar' ? 'الإعدادات' : 'Settings'}</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-red-600 cursor-pointer" onClick={onLogout}>
              <LogOut className="mr-2 h-4 w-4" />
              <span>{lang === 'ar' ? 'تسجيل الخروج' : 'Log out'}</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
};

export default Header;
