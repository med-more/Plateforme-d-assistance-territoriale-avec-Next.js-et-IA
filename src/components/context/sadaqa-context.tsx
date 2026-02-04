"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { Moon } from "lucide-react";

interface SadaqaContextType {
  activeDocument: string | null;
  activeFamily: string | null;
  isStreaming: boolean;
  setActiveDocument: (doc: string | null) => void;
  setActiveFamily: (family: string | null) => void;
  setIsStreaming: (streaming: boolean) => void;
}

const SadaqaContext = createContext<SadaqaContextType | undefined>(undefined);

export function SadaqaProvider({ children }: { children: React.ReactNode }) {
  const [activeDocument, setActiveDocument] = useState<string | null>(null);
  const [activeFamily, setActiveFamily] = useState<string | null>(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <SadaqaContext.Provider
      value={{
        activeDocument,
        activeFamily,
        isStreaming,
        setActiveDocument,
        setActiveFamily,
        setIsStreaming,
      }}
    >
      {children}
      {mounted && isStreaming && (
        <div className="fixed bottom-6 right-6 z-50">
          <div className="flex items-center gap-3 px-4 py-3 bg-openai-darker border border-openai-gray rounded-lg">
            <Moon className="w-5 h-5 text-openai-green" />
            <span className="text-sm text-openai-text font-medium">
              Assistant Sadaqa réfléchit...
            </span>
          </div>
        </div>
      )}
    </SadaqaContext.Provider>
  );
}

export function useSadaqa() {
  const context = useContext(SadaqaContext);
  if (context === undefined) {
    throw new Error("useSadaqa must be used within a SadaqaProvider");
  }
  return context;
}
