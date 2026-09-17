'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

interface AccessibilityContextType {
  easyMode: boolean;
  setEasyMode: (val: boolean) => void;
  highContrast: boolean;
  setHighContrast: (val: boolean) => void;
  fontSize: 'default' | 'large' | 'xlarge';
  setFontSize: (size: 'default' | 'large' | 'xlarge') => void;
}

const AccessibilityContext = createContext<AccessibilityContextType>({
  easyMode: false,
  setEasyMode: () => {},
  highContrast: false,
  setHighContrast: () => {},
  fontSize: 'default',
  setFontSize: () => {},
});

export function AccessibilityProvider({ children }: { children: React.ReactNode }) {
  const [easyMode, setEasyModeState] = useState<boolean>(false);
  const [highContrast, setHighContrastState] = useState<boolean>(false);
  const [fontSize, setFontSizeState] = useState<'default' | 'large' | 'xlarge'>('default');

  useEffect(() => {
    try {
      const savedEasy = localStorage.getItem('carepath_easy_mode');
      if (savedEasy) setEasyModeState(JSON.parse(savedEasy));

      const savedContrast = localStorage.getItem('carepath_high_contrast');
      if (savedContrast) setHighContrastState(JSON.parse(savedContrast));

      const savedFont = localStorage.getItem('carepath_font_size') as any;
      if (savedFont) setFontSizeState(savedFont);
    } catch {}
  }, []);

  const setEasyMode = (val: boolean) => {
    setEasyModeState(val);
    localStorage.setItem('carepath_easy_mode', JSON.stringify(val));
    if (val) {
      document.documentElement.classList.add('easy-mode');
    } else {
      document.documentElement.classList.remove('easy-mode');
    }
  };

  const setHighContrast = (val: boolean) => {
    setHighContrastState(val);
    localStorage.setItem('carepath_high_contrast', JSON.stringify(val));
    if (val) {
      document.documentElement.classList.add('high-contrast');
    } else {
      document.documentElement.classList.remove('high-contrast');
    }
  };

  const setFontSize = (size: 'default' | 'large' | 'xlarge') => {
    setFontSizeState(size);
    localStorage.setItem('carepath_font_size', size);
  };

  return (
    <AccessibilityContext.Provider
      value={{
        easyMode,
        setEasyMode,
        highContrast,
        setHighContrast,
        fontSize,
        setFontSize,
      }}
    >
      <div
        className={`min-h-screen transition-colors ${
          easyMode ? 'text-lg font-medium' : ''
        } ${highContrast ? 'contrast-125' : ''}`}
      >
        {children}
      </div>
    </AccessibilityContext.Provider>
  );
}

export function useAccessibility() {
  return useContext(AccessibilityContext);
}
