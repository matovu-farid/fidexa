"use client";

import { useEffect, useRef } from "react";
import { serializeJsonLd } from "@/lib/seo";

export function StructuredData({ data }: { data: unknown }) {
  const serialized = serializeJsonLd(data);
  const container = useRef<HTMLDivElement>(null);
  // Keep the initial server HTML readable without JavaScript. The normal DOM
  // wrapper owns the script's lifecycle, including removal on route changes.
  useEffect(() => {
    const script = container.current?.querySelector("script");
    if (script) script.textContent = serialized;
  }, [serialized]);
  return <div hidden ref={container}><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serialized }} /></div>;
}
