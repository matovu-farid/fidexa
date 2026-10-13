import Link from "next/link";
import { GithubIcon, TwitterIcon } from "lucide-react";
import { Logo } from "./logo";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

export function Footer() {
  return (
    <footer className="site-footer theme-inverse">
      <div className="site-shell">
        <div className="footer-top">
          <Link href="/" className="footer-brand" aria-label="Fidexa home">
            <Logo variant="reversed" size={64} />
            <span>fidexa</span>
          </Link>
          <p className="footer-tagline">End-to-end products for the work ahead.</p>
        </div>
        <Separator />
        <div className="footer-grid">
          <nav className="footer-links" aria-label="Footer navigation">
            <Button asChild variant="ghost"><Link href="/projects">Work</Link></Button>
            <Button asChild variant="ghost"><Link href="/#contact">Contact</Link></Button>
            <Button asChild variant="ghost"><Link href="/sms">SMS support</Link></Button>
          </nav>
          <div className="footer-socials" aria-label="Social links">
            <Button asChild variant="ghost" size="icon"><a href="https://github.com/matovu-farid" target="_blank" rel="noopener noreferrer" aria-label="Fidexa on GitHub"><GithubIcon /></a></Button>
            <Button asChild variant="ghost" size="icon"><a href="https://twitter.com/matovu100" target="_blank" rel="noopener noreferrer" aria-label="Fidexa on X"><TwitterIcon /></a></Button>
            <span>© {new Date().getFullYear()} Fidexa</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
