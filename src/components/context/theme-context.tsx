"use client";

import { createContext, useContext, useEffect, useState } from "react";

type Theme = "dark" | "light";

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  // Initialize theme from the class already set by the inline script
  const [theme, setThemeState] = useState<Theme>(() => {
    if (typeof window === "undefined") return "dark";
    const root = document.documentElement;
    if (root.classList.contains("light")) return "light";
    if (root.classList.contains("dark")) return "dark";
    return "dark";
  });
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    
    // Sync with localStorage if it exists
    if (typeof window !== "undefined") {
      const savedTheme = localStorage.getItem("theme") as Theme;
      if (savedTheme && (savedTheme === "dark" || savedTheme === "light")) {
        if (savedTheme !== theme) {
          setThemeState(savedTheme);
        }
      }
    }
  }, []);

  useEffect(() => {
    if (!mounted || typeof window === "undefined") return;
    
    const root = document.documentElement;
    // Use setTimeout to ensure this runs after React hydration
    const timeoutId = setTimeout(() => {
      root.classList.remove("dark", "light");
      root.classList.add(theme);
      localStorage.setItem("theme", theme);
    }, 0);
    
    return () => clearTimeout(timeoutId);
  }, [theme, mounted]);

  const toggleTheme = () => {
    setThemeState((prev) => (prev === "dark" ? "light" : "dark"));
  };

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
  };

  // Always provide the context, even before mounting
  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}
