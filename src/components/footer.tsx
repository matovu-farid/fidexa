import Link from "next/link";
import { GithubIcon, LinkedinIcon, TwitterIcon } from "lucide-react";
import { LogoWithText } from "./logo";

export function Footer() {
  return (
    <footer className="site-footer">
      <div className="site-shell footer-grid">
        <div>
          <LogoWithText variant="reversed" />
          <p className="mt-3 max-w-xs text-xs leading-5 text-[#b8c7dd]">Built for the next useful step.</p>
        </div>
        <nav className="footer-links" aria-label="Footer navigation">
          <Link href="/projects">Work</Link>
          <Link href="/#contact">Contact</Link>
          <Link href="/sms">SMS support</Link>
        </nav>
        <div className="footer-socials" aria-label="Social links">
          <a href="https://github.com/matovu-farid" target="_blank" rel="noopener noreferrer" aria-label="Fidexa on GitHub"><GithubIcon size={16} /></a>
          <a href="https://twitter.com/matovu100" target="_blank" rel="noopener noreferrer" aria-label="Fidexa on X"><TwitterIcon size={16} /></a>
          <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" aria-label="Fidexa on LinkedIn"><LinkedinIcon size={16} /></a>
          <span className="text-xs text-[#b8c7dd]">© {new Date().getFullYear()} Fidexa</span>
        </div>
      </div>
    </footer>
  );
}
