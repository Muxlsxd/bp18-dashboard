"use client";

import { createContext, useContext, useEffect, useRef, useState, ReactNode } from "react";

type Theme = "dark" | "light";
const ThemeCtx = createContext<{ theme: Theme; toggle: () => void }>({ theme: "dark", toggle: () => {} });

function readInitialTheme(): Theme {
  if (typeof window === "undefined") return "dark";
  try {
    return (localStorage.getItem("bp18-theme") as Theme) || "dark";
  } catch {
    return "dark";
  }
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>(readInitialTheme);
  const inited = useRef(false);

  useEffect(() => {
    if (inited.current) return;
    inited.current = true;
    document.documentElement.dataset.theme = theme;
    try {
      localStorage.setItem("bp18-theme", theme);
    } catch {
      /* ignore */
    }
  }, [theme]);

  const toggle = () => {
    setTheme((t) => {
      const next = t === "dark" ? "light" : "dark";
      document.documentElement.dataset.theme = next;
      try {
        localStorage.setItem("bp18-theme", next);
      } catch {
        /* ignore */
      }
      return next;
    });
  };

  return <ThemeCtx.Provider value={{ theme, toggle }}>{children}</ThemeCtx.Provider>;
}

export function useTheme() {
  return useContext(ThemeCtx);
}
