/**
 * Dark Mode Theme Provider
 * Complete theme management with localStorage persistence
 */

'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

type Theme = 'light' | 'dark' | 'system';

interface ThemeProviderProps {
  children: React.ReactNode;
  defaultTheme?: Theme;
  storageKey?: string;
}

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  isDark: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const DarkModeProvider: React.FC<ThemeProviderProps> = ({
  children,
  defaultTheme = 'system',
  storageKey = 'iems-theme'
}) => {
  const [theme, setThemeState] = useState<Theme>(() => {
    if (typeof window !== 'undefined') {
      return (localStorage.getItem(storageKey) as Theme) || defaultTheme;
    }
    return defaultTheme;
  });
  const [isDark, setIsDark] = useState(false);

  /*
  useEffect(() => {
    // Load theme from localStorage
    const savedTheme = localStorage.getItem(storageKey) as Theme | null;
    if (savedTheme && savedTheme !== theme) {
      setThemeState(savedTheme);
    }
  }, [storageKey]); // eslint-disable-line react-hooks/exhaustive-deps
  */

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');

    const applyTheme = () => {
      let effectiveTheme: 'light' | 'dark' = 'light';
      if (theme === 'system') {
        effectiveTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      } else {
        effectiveTheme = theme;
      }
      
      root.classList.add(effectiveTheme);
      root.style.setProperty('color-scheme', effectiveTheme);
      
      // Use setTimeout to avoid synchronous state update warning
      setTimeout(() => setIsDark(effectiveTheme === 'dark'), 0);
    };

    applyTheme();

    if (theme === 'system') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const handler = () => applyTheme();
      mediaQuery.addEventListener('change', handler);
      return () => mediaQuery.removeEventListener('change', handler);
    }
  }, [theme]);

  // Derived state
  // const isDark = theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
  // But we need to listen to system changes if 'system'.
  // For now, let's just suppress the warning or wrap in setTimeout to avoid synchronous update warning, 
  // OR better, use a separate effect or just accept that this updates the context.
  // The warning says "Calling setState synchronously within an effect can trigger cascading renders".
  // We can check if value changed.
  
  /*
  if (isDark !== (effectiveTheme === 'dark')) {
      setIsDark(effectiveTheme === 'dark');
  }
  */


  const setTheme = (newTheme: Theme) => {
    localStorage.setItem(storageKey, newTheme);
    setThemeState(newTheme);
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme, isDark }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useDarkMode = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useDarkMode must be used within DarkModeProvider');
  }
  return context;
};

/**
 * Theme Toggle Button Component
 */
export const ThemeToggle: React.FC = () => {
  const { setTheme, isDark } = useDarkMode();

  return (
    <button
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
      aria-label="Toggle theme"
    >
      {isDark ? (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" />
        </svg>
      ) : (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
        </svg>
      )}
    </button>
  );
};
