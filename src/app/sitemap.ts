import type { MetadataRoute } from "next";
import { site } from "@/data/site";

export default function sitemap(): MetadataRoute.Sitemap {
  return site.pages.map((page) => ({
    url: new URL(page.path, site.url).href,
    changeFrequency: "monthly",
  }));
}
