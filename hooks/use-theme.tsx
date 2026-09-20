'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { repository } from '@/lib/data/repository';

export type Theme = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: 'light',
  setTheme: () => {},
  toggleTheme: () => {},
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>('light');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    try {
      const savedTheme = localStorage.getItem('carepath_theme') as Theme | null;
      if (savedTheme === 'dark' || savedTheme === 'light') {
        applyTheme(savedTheme);
      } else {
        const user = repository.getCurrentUser();
        if (user?.theme) {
          applyTheme(user.theme);
        } else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
          applyTheme('dark');
        } else {
          applyTheme('light');
        }
      }
    } catch {
      applyTheme('light');
    }
  }, []);

  const applyTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
    try {
      localStorage.setItem('carepath_theme', newTheme);
      if (newTheme === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
      // Sync to user profile if logged in
      const user = repository.getCurrentUser();
      if (user && user.theme !== newTheme) {
        user.theme = newTheme;
        repository.saveCurrentUser(user);
      }
    } catch {}
  };

  const setTheme = (newTheme: Theme) => {
    applyTheme(newTheme);
  };

  const toggleTheme = () => {
    applyTheme(theme === 'dark' ? 'light' : 'dark');
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
