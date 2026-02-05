import Image from "next/image";

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
    <div className="min-h-screen bg-openai-dark relative overflow-hidden">
      {/* Dashboard Frame SVG - Top Right, aligned with navbar bottom */}
      <div className="fixed top-16 sm:top-20 right-0 z-[5] pointer-events-none">
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
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 max-w-[1920px] relative z-20">
        {/* Header Section */}
        <div className="mb-6 sm:mb-8">
          <div className="mb-6">
            <div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-openai-text mb-2" style={{ fontFamily: 'var(--font-amiri), serif' }}>
                لوحة التحكم
              </h1>
              <h2 className="text-lg sm:text-xl font-semibold text-openai-text-muted">
                Dashboard
              </h2>
              <p className="text-sm text-openai-text-muted mt-2 max-w-2xl">
                Gérez vos documents, consultez les familles nécessiteuses et interagissez avec l'Assistant Sadaqa
              </p>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
          {/* Chat Panel */}
          <div className="lg:sticky lg:top-6 lg:h-[calc(100vh-8rem)] flex flex-col">
            <div className="flex items-center gap-2 mb-4 px-2">
              <div className="w-2 h-2 rounded-full bg-openai-green animate-pulse" />
              <span className="text-xs font-medium text-openai-text-muted uppercase tracking-wide">
                Assistant Sadaqa
              </span>
            </div>
            {chat}
          </div>
          
          {/* Explorer Panel */}
          <div className="flex flex-col">
            <div className="flex items-center gap-2 mb-4 px-2">
              <div className="w-2 h-2 rounded-full bg-openai-green animate-pulse" />
              <span className="text-xs font-medium text-openai-text-muted uppercase tracking-wide">
                Gestion des Documents
              </span>
            </div>
            {explorer}
          </div>
        </div>
      </div>
    </div>
  );
}
