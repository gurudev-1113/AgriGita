import React, { createContext, useState, useContext, useEffect } from 'react';
import { useColorScheme } from 'react-native';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const systemColorScheme = useColorScheme();
  const [isDarkMode, setIsDarkMode] = useState(systemColorScheme === 'dark');

  const toggleTheme = () => setIsDarkMode(prev => !prev);

  const theme = {
    isDarkMode,
    colors: isDarkMode ? darkPalette : lightPalette,
    toggleTheme
  };

  return (
    <ThemeContext.Provider value={theme}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);

const darkPalette = {
  background: '#0f172a',
  surface: '#1e293b',
  text: '#f8fafc',
  textSecondary: '#94a3b8',
  primary: '#22c55e',
  accent: '#06b6d4',
  border: '#334155',
  card: '#1e293b',
  tabBar: '#1e293b',
  active: '#22c55e',
  inactive: '#94a3b8',
};

const lightPalette = {
  background: '#f8fafc',
  surface: '#ffffff',
  text: '#0f172a',
  textSecondary: '#64748b',
  primary: '#16a34a',
  accent: '#0891b2',
  border: '#e2e8f0',
  card: '#ffffff',
  tabBar: '#ffffff',
  active: '#16a34a',
  inactive: '#64748b',
};
