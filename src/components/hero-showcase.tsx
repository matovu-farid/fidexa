"use client";

import { ArrowUpRight } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const products = [
  { id: "rishi", name: "Rishi", description: "Read, listen, and return to your books.", href: "#project-rishi" },
  { id: "lending", name: "Kaks Credit", description: "Lending built around an accounting ledger.", href: "#project-money-lending" },
  { id: "inventory", name: "Inventory", description: "Supply, Store, and Shop in one workspace.", href: "#project-inventory-trade" },
];

export function HeroShowcase() {
  return (
    <Tabs defaultValue="rishi" className="hero-showcase gap-3">
      {products.map((product) => (
        <TabsContent key={product.id} value={product.id} forceMount className={`hero-showcase-panel showcase-${product.id} m-0 data-[state=inactive]:hidden`}>
          <a className="hero-showcase-link" href={product.href} aria-label={`Explore the ${product.name} project story`}>
            <span className="hero-showcase-visual" aria-hidden="true"><span className="hero-showcase-image" /></span>
            <span className="hero-showcase-caption"><span><strong>{product.name}</strong><span>{product.description}</span></span><ArrowUpRight size={20} /></span>
          </a>
        </TabsContent>
      ))}
      <TabsList aria-label="Explore selected products" className="hero-product-index grid w-full grid-cols-3 group-data-[orientation=horizontal]/tabs:h-auto">
        {products.map((product) => <TabsTrigger value={product.id} key={product.id} className="min-h-11 data-[state=active]:bg-accent data-[state=active]:text-accent-foreground">{product.name}</TabsTrigger>)}
      </TabsList>
    </Tabs>
  );
}
