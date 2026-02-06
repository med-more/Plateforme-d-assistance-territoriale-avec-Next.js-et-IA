"use client";

import Image from "next/image";
import { MobileTabs } from "@/components/dashboard/mobile-tabs";

export default function DashboardLayout({
  children,
  chat,
  explorer,
}: {
  children: React.ReactNode;
  chat: React.ReactNode;
  explorer: React.ReactNode;
}) {
  return (
    <div className="min-h-screen h-screen bg-openai-dark relative overflow-hidden flex flex-col">
      {/* Dashboard Frame SVG - Top Right, aligned with navbar bottom - Hidden on mobile */}
      <div className="hidden sm:block fixed top-16 sm:top-20 right-0 z-[5] pointer-events-none">
        <Image
          src="/dashbordFrame.svg"
          alt="Dashboard Frame decoration"
          width={500}
          height={500}
          className="transform scale-x-[-1] opacity-80"
          style={{
            filter: 'drop-shadow(0 4px 20px rgba(188, 131, 42, 0.2))'
          }}
        />
      </div>
      
      {/* Subtle gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-openai-green/5 via-transparent to-transparent pointer-events-none z-0" />
      
      <div className="container mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-2 sm:py-3 md:py-4 lg:py-6 xl:py-8 max-w-[1920px] relative z-20 flex-1 flex flex-col overflow-hidden min-h-0">
        {/* Header Section - Very compact on mobile, hidden on small mobile */}
        <div className="mb-2 sm:mb-3 md:mb-4 lg:mb-6 xl:mb-8 flex-shrink-0 hidden sm:block">
          <div className="mb-2 sm:mb-3 md:mb-4 lg:mb-6">
            <div>
              <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-openai-text mb-1 sm:mb-2" style={{ fontFamily: 'var(--font-amiri), serif' }}>
                لوحة التحكم
              </h1>
              <h2 className="text-base sm:text-lg md:text-xl font-semibold text-openai-text-muted">
                Dashboard
              </h2>
              <p className="text-xs sm:text-sm text-openai-text-muted mt-1 sm:mt-2 max-w-2xl hidden md:block">
                Gérez vos documents, consultez les familles nécessiteuses et interagissez avec l'Assistant Sadaqa
              </p>
            </div>
          </div>
        </div>

        {/* Mobile: Tab Navigation System */}
        <div className="lg:hidden flex-1 min-h-0 overflow-hidden">
          <MobileTabs chat={chat} explorer={explorer} />
        </div>

        {/* Desktop: Side by Side Layout */}
        <div className="hidden lg:grid grid-cols-2 gap-6 lg:gap-8 flex-1 min-h-0 overflow-hidden">
          {/* Chat Panel */}
          <div className="flex flex-col min-h-0 h-full overflow-hidden">
            <div className="flex items-center gap-2 mb-3 md:mb-4 px-2 flex-shrink-0">
              <div className="w-2 h-2 rounded-full bg-openai-green animate-pulse" />
              <span className="text-xs font-medium text-openai-text-muted uppercase tracking-wide">
                Assistant Sadaqa
              </span>
            </div>
            <div className="flex-1 min-h-0 h-full overflow-hidden">
              {chat}
            </div>
          </div>
          
          {/* Explorer Panel */}
          <div className="flex flex-col min-h-0 h-full overflow-hidden">
            <div className="flex items-center gap-2 mb-3 md:mb-4 px-2 flex-shrink-0">
              <div className="w-2 h-2 rounded-full bg-openai-green animate-pulse" />
              <span className="text-xs font-medium text-openai-text-muted uppercase tracking-wide">
                Gestion des Documents
              </span>
            </div>
            <div className="flex-1 min-h-0 h-full overflow-y-auto">
              {explorer}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
