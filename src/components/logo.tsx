export function Logo({ className = "", size = 32 }: { className?: string; size?: number }) {
  return (
    <svg
      width={size}
      height={size * 1.1}
      viewBox="0 0 40 44"
      fill="none"
      className={className}
    >
      <path
        d="M20 2L38 14V30L20 42L2 30V14L20 2Z"
        stroke="currentColor"
        strokeWidth="2.2"
      />
      <path d="M20 2V42" stroke="currentColor" strokeWidth="1.5" opacity="0.4" />
      <path
        d="M2 14L20 22L38 14"
        stroke="currentColor"
        strokeWidth="1.5"
        opacity="0.4"
      />
      <path d="M20 22V42" stroke="currentColor" strokeWidth="1.5" opacity="0.6" />
    </svg>
  );
}

export function LogoWithText({ className = "" }: { className?: string }) {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <Logo size={28} />
      <span className="text-xl font-bold tracking-tight">fidexa</span>
    </div>
  );
}
