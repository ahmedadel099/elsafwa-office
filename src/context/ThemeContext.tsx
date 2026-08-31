import React, { createContext, useContext, useState, useEffect } from 'react';

export type ThemePreset = 'emerald' | 'sapphire' | 'slate' | 'crimson';
export type ThemeMode = 'light' | 'dark';

interface ThemeContextType {
  themePreset: ThemePreset;
  themeMode: ThemeMode;
  setThemePreset: (preset: ThemePreset) => void;
  toggleThemeMode: () => void;
  setThemeMode: (mode: ThemeMode) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const THEME_PRESETS: Record<ThemePreset, {
  name_ar: string;
  name_en: string;
  primaryLight: string;
  primaryDark: string;
  gradientLight: string;
  gradientDark: string;
  accentGold: string;
  badgeBgLight: string;
  badgeBgDark: string;
}> = {
  emerald: {
    name_ar: '💎 الزمرد المصري والذهب',
    name_en: 'Egyptian Emerald & Gold',
    primaryLight: '#044E39',
    primaryDark: '#059669',
    gradientLight: 'linear-gradient(135deg, #044E39 0%, #065F46 60%, #022C20 100%)',
    gradientDark: 'linear-gradient(135deg, #065F46 0%, #044E39 60%, #022C20 100%)',
    accentGold: '#D4AF37',
    badgeBgLight: '#ECFDF5',
    badgeBgDark: '#064E3B'
  },
  sapphire: {
    name_ar: '🌌 الكحلي الملكي الرفيع',
    name_en: 'Royal Sapphire Navy',
    primaryLight: '#1E3A8A',
    primaryDark: '#2563EB',
    gradientLight: 'linear-gradient(135deg, #0A192F 0%, #1E3A8A 60%, #1E40AF 100%)',
    gradientDark: 'linear-gradient(135deg, #1E3A8A 0%, #1E40AF 60%, #0A192F 100%)',
    accentGold: '#F59E0B',
    badgeBgLight: '#EFF6FF',
    badgeBgDark: '#1E3A8A'
  },
  slate: {
    name_ar: '🏙️ الرمادي العصري الحديث',
    name_en: 'Modern Minimal Slate',
    primaryLight: '#0F172A',
    primaryDark: '#334155',
    gradientLight: 'linear-gradient(135deg, #0F172A 0%, #1E293B 60%, #334155 100%)',
    gradientDark: 'linear-gradient(135deg, #1E293B 0%, #334155 60%, #0F172A 100%)',
    accentGold: '#EAB308',
    badgeBgLight: '#F1F5F9',
    badgeBgDark: '#1E293B'
  },
  crimson: {
    name_ar: '🍷 العنابي والأسود الفاخر',
    name_en: 'Luxury Crimson Ruby',
    primaryLight: '#881337',
    primaryDark: '#BE123C',
    gradientLight: 'linear-gradient(135deg, #4C0519 0%, #881337 60%, #9F1239 100%)',
    gradientDark: 'linear-gradient(135deg, #881337 0%, #9F1239 60%, #4C0519 100%)',
    accentGold: '#F59E0B',
    badgeBgLight: '#FFF1F2',
    badgeBgDark: '#881337'
  }
};

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [themePreset, setThemePresetState] = useState<ThemePreset>(() => {
    return (localStorage.getItem('ELSafwa_Theme_Preset') as ThemePreset) || 'emerald';
  });

  const [themeMode, setThemeModeState] = useState<ThemeMode>(() => {
    return (localStorage.getItem('ELSafwa_Theme_Mode') as ThemeMode) || 'light';
  });

  useEffect(() => {
    localStorage.setItem('ELSafwa_Theme_Preset', themePreset);
    localStorage.setItem('ELSafwa_Theme_Mode', themeMode);

    const root = document.documentElement;
    if (themeMode === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }

    const preset = THEME_PRESETS[themePreset];
    const isDark = themeMode === 'dark';

    // Set Dynamic CSS Variables on Root
    root.style.setProperty('--bg-canvas', isDark ? '#070a12' : '#f8faf6');
    root.style.setProperty('--bg-card', isDark ? '#0f172a' : '#ffffff');
    root.style.setProperty('--text-main', isDark ? '#f8fafc' : '#0f172a');
    root.style.setProperty('--text-muted', isDark ? '#94a3b8' : '#64748b');
    root.style.setProperty('--border-main', isDark ? '#1e293b' : '#e2e8f0');
    root.style.setProperty('--primary-color', isDark ? preset.primaryDark : preset.primaryLight);
    root.style.setProperty('--primary-gradient', isDark ? preset.gradientDark : preset.gradientLight);
    root.style.setProperty('--accent-gold', preset.accentGold);
  }, [themePreset, themeMode]);

  const setThemePreset = (preset: ThemePreset) => {
    setThemePresetState(preset);
  };

  const toggleThemeMode = () => {
    setThemeModeState(prev => (prev === 'light' ? 'dark' : 'light'));
  };

  const setThemeMode = (mode: ThemeMode) => {
    setThemeModeState(mode);
  };

  return (
    <ThemeContext.Provider value={{
      themePreset,
      themeMode,
      setThemePreset,
      toggleThemeMode,
      setThemeMode
    }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useTheme must be used within ThemeProvider');
  return context;
};
