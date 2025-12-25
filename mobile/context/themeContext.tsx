import React, { createContext, useContext, useEffect, useState, ReactNode } from "react";

type ThemeType = "light" | "dark";

interface ThemeContextProps {
  theme: ThemeType;
  toggleTheme: () => void;
  setThemeExplicit: (value: ThemeType) => void;
}

const ThemeContext = createContext<ThemeContextProps | undefined>(undefined);

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const [theme, setTheme] = useState<ThemeType>("dark"); // default dark

  useEffect(() => {
    try {
      const stored = (global as any)?.localStorage?.getItem?.('app_theme');
      if (stored === 'light' || stored === 'dark') {
        setTheme(stored);
      }
    } catch (_e) { }
  }, []);

  useEffect(() => {
    try {
      (global as any)?.localStorage?.setItem?.('app_theme', theme);
    } catch (_e) { }
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  };

  const setThemeExplicit = (value: ThemeType) => {
    setTheme(value);
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setThemeExplicit }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const themeColors = {
  light: {
    background: '#f9fafb',
    card: '#ffffff',
    text: '#111827',
    textSecondary: '#6b7280',
    primary: '#8b5cf6',
    border: '#e5e7eb',
    success: '#10b981',
    error: '#ef4444',
  },
  dark: {
    background: '#111827',
    card: '#1f2937',
    text: '#f9fafb',
    textSecondary: '#9ca3af',
    primary: '#a78bfa',
    border: '#374151',
    success: '#34d399',
    error: '#f87171',
  }
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within ThemeProvider");
  }
  return {
    ...context,
    colors: themeColors[context.theme]
  };
};
