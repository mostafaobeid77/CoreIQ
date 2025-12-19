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
    } catch (_e) {}
  }, []);

  useEffect(() => {
    try {
      (global as any)?.localStorage?.setItem?.('app_theme', theme);
    } catch (_e) {}
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

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within ThemeProvider");
  }
  return context;
};
