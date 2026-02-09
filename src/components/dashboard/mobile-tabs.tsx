"use client";

import { useState } from "react";
import { MessageSquare, FileText } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

interface MobileTabsProps {
  chat: React.ReactNode;
  explorer: React.ReactNode;
}

export function MobileTabs({ chat, explorer }: MobileTabsProps) {
  const [activeTab, setActiveTab] = useState<"chat" | "documents">("chat");

  return (
    <div className="flex flex-col h-full w-full lg:hidden" style={{ height: '100%', maxHeight: '100%' }}>
      {/* Content Area */}
      <div className="flex-1 min-h-0 overflow-hidden relative pt-16 sm:pt-20" style={{ paddingBottom: 'calc(4.5rem + env(safe-area-inset-bottom))' }}>
        <AnimatePresence mode="wait">
          {activeTab === "chat" ? (
            <motion.div
              key="chat"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.2, ease: [0.25, 0.1, 0.25, 1] }}
              className="absolute inset-0 h-full w-full"
            >
              {chat}
            </motion.div>
          ) : (
            <motion.div
              key="documents"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2, ease: [0.25, 0.1, 0.25, 1] }}
              className="absolute inset-0 h-full w-full overflow-y-auto"
            >
              {explorer}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Bottom Tab Navigation - Fixed at bottom with safe area */}
      <div className="flex-shrink-0 border-t border-openai-gray/30 bg-openai-dark/95 backdrop-blur-sm fixed bottom-0 left-0 right-0 z-50 shadow-[0_-4px_20px_rgba(0,0,0,0.3)]" style={{ paddingBottom: 'max(0.5rem, env(safe-area-inset-bottom))' }}>
        <div className="flex items-center justify-around px-2 py-2.5 max-w-md mx-auto">
          {/* Chat Tab */}
          <button
            onClick={() => setActiveTab("chat")}
            className={cn(
              "flex flex-col items-center justify-center gap-1 px-4 py-2 rounded-lg transition-all duration-200 min-w-[80px] relative",
              activeTab === "chat"
                ? "bg-openai-green/10 text-openai-green"
                : "text-openai-text-muted hover:text-openai-text hover:bg-openai-darker/50"
            )}
          >
            <MessageSquare
              className={cn(
                "w-5 h-5 transition-transform duration-200",
                activeTab === "chat" && "scale-110"
              )}
            />
            <span className="text-[10px] font-medium uppercase tracking-wide">
              Chat
            </span>
            {activeTab === "chat" && (
              <motion.div
                layoutId="mobileActiveTab"
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-openai-green rounded-t-full"
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
              />
            )}
          </button>

          {/* Documents Tab */}
          <button
            onClick={() => setActiveTab("documents")}
            className={cn(
              "flex flex-col items-center justify-center gap-1 px-4 py-2 rounded-lg transition-all duration-200 min-w-[80px] relative",
              activeTab === "documents"
                ? "bg-openai-green/10 text-openai-green"
                : "text-openai-text-muted hover:text-openai-text hover:bg-openai-darker/50"
            )}
          >
            <FileText
              className={cn(
                "w-5 h-5 transition-transform duration-200",
                activeTab === "documents" && "scale-110"
              )}
            />
            <span className="text-[10px] font-medium uppercase tracking-wide">
              Documents
            </span>
            {activeTab === "documents" && (
              <motion.div
                layoutId="mobileActiveTab"
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-openai-green rounded-t-full"
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
              />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
