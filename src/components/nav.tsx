"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { LogoWithText } from "./logo";

export function Nav({ embedded = false }: { embedded?: boolean }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const isWork = pathname === "/projects";

  useEffect(() => {
    if (!open) return;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [open]);

  return (
    <nav className={`site-nav ${embedded ? "site-nav-embedded" : ""}`}>
      <div className="site-shell site-nav-inner">
        <Link href="/" aria-label="Fidexa home" onClick={() => setOpen(false)}>
          <LogoWithText variant={embedded ? "reversed" : "light"} />
        </Link>
        <div className="hidden items-center gap-8 md:flex">
          <Link className={`text-xs font-bold uppercase tracking-[0.12em] transition-colors ${embedded ? "text-[#aab4c5] hover:text-[#f7f9fc]" : "hover:text-[#101828]"} ${isWork ? (embedded ? "text-[#f7f9fc]" : "text-[#101828]") : (embedded ? "text-[#aab4c5]" : "text-[#667087]")}`} href="/projects" aria-current={isWork ? "page" : undefined}>
            Work
          </Link>
          <Link className={`text-xs font-bold uppercase tracking-[0.12em] transition-colors ${embedded ? "text-[#aab4c5] hover:text-[#f7f9fc]" : "text-[#667087] hover:text-[#101828]"}`} href="/#studio">
            Studio
          </Link>
          <Link className={`text-xs font-bold uppercase tracking-[0.12em] transition-colors ${embedded ? "text-[#aab4c5] hover:text-[#f7f9fc]" : "text-[#667087] hover:text-[#101828]"}`} href="/#contact">
            Contact
          </Link>
        </div>
        <button
          type="button"
          className={`mobile-menu-button min-h-11 min-w-[76px] rounded-full border px-3 py-2 text-[11px] font-bold uppercase tracking-[0.12em] ${embedded ? "border-[#f7f9fc]/25 text-[#f7f9fc]" : "border-[#101828]/15 text-[#101828]"}`}
          aria-expanded={open}
          aria-controls="mobile-nav"
          onClick={() => setOpen((value) => !value)}
        >
          Menu {open ? "−" : "+"}
        </button>
      </div>
      {open && (
        <div id="mobile-nav" className={`border-t md:hidden ${embedded ? "border-[#f7f9fc]/15 bg-[#101828]" : "border-[#101828]/10 bg-[#fffdf8]"}`}>
          <div className="site-shell grid gap-1 py-3">
            <Link className={`rounded-lg px-3 py-3 text-sm font-bold ${embedded ? "text-[#f7f9fc] hover:bg-[#1c2740]" : "hover:bg-[#f7f1e8]"}`} href="/projects" onClick={() => setOpen(false)}>Work</Link>
            <Link className={`rounded-lg px-3 py-3 text-sm font-bold ${embedded ? "text-[#f7f9fc] hover:bg-[#1c2740]" : "hover:bg-[#f7f1e8]"}`} href="/#studio" onClick={() => setOpen(false)}>Studio</Link>
            <Link className={`rounded-lg px-3 py-3 text-sm font-bold ${embedded ? "text-[#f7f9fc] hover:bg-[#1c2740]" : "hover:bg-[#f7f1e8]"}`} href="/#contact" onClick={() => setOpen(false)}>Contact</Link>
          </div>
        </div>
      )}
    </nav>
  );
}
