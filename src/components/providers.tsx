"use client";

import { ThemeProvider } from "./context/theme-context";
import { SadaqaProvider } from "./context/sadaqa-context";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <SadaqaProvider>
        {children}
      </SadaqaProvider>
    </ThemeProvider>
  );
}
