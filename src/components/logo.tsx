type LogoVariant = "light" | "reversed";

type LogoProps = {
  className?: string;
  size?: number;
  variant?: LogoVariant;
};

export function Logo({ className = "", size = 32, variant = "reversed" }: LogoProps) {
  const foreground = variant === "light" ? "#101828" : "#F7F9FC";

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      className={className}
      aria-hidden="true"
    >
      <path d="M12 11H37L30.27 19H19V22.43H28.62L22.47 30.42H19V37H12V11Z" fill={foreground} />
      <path d="M12 11H37L30.27 19H19V15.2H12V11Z" fill="#7C5CFC" />
      <path d="M19 22.43H28.62L22.47 30.42H19V22.43Z" fill="#37D6C0" />
    </svg>
  );
}

export function LogoWithText({ className = "", variant = "reversed" }: Omit<LogoProps, "size">) {
  const textColor = variant === "light" ? "text-[#101828]" : "text-[#F7F9FC]";

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <Logo size={28} variant={variant} />
      <span className={`text-xl font-bold tracking-tight ${textColor}`}>fidexa</span>
    </div>
  );
}
