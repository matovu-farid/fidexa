"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import { LogoWithText } from "./logo";
import { Button } from "@/components/ui/button";
import { NavigationMenu, NavigationMenuList, NavigationMenuItem, NavigationMenuLink } from "@/components/ui/navigation-menu";
import { Sheet, SheetTrigger, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetClose } from "@/components/ui/sheet";

const destinations = [{ label: "Work", href: "/projects" }, { label: "Studio", href: "/#studio" }, { label: "Contact", href: "/#contact" }];

export function Nav({ embedded = false }: { embedded?: boolean }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  return (
    <nav aria-label="Primary" className={`site-nav ${embedded ? "site-nav-embedded theme-inverse" : ""}`}>
      <div className="site-shell site-nav-inner">
        <Link href="/" aria-label="Fidexa home"><LogoWithText variant={embedded ? "reversed" : "light"} /></Link>
        <div className="site-nav-actions">
          <NavigationMenu className="site-nav-desktop hidden md:flex" viewport={false} aria-label="Studio navigation">
            <NavigationMenuList>
              {destinations.map(({ label, href }) => <NavigationMenuItem key={label}><NavigationMenuLink asChild active={pathname === href} className="min-h-11 justify-center px-4"><Link href={href} aria-current={pathname === href ? "page" : undefined}>{label}</Link></NavigationMenuLink></NavigationMenuItem>)}
            </NavigationMenuList>
          </NavigationMenu>
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild><Button variant="outline" className="mobile-menu-button min-h-11 md:hidden" aria-label="Open navigation"><Menu /> Menu</Button></SheetTrigger>
            <SheetContent showCloseButton={false} className="w-[min(90vw,360px)]">
              <SheetHeader className="pr-16 pt-7"><SheetTitle>Explore Fidexa</SheetTitle><SheetDescription>Products, studio, and your next project.</SheetDescription></SheetHeader>
              <SheetClose asChild><Button size="icon-lg" variant="ghost" className="absolute right-4 top-4 min-h-11 min-w-11" aria-label="Close navigation"><X /></Button></SheetClose>
              <div className="grid gap-3 px-4">{destinations.map(({ label, href }) => <SheetClose asChild key={label}><Button asChild variant="ghost" className="min-h-12 justify-start text-lg"><Link href={href}>{label}</Link></Button></SheetClose>)}</div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </nav>
  );
}
