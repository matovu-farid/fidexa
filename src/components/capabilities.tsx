import { Globe, Smartphone, Bot, Monitor } from "lucide-react";

const capabilities = [
  {
    icon: Globe,
    label: "Web Apps",
    tech: "Next.js, React, Rails",
  },
  {
    icon: Smartphone,
    label: "Mobile",
    tech: "Flutter, React Native",
  },
  {
    icon: Bot,
    label: "AI & ML",
    tech: "OpenAI, on-device ML",
  },
  {
    icon: Monitor,
    label: "Desktop",
    tech: "Tauri, Electron, Rust",
  },
];

export function Capabilities() {
  return (
    <section className="border-t border-white/[0.06] px-6 py-24">
      <div className="mx-auto max-w-5xl">
        <p className="mb-2 text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
          Capabilities
        </p>
        <h2 className="mb-10 text-2xl font-semibold tracking-tight sm:text-3xl">
          What we bring to the table
        </h2>
        <div className="grid grid-cols-2 gap-6 sm:grid-cols-4">
          {capabilities.map((cap) => (
            <div key={cap.label} className="text-center">
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl border border-white/[0.06] bg-white/[0.02]">
                <cap.icon size={22} className="text-muted-foreground" />
              </div>
              <p className="text-sm font-semibold">{cap.label}</p>
              <p className="mt-1 text-xs text-muted-foreground">{cap.tech}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
