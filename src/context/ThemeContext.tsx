import React, { createContext, useContext, useState, useEffect } from 'react';

export type ThemeType = 'light' | 'dark' | 'system-rpg';

interface ThemeContextType {
  theme: ThemeType;
  setTheme: (theme: ThemeType) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<ThemeType>(() => {
    const saved = localStorage.getItem('rpg_theme') as ThemeType;
    return saved || 'system-rpg'; // System RPG Mode is default
  });

  const setTheme = (newTheme: ThemeType) => {
    setThemeState(newTheme);
    localStorage.setItem('rpg_theme', newTheme);
  };

  useEffect(() => {
    const root = window.document.documentElement;
    
    // Remove all theme classes first
    root.classList.remove('light', 'dark', 'system-rpg');
    
    // Add correct class
    if (theme === 'light') {
      root.classList.add('light');
    } else if (theme === 'system-rpg') {
      root.classList.add('system-rpg');
      root.classList.add('dark'); // system-rpg builds on dark styles
    } else {
      root.classList.add('dark');
    }
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};
export default ThemeProvider;
