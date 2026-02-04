"use client";

export function LoadingDots({ className = "" }: { className?: string }) {
  return (
    <div className={`flex items-center gap-1.5 ${className}`}>
      <div className="w-2 h-2 bg-openai-green rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
      <div className="w-2 h-2 bg-openai-green rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
      <div className="w-2 h-2 bg-openai-green rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
    </div>
  );
}
