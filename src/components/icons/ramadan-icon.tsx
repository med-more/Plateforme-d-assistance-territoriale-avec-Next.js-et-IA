"use client";

export function RamadanMoonIcon({ className = "w-6 h-6" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <path
        d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="12" cy="12" r="3" fill="currentColor" opacity="0.3" />
    </svg>
  );
}

export function RamadanStarIcon({ className = "w-6 h-6" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <path
        d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="currentColor"
        fillOpacity="0.1"
      />
    </svg>
  );
}

export function RamadanLanternIcon({ className = "w-6 h-6" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <rect x="8" y="2" width="8" height="4" rx="1" fill="currentColor" opacity="0.3" />
      <rect x="9" y="6" width="6" height="12" rx="1" stroke="currentColor" strokeWidth="2" />
      <line x1="12" y1="6" x2="12" y2="18" stroke="currentColor" strokeWidth="1.5" />
      <line x1="9" y1="10" x2="15" y2="10" stroke="currentColor" strokeWidth="1.5" />
      <line x1="9" y1="14" x2="15" y2="14" stroke="currentColor" strokeWidth="1.5" />
      <ellipse cx="12" cy="18" rx="2" ry="1" fill="currentColor" opacity="0.5" />
    </svg>
  );
}

export function DonationHandIcon({ className = "w-6 h-6" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <path
        d="M18 11V8A6 6 0 0 0 6 8v3M18 11v5a2 2 0 0 1-2 2h-3.09a2 2 0 0 1-1.664-.89l-1.87-2.5A2 2 0 0 1 9.09 13H6a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h2M18 11h2a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2h-2"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M7 10V8a1 1 0 0 1 1-1h0a1 1 0 0 1 1 1v2M11 10V8a1 1 0 0 1 1-1h0a1 1 0 0 1 1 1v2"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}
