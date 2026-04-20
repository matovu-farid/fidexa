import Link from "next/link";
import { LogoWithText } from "./logo";

export function Nav() {
  return (
    <nav className="fixed top-0 z-50 w-full border-b border-white/[0.06] bg-background/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-6">
        <Link href="/">
          <LogoWithText />
        </Link>
        <div className="flex items-center gap-8">
          <Link
            href="/projects"
            className="text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            Projects
          </Link>
          <a
            href="#contact"
            className="text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            Contact
          </a>
        </div>
      </div>
    </nav>
  );
}
