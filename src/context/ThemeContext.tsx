"use client";

import type React from "react";
import { createContext, useState, useContext, useEffect } from "react";

type Theme = "light" | "dark";

type ThemeContextType = {
  theme: Theme;
  toggleTheme: () => void;
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  // Force le thème à toujours être light
  const [theme] = useState<Theme>("light");
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    // Initialisation côté client - toujours en mode light
    setIsInitialized(true);
  }, []);

  useEffect(() => {
    if (isInitialized) {
      // Force le mode light en supprimant toujours la classe dark
      document.documentElement.classList.remove("dark");
      // Supprime aussi du localStorage pour éviter tout conflit
      localStorage.removeItem("theme");
    }
  }, [isInitialized]);

  // Fonction toggleTheme désactivée - ne fait rien
  const toggleTheme = () => {
    // Ne fait rien - le thème reste toujours light
    console.log("Theme switching is disabled - always light mode");
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};
