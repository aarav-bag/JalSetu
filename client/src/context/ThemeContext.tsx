import React, { createContext, useContext, useState, useEffect } from 'react';

type ThemeContextType = {
  darkMode: boolean;
  toggleDarkMode: () => void;
  animationsEnabled: boolean;
  toggleAnimations: () => void;
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const isNightTime = () => {
  const h = new Date().getHours();
  return h >= 20 || h < 6; // 8 PM to 6 AM = night
};

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('darkMode');
    // If user has never set a preference, auto-detect from time
    if (saved === null) return isNightTime();
    return JSON.parse(saved);
  });

  const [animationsEnabled, setAnimationsEnabled] = useState(() => {
    const saved = localStorage.getItem('animationsEnabled');
    return saved ? JSON.parse(saved) : true;
  });

  // Auto-switch to dark at night — runs every minute
  useEffect(() => {
    const checkTime = () => {
      const night = isNightTime();
      const saved = localStorage.getItem('darkMode');
      // Only auto-switch if the user hasn't manually set a preference
      // OR if we are crossing the night/day boundary automatically
      if (saved === null || saved === 'auto') {
        setDarkMode(night);
      }
    };

    // Check immediately on mount too
    const hour = new Date().getHours();
    if (hour === 20 || hour === 6) {
      // We're right at the boundary — trigger auto-switch
      setDarkMode(isNightTime());
    }

    const interval = setInterval(checkTime, 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  // Apply dark class to <html>
  useEffect(() => {
    localStorage.setItem('darkMode', JSON.stringify(darkMode));
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  useEffect(() => {
    localStorage.setItem('animationsEnabled', JSON.stringify(animationsEnabled));
    if (animationsEnabled) {
      document.documentElement.classList.remove('reduce-motion');
    } else {
      document.documentElement.classList.add('reduce-motion');
    }
  }, [animationsEnabled]);

  const toggleDarkMode = () => setDarkMode((prev: boolean) => !prev);
  const toggleAnimations = () => setAnimationsEnabled((prev: boolean) => !prev);

  return (
    <ThemeContext.Provider value={{ darkMode, toggleDarkMode, animationsEnabled, toggleAnimations }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
