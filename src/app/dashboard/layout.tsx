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
    <div className="min-h-screen bg-openai-dark relative">
      {/* Dashboard Frame SVG - Top Right, aligned with navbar bottom */}
      <div className="absolute top-16 sm:top-20 right-0 z-10 pointer-events-none -mt-0">
        <Image
          src="/dashbordFrame.svg"
          alt="Dashboard Frame decoration"
          width={400}
          height={400}
          className="transform scale-x-[-1] opacity-80"
          style={{
            filter: 'drop-shadow(0 4px 20px rgba(188, 131, 42, 0.2))'
          }}
        />
      </div>
      
      <div className="container mx-auto px-4 sm:px-6 py-4 sm:py-6 max-w-[1920px] relative z-20">
        <div className="mb-4 sm:mb-6">
          <h1 className="text-xl sm:text-2xl font-semibold text-openai-text mb-1" style={{ fontFamily: 'var(--font-amiri), serif' }}>
            لوحة التحكم
          </h1>
          <h2 className="text-base sm:text-lg font-medium text-openai-text-muted">
            Dashboard
          </h2>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          <div className="lg:sticky lg:top-4 lg:h-[calc(100vh-8rem)]">{chat}</div>
          <div>{explorer}</div>
        </div>
      </div>
    </div>
  );
}
