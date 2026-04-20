import { LogoWithText } from "./logo";
import { GithubIcon, LinkedinIcon, TwitterIcon } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-white/[0.06] px-6 py-12">
      <div className="mx-auto flex max-w-5xl flex-col items-center justify-between gap-6 sm:flex-row">
        <div className="flex items-center gap-6">
          <LogoWithText />
          <span className="text-xs text-muted-foreground">
            Inspiring Digital Transformation
          </span>
        </div>
        <div className="flex items-center gap-5">
          <a
            href="https://github.com/matovu-farid"
            target="_blank"
            rel="noopener noreferrer"
            className="text-muted-foreground transition-colors hover:text-foreground"
          >
            <GithubIcon size={18} />
          </a>
          <a
            href="https://twitter.com/matovu100"
            target="_blank"
            rel="noopener noreferrer"
            className="text-muted-foreground transition-colors hover:text-foreground"
          >
            <TwitterIcon size={18} />
          </a>
          <a
            href="https://linkedin.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-muted-foreground transition-colors hover:text-foreground"
          >
            <LinkedinIcon size={18} />
          </a>
        </div>
        <p className="text-xs text-muted-foreground">
          &copy; {new Date().getFullYear()} Fidexa. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
